export type HomeMode = 'map' | 'search';
export type MapSheetLevel = 'collapsed' | 'expanded';
export interface MapCamera {
  latitude: number;
  longitude: number;
  zoom: number;
}
export interface MapBounds {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
}
export type NativeMapModule = typeof import('@mj-studio/react-native-naver-map');
