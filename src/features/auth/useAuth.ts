import { useCallback } from 'react';

import { ApiError } from '@/shared/api/error';
import { logout, restoreAccount, socialLogin, withdrawAccount } from './api';
import {
  getAuthSession,
  getDeviceId,
  removeAuthSession,
  saveAuthSession,
  saveDeviceId,
} from './storage';
import { useAuthStore } from './authStore';

import type { AuthenticatedSocialLoginResponse, SocialLoginRequest } from './types';

export class PendingDeletionError extends Error {
  restoreToken: string;

  constructor(restoreToken: string) {
    super('탈퇴 신청한 계정입니다.');
    this.name = 'PendingDeletionError';
    this.restoreToken = restoreToken;
  }
}

export const useAuth = () => {
  const setLogin = useAuthStore(state => state.setLogin);
  const setLogout = useAuthStore(state => state.setLogout);

  const handleSocialLogin = useCallback(async (
    body: SocialLoginRequest,
  ): Promise<AuthenticatedSocialLoginResponse> => {
    const response = await socialLogin(body);

    if (response.pendingDeletion) {
      if (!response.restoreToken) {
        throw new Error('계정 복구 토큰을 받지 못했어요. 다시 로그인해주세요.');
      }

      await saveDeviceId(body.deviceId);
      throw new PendingDeletionError(response.restoreToken);
    }

    if (!response.accessToken || !response.refreshToken) {
      throw new Error('로그인 토큰을 받지 못했어요. 다시 시도해주세요.');
    }

    const authenticatedResponse: AuthenticatedSocialLoginResponse = {
      ...response,
      accessToken: response.accessToken,
      pendingDeletion: false,
      refreshToken: response.refreshToken,
    };

    await Promise.all([saveAuthSession(authenticatedResponse), saveDeviceId(body.deviceId)]);

    setLogin(authenticatedResponse.accessToken, {
      id: authenticatedResponse.userId,
      provider: authenticatedResponse.provider,
    });

    return authenticatedResponse;
  }, [setLogin]);

  const handleRestoreAccount = useCallback(async (
    restoreToken: string,
    body: SocialLoginRequest,
  ) => {
    await restoreAccount(restoreToken);

    return handleSocialLogin(body);
  }, [handleSocialLogin]);

  const handleLogout = useCallback(async () => {
    const isMockSession = useAuthStore.getState().isMockSession;

    try {
      const deviceId = await getDeviceId();

      if (!isMockSession && deviceId) {
        await logout({ deviceId });
      }
    } catch (error) {
      // A missing server-side endpoint must not prevent local sign-out.
      if (error instanceof ApiError && error.status === 404) return;
    } finally {
      await removeAuthSession();
      setLogout();
    }
  }, [setLogout]);

  const handleWithdrawAccount = useCallback(async () => {
    await withdrawAccount();
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
    handleRestoreAccount,
    handleLogout,
    handleWithdrawAccount,
    initAuth,
  };
};
