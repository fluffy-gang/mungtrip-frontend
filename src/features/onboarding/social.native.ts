import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import Constants from 'expo-constants';

import type { OAuthExtra } from './social.type';
import type { LoginProvider } from './types';

const oauth = (Constants.expoConfig?.extra?.oauth ?? {}) as OAuthExtra;
let googleConfigured = false;

function configureGoogle() {
  if (!oauth.googleWebClientId) {
    throw new Error('Google OAuth client ID 설정이 필요해요.');
  }
  if (!googleConfigured) {
    GoogleSignin.configure({
      iosClientId: oauth.googleIosClientId,
      webClientId: oauth.googleWebClientId,
    });
    googleConfigured = true;
  }
}

export async function getProviderToken(provider: LoginProvider) {
  if (provider === 'KAKAO') {
    try {
      const result = await kakaoLogin();
      return result.accessToken;
    } catch (error) {
      if (error instanceof Error && /^user cancel(?:l)?ed$/i.test(error.message)) {
        throw new Error('로그인을 취소했어요.');
      }
      throw error;
    }
  }

  configureGoogle();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success' || !result.data.idToken) {
    throw new Error('Google 로그인이 취소되었어요.');
  }
  return result.data.idToken;
}

export function getKakaoRedirectUri(): string {
  throw new Error('Kakao redirect URI is available on web only.');
}

export function consumeKakaoCallback(_code: string, _state: string): never {
  throw new Error('Kakao OAuth callback is available on web only.');
}
