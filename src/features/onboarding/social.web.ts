import Constants from 'expo-constants';

import type { KakaoTokenResponse, OAuthExtra, OAuthPopupResult } from './social.type';
import type { LoginProvider } from './types';

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const KAKAO_AUTHORIZATION_URL = 'https://kauth.kakao.com/oauth/authorize';
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const POPUP_TIMEOUT_MS = 120_000;

function getOAuthConfig() {
  return (Constants.expoConfig?.extra?.oauth ?? {}) as OAuthExtra;
}

function createRandomValue() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getRedirectUri() {
  return new URL('/onboarding/oauth-callback', window.location.origin).toString();
}

function parsePopupUrl(url: URL): OAuthPopupResult {
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  return {
    code: url.searchParams.get('code') ?? undefined,
    error: url.searchParams.get('error') ?? hash.get('error') ?? undefined,
    errorDescription:
      url.searchParams.get('error_description') ?? hash.get('error_description') ?? undefined,
    idToken: hash.get('id_token') ?? undefined,
    state: url.searchParams.get('state') ?? hash.get('state') ?? undefined,
  };
}

function openOAuthPopup(url: string, expectedState: string) {
  const popup = window.open(
    url,
    'mungtrip-social-login',
    'popup=yes,width=500,height=720,menubar=no,toolbar=no,location=yes',
  );
  if (!popup) throw new Error('로그인 팝업이 차단되었어요. 팝업을 허용해 주세요.');

  return new Promise<OAuthPopupResult>((resolve, reject) => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(interval);
        reject(new Error('소셜 로그인이 취소되었어요.'));
        return;
      }
      if (Date.now() - startedAt > POPUP_TIMEOUT_MS) {
        window.clearInterval(interval);
        popup.close();
        reject(new Error('로그인 시간이 초과되었어요. 다시 시도해 주세요.'));
        return;
      }

      try {
        if (popup.location.origin !== window.location.origin) return;
        const result = parsePopupUrl(new URL(popup.location.href));
        if (!result.code && !result.idToken && !result.error) return;
        window.clearInterval(interval);
        popup.close();
        if (result.state !== expectedState) {
          reject(new Error('로그인 요청을 확인하지 못했어요. 다시 시도해 주세요.'));
          return;
        }
        if (result.error) {
          reject(new Error(result.errorDescription ?? '소셜 로그인에 실패했어요.'));
          return;
        }
        resolve(result);
      } catch {
        // OAuth 제공자 도메인에 머무는 동안에는 동일 출처 정책으로 URL을 읽을 수 없다.
      }
    }, 250);
  });
}

async function getGoogleToken() {
  const oauth = getOAuthConfig();
  if (!oauth.googleWebClientId) throw new Error('Google 웹 OAuth 클라이언트 ID가 필요해요.');

  const state = createRandomValue();
  const params = new URLSearchParams({
    client_id: oauth.googleWebClientId,
    nonce: createRandomValue(),
    prompt: 'select_account',
    redirect_uri: getRedirectUri(),
    response_type: 'id_token',
    scope: 'openid email profile',
    state,
  });
  const result = await openOAuthPopup(`${GOOGLE_AUTHORIZATION_URL}?${params}`, state);
  if (!result.idToken) throw new Error('Google ID 토큰을 받지 못했어요.');
  return result.idToken;
}

async function getKakaoToken() {
  const oauth = getOAuthConfig();
  if (!oauth.kakaoJavascriptKey || !oauth.kakaoRestApiKey) {
    throw new Error('Kakao 웹 OAuth 앱 키 설정이 필요해요.');
  }

  const redirectUri = getRedirectUri();
  const state = createRandomValue();
  const authorizationParams = new URLSearchParams({
    client_id: oauth.kakaoJavascriptKey,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });
  const result = await openOAuthPopup(`${KAKAO_AUTHORIZATION_URL}?${authorizationParams}`, state);
  if (!result.code) throw new Error('Kakao 인증 코드를 받지 못했어요.');

  const tokenParams = new URLSearchParams({
    client_id: oauth.kakaoRestApiKey,
    code: result.code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  const response = await fetch(KAKAO_TOKEN_URL, {
    body: tokenParams.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    method: 'POST',
  });
  const token = (await response.json()) as KakaoTokenResponse;
  if (!response.ok || !token.access_token) {
    throw new Error(token.error_description ?? 'Kakao access token을 받지 못했어요.');
  }
  return token.access_token;
}

export function getProviderToken(provider: LoginProvider): Promise<string> {
  return provider === 'KAKAO' ? getKakaoToken() : getGoogleToken();
}
