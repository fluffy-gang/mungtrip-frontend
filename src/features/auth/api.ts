import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { isUnauthorizedApiError } from '@/shared/api/error';

import { useAuthStore } from './authStore';
import { getAccessToken, removeAuthTokens } from './storage';
import type { SocialLoginRequest, SocialLoginResponse } from './types';

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

export const setupAuthInterceptor = () => {
  if (requestInterceptorId === null) {
    requestInterceptorId = apiClient.interceptors.request.use(async config => {
      const token = await getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  if (responseInterceptorId === null) {
    responseInterceptorId = apiClient.interceptors.response.use(
      response => response,
      async error => {
        // TODO(#11): 목로그인 세션은 실제 토큰이 없어 다른 화면의 진짜 API 호출이 401을
        // 받을 수 있다. 그 401 때문에 목로그인이 풀리지 않도록 여기서 막아둔다.
        if (isUnauthorizedApiError(error) && !useAuthStore.getState().isMockSession) {
          await removeAuthTokens();
          useAuthStore.getState().setLogout();
        }

        return Promise.reject(error);
      },
    );
  }
};

export const socialLogin = async (
  body: SocialLoginRequest,
): Promise<SocialLoginResponse> => {
  const { data } = await apiClient.post<SocialLoginResponse>(
    ENDPOINTS.auth.socialLogin,
    body,
  );

  return data;
};
