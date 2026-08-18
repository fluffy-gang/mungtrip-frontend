import type { SymbolViewProps } from 'expo-symbols';

import type { MapBounds, MapCamera } from './types';

type PlaceCategorySymbol = SymbolViewProps['name'];

export const PLACE_CATEGORY_META = {
  RESTAURANT: {
    color: '#D97706',
    symbol: { android: 'restaurant', ios: 'fork.knife', web: 'restaurant' },
  },
  CAFE: {
    color: '#8B5E34',
    symbol: { android: 'local_cafe', ios: 'cup.and.saucer.fill', web: 'local_cafe' },
  },
  ATTRACTION: {
    color: '#2E7D32',
    symbol: { android: 'park', ios: 'tree.fill', web: 'park' },
  },
  ACCOMMODATION: {
    color: '#4F46E5',
    symbol: { android: 'hotel', ios: 'bed.double.fill', web: 'hotel' },
  },
  HOSPITAL: {
    color: '#0EA5E9',
    symbol: { android: 'local_hospital', ios: 'cross.case.fill', web: 'local_hospital' },
  },
  ACTIVITY: {
    color: '#16A34A',
    symbol: { android: 'directions_run', ios: 'figure.run', web: 'directions_run' },
  },
  GROOMING: {
    color: '#DB2777',
    symbol: { android: 'content_cut', ios: 'scissors', web: 'content_cut' },
  },
  CARE: {
    color: '#F97316',
    symbol: { android: 'favorite', ios: 'heart.fill', web: 'favorite' },
  },
  SHOPPING: {
    color: '#7C3AED',
    symbol: { android: 'shopping_bag', ios: 'bag.fill', web: 'shopping_bag' },
  },
  TRAINING: {
    color: '#EA580C',
    symbol: { android: 'school', ios: 'graduationcap.fill', web: 'school' },
  },
  FACILITY: {
    color: '#64748B',
    symbol: { android: 'build', ios: 'wrench.and.screwdriver.fill', web: 'build' },
  },
  DEFAULT: {
    color: '#FF6A21',
    symbol: { android: 'pets', ios: 'pawprint.fill', web: 'pets' },
  },
} satisfies Record<string, { color: string; symbol: PlaceCategorySymbol }>;

export const BOTTOM_TAB_HEIGHT = 56;
export const MAP_COLLAPSED_SHEET_HEIGHT = 214;
// 카테고리 칩(zIndex 20)이 항상 시트보다 위에 떠 있어 그 아래까지만 올라간다.
export const MAP_EXPANDED_TOP_OFFSET = 104;
export const MAP_FLOATING_ACTION_GAP = 10;
export const MAP_HALF_SHEET_RATIO = 0.5;
export const MAP_BOUNDS_EPSILON = 0.00001;
export const MAP_MAX_ZOOM = 18;
export const MAP_MIN_ZOOM = 6;
export const MAP_ZOOM_STEP = 1;
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
