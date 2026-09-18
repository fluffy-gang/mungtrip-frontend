import { errorMessage } from './provider';

import type { TripPlaceSelection, TripSearchResult } from './types';
/** Selection survives result replacement; only explicit cancel clears it. */
export function createPlaceSelection() {
  let selected: TripPlaceSelection[] = [];
  return {
    getSnapshot: () => selected,
    toggle(place: TripPlaceSelection) { selected = selected.some(item => item.id === place.id) ? selected.filter(item => item.id !== place.id) : [...selected, place]; return selected; },
    cancel() { selected = []; return selected; },
  };
}
export function createPlaceQueryController() {
  let version = 0;
  let snapshot = { places: [] as TripPlaceSelection[], loading: false, error: '', page: 0, hasMore: false };
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<typeof snapshot>) => { snapshot = { ...snapshot, ...patch }; listeners.forEach(listener => listener()); };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    invalidate() { version++; },
    async load(request: (page: number) => Promise<TripSearchResult>, append = false) {
      if (append && snapshot.loading)
        return;
      const current = ++version, page = append ? snapshot.page + 1 : 0;
      publish({ loading: true, error: '', ...(append ? {} : { places: [], page: 0, hasMore: false }) });
      try {
        const result = await request(page);
        if (current !== version)
          return;
        const combined = append ? [...snapshot.places, ...result.places] : result.places;
        publish({ places: [...new Map(combined.map(place => [place.id, place])).values()], page: result.page, hasMore: (result.page + 1) * result.size < result.totalCount });
      }
      catch (reason) {
        if (current === version)
          publish({ error: errorMessage(reason) });
      }
      finally {
        if (current === version)
          publish({ loading: false });
      }
    },
  };
}
