/**
 * 지도 마커는 React 자식 뷰 대신 캐시 가능한 로컬 비트맵을 사용한다.
 * Fabric 환경에서 다수의 커스텀 마커를 동시에 mount/unmount할 때 발생하는
 * 네이티브 인덱스 오류를 피하면서도 동일한 원형 마커 UI를 제공한다.
 */
import type { ImageRequireSource } from 'react-native';

const categoryIconMasks = {
  ACCOMMODATION: require('@/assets/images/map-marker-masks/accommodation.png'),
  ACTIVITY: require('@/assets/images/map-marker-masks/activity.png'),
  ATTRACTION: require('@/assets/images/map-marker-masks/attraction.png'),
  CAFE: require('@/assets/images/map-marker-masks/cafe.png'),
  CARE: require('@/assets/images/map-marker-masks/care.png'),
  DEFAULT: require('@/assets/images/map-marker-masks/default.png'),
  FACILITY: require('@/assets/images/map-marker-masks/facility.png'),
  GROOMING: require('@/assets/images/map-marker-masks/grooming.png'),
  HOSPITAL: require('@/assets/images/map-marker-masks/hospital.png'),
  RESTAURANT: require('@/assets/images/map-marker-masks/restaurant.png'),
  SHOPPING: require('@/assets/images/map-marker-masks/shopping.png'),
  TRAINING: require('@/assets/images/map-marker-masks/training.png'),
} as const satisfies Record<string, ImageRequireSource>;

export const placeMarkerBackgroundMask = require('@/assets/images/map-marker-masks/background.png');

export function getPlaceMarkerIconMask(category: string): ImageRequireSource {
  return (
    categoryIconMasks[category as keyof typeof categoryIconMasks] ??
    categoryIconMasks.DEFAULT
  );
}
