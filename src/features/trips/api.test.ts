import assert from 'node:assert/strict';
import test from 'node:test';

import { createTripAdapter } from './api';
import { dateCount, dateRange, isValidDate } from './date-utils';
import { fixtureTrip, input } from './test-fixtures';
import { parseTrip } from './validation';

import type { TripTransport } from './types';

test('strict dates handle invalid month, leap day, reversal and inclusive single/range', () => {
  assert.equal(isValidDate('2026-13-01'), false);
  assert.equal(isValidDate('2026-02-29'), false);
  assert.equal(isValidDate('2024-02-29'), true);
  assert.equal(isValidDate(''), false);
  assert.deepEqual(dateRange('2026-10-01', '2026-10-01'), ['2026-10-01']);
  assert.equal(dateCount(input.startDate, input.endDate), 3);
  assert.deepEqual(dateRange(input.endDate, input.startDate), []);
});
test('API rejects missing nested arrays, invalid dates, duplicate ids and missing days', () => {
  const trip = fixtureTrip();
  assert.throws(() => parseTrip({ ...trip, days: undefined }));
  assert.throws(() => parseTrip({ ...trip, days: [{ ...trip.days[0], items: undefined }] }));
  assert.throws(() => parseTrip({ ...trip, startDate: '2026-13-01' }));
  assert.throws(() => parseTrip({ ...trip, days: [{ ...trip.days[0], items: [...trip.days[0].items, ...trip.days[0].items] }] }));
  assert.throws(() => parseTrip({ ...trip, endDate: '2026-10-02' }));
});
test('real adapter sends actual paths and bodies, preserving response counts and nullable nearby metadata', async () => {
  const calls: Parameters<TripTransport['request']>[0][] = [];
  const transport: TripTransport = {
    request: async (config) => {
      calls.push(config);
      if (config.method === 'POST')
        return config.path.endsWith('/trips') ? { tripId: 9 } : { tripItemIds: [11, 12] };
      if (config.path.endsWith('/brief'))
        return { trips: [{ ...fixtureTrip(), totalDays: 1 }] };
      if (config.path.endsWith('/nearby'))
        return { places: [{ id: 2, name: '공원', distanceMeters: 0 }], expandedRadiusMeters: null, expandedCount: null };
      if (config.path.endsWith('/trips'))
        return { upcomingTrips: [{ ...fixtureTrip(), thumbnailUrls: ['a', 'b'], totalPlaceCount: 2, visitedPlaceCount: 1 }], pastTrips: [] };
      return undefined;
    }
  };
  const api = createTripAdapter(transport);
  assert.equal(await api.create(input), 9);
  assert.deepEqual(calls[0].body, input);
  assert.deepEqual(await api.addPlaces(9, [101, 102], 2), [11, 12]);
  assert.equal(calls[1].path, '/api/v1/trips/9/items/place');
  assert.deepEqual(calls[1].body, { placeIds: [101, 102], day: 2 });
  await api.addCourse(9, 201, 1);
  assert.equal(calls[2].path, '/api/v1/trips/9/items/course');
  await api.update(9, '변경', []);
  assert.deepEqual(calls[3].body, { title: '변경', items: [] });
  await api.remove(9);
  assert.equal(calls[4].method, 'DELETE');
  assert.equal((await api.brief())[0].totalDays, 1);
  assert.deepEqual((await api.list()).upcomingTrips[0].thumbnailUrls, ['a', 'b']);
  const nearby = await api.nearby(1);
  assert.equal(nearby.places[0].distanceMeters, 0);
  assert.equal(nearby.expandedRadiusMeters, null);
});
test('adapter rejects malformed list instead of returning destructive empty data', async () => {
  const api = createTripAdapter({ request: async () => ({}) });
  await assert.rejects(api.list());
  await assert.rejects(api.detail(1));
  await assert.rejects(api.brief());
  await assert.rejects(api.create({ ...input, dogIds: [] }));
  await assert.rejects(api.search({}));
});

test('search pagination and filter parameters use verified API and no envelope double unwrap', async () => {
  const calls: Parameters<TripTransport['request']>[0][] = [];
  const api = createTripAdapter({ request: async config => {
    calls.push(config);
    return { places: [{ id: 101, name: '장소', mapx: 126.3, mapy: 33.4, thumbnailUrl: null }], page: 1, size: 20, totalCount: 50 };
  } });
  const result = await api.search({ keyword: '장소', page: 1, size: 20, dogIds: [1], category: 'CAFE' });
  assert.equal(result.page, 1); assert.equal(result.totalCount, 50); assert.equal(result.places[0].longitude, 126.3);
  assert.deepEqual(calls[0].params, { keyword: '장소', page: 1, size: 20, dogIds: [1], category: 'CAFE' });
  await api.recommendations('CAFE'); assert.equal(calls[1].path, '/api/v1/places/recommendations');
  await api.recent('CAFE'); assert.equal(calls[2].path, '/api/v1/places/me/recent-views');
});
