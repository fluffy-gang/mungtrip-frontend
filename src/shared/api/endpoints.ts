const API_PREFIX = '/api/v1';

export const ENDPOINTS = {
  auth: {
    logout: `${API_PREFIX}/auth/logout`,
    reissue: `${API_PREFIX}/auth/reissue`,
    restore: `${API_PREFIX}/auth/restore`,
    socialLogin: `${API_PREFIX}/auth/social-login`,
  },
  users: {
    me: `${API_PREFIX}/users/me`,
    nickname: `${API_PREFIX}/users/me/nickname`,
  },
  agreements: {
    list: `${API_PREFIX}/agreements`,
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
    likedPlaces: `${API_PREFIX}/places/me/likes`,
    recentViews: `${API_PREFIX}/places/me/recent-views`,
    placeLike: (placeId: number) => `${API_PREFIX}/places/${placeId}/like`,
    placeDetail: (placeId: number) => `${API_PREFIX}/places/${placeId}`,
    placeVisits: (placeId: number) => `${API_PREFIX}/places/${placeId}/visits`,
    popularKeywords: `${API_PREFIX}/places/search/popular-keywords`,
    recentlyVerified: `${API_PREFIX}/places/recently-verified`,
    topPlaces: `${API_PREFIX}/places/top`,
  },
  reviews: {
    byPlace: (placeId: number) => `${API_PREFIX}/places/${placeId}/reviews`,
    detail: (reviewId: number) => `${API_PREFIX}/reviews/${reviewId}`,
    mine: `${API_PREFIX}/places/me/reviews`,
    myForPlace: (placeId: number) => `${API_PREFIX}/places/${placeId}/reviews/me`,
  },
  visits: {
    mine: `${API_PREFIX}/places/me/visits`,
  },
  courses: {
    list: `${API_PREFIX}/courses`,
    detail: (courseId: number) => `${API_PREFIX}/courses/${courseId}`,
    like: (courseId: number) => `${API_PREFIX}/courses/${courseId}/like`,
  },
  admin: {
    places: `${API_PREFIX}/admin/places`,
    syncTourApi: `${API_PREFIX}/admin/sync/tour-api`,
  },
  uploads: {
    presigned: `${API_PREFIX}/uploads/presigned`,
  },
} as const;
