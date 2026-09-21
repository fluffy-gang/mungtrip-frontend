import type { SymbolViewProps } from 'expo-symbols';
import type { MapBounds, MapCamera } from './types';

type PlaceCategorySymbol = SymbolViewProps['name'];
type LocalMapIcon = number;

interface ImageCategoryMeta {
  readonly kind: 'image';
  readonly icon: LocalMapIcon;
  readonly rotate?: number;
}

interface FallbackCategoryMeta {
  readonly kind: 'fallback';
  readonly symbol: PlaceCategorySymbol;
}

export const PLACE_CATEGORY_META = {
  RESTAURANT: {
    kind: 'image',
    icon: require('./assets/map-icons/restaurant.webp'),
  },
  CAFE: {
    kind: 'image',
    icon: require('./assets/map-icons/cafe.webp'),
  },
  ATTRACTION: {
    kind: 'image',
    icon: require('./assets/map-icons/attraction.webp'),
  },
  ACCOMMODATION: {
    kind: 'image',
    icon: require('./assets/map-icons/accommodation.webp'),
  },
  HOSPITAL: {
    kind: 'image',
    icon: require('./assets/map-icons/hospital.svg'),
  },
  ACTIVITY: {
    kind: 'image',
    icon: require('./assets/map-icons/activity.webp'),
  },
  GROOMING: {
    kind: 'image',
    icon: require('./assets/map-icons/grooming.webp'),
    rotate: -90,
  },
  CARE: {
    kind: 'image',
    icon: require('./assets/map-icons/care.webp'),
  },
  SHOPPING: {
    kind: 'image',
    icon: require('./assets/map-icons/shopping.webp'),
  },
  TRAINING: {
    kind: 'image',
    icon: require('./assets/map-icons/training.webp'),
  },
  FACILITY: {
    kind: 'image',
    icon: require('./assets/map-icons/facility.webp'),
  },
  DEFAULT: {
    kind: 'fallback',
    symbol: { android: 'pets', ios: 'pawprint.fill', web: 'pets' } as PlaceCategorySymbol,
  },
} as const satisfies Record<string, ImageCategoryMeta | FallbackCategoryMeta>;

export type PlaceCategoryMeta = ImageCategoryMeta | FallbackCategoryMeta;

export function getPlaceCategoryMeta(category: string): PlaceCategoryMeta {
  if (Object.prototype.hasOwnProperty.call(PLACE_CATEGORY_META, category)) {
    return PLACE_CATEGORY_META[category as keyof typeof PLACE_CATEGORY_META];
  }
  return PLACE_CATEGORY_META.DEFAULT;
}

/** 홈 상단 검색 버튼과 검색 화면 입력창이 같은 문구를 보여야 화면 전환이 자연스럽다. */
export const SEARCH_PLACEHOLDER = '강아지 동반 장소 검색';

export const BOTTOM_TAB_HEIGHT = 56;
export const MAP_COLLAPSED_SHEET_HEIGHT = 214;
// 검색바 + 카테고리 칩 헤더의 고정 높이(안전영역 제외). 헤더가 더 이상 지도 위에
// 떠 있지 않고 별도 영역이라, 지도 영역 높이(areaHeight)를 계산할 때 사용한다.
export const HEADER_CONTENT_HEIGHT = 90;
// 시트를 최대로 확장해도 지도가 살짝 보이도록 남겨두는 여백.
export const MAP_EXPANDED_TOP_GAP = 16;
export const MAP_FLOATING_ACTION_GAP = 10;
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

/** 현재 위치 자동 이동은 서비스 지역인 제주 지도 경계 안에서만 허용한다. */
export const isWithinJejuMapBounds = (latitude: number, longitude: number) => {
  return (
    latitude >= JEJU_MAP_BOUNDS.swLat &&
    latitude <= JEJU_MAP_BOUNDS.neLat &&
    longitude >= JEJU_MAP_BOUNDS.swLng &&
    longitude <= JEJU_MAP_BOUNDS.neLng
  );
};
