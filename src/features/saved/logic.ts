import type { Place } from '@/features/places/types';

export const toggleVisibleSelection = (selected: number[], visibleIds: number[]): number[] => {
  const visible = new Set(visibleIds);
  const allVisible = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id));
  return allVisible ? selected.filter(id => !visible.has(id)) : [...new Set([...selected, ...visibleIds])];
};

export const pruneSelection = (selected: number[], places: Place[]): number[] => {
  const available = new Set(places.map(place => place.id));
  return selected.filter(id => available.has(id));
};

export const selectedPlaceModels = (selected: number[], places: Place[]): Place[] => {
  const ids = new Set(selected);
  return places.filter(place => ids.has(place.id));
};
