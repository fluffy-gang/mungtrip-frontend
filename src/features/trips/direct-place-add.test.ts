import assert from 'node:assert/strict';
import test from 'node:test';

import { TripWriteUncertainError } from './api';
import { createDirectPlaceAddController } from './direct-place-add';
import { createMockTripProvider, createTripProvider, TripSessionChangedError } from './provider';
import { emptyList, fixtureTrip, input, place } from './test-fixtures';

test('direct add writes to the fixed trip/day and repeated submits deliver one write', async () => {
  const provider = createMockTripProvider('empty');
  const tripId = await provider.create(input);
  const direct = createDirectPlaceAddController(provider, tripId, 2);
  const result = await direct.submit([place]);
  assert.ok(result.status === 'completed' && result.tripId === tripId);
  const trip = await provider.loadTrip(tripId);
  assert.deepEqual(trip.days[1].items.map(item => item.placeId), [place.id]);
  assert.deepEqual(trip.days[0].items, []);
  assert.equal(await direct.submit([place]), result);
  assert.equal((await provider.loadTrip(tripId)).days[1].items.length, 1);
});

test('concurrent submits share one in-flight write', async () => {
  const provider = createMockTripProvider('empty');
  const tripId = await provider.create(input);
  const direct = createDirectPlaceAddController(provider, tripId, 1);
  const first = direct.submit([place]);
  const second = direct.submit([place]);
  assert.equal(direct.busy, true);
  assert.equal(await first, await second);
  assert.equal((await provider.loadTrip(tripId)).days[0].items.length, 1);
});

test('invalid trip id, day or empty selection is rejected before any write', async () => {
  const provider = createMockTripProvider('empty');
  const tripId = await provider.create(input);
  await assert.rejects(createDirectPlaceAddController(provider, 0, 1).submit([place]));
  await assert.rejects(createDirectPlaceAddController(provider, Number.NaN, 1).submit([place]));
  await assert.rejects(createDirectPlaceAddController(provider, tripId, 0).submit([place]));
  await assert.rejects(createDirectPlaceAddController(provider, tripId, 1).submit([]));
  assert.equal((await provider.loadTrip(tripId)).days[0].items.length, 0);
});

test('a definite failure stays retryable with the current selection', async () => {
  const provider = createMockTripProvider('empty');
  const tripId = await provider.create(input);
  provider.failNext?.('addPlaces');
  const direct = createDirectPlaceAddController(provider, tripId, 1);
  await assert.rejects(direct.submit([place]));
  assert.equal(direct.uncertain, false);
  const result = await direct.submit([place]);
  assert.ok(result.status === 'completed');
  assert.deepEqual((await provider.loadTrip(tripId)).days[0].items.map(item => item.placeId), [place.id]);
});

test('a session change blocks the write instead of adding to another account', async () => {
  const provider = createMockTripProvider('empty');
  const tripId = await provider.create(input);
  const direct = createDirectPlaceAddController(provider, tripId, 1);
  provider.resetForSession('user-b');
  await assert.rejects(direct.submit([place]), TripSessionChangedError);
});

test('an ambiguous write is never resent from the same screen', async () => {
  let posts = 0;
  const provider = createTripProvider({
    transport: {
      request: async (config) => {
        if (config.method === 'POST') {
          posts++;
          throw new Error('network lost');
        }
        return config.path === '/api/v1/trips/1' ? fixtureTrip() : emptyList;
      },
    },
  });
  const direct = createDirectPlaceAddController(provider, 1, 1);
  await assert.rejects(direct.submit([place]), TripWriteUncertainError);
  assert.equal(direct.uncertain, true);
  await assert.rejects(direct.submit([place]), TripWriteUncertainError);
  assert.equal(posts, 1);
});
