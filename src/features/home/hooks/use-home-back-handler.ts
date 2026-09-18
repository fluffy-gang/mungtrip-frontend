import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

import type { HomeMode } from '../types';
import type { Place } from '@/features/places/types';

type UseHomeBackHandlerParams = {
  closePlacePreview: () => void;
  closeSearch: () => void;
  mode: HomeMode;
  selectedPlace: Place | null;
};

/** 홈 포커스 중 오버레이를 먼저 닫아 상세 화면의 back 동작을 보존한다. */
export function useHomeBackHandler({
  closePlacePreview,
  closeSearch,
  mode,
  selectedPlace,
}: UseHomeBackHandlerParams) {
  useFocusEffect(
    useCallback(() => {
      if (mode !== 'search' && !selectedPlace) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (mode === 'search') {
            closeSearch();
          } else {
            closePlacePreview();
          }

          return true;
        },
      );

      return () => subscription.remove();
    }, [mode, selectedPlace, closeSearch, closePlacePreview]),
  );
}
