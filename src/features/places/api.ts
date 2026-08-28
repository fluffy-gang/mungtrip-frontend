import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import {
  mapCategoryListResponse,
  mapPlaceDetailResponse,
  mapPlaceListResponse,
  mapTagListResponse,
  type PlaceCatalog,
} from './mapper';
import type {
  Place,
  PlaceCategory,
  PlaceQueryParams,
  PlaceTag,
} from './types';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

export const getPlaceCategories = async (): Promise<PlaceCategory[]> => {
  const { data } =
    await apiClient.get<ApiEnvelope<unknown>>(ENDPOINTS.map.categories);

  return mapCategoryListResponse(data);
};

export const getPlaceTags = async (): Promise<PlaceTag[]> => {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(ENDPOINTS.map.tags);

  return mapTagListResponse(data);
};

export const getPlaces = async (
  params?: PlaceQueryParams,
  catalog?: PlaceCatalog,
): Promise<Place[]> => {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(
    ENDPOINTS.map.places,
    { params },
  );

  return mapPlaceListResponse(data, catalog);
};

export const getPlaceDetail = async (
  placeId: number,
  catalog?: PlaceCatalog,
): Promise<Place> => {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(
    ENDPOINTS.map.placeDetail(placeId),
  );

  return mapPlaceDetailResponse(data, catalog);
};
