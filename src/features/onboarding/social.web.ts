import Constants from 'expo-constants';

import { getOAuthCallbackAction } from './oauth-state';

import type { OAuthExtra } from './social.type';
import type { LoginProvider } from './types';

const oauth = (Constants.expoConfig?.extra?.oauth ?? {}) as OAuthExtra;
const KAKAO_STATE_KEY = 'mungtrip.oauth.kakao.state';
const KAKAO_CODE_KEY = 'mungtrip.oauth.kakao.code';
const KAKAO_RECEIPT_KEY = 'mungtrip.oauth.kakao.receipt';

export function getKakaoRedirectUri() {
  return oauth.kakaoRedirectUri || `${window.location.origin}/onboarding/oauth/kakao`;
}

export async function getProviderToken(provider: LoginProvider): Promise<string> {
  if (provider === 'KAKAO') {
    const code = sessionStorage.getItem(KAKAO_CODE_KEY);
    if (code) {
      sessionStorage.removeItem(KAKAO_CODE_KEY);
      sessionStorage.removeItem(KAKAO_RECEIPT_KEY);
      return code;
    }
    if (!oauth.kakaoRestApiKey) throw new Error('Kakao REST API key 설정이 필요해요.');
    const state = crypto.randomUUID();
    sessionStorage.setItem(KAKAO_STATE_KEY, state);
    const params = new URLSearchParams({
      client_id: oauth.kakaoRestApiKey,
      redirect_uri: getKakaoRedirectUri(),
      response_type: 'code',
      state,
    });
    window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params}`);
    return new Promise(() => undefined);
  }

  throw new Error('Google GIS 버튼을 사용해 로그인해주세요.');
}

export function consumeKakaoCallback(code: string, returnedState: string) {
  const expectedState = sessionStorage.getItem(KAKAO_STATE_KEY);
  let receipt: { state: string; code: string } | undefined;
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(KAKAO_RECEIPT_KEY) ?? 'null');
    if (value && typeof value === 'object' && 'state' in value && 'code' in value &&
      typeof value.state === 'string' && typeof value.code === 'string') {
      receipt = { state: value.state, code: value.code };
    }
  } catch {
    // An unreadable receipt is treated as absent; current state still has to validate.
  }

  const action = getOAuthCallbackAction(expectedState, returnedState, receipt?.state ?? null, receipt?.code ?? null, code);
  if (action === 'invalid') {
    sessionStorage.removeItem(KAKAO_STATE_KEY);
    throw new Error('카카오 로그인 상태 검증에 실패했어요. 다시 시도해주세요.');
  }
  if (action === 'duplicate') return;

  sessionStorage.removeItem(KAKAO_STATE_KEY);
  sessionStorage.setItem(KAKAO_CODE_KEY, code);
  sessionStorage.setItem(KAKAO_RECEIPT_KEY, JSON.stringify({ state: returnedState, code }));
}
