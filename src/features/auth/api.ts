import { isAxiosError } from "axios";
import { Platform } from 'react-native';

import { apiClient, setResponseErrorHandler } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { getKakaoRedirectUri } from '../onboarding/social';
import { useAuthStore } from "./authStore";
import {
  getAccessToken,
  getRefreshToken,
  removeAuthSession,
  saveAuthTokens,
} from "./storage";

import type {
  LogoutRequest,
  ReissueResponse,
  RestoreAccountResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  UpdateMyProfileRequest,
} from "./types";

let requestInterceptorId: number | null = null;
let refreshRequest: Promise<string> | null = null;
const retriedRequests = new WeakSet<object>();

async function clearAuthentication() {
  await removeAuthSession();
  useAuthStore.getState().setLogout();
}

async function reissueAccessToken() {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) throw new Error("로그인이 필요해요.");

    const { data } = await apiClient.post<ReissueResponse>(
      ENDPOINTS.auth.reissue,
      { refreshToken },
    );

    await saveAuthTokens(data);
    useAuthStore
      .getState()
      .setLogin(data.accessToken, useAuthStore.getState().user ?? undefined);

    return data.accessToken;
  })().finally(() => {
    refreshRequest = null;
  });

  return refreshRequest;
}

async function handleResponseError(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error;
  }

  const config = error.config;

  if (config.url === ENDPOINTS.auth.reissue || retriedRequests.has(config)) {
    await clearAuthentication();
    throw error;
  }

  retriedRequests.add(config);

  try {
    const accessToken = await reissueAccessToken();
    config.headers.set("Authorization", `Bearer ${accessToken}`);

    return apiClient.request(config);
  } catch (refreshError) {
    await clearAuthentication();
    throw refreshError;
  }
}

export const setupAuthInterceptor = () => {
  if (requestInterceptorId === null) {
    requestInterceptorId = apiClient.interceptors.request.use(
      async (config) => {
        const token = await getAccessToken();

        if (token) config.headers.Authorization = `Bearer ${token}`;

        return config;
      },
    );
  }

  setResponseErrorHandler(handleResponseError);
};

export const socialLogin = async (
  body: SocialLoginRequest,
): Promise<SocialLoginResponse> => {
  if (Platform.OS === 'web' && body.provider === 'KAKAO') {
    return socialLoginWithKakaoCode(body.providerToken, getKakaoRedirectUri(), body.deviceId);
  }
  const { data } = await apiClient.post<SocialLoginResponse>(
    ENDPOINTS.auth.socialLogin,
    body,
  );

  return data;
};

export const socialLoginWithKakaoCode = async (
  code: string,
  redirectUri: string,
  deviceId: string,
): Promise<SocialLoginResponse> => {
  const { data } = await apiClient.post<SocialLoginResponse>(ENDPOINTS.auth.kakaoCode, {
    code,
    redirectUri,
    deviceId,
  });
  return data;
};

export const logout = async (body: LogoutRequest): Promise<void> => {
  await apiClient.post(ENDPOINTS.auth.logout, body);
};

export const withdrawAccount = async (): Promise<void> => {
  await apiClient.delete(ENDPOINTS.users.me);
};

export const restoreAccount = async (
  restoreToken: string,
): Promise<RestoreAccountResponse> => {
  const { data } = await apiClient.post<RestoreAccountResponse>(
    ENDPOINTS.auth.restore,
    undefined,
    {
      headers: { Authorization: `Bearer ${restoreToken}` },
    },
  );

  return data;
};

export const updateMyProfile = async (
  body: UpdateMyProfileRequest,
): Promise<void> => {
  await apiClient.patch(
    ENDPOINTS.users.nickname,
    body,
  );
};
