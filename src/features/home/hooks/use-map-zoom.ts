import { useCallback } from 'react';

import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, MAP_ZOOM_STEP } from '../constants';

import type { MapCamera } from '../types';
import type { Dispatch, SetStateAction } from 'react';

/** 지도 확대/축소 버튼용 컨트롤. 줌은 항상 지원 범위로 고정한다. */
export function useMapZoom(setMapCamera: Dispatch<SetStateAction<MapCamera>>) {
  const updateMapZoom = useCallback(
    (zoomDelta: number) => {
      setMapCamera(currentCamera => ({
        ...currentCamera,
        zoom: Math.min(
          MAP_MAX_ZOOM,
          Math.max(MAP_MIN_ZOOM, currentCamera.zoom + zoomDelta),
        ),
      }));
    },
    [setMapCamera],
  );
  const zoomIn = useCallback(() => {
    updateMapZoom(MAP_ZOOM_STEP);
  }, [updateMapZoom]);
  const zoomOut = useCallback(() => {
    updateMapZoom(-MAP_ZOOM_STEP);
  }, [updateMapZoom]);

  return { zoomIn, zoomOut };
}
