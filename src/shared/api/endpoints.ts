const API_PREFIX = '/api/v1';

export const ENDPOINTS = {
  auth: {
    socialLogin: `${API_PREFIX}/auth/social-login`,
  },
  agreements: {
    me: `${API_PREFIX}/users/me/agreements`,
  },
  dogPersonalities: {
    list: `${API_PREFIX}/dog-personalities`,
  },
  dogs: {
    list: `${API_PREFIX}/dogs`,
    detail: (dogId: number) => `${API_PREFIX}/dogs/${dogId}`,
  },
} as const;
