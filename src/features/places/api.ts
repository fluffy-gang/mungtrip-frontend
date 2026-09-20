import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { findArrayPayload, getObjectValue, isObject, mapCategory, mapPlace, mapPlaces, mapTag, toString } from './detail/catalog-mapping';

import type { PlaceCatalog } from './detail/catalog-mapping';
import type {
  Place,
  PlaceCategory,
  PlaceQueryParams,
  PlaceTag,
  TopPlacesQueryParams,
} from './types';

export const getPlaceCategories = async (): Promise<PlaceCategory[]> => {
  const { data } =
    await apiClient.get<unknown>(ENDPOINTS.map.categories);

  return findArrayPayload(data)
    .map(mapCategory)
    .filter((category): category is PlaceCategory => Boolean(category));
};

export const getPlaceTags = async (): Promise<PlaceTag[]> => {
  const { data } = await apiClient.get<unknown>(ENDPOINTS.map.tags);

  return findArrayPayload(data)
    .map(mapTag)
    .filter((tag): tag is PlaceTag => Boolean(tag))
    .sort((firstTag, secondTag) => firstTag.sortOrder - secondTag.sortOrder);
};

export const getPlaces = async (
  params?: PlaceQueryParams,
  catalog?: PlaceCatalog,
): Promise<Place[]> => {
  const { data } = await apiClient.get<unknown>(
    ENDPOINTS.map.places,
    { params },
  );

  return mapPlaces(data, catalog);
};

export const getPlaceDetail = async (
  placeId: number,
  catalog?: PlaceCatalog,
): Promise<Place> => {
  const { data } = await apiClient.get<unknown>(
    ENDPOINTS.map.placeDetail(placeId),
  );

  const place = mapPlace(data, catalog);
  if (!place) {
    throw new Error('장소 응답 형식이 올바르지 않습니다.');
  }

  return place;
};

export const getPopularKeywords = async (): Promise<string[]> => {
  const { data } = await apiClient.get<unknown>(
    ENDPOINTS.map.popularKeywords,
  );

  return findArrayPayload(data)
    .map(value => {
      if (typeof value === 'string') {
        return value;
      }

      if (isObject(value)) {
        return toString(getObjectValue(value, ['keyword', 'name', 'text', 'label']));
      }

      return undefined;
    })
    .filter((value): value is string => Boolean(value));
};

export const getRecentlyVerifiedPlaces = async (
  limit = 10,
  catalog?: PlaceCatalog,
): Promise<Place[]> => {
  const { data } = await apiClient.get<unknown>(
    ENDPOINTS.map.recentlyVerified,
    {
      params: { limit },
    },
  );

  return mapPlaces(data, catalog);
};

export const getTopPlaces = async (
  params: TopPlacesQueryParams,
  catalog?: PlaceCatalog,
): Promise<Place[]> => {
  const { data } = await apiClient.get<unknown>(
    ENDPOINTS.map.topPlaces,
    { params },
  );

  return mapPlaces(data, catalog);
};
