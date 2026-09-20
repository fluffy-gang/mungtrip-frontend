import { create } from 'zustand';

import type { User } from './types';

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  /** TODO(#11): 실제 로그인 화면(#9) 머지 전까지, 목데이터로 로그인 UI를 확인하기 위한 임시 플래그. */
  isMockSession: boolean;
  user: User | null;

  setLogin: (accessToken: string, user?: User) => void;
  setLogout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  isLoggedIn: false,
  accessToken: null,
  isMockSession: false,
  user: null,

  setLogin: (accessToken, user) =>
    set({
      isLoggedIn: true,
      isMockSession: false,
      accessToken,
      user: user ?? null,
    }),

  setLogout: () =>
    set({
      isLoggedIn: false,
      isMockSession: false,
      accessToken: null,
      user: null,
    }),

  updateUser: user =>
    set(state => ({
      user: state.user ? { ...state.user, ...user } : null,
    })),
}));
