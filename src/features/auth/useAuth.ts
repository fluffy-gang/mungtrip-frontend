import { useCallback } from 'react';

import { socialLogin } from './api';
import {
  getAuthSession,
  removeAuthSession,
  saveAuthSession,
} from './storage';
import { useAuthStore } from './authStore';

import type { SocialLoginRequest } from './types';

export const useAuth = () => {
  const setLogin = useAuthStore(state => state.setLogin);
  const setLogout = useAuthStore(state => state.setLogout);

  const handleSocialLogin = useCallback(async (body: SocialLoginRequest) => {
    const response = await socialLogin(body);

    await saveAuthSession(response);

    setLogin(response.accessToken, {
      id: response.userId,
      provider: response.provider,
    });

    return response;
  }, [setLogin]);

  const handleLogout = useCallback(async () => {
    await removeAuthSession();
    setLogout();
  }, [setLogout]);

  const initAuth = useCallback(async () => {
    const session = await getAuthSession();

    if (session) {
      setLogin(session.accessToken, {
        id: session.userId,
        provider: session.provider,
      });
      return session;
    }

    setLogout();
    return null;
  }, [setLogin, setLogout]);

  return {
    handleSocialLogin,
    handleLogout,
    initAuth,
  };
};
