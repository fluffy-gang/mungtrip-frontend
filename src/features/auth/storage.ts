import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// SecureStore는 네이티브 전용이므로 웹에서는 동일한 비동기 계약으로 localStorage를 사용한다.
const getStoredItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
};

const setStoredItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const removeStoredItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export const saveAccessToken = async (token: string) => {
  await setStoredItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  return await getStoredItem(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = async () => {
  await removeStoredItem(ACCESS_TOKEN_KEY);
};

export const saveRefreshToken = async (token: string) => {
  await setStoredItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async () => {
  return await getStoredItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = async () => {
  await removeStoredItem(REFRESH_TOKEN_KEY);
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
