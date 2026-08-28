import type { MapBounds, MapCamera } from './types';

export const MAP_COLLAPSED_SHEET_HEIGHT = 214;
// 검색바 + 카테고리 칩 헤더의 고정 높이(안전영역 제외). 헤더가 더 이상 지도 위에
// 떠 있지 않고 별도 영역이라, 지도 영역 높이(areaHeight)를 계산할 때 사용한다.
export const HEADER_CONTENT_HEIGHT = 168;
// 시트를 최대로 확장해도 지도가 살짝 보이도록 남겨두는 여백.
export const MAP_EXPANDED_TOP_GAP = 16;
export const MAP_FLOATING_ACTION_GAP = 10;
export const MAP_BOUNDS_EPSILON = 0.00001;
export const MAP_MAX_ZOOM = 18;
export const MAP_MIN_ZOOM = 6;
export const MAP_ZOOM_STEP = 1;
export const MAP_SEARCH_SINGLE_RESULT_ZOOM = 15;
export const MAP_SEARCH_FIT_PADDING_RATIO = 0.12;
export const MAP_SEARCH_FIT_PIVOT = { x: 0.5, y: 0.38 } as const;
export const JEJU_MAP_BOUNDS: MapBounds = {
  swLng: 126.1,
  swLat: 33.1,
  neLng: 127,
  neLat: 33.6,
} as const;



export const JEJU_MAP_CAMERA: MapCamera = {
  latitude: 33.4996,
  longitude: 126.5312,
  zoom: 10,
};
