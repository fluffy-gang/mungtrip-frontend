import type { Place } from '@/features/places/types';

export const hasPlaceCoordinate = (
  place: Place,
): place is Place & { latitude: number; longitude: number } => {
  return place.latitude !== undefined && place.longitude !== undefined;
};
