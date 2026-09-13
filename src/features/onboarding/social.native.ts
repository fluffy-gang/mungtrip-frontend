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
    const result = await kakaoLogin();
    return result.accessToken;
  }

  configureGoogle();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  if (result.type !== 'success' || !result.data.idToken) {
    throw new Error('Google 로그인이 취소되었어요.');
  }
  return result.data.idToken;
}
