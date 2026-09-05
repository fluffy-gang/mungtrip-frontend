import assert from 'node:assert/strict';
import test from 'node:test';

import { TripWriteUncertainError } from './api';
import { completeTripVisit, createReplacementController, createTripFlowController } from './flow';
import { createMockTripProvider, createTripProvider } from './provider';
import { bindTripSession } from './session';
import { createPlaceQueryController, createPlaceSelection } from './selection';
import { positions } from './validation';
import { deferred, emptyList, fixtureTrip, input, place } from './test-fixtures';
test('mock CRUD updates immutable snapshots and counts; failed edits do not mutate', async () => {
  const provider = createMockTripProvider('empty');
  await provider.refresh();
  const before = provider.getSnapshot();
  const id = await provider.create(input);
  assert.equal(provider.getTrip(id)?.days.length, 3);
  const ids = await provider.addPlaces(id, [101, 102], 2);
  assert.equal(provider.getSnapshot().upcomingTrips[0].totalPlaceCount, 2);
  assert.equal(before.upcomingTrips.length, 0);
  const trip = await provider.loadTrip(id);
  await assert.rejects(provider.update(id, { baseline: trip, title: 'oops', items: [{ tripItemId: ids[0], day: 4, sortOrder: 1 }] }));
  assert.equal((await provider.loadTrip(id)).days[1].items.length, 2);
  await provider.update(id, { baseline: trip, title: '변경', items: [{ tripItemId: ids[1], day: 1, sortOrder: 1 }] });
  assert.equal(provider.getSnapshot().upcomingTrips[0].title, '변경');
  assert.equal(provider.getSnapshot().upcomingTrips[0].totalPlaceCount, 1);
  await provider.remove(id);
  assert.equal(provider.getSnapshot().upcomingTrips.length, 0);
});
test('create/add failure retains created trip and duplicate submits share one promise', async () => {
  const provider = createMockTripProvider('empty');
  provider.failNext?.('addPlaces');
  const flow = createTripFlowController(provider, { mode: 'create', source: 'mock', selection: { kind: 'place', places: [place] } });
  const first = flow.submit({ create: input });
  assert.equal(first, flow.submit({ create: input }));
  await assert.rejects(first);
  assert.ok(flow.createdTripId);
  const result = await flow.submit({ create: input });
  assert.equal(result.status, 'completed');
  assert.equal(provider.getSnapshot().upcomingTrips.length, 1);
  assert.equal(provider.getSnapshot().upcomingTrips[0].totalPlaceCount, 1);
  assert.equal(flow.cancel(), undefined);
});
test('cancel reports created id after partial success and source mismatch never writes', async () => {
  const provider = createMockTripProvider('empty');
  provider.failNext?.('addPlaces');
  const flow = createTripFlowController(provider, { mode: 'create', source: 'mock', selection: { kind: 'place', places: [place] } });
  await assert.rejects(flow.submit({ create: input }));
  const result = flow.cancel();
  assert.ok(result?.status === 'cancelled' && result.createdTripId);
  assert.equal(flow.cancel(), undefined);
  const mismatch = createTripFlowController(provider, { mode: 'create', source: 'real' });
  await assert.rejects(mismatch.submit({ create: input }));
  assert.equal(provider.getSnapshot().upcomingTrips.length, 1);
});
test('replacement retries complete PUT only and preserves original on add failure', async () => {
  const provider = createMockTripProvider();
  const before = await provider.loadTrip(1), old = before.days[0].items[0];
  const replace = createReplacementController(provider, 1, old.tripItemId);
  provider.failNext?.('addPlaces');
  await assert.rejects(replace.submit(103));
  assert.equal((await provider.loadTrip(1)).days[0].items.length, 2);
  provider.failNext?.('update');
  await assert.rejects(replace.submit(103));
  assert.equal(replace.partial, true);
  assert.equal((await provider.loadTrip(1)).days[0].items.length, 3);
  await replace.submit(103);
  const after = await provider.loadTrip(1);
  assert.equal(after.days[0].items.length, 2);
  assert.equal(after.days[0].items.filter(item => item.placeId === 103).length, 1);
  assert.equal(after.days[0].items.some(item => item.tripItemId === old.tripItemId), false);
});
test('complete update rejects stale draft after concurrent addition', async () => {
  const provider = createMockTripProvider();
  const baseline = await provider.loadTrip(1);
  await provider.addPlaces(1, [103], 1);
  await assert.rejects(provider.update(1, { baseline, title: baseline.title, items: positions(baseline) }));
  assert.equal((await provider.loadTrip(1)).days[0].items.length, 3);
});
test('mock visit updates every occurrence and preserves independent providers', async () => {
  const provider = createMockTripProvider(), other = createMockTripProvider();
  await provider.loadTrip(1);
  await provider.loadTrip(2);
  await provider.addPlaces(1, [101], 2);
  await provider.applyVisitResult({ status: 'completed', source: 'mock', placeId: 101, outcome: 'REJECTED', rejectReason: '입장 불가' });
  for (const id of [1, 2])
    for (const item of (await provider.loadTrip(id)).days.flatMap(day => day.items).filter(item => item.placeId === 101))
      assert.equal(item.visitStatus, 'REJECTED');
  assert.equal((await other.loadTrip(1)).days[0].items[0].visitStatus, 'NOT_VISITED');
});
test('session reset invalidates late GET and pending flow; stable known session is a no-op', async () => {
  const wait = deferred<unknown>();
  const provider = createTripProvider({ transport: { request: async () => wait.promise } });
  const loading = provider.refresh();
  provider.resetForSession('user-b');
  wait.resolve(emptyList);
  await assert.rejects(loading);
  assert.equal(provider.getSnapshot().loaded, false);
  const revision = provider.getSnapshot().sessionRevision;
  provider.resetForSession('user-b');
  assert.equal(provider.getSnapshot().sessionRevision, revision);
  const mock = createMockTripProvider();
  const flow = createTripFlowController(mock, { mode: 'create', source: 'mock' });
  mock.resetForSession();
  await assert.rejects(flow.submit({ create: input }));
});
test('latest overlapping list response wins', async () => {
  const first = deferred<unknown>(), second = deferred<unknown>();
  let calls = 0;
  const provider = createTripProvider({ transport: { request: () => (++calls === 1 ? first.promise : second.promise) } });
  const a = provider.refresh(), b = provider.refresh();
  second.resolve(emptyList);
  await b;
  first.resolve({ upcomingTrips: [{ ...fixtureTrip(), thumbnailUrls: [], totalPlaceCount: 1, visitedPlaceCount: 0 }], pastTrips: [] });
  await a;
  assert.equal(provider.getSnapshot().upcomingTrips.length, 0);
});
test('ambiguous write failure blocks automatic create retry', async () => {
  let posts = 0;
  const provider = createTripProvider({
    transport: {
      request: async (config) => {
        if (config.method === 'POST') {
          posts++;
          throw new Error('network lost');
        } return emptyList;
      }
    }
  });
  const flow = createTripFlowController(provider, { mode: 'create', source: 'real' });
  await assert.rejects(flow.submit({ create: input }));
  assert.equal(flow.uncertain, true);
  await assert.rejects(flow.submit({ create: input }));
  assert.equal(posts, 1);
  assert.ok(new TripWriteUncertainError() instanceof Error);
});
test('selection survives query changes and stale search cannot replace latest results', async () => {
  const selection = createPlaceSelection();
  selection.toggle(place);
  assert.equal(selection.getSnapshot().length, 1);
  const query = createPlaceQueryController(), first = deferred<{
    places: typeof place[];
    page: number;
    size: number;
    totalCount: number;
  }>();
  const pending = query.load(() => first.promise);
  await query.load(async () => ({ places: [{ id: 102, name: '공원' }], page: 0, size: 1, totalCount: 2 }));
  first.resolve({ places: [place], page: 0, size: 1, totalCount: 1 });
  await pending;
  assert.equal(query.getSnapshot().places[0].id, 102);
  assert.equal(query.getSnapshot().hasMore, true);
  assert.equal(selection.getSnapshot()[0].id, 101);
  selection.cancel();
  assert.equal(selection.getSnapshot().length, 0);
});
test('all mock scenarios reset predictably; known course adds and errors retry', async () => {
  const provider = createMockTripProvider();
  for (const scenario of ['populated', 'empty', 'error', 'retry', 'long-content', 'missing-image'] as const) {
    provider.resetFixture?.(scenario);
    if (scenario === 'error' || scenario === 'retry') {
      await assert.rejects(provider.refresh());
      if (scenario === 'error')
        continue;
    }
    await provider.refresh();
    assert.equal(provider.getSnapshot().upcomingTrips.length, scenario === 'empty' ? 0 : 1);
  }
  provider.resetFixture?.();
  await provider.addCourse(1, 201, 2);
  assert.equal((await provider.loadTrip(1)).days[1].items.length, 3);
});
test('confirmed create remains successful when post-write refresh fails', async () => {
  const provider = createMockTripProvider('empty');
  provider.failNext?.('list');
  const id = await provider.create(input);
  assert.ok(id);
  assert.equal(provider.getTrip(id)?.title, input.title);
  assert.ok(provider.getSnapshot().error);
  await provider.refresh();
  assert.equal(provider.getSnapshot().upcomingTrips.length, 1);
});
test('late pre-mutation GET cannot erase confirmed write and queued mutation is invalidated on session reset', async () => {
  const oldRead = deferred<unknown>();
  let listCalls = 0;
  const provider = createTripProvider({
    transport: {
      request: async (config) => {
        if (config.path === '/api/v1/trips' && config.method === 'GET')
          return ++listCalls === 1 ? oldRead.promise : { upcomingTrips: [{ ...fixtureTrip(), thumbnailUrls: [], totalPlaceCount: 1, visitedPlaceCount: 0 }], pastTrips: [] };
        if (config.method === 'POST')
          return { tripId: 1 };
        if (config.path.endsWith('/brief'))
          return { trips: [{ ...fixtureTrip(), totalDays: 1 }] };
        if (config.path.endsWith('/dogs'))
          return { dogs: [] };
        return fixtureTrip();
      }
    }
  });
  const pendingRead = provider.refresh();
  await provider.create(input);
  oldRead.resolve(emptyList);
  await pendingRead;
  assert.equal(provider.getSnapshot().upcomingTrips.length, 1);
  const blocked = deferred<unknown>();
  let posts = 0;
  const next = createTripProvider({
    transport: {
      request: async (config) => {
        if (config.method === 'POST') {
          posts++;
          return blocked.promise;
        } return fixtureTrip();
      }
    }
  });
  const first = next.create(input), queued = next.create(input);
  await Promise.resolve();
  await Promise.resolve();
  next.resetForSession();
  blocked.resolve({ tripId: 1 });
  await assert.rejects(first);
  await assert.rejects(queued);
  assert.equal(posts, 1);
  assert.equal(next.getSnapshot().loaded, false);
});
test('auth binding invalidates unknown credential swaps and logout, preserving known-user renewal', () => {
  const provider = createMockTripProvider();
  type State = {
    isLoggedIn: boolean;
    accessToken: string | null;
    user: {
      id: number;
    } | null;
  };
  let state: State = { isLoggedIn: true, accessToken: 'one', user: { id: 1 } };
  let listener: (state: State) => void = () => undefined;
  const off = bindTripSession(provider, { getState: () => state, subscribe: fn => { listener = fn; return () => { listener = () => undefined; }; } });
  state = { ...state, accessToken: 'two' };
  listener(state);
  assert.equal(provider.getSnapshot().sessionRevision, 0);
  state = { ...state, user: null };
  listener(state);
  assert.equal(provider.getSnapshot().sessionRevision, 1);
  state = { ...state, accessToken: 'three' };
  listener(state);
  assert.equal(provider.getSnapshot().sessionRevision, 2);
  state = { isLoggedIn: false, user: null, accessToken: null };
  listener(state);
  assert.equal(provider.getSnapshot().sessionRevision, 3);
  off();
});
test('visit callback cancellation/error preserves state and late old-session result is rejected', async () => {
  const provider = createMockTripProvider();
  const action = { source: 'mock' as const, tripId: 1, tripItemId: 10, placeId: 101, placeName: '카페' };
  const before = await provider.loadTrip(1);
  await completeTripVisit(provider, action, async () => ({ status: 'cancelled' }));
  assert.deepEqual(await provider.loadTrip(1), before);
  await assert.rejects(completeTripVisit(provider, action, async () => { throw new Error('visit failed'); }));
  const wait = deferred<import('./types').TripVisitResult>();
  const pending = completeTripVisit(provider, action, () => wait.promise);
  provider.resetFixture?.();
  wait.resolve({ status: 'completed', source: 'mock', placeId: 101, outcome: 'VISITED' });
  await assert.rejects(pending);
  assert.equal((await provider.loadTrip(1)).days[0].items[0].visitStatus, 'NOT_VISITED');
});
test('mock session reset clears previous-session user-created trips', async () => {
  const provider = createMockTripProvider('empty');
  await provider.create(input);
  provider.resetForSession('next-user');
  await provider.refresh();
  assert.equal(provider.getSnapshot().upcomingTrips.length, 0);
});
