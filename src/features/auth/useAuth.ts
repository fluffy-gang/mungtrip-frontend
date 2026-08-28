import { useCallback } from 'react';

import { socialLogin } from './api';
import {
  getAccessToken,
  removeAuthTokens,
  saveAuthTokens,
} from './storage';
import { useAuthStore } from './authStore';

import type { SocialLoginRequest } from './types';

export const useAuth = () => {
  const setLogin = useAuthStore(state => state.setLogin);
  const setLogout = useAuthStore(state => state.setLogout);

  const handleSocialLogin = useCallback(async (body: SocialLoginRequest) => {
    const response = await socialLogin(body);

    await saveAuthTokens(response);

    setLogin(response.accessToken, {
      id: response.userId,
      provider: response.provider,
    });

    return response;
  }, [setLogin]);

  const handleLogout = useCallback(async () => {
    await removeAuthTokens();
    setLogout();
  }, [setLogout]);

  const initAuth = useCallback(async () => {
    const token = await getAccessToken();

    if (token) {
      setLogin(token);
      return;
    }

    setLogout();
  }, [setLogin, setLogout]);

  return {
    handleSocialLogin,
    handleLogout,
    initAuth,
  };
};
