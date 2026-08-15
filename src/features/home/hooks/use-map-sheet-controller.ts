import { useCallback, useMemo, useState } from 'react';
import { PanResponder } from 'react-native';

import {
  BOTTOM_TAB_HEIGHT,
  MAP_COLLAPSED_SHEET_HEIGHT,
  MAP_EXPANDED_TOP_OFFSET,
  MAP_FLOATING_ACTION_GAP,
  MAP_HALF_SHEET_RATIO,
} from '../constants';
import type { MapSheetContent, MapSheetLevel } from '../types';

interface UseMapSheetControllerOptions {
  bottomInset: number;
  topInset: number;
  windowHeight: number;
}

export function useMapSheetController({
  bottomInset,
  topInset,
  windowHeight,
}: UseMapSheetControllerOptions) {
  const [content, setContent] = useState<MapSheetContent>('content');
  const [level, setLevel] = useState<MapSheetLevel>('collapsed');
  const sheetBottomOffset = bottomInset + BOTTOM_TAB_HEIGHT;
  const expandedHeight = Math.max(
    MAP_COLLAPSED_SHEET_HEIGHT,
    windowHeight - sheetBottomOffset - (topInset + MAP_EXPANDED_TOP_OFFSET),
  );
  const halfHeight = Math.min(
    expandedHeight,
    Math.max(
      MAP_COLLAPSED_SHEET_HEIGHT,
      Math.round(windowHeight * MAP_HALF_SHEET_RATIO),
    ),
  );
  const height = {
    collapsed: MAP_COLLAPSED_SHEET_HEIGHT,
    expanded: expandedHeight,
    half: halfHeight,
  }[level];
  const isExpanded = level === 'expanded';
  const isPlaceList = content === 'places';
  const floatingActionBottom =
    bottomInset +
    BOTTOM_TAB_HEIGHT +
    (isExpanded ? 16 : height + MAP_FLOATING_ACTION_GAP);
  const myLocationButtonBottom =
    bottomInset + BOTTOM_TAB_HEIGHT + height + MAP_FLOATING_ACTION_GAP;
  const zoomControlBottom = myLocationButtonBottom + 52;
  const floatingActionText = isPlaceList
    ? '콘텐츠 보기'
    : '장소 리스트 보기';
  const floatingActionIcon = isPlaceList
    ? { android: 'dashboard', ios: 'square.grid.2x2', web: 'dashboard' } as const
    : { android: 'list', ios: 'list.bullet', web: 'list' } as const;

  const collapse = useCallback(() => {
    setLevel(currentLevel => {
      if (currentLevel === 'expanded') {
        return 'half';
      }

      if (currentLevel === 'half') {
        return 'collapsed';
      }

      return currentLevel;
    });
  }, []);
  const expand = useCallback(() => {
    setLevel(currentLevel => {
      if (currentLevel === 'collapsed') {
        return 'half';
      }

      if (currentLevel === 'half') {
        return 'expanded';
      }

      return currentLevel;
    });
  }, []);
  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dy) > 8 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy < -36) {
            expand();
            return;
          }

          if (gesture.dy > 36) {
            collapse();
          }
        },
      }).panHandlers,
    [collapse, expand],
  );
  const showMap = useCallback(() => {
    setLevel('collapsed');
  }, []);
  const showContentCollapsed = useCallback(() => {
    setContent('content');
    setLevel('collapsed');
  }, []);
  const showPlacesCollapsed = useCallback(() => {
    setContent('places');
    setLevel('collapsed');
  }, []);
  const showPlacesExpanded = useCallback(() => {
    setContent('places');
    setLevel('expanded');
  }, []);
  const toggleContent = useCallback(() => {
    setContent(currentContent =>
      currentContent === 'places' ? 'content' : 'places',
    );
  }, []);

  return {
    floatingActionBottom,
    floatingActionIcon,
    floatingActionText,
    height,
    isExpanded,
    isPlaceList,
    myLocationButtonBottom,
    panHandlers,
    showContentCollapsed,
    showMap,
    showPlacesCollapsed,
    showPlacesExpanded,
    toggleContent,
    zoomControlBottom,
  };
}
