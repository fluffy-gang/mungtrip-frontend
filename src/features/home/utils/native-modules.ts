import type { LocationModule, NativeMapModule } from '../types';

export function loadNativeMapModule(): NativeMapModule | null {
  if (!process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID?.trim()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@mj-studio/react-native-naver-map') as NativeMapModule;
  } catch {
    return null;
  }
}

export function loadLocationModule(): LocationModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-location') as LocationModule;
  } catch {
    return null;
  }
}
