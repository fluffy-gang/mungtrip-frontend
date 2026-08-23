import type { LocationModule, NativeMapModule } from '../types';

/**
 * 네이버 지도 네이티브 모듈은 Expo Go에서 사용할 수 없고, 개발 빌드에서도
 * `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`가 없으면 로드하지 않는다.
 * 모듈 스코프에서 한 번만 로드해서, 지도 렌더링(`MapCanvas`)과
 * 지도 오버레이 컨트롤 표시 여부가 항상 같은 판단 기준을 쓰도록 한다.
 */
const nativeMapModuleInstance = ((): NativeMapModule | null => {
  if (!process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@mj-studio/react-native-naver-map') as NativeMapModule;
  } catch {
    return null;
  }
})();

export const isNativeMapAvailable = nativeMapModuleInstance !== null;

export function loadNativeMapModule(): NativeMapModule | null {
  return nativeMapModuleInstance;
}

/** expo-location은 네이티브 모듈이라 Expo Go 등 미지원 환경에서는 require가 던진다. */
export function loadLocationModule(): LocationModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-location') as LocationModule;
  } catch {
    return null;
  }
}
