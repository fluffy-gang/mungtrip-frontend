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
  map: {
    categories: `${API_PREFIX}/categories`,
    tags: `${API_PREFIX}/tags`,
    places: `${API_PREFIX}/places`,
    placeDetail: (placeId: number) => `${API_PREFIX}/places/${placeId}`,
    placeVisits: (placeId: number) => `${API_PREFIX}/places/${placeId}/visits`,
    popularKeywords: `${API_PREFIX}/places/search/popular-keywords`,
    recentlyVerified: `${API_PREFIX}/places/recently-verified`,
    topPlaces: `${API_PREFIX}/places/top`,
  },
  admin: {
    places: `${API_PREFIX}/admin/places`,
    syncTourApi: `${API_PREFIX}/admin/sync/tour-api`,
  },
} as const;
