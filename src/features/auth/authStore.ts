import { create } from 'zustand';

import type { User } from './types';

type AuthState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;

  setLogin: (accessToken: string, user?: User) => void;
  setLogout: () => void;
};

export const useAuthStore = create<AuthState>(set => ({
  isLoggedIn: false,
  accessToken: null,
  user: null,

  setLogin: (accessToken, user) =>
    set({
      isLoggedIn: true,
      accessToken,
      user: user ?? null,
    }),

  setLogout: () =>
    set({
      isLoggedIn: false,
      accessToken: null,
      user: null,
    }),
}));
