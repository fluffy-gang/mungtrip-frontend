import { useAuthStore } from '@/features/auth/authStore';
import { getMyDogs } from '@/features/dogs/api';
import { uploadFile } from '@/features/uploads/api';
import { apiClient } from '@/shared/api/client';
import { getPlaceCategories, getPlaceDetail, getPlaceTags } from '../api';
import { createPlaceApi } from './api';
import { samePlaceSession } from './session';

import type { PlaceAdapter } from './types';

/** Uses the existing auth/envelope client and presigned layer; no mock fallback. */
export function createRealPlaceAdapter(): PlaceAdapter {
  return {
    source: 'real',
    subscribeSession: onChange => useAuthStore.subscribe((next, previous) => {
      if (!samePlaceSession(previous, next)) onChange();
    }),
    ...createPlaceApi({ request: async (method, url, data, params) => {
      const response = await apiClient.request<unknown>({ method, url, data, params });
      return response.data;
    } }),
    detail: async id => {
      const [categories, tags] = await Promise.all([getPlaceCategories(), getPlaceTags()]);
      return getPlaceDetail(id, { categories, tags });
    },
    upload: photo => uploadFile(photo.uri, photo.mimeType, 'REVIEW_IMAGE'),
    dogs: async () => (await getMyDogs()).map(dog => ({ id: dog.dogId, name: dog.name, breed: dog.breed, weight: dog.weight })),
  };
}
