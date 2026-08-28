import { useCallback, useMemo, useState } from 'react';
import { PanResponder } from 'react-native';

import {
  MAP_COLLAPSED_SHEET_HEIGHT,
  MAP_EXPANDED_TOP_GAP,
  MAP_FLOATING_ACTION_GAP,
} from '../constants';
import type { MapSheetLevel } from '../types';

interface UseMapSheetControllerOptions {
  /** 헤더와 하단 safe area를 제외한, 지도 영역이 실제로 차지하는 높이. */
  areaHeight: number;
}

export function useMapSheetController({
  areaHeight,
}: UseMapSheetControllerOptions) {
  const [level, setLevel] = useState<MapSheetLevel>('collapsed');
  const expandedHeight = Math.max(
    MAP_COLLAPSED_SHEET_HEIGHT,
    areaHeight - MAP_EXPANDED_TOP_GAP,
  );
  const height = {
    collapsed: MAP_COLLAPSED_SHEET_HEIGHT,
    expanded: expandedHeight,
  }[level];
  const isExpanded = level === 'expanded';
  const floatingActionBottom = isExpanded
    ? 16
    : height + MAP_FLOATING_ACTION_GAP;
  const zoomControlBottom = height + MAP_FLOATING_ACTION_GAP;

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
  return {
    floatingActionBottom,
    height,
    panHandlers,
    showMap: collapse,
    showPlacesCollapsed: collapse,
    zoomControlBottom,
  };
}
