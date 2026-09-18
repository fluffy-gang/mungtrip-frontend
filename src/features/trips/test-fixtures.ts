import type { Trip } from './types';

export const input = { title: '새 여행', startDate: '2026-10-01', endDate: '2026-10-03', dogIds: [1] };
export const place = { id: 101, name: '카페' };
export function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
export const emptyList = { upcomingTrips: [], pastTrips: [] };
export const fixtureTrip = (): Trip => ({ tripId: 1, title: '여행', startDate: '2026-10-01', endDate: '2026-10-01', days: [{ day: 1, date: '2026-10-01', items: [{ tripItemId: 10, sortOrder: 1, placeId: 101, placeName: '카페' }] }] });
