import test from 'node:test';
import assert from 'node:assert/strict';

import { createSavedProvider } from '../provider.ts';
import { createSavedController } from '../controller.ts';
import { createRealSavedAdapter, mapSavedPlace, mapSavedCourse } from '../api.ts';
import { createMockSavedAdapter } from '../mock.ts';
import { useAuthStore } from '../../auth/authStore.ts';

const place = (id = 1, extra = {}) => ({ id, name: `장소${id}`, category: 'CAFE', address: '서울', tags: ['INDOOR'], isOfficial: true, isLiked: true, ...extra });
const course = (id = 10, liked = true) => ({ id, title: `코스${id}`, region: '제주', placeCount: 2, totalDistanceKm: 4, isLiked: liked });
const page = (places, extra = {}) => ({ totalCount: places.length, page: 0, size: 50, places, ...extra });
const coursePage = (courses, extra = {}) => ({ totalCount: courses.length, page: 0, size: 10, courses, ...extra });
const defer = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const real = (request, t) => { const p = createSavedProvider({ source: 'real', transport: { request } }); t.after(() => p.dispose()); return p; };
const mock = async (t, options) => { const p = createSavedProvider({ source: 'mock', mock: options }); t.after(() => p.dispose()); await p.refresh(); return p; };
const controller = (p, t) => { const c = createSavedController(p); t.after(c.subscribe(() => {})); return c; };

for (const ordering of ['read-before-post', 'read-during-post']) {
  test(`completed unlike wins stale GET: ${ordering}`, async t => {
    const get = defer(), post = defer(); let hold = false;
    const p = real(config => config.method === 'POST' ? post.promise : hold ? get.promise : page([place()]), t);
    await p.refresh('places'); hold = true;
    let read, write;
    if (ordering === 'read-before-post') { read = p.refresh('places'); write = p.togglePlaceLike(1); }
    else { write = p.togglePlaceLike(1); read = p.refresh('places'); }
    post.resolve({ liked: false }); await write;
    get.resolve(page([place()])); await read;
    assert.deepEqual(p.getSnapshot().places.items, []);
    assert.equal(p.getSnapshot().placeLikedById[1], false);
    assert.equal(p.getSnapshot().places.status, 'idle');
  });
}
test('newest refresh wins, late old read never ends a newer loading state', async t => {
  const a = defer(), b = defer(); let call = 0;
  const p = real(() => ++call === 1 ? a.promise : b.promise, t);
  const first = p.refresh('places'), second = p.refresh('places');
  a.resolve(page([place()])); await first;
  assert.equal(p.getSnapshot().places.status, 'loading');
  b.resolve(page([])); await second;
  assert.equal(p.getSnapshot().places.status, 'idle');
  assert.deepEqual(p.getSnapshot().places.items, []);
});
test('complete empty refresh reconciles known likes, absent unknown remains unknown', async t => {
  let response = page([place()]); const p = real(() => response, t);
  assert.equal(p.getSnapshot().placeLikedById[999], undefined);
  await p.refresh('places'); response = page([]); await p.refresh('places');
  assert.equal(p.getSnapshot().placeLikedById[1], false);
  assert.equal(p.getSnapshot().placeLikedById[999], undefined);
});
test('same-ID duplicate rejected, other IDs mutate independently and count only existing rows', async t => {
  const post = defer(); let calls = 0;
  const p = real(c => c.method === 'GET' ? page([place(), place(2)]) : (++calls, c.path.endsWith('/1/like') ? post.promise : { liked: false }), t);
  await p.refresh('places'); const pending = p.togglePlaceLike(1);
  await assert.rejects(p.togglePlaceLike(1), /처리 중/);
  await p.togglePlaceLike(99); assert.equal(p.getSnapshot().places.totalCount, 2);
  await p.togglePlaceLike(2); post.resolve({ liked: false }); await pending;
  assert.equal(calls, 3); assert.equal(p.getSnapshot().places.totalCount, 0);
});
for (const kind of ['GET', 'POST', 'POST-followup-GET']) {
  test(`reset rejects/ignores stale ${kind}`, async t => {
    const pending = defer();
    const p = real(c => kind === 'POST-followup-GET' && c.method === 'POST' ? { liked: true } : pending.promise, t);
    const operation = kind === 'GET' ? p.refresh('places') : p.togglePlaceLike(1);
    const rejected = kind === 'GET' ? operation : assert.rejects(operation, /세션/);
    await Promise.resolve(); await Promise.resolve();
    p.resetForSession('other');
    pending.resolve(kind === 'POST' ? { liked: false } : page([place()]));
    await rejected;
    assert.deepEqual(p.getSnapshot().places.items, []);
    assert.deepEqual(p.getSnapshot().busyPlaceIds, []);
    assert.equal(p.getSnapshot().placeLikedById[1], undefined);
    assert.equal(p.getSnapshot().sessionRevision, 1);
  });
}
test('dispose invalidates pending mutation and detaches listeners', async t => {
  const d = defer(); const p = real(() => d.promise, t); let events = 0;
  p.subscribe(() => events++); const pending = p.togglePlaceLike(1); const rejected = assert.rejects(pending, /세션/);
  const before = events; p.dispose(); d.resolve({ liked: false }); await rejected; assert.equal(events, before);
});
test('auth identity reset does not fire for token refresh; mock stays independent', async t => {
  const p = real(() => page([]), t); const m = await mock(t);
  const user = { id: 7, provider: 'KAKAO' };
  useAuthStore.getState().setLogin('test-token', user);
  const revision = p.getSnapshot().sessionRevision;
  useAuthStore.getState().setLogin('refreshed-test-token', user);
  assert.equal(p.getSnapshot().sessionRevision, revision);
  useAuthStore.getState().setLogout();
  assert.equal(p.getSnapshot().sessionRevision, revision + 1);
  assert.equal(m.getSnapshot().sessionRevision, 0);
});
test('full course catalog pagination filters saved items and reports saved count', async t => {
  const calls = []; const p = real(c => { calls.push(c); return coursePage([course(10 + c.params.page, c.params.page === 1)], { totalCount: 2, page: c.params.page, size: 1 }); }, t);
  await p.refresh('courses');
  assert.deepEqual(p.getSnapshot().courses.items.map(x => x.id), [11]);
  assert.equal(p.getSnapshot().courses.totalCount, 1);
  assert.equal(p.getSnapshot().courseLikedById[10], false);
  assert.deepEqual(calls.map(c => c.params.page), [0, 1]);
});
for (const broken of ['duplicate', 'empty', 'total-drift']) {
  test(`incomplete pagination rejects ${broken}`, async t => {
    const p = real(c => c.params.page === 0 ? page([place()], { size: 1, totalCount: 2 }) : page(broken === 'empty' ? [] : [place(broken === 'duplicate' ? 1 : 2)], { size: 1, page: 1, totalCount: broken === 'total-drift' ? 3 : 2 }), t);
    await p.refresh('places'); assert.equal(p.getSnapshot().places.status, 'error'); assert.deepEqual(p.getSnapshot().places.items, []);
  });
}
test('uncertain POST reconciles once, never silently retries mutation', async t => {
  let liked = true, posts = 0;
  const p = real(c => c.method === 'GET' ? page(liked ? [place()] : []) : (posts++, liked = false, Promise.reject(new Error('timeout'))), t);
  await p.refresh('places'); await assert.rejects(p.togglePlaceLike(1), /timeout/);
  assert.equal(posts, 1); assert.equal(p.getSnapshot().placeLikedById[1], false); assert.equal(p.getSnapshot().places.totalCount, 0);
});
test('failed reconciliation blocks a later toggle from blindly replaying', async t => {
  let posts = 0, failed = false;
  const p = real(c => c.method === 'POST' ? (posts++, failed = true, Promise.reject(new Error('timeout'))) : failed ? Promise.reject(new Error('offline')) : page([place()]), t);
  await p.refresh('places'); await assert.rejects(p.togglePlaceLike(1)); await assert.rejects(p.togglePlaceLike(1), /확인/);
  assert.equal(posts, 1);
});
test('stable snapshots, subscriptions, external unknown-ID likes and deterministic resets', async t => {
  const extra = { ...mapSavedPlace(place(99)), isLiked: false };
  const p = await mock(t, { catalogPlaces: [extra] }); let events = 0; const unsub = p.subscribe(() => events++);
  assert.equal(p.getSnapshot(), p.getSnapshot());
  for (let i = 0; i < 2; i++) { await p.togglePlaceLike(1); await p.togglePlaceLike(1); }
  await p.togglePlaceLike(99); assert.ok(p.getSnapshot().places.items.some(x => x.id === 99));
  assert.ok(events > 0); unsub(); const before = events;
  p.resetFixture('populated'); await p.refresh(); assert.equal(events, before);
  assert.equal(p.getSnapshot().places.items.length, 3); await p.togglePlaceLike(99); assert.equal(p.getSnapshot().placeLikedById[99], true);
  p.resetFixture('empty'); await p.refresh(); assert.equal(p.getSnapshot().places.items.length, 0); assert.equal(p.getSnapshot().courses.items.length, 0);
});
test('all fixture scenarios reset both tabs and distinguish missing images', async t => {
  const p = await mock(t); assert.match(p.getSnapshot().places.items[0].imageUrl, /saved-fixture/);
  p.resetFixture('missing-image'); await p.refresh(); assert.equal(p.getSnapshot().places.items[0].imageUrl, undefined); assert.equal(p.getSnapshot().courses.items[0].thumbnailUrl, undefined);
  p.resetFixture('long-content'); await p.refresh(); assert.ok(p.getSnapshot().courses.items[0].title.length > 25);
  p.resetFixture('error'); await p.refresh(); assert.equal(p.getSnapshot().places.status, 'error'); assert.equal(p.getSnapshot().courses.status, 'error');
  p.resetFixture('retry'); await p.refresh(); assert.equal(p.getSnapshot().places.status, 'error'); assert.equal(p.getSnapshot().courses.status, 'error'); await p.refresh(); assert.equal(p.getSnapshot().places.status, 'idle'); assert.equal(p.getSnapshot().courses.status, 'idle');
});
test('adapter exact methods/paths, no double envelope unwrap, rejects malformed data', async () => {
  const calls = []; const adapter = createRealSavedAdapter({ request: async c => { calls.push(c); return c.method === 'POST' ? { liked: false } : c.path.endsWith('courses') ? coursePage([]) : page([place()]); } });
  await adapter.getPlaces(); await adapter.getCourses(); await adapter.togglePlaceLike(2); await adapter.toggleCourseLike(3);
  assert.deepEqual(calls.map(c => [c.method, c.path]), [['GET', '/api/v1/places/me/likes'], ['GET', '/api/v1/courses'], ['POST', '/api/v1/places/2/like'], ['POST', '/api/v1/courses/3/like']]);
  assert.equal(mapSavedPlace(place(1, { mapx: 181 })), null); assert.equal(mapSavedPlace(place(1, { tags: [4] })), null);
  assert.equal(mapSavedCourse(course(1, 'yes')), null);
  await assert.rejects(createRealSavedAdapter({ request: async () => ({ data: page([]) }) }).getPlaces());
  await assert.rejects(createRealSavedAdapter({ request: async () => ({ liked: 1 }) }).toggleCourseLike(1));
  await assert.rejects(adapter.togglePlaceLike(0));
  const retry = createMockSavedAdapter({ scenario: 'retry' }); await assert.rejects(retry.getPlaces()); await retry.getPlaces();
});
test('filter/select-visible preserves hidden selection and map uses only visible models', async t => {
  const p = await mock(t), c = controller(p, t); c.enterSelection(); c.setCategory('CAFE'); c.selectVisible(); c.setCategory('RESTAURANT'); c.selectVisible();
  assert.deepEqual(c.selectedPlaces().map(x => x.id), [1, 2]); c.selectVisible(); assert.deepEqual(c.getSnapshot().selectedIds, [1]);
  let map; c.showMap(payload => { map = payload; }); assert.deepEqual(map.places.map(x => x.id), [2]); assert.equal(map.source, 'mock'); assert.deepEqual(c.getSnapshot().selectedIds, [1]);
});
test('trip cancellation/rejection preserve full selection, success clears and same-tick double tap locks', async t => {
  const p = await mock(t), c = controller(p, t); c.enterSelection(); c.toggleSelected(1); c.toggleSelected(2); c.setCategory('CAFE');
  let payload; await c.createTrip(async value => { payload = value; return 'cancelled'; }); assert.equal(payload.places.length, 2); assert.equal(payload.source, 'mock'); assert.equal(c.getSnapshot().selectedIds.length, 2);
  await c.createTrip(async () => { throw new Error('failed'); }); assert.equal(c.getSnapshot().selectedIds.length, 2); assert.ok(c.getSnapshot().feedback);
  const d = defer(); let calls = 0; const fn = async () => { calls++; return d.promise; };
  const first = c.createTrip(fn), second = c.createTrip(fn); assert.equal(calls, 1); d.resolve('completed'); await Promise.all([first, second]); assert.equal(c.getSnapshot().selectionMode, false); assert.deepEqual(c.getSnapshot().selectedIds, []);
});
test('session reset prunes permanently and old callback cannot clear new selection', async t => {
  const p = await mock(t), c = controller(p, t); c.enterSelection(); c.toggleSelected(1); const d = defer(); const pending = c.createTrip(() => d.promise);
  p.resetFixture(); await p.refresh(); assert.deepEqual(c.getSnapshot().selectedIds, []);
  c.enterSelection(); c.toggleSelected(2); d.resolve('completed'); await pending; assert.deepEqual(c.getSnapshot().selectedIds, [2]);
  await p.togglePlaceLike(2); await p.togglePlaceLike(2); assert.deepEqual(c.getSnapshot().selectedIds, []);
});
test('bulk partial failure preserves failed selection and retry never re-likes successes', async t => {
  const saved = new Set([1, 2]); let fail = true; const writes = [];
  const p = real(c => {
    if (c.method === 'GET') return page([...saved].map(id => place(id)));
    const id = Number(c.path.split('/').at(-2)); writes.push(id);
    if (id === 2 && fail) return Promise.reject(new Error('network'));
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    return { liked: saved.has(id) };
  }, t);
  await p.refresh('places'); const c = controller(p, t); c.enterSelection(); c.selectVisible(); await c.unlikeSelected();
  assert.deepEqual(c.getSnapshot().selectedIds, [2]); fail = false; await c.unlikeSelected(); assert.deepEqual(writes, [1, 2, 2]); assert.equal(saved.size, 0);
});
test('course callback rejection is handled and concurrent sheet actions are locked', async t => {
  const p = await mock(t), c = controller(p, t); const d = defer(); let count = 0;
  const first = c.addCourse(p.getSnapshot().courses.items[0], () => { count++; return d.promise; });
  await c.addCourse(p.getSnapshot().courses.items[1], async () => { count++; return 'completed'; }); assert.equal(count, 1);
  d.reject(new Error('sheet')); await first; assert.equal(c.getSnapshot().busy, null); assert.ok(c.getSnapshot().feedback);
  c.setTab('places'); assert.equal(c.getSnapshot().feedback, null);
});

test('unknown auth identities reset on credential replacement rather than retaining private data', async t => {
  const p = real(() => page([place()]), t);
  useAuthStore.getState().setLogin('first-test-session'); await p.refresh('places');
  const revision = p.getSnapshot().sessionRevision;
  useAuthStore.getState().setLogin('other-test-session');
  assert.equal(p.getSnapshot().sessionRevision, revision + 1);
  assert.deepEqual(p.getSnapshot().places.items, []);
  useAuthStore.getState().setLogout();
});
