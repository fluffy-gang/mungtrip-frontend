// Run with the existing saved/tests/loader.js to resolve production TS imports.
import assert from 'node:assert/strict';
import { createSavedProvider } from '../src/features/saved/provider.ts';
import { createTripProvider } from '../src/features/trips/provider.ts';
import { createTripFlowController, completeTripVisit } from '../src/features/trips/flow.ts';
import { MOCK_PLACES } from '../src/features/trips/mock.ts';
import { createProvider } from '../src/features/places/detail/provider.ts';
import { createMockPlaceAdapter } from '../src/features/places/detail/mock.ts';

const catalog = MOCK_PLACES.map(place => ({ ...place, categoryName: place.category, address: place.address ?? '', tags: [], tagCodes: [], isLiked: true, isOfficial: false }));
const saved = createSavedProvider({ source: 'mock', mock: { places: catalog } });
const trips = createTripProvider({ source: 'mock' });
const places = createProvider(createMockPlaceAdapter({ catalog, delayMs: 0 }));
try {
  await saved.refresh('places');
  await trips.refreshOptions();
  const dogIds = trips.getSnapshot().dogs.map(dog => dog.dogId);
  const selected = saved.getSnapshot().places.items.slice(0, 2);
  assert.equal(selected.length, 2);
  const flow = createTripFlowController(trips, { mode: 'create', source: 'mock', selection: { kind: 'place', places: selected } });
  const result = await flow.submit({ create: { title: '연결 검증', startDate: '2026-10-10', endDate: '2026-10-11', dogIds }, day: 2 });
  assert.equal(result.status, 'completed');
  let trip = await trips.loadTrip(result.tripId);
  assert.deepEqual(trip.days[1].items.map(item => item.placeId), selected.map(place => place.id));
  const item = trip.days[1].items[0];
  await places.loadDetail(item.placeId);
  assert.equal(places.getSnapshot().places[item.placeId].detail.data.name, selected[0].name);
  const action = { source: 'mock', tripId: trip.tripId, tripItemId: item.tripItemId, placeId: item.placeId };
  const visit = await completeTripVisit(trips, action, async () => ({ status: 'completed', source: 'mock', ...await places.visit(item.placeId, { outcome: 'VISITED' }) }));
  assert.equal(visit.status, 'completed');
  trip = trips.getSnapshot().details[trip.tripId];
  assert.equal(trip.days[1].items[0].visitStatus, 'VISITED');
  await completeTripVisit(trips, action, async () => ({ status: 'completed', source: 'mock', ...await places.visit(item.placeId, { outcome: 'REJECTED', rejectReason: 'CLOSED' }) }));
  trip = trips.getSnapshot().details[trip.tripId];
  assert.equal(trip.days[1].items[0].visitStatus, 'REJECTED');
  assert.equal(trip.days[1].items[0].rejectReason, 'CLOSED');
  await saved.togglePlaceLike(item.placeId);
  assert.equal(saved.getSnapshot().placeLikedById[item.placeId], false);
  assert.ok(!saved.getSnapshot().places.items.some(place => place.id === item.placeId));
  assert.equal(trips.getSnapshot().details[trip.tripId].days[1].items[0].placeId, item.placeId);
  await assert.rejects(trips.applyVisitResult({ ...visit, source: 'real' }), /출처/);
  let resolveVisit;
  const pending = completeTripVisit(trips, action, () => new Promise(resolve => { resolveVisit = resolve; }));
  trips.resetForSession();
  resolveVisit(visit);
  await assert.rejects(pending, /로그인 상태/);
  assert.deepEqual(trips.getSnapshot().details, {});
  console.log('actual saved → trip → place visit/rejection → trip refresh; unlike isolation; source/session guards PASS');
} finally {
  saved.dispose(); places.dispose();
}
