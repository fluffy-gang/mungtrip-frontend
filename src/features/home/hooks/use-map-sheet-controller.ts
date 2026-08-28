import { useCallback, useMemo, useState } from 'react';
import { PanResponder } from 'react-native';

import {
  BOTTOM_TAB_HEIGHT,
  MAP_COLLAPSED_SHEET_HEIGHT,
  MAP_EXPANDED_TOP_GAP,
  MAP_FLOATING_ACTION_GAP,
} from '../constants';
import type { MapSheetContent, MapSheetLevel } from '../types';

interface UseMapSheetControllerOptions {
  /** 헤더(검색바+카테고리)를 제외한, 지도 영역이 실제로 차지하는 높이. */
  areaHeight: number;
  bottomInset: number;
}

export function useMapSheetController({
  areaHeight,
  bottomInset,
}: UseMapSheetControllerOptions) {
  const [content, setContent] = useState<MapSheetContent>('content');
  const [level, setLevel] = useState<MapSheetLevel>('collapsed');
  const sheetBottomOffset = bottomInset + BOTTOM_TAB_HEIGHT;
  const expandedHeight = Math.max(
    MAP_COLLAPSED_SHEET_HEIGHT,
    areaHeight - sheetBottomOffset - MAP_EXPANDED_TOP_GAP,
  );
  const height = {
    collapsed: MAP_COLLAPSED_SHEET_HEIGHT,
    expanded: expandedHeight,
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
  const floatingActionText = isExpanded
    ? '지도보기'
    : isPlaceList
      ? '콘텐츠 피드 보기'
      : '장소 리스트 보기';
  const floatingActionIcon = isExpanded
    ? { android: 'map', ios: 'map', web: 'map' } as const
    : { android: 'swap_horiz', ios: 'arrow.left.arrow.right', web: 'swap_horiz' } as const;

  const collapse = useCallback(() => {
    setLevel('collapsed');
  }, []);
  const expand = useCallback(() => {
    setLevel('expanded');
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
    setContent('content');
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
