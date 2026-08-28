const API_PREFIX = '/api/v1';

export const ENDPOINTS = {
  map: {
    categories: `${API_PREFIX}/categories`,
    tags: `${API_PREFIX}/tags`,
    places: `${API_PREFIX}/places`,
    placeDetail: (placeId: number) => `${API_PREFIX}/places/${placeId}`,
  },
  admin: {
    places: `${API_PREFIX}/admin/places`,
    syncTourApi: `${API_PREFIX}/admin/sync/tour-api`,
  },
} as const;
