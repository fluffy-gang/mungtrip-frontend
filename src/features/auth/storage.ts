import * as SecureStore from 'expo-secure-store';

import type { AuthSession, SocialProvider } from './types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_IDENTITY_KEY = 'authIdentity';

interface AuthIdentity {
  provider: SocialProvider;
  userId: number;
}

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

export const saveAuthSession = async (session: AuthSession) => {
  const identity: AuthIdentity = {
    provider: session.provider,
    userId: session.userId,
  };

  await Promise.all([
    saveAuthTokens(session),
    SecureStore.setItemAsync(AUTH_IDENTITY_KEY, JSON.stringify(identity)),
  ]);
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const [accessToken, refreshToken, identityValue] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    SecureStore.getItemAsync(AUTH_IDENTITY_KEY),
  ]);

  if (!accessToken || !refreshToken || !identityValue) return null;

  try {
    const identity = JSON.parse(identityValue) as AuthIdentity;

    if (!identity.userId || !identity.provider) return null;

    return { accessToken, refreshToken, ...identity };
  } catch {
    return null;
  }
};

export const removeAuthSession = async () => {
  await Promise.all([
    removeAccessToken(),
    removeRefreshToken(),
    SecureStore.deleteItemAsync(AUTH_IDENTITY_KEY),
  ]);
};
