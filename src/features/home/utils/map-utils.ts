import type { Region } from '@mj-studio/react-native-naver-map';

import type { Place } from '@/features/places/types';

import {
  MAP_BOUNDS_EPSILON,
  MAP_SEARCH_FIT_PADDING_RATIO,
} from '../constants';
import type { MapBounds } from '../types';

export function areMapBoundsEqual(
  firstBounds: MapBounds,
  secondBounds: MapBounds,
) {
  return (
    Math.abs(firstBounds.swLng - secondBounds.swLng) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.swLat - secondBounds.swLat) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.neLng - secondBounds.neLng) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.neLat - secondBounds.neLat) < MAP_BOUNDS_EPSILON
  );
}

/** 네이버 지도 Region의 남서쪽 좌표와 delta를 API bounds로 변환한다. */
export function toMapBounds(region: Region): MapBounds {
  return {
    swLng: region.longitude,
    swLat: region.latitude,
    neLng: region.longitude + region.longitudeDelta,
    neLat: region.latitude + region.latitudeDelta,
  };
}

/** 검색 결과의 모든 유효 좌표를 감싸는 지도 범위를 계산한다. */
export function getPlaceCoordinateBounds(places: Place[]): MapBounds | null {
  const coordinates = places.filter(place =>
    Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
  );

  if (coordinates.length === 0) return null;

  const latitudes = coordinates.map(place => place.latitude as number);
  const longitudes = coordinates.map(place => place.longitude as number);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lngSpan = Math.max(maxLng - minLng, 0.01);
  const latPadding = latSpan * MAP_SEARCH_FIT_PADDING_RATIO;
  const lngPadding = lngSpan * MAP_SEARCH_FIT_PADDING_RATIO;

  return {
    swLat: minLat - latPadding,
    swLng: minLng - lngPadding,
    neLat: maxLat + latPadding,
    neLng: maxLng + lngPadding,
  };
}
