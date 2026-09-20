import * as Storage from '@/shared/storage';

import type { AuthSession, SocialProvider } from './types';

const ACCESS_TOKEN_KEY = 'accessToken';
const DEVICE_ID_KEY = 'deviceId';
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
  await Storage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  return Storage.getItem(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = async () => {
  await Storage.removeItem(ACCESS_TOKEN_KEY);
};

export const saveRefreshToken = async (token: string) => {
  await Storage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async () => {
  return Storage.getItem(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = async () => {
  await Storage.removeItem(REFRESH_TOKEN_KEY);
};

/** 로그인과 로그아웃 요청에서 동일한 기기 식별자를 사용하기 위해 안전 저장소에 보관한다. */
export const saveDeviceId = async (deviceId: string) => {
  await Storage.setItem(DEVICE_ID_KEY, deviceId);
};

export const getDeviceId = async () => {
  return Storage.getItem(DEVICE_ID_KEY);
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
    Storage.setItem(AUTH_IDENTITY_KEY, JSON.stringify(identity)),
  ]);
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const [accessToken, refreshToken, identityValue] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    Storage.getItem(AUTH_IDENTITY_KEY),
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
    Storage.removeItem(AUTH_IDENTITY_KEY),
  ]);
};
