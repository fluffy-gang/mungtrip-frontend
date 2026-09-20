import type { Region } from '@mj-studio/react-native-naver-map';
import type { MapBounds } from '../types';

/** 네이버 지도 Region의 중심 좌표와 전체 delta를 API bounds로 변환한다. */
export function toMapBounds(region: Region): MapBounds {
  return {
    swLng: region.longitude - region.longitudeDelta / 2,
    swLat: region.latitude - region.latitudeDelta / 2,
    neLng: region.longitude + region.longitudeDelta / 2,
    neLat: region.latitude + region.latitudeDelta / 2,
  };
}
