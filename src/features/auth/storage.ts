import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// 이 앱은 웹을 배포 타겟으로 지원하지 않는다(핵심 기능인 지도부터 네이티브 전용).
// localStorage 폴백은 인증 토큰을 평문으로 노출해 XSS에 취약하므로 두지 않는다.

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export const saveAccessToken = async (token: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const saveRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async () => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = async () => {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const saveAuthTokens = async (tokens: AuthTokens) => {
  await saveAccessToken(tokens.accessToken);

  if (tokens.refreshToken) {
    await saveRefreshToken(tokens.refreshToken);
    return;
  }

  await removeRefreshToken();
};

export const removeAuthTokens = async () => {
  await Promise.all([removeAccessToken(), removeRefreshToken()]);
};
