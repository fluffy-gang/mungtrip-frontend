import type { Region } from '@mj-studio/react-native-naver-map';
import type { MapBounds } from '../types';

/** 네이버 지도 Region의 남서쪽 좌표와 delta를 API bounds로 변환한다. */
export function toMapBounds(region: Region): MapBounds {
  return {
    swLng: region.longitude,
    swLat: region.latitude,
    neLng: region.longitude + region.longitudeDelta,
    neLat: region.latitude + region.latitudeDelta,
  };
}
