import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import type { HomeMode } from '../types';

/** 다른 탭의 검색 진입을 반영하고, 홈에서 모드를 바꾸면 전달된 요청을 지운다. */
export function useHomeMode() {
  const router = useRouter();
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: string }>();
  const [localMode, setLocalMode] = useState<HomeMode>('map');
  const mode: HomeMode = requestedMode === 'search' ? 'search' : localMode;
  const setMode = useCallback((nextMode: HomeMode) => {
    setLocalMode(nextMode);
    if (requestedMode !== undefined) router.setParams({ mode: undefined });
  }, [requestedMode, router]);
  return { mode, setMode };
}
