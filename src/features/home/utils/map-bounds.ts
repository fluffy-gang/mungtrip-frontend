import { MAP_BOUNDS_EPSILON } from '../constants';

import type { MapBounds } from '../types';

export function areMapBoundsEqual(
  firstBounds: MapBounds,
  secondBounds: MapBounds,
): boolean {
  // Small coordinate drift from map updates is equivalent to the same viewport.
  return (
    Math.abs(firstBounds.swLng - secondBounds.swLng) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.swLat - secondBounds.swLat) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.neLng - secondBounds.neLng) < MAP_BOUNDS_EPSILON &&
    Math.abs(firstBounds.neLat - secondBounds.neLat) < MAP_BOUNDS_EPSILON
  );
}
