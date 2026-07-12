import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export const saveAccessToken = async (token: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const saveRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
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
