import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { isUnauthorizedApiError } from '@/shared/api/error';
import { unwrapApiData } from '@/shared/api/types';

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
        if (isUnauthorizedApiError(error)) {
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
  const { data } = await apiClient.post<
    SocialLoginResponse | { data: SocialLoginResponse }
  >(ENDPOINTS.auth.socialLogin, body);

  return unwrapApiData(data);
};
