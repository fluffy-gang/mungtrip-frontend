/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createPlaceApi } from '../detail/api';
import { mapPlace } from '../detail/catalog-mapping';
import { createMockPlaceAdapter } from '../detail/mock';
import { createProvider } from '../detail/provider';
import { samePlaceSession } from '../detail/session';
import { normalizeVisit, parsePlaceId, validateReview } from '../detail/validation';
import { saveReviewWithPhotos } from '../reviews/upload';

import type { Place } from '../types';
import type { PlaceAdapter, ReviewInput } from '../detail/types';

const review: ReviewInput = { rating: 4, content: '좋았어요', dogId: 1, imageUrls: [] };
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};
const mock = () => createMockPlaceAdapter({ delayMs: 0 });
const sample = async () => mock().detail(36);

test('visit upsert, rejection, review prerequisite, edit and refreshed state stay consistent', async () => {
  const provider = createProvider(mock());
  await assert.rejects(provider.saveReview(36, review), /방문 체크/);
  const first = await provider.visit(36, { outcome: 'REJECTED', rejectReason: 'CLOSED', rejectDetail: ' 문 닫음 ' });
  assert.equal(provider.getSnapshot().places[36]?.reviews.data?.items[0].rejectDetail, '문 닫음');
  const visited = await provider.visit(36, { outcome: 'VISITED' });
  assert.equal(first.placeVisitId, visited.placeVisitId);
  assert.equal(provider.getSnapshot().places[36]?.detail.data?.verifiedCount, 44);
  const created = await provider.saveReview(36, { ...review, imageUrls: ['review-image/key.jpg'] });
  assert.equal((await provider.myReview(36))?.reviewId, created.reviewId);
  await assert.rejects(provider.saveReview(36, review), /이미 작성/);
  const edited = await provider.saveReview(36, { ...review, rating: 5, content: '수정', imageUrls: [] }, created);
  assert.deepEqual(edited.imageUrls, ['review-image/key.jpg']);
  assert.equal(edited.dog?.name, '보리');
  assert.equal(provider.getSnapshot().places[36]?.reviews.data?.items[0].content, '수정');
  provider.resetForSession('next');
  assert.equal(await provider.myReview(36), null);
  assert.deepEqual(provider.getSnapshot().places, {});
});

test('concurrent reads are deduplicated and stale responses cannot repopulate a reset session', async () => {
  const gate = deferred<Place>();
  let calls = 0;
  const adapter: PlaceAdapter = { ...mock(), detail: () => { calls++; return gate.promise; } };
  const provider = createProvider(adapter);
  const first = provider.loadDetail(36);
  assert.equal(provider.loadDetail(36), first);
  await Promise.resolve();
  assert.equal(calls, 1);
  provider.resetForSession('new-user');
  gate.resolve(await sample());
  await first;
  assert.deepEqual(provider.getSnapshot().places, {});
});

test('mutation guard spans refresh; old session completion is rejected', async () => {
  const gate = deferred<Place>();
  const provider = createProvider({ ...mock(), detail: () => gate.promise });
  const pending = provider.visit(36, { outcome: 'VISITED' });
  await new Promise(resolve => setTimeout(resolve, 10));
  await assert.rejects(provider.visit(36, { outcome: 'VISITED' }), /이미 처리/);
  provider.resetForSession('new-user');
  gate.resolve(await sample());
  await assert.rejects(pending, /사용자 정보/);
  assert.deepEqual(provider.getSnapshot().places, {});
});

test('pagination appends once and terminal page prevents redundant requests', async () => {
  let calls = 0;
  const adapter = mock();
  const provider = createProvider({ ...adapter, reviews: async (id, page) => {
    calls++; const feed = await adapter.reviews(id, 0);
    return { ...feed, items: [{ ...feed.items[0], reviewId: page + 1 }], hasNext: page === 0 };
  } });
  await provider.loadReviews(36);
  await Promise.all([provider.loadReviews(36, true), provider.loadReviews(36, true)]);
  assert.deepEqual(provider.getSnapshot().places[36]?.reviews.data?.items.map(item => item.reviewId), [1, 2]);
  await provider.loadReviews(36, true);
  assert.equal(calls, 2);
});

test('retry fixture recovers explicitly; persistent error and empty data remain distinct', async () => {
  const provider = createProvider(createMockPlaceAdapter({ scenario: 'retry', delayMs: 0 }));
  await provider.loadDetail(36);
  assert.ok(provider.getSnapshot().places[36]?.detail.error);
  await provider.loadDetail(36);
  assert.equal(provider.getSnapshot().places[36]?.detail.error, undefined);
  assert.ok(provider.getSnapshot().places[36]?.detail.data);
  const empty = createProvider(createMockPlaceAdapter({ scenario: 'empty', delayMs: 0 }));
  await empty.loadReviews(36);
  assert.deepEqual(empty.getSnapshot().places[36]?.reviews.data?.items, []);
});

test('upload failure creates no review; retry stores object keys and edit preserves images', async () => {
  const provider = createProvider(createMockPlaceAdapter({ scenario: 'upload-failure', delayMs: 0 }));
  await provider.visit(36, { outcome: 'VISITED' });
  const photos = [{ uri: 'file:///private/photo.png', mimeType: 'image/png' }];
  await assert.rejects(saveReviewWithPhotos(provider, 36, review, photos), /업로드/);
  assert.equal(await provider.myReview(36), null);
  const saved = await saveReviewWithPhotos(provider, 36, review, photos);
  assert.match(saved.imageUrls[0], /^review-image\//);
  assert.ok(!saved.imageUrls[0].includes('file:'));
  await assert.rejects(provider.upload({ uri: 'file:///x', mimeType: 'image/heic' }), /JPG/);
});

test('API adapter uses verified verbs/paths/payloads and does not swallow auth or malformed responses', async () => {
  const requests: unknown[][] = [];
  const api = createPlaceApi({ request: async (...args) => {
    requests.push(args);
    if (args[1].endsWith('/visits')) return { placeVisitId: 1, placeId: 36, outcome: 'VISITED' };
    return { reviewId: 2, placeId: 36, rating: 4, imageUrls: [] };
  } });
  await api.visit(36, { outcome: 'VISITED', rejectReason: 'CLOSED' });
  assert.deepEqual(requests[0], ['POST', '/api/v1/places/36/visits', { outcome: 'VISITED' }]);
  await api.updateReview(2, { rating: 4, content: '수정' });
  assert.deepEqual(requests[1], ['PATCH', '/api/v1/reviews/2', { rating: 4, content: '수정' }]);
  const missing = createPlaceApi({ request: async () => { throw { status: 404, data: { code: 'REVIEW_404_1' } }; } });
  assert.equal(await missing.myReview(36), null);
  const authError = { status: 401, data: { code: 'AUTH_401' } };
  const auth = createPlaceApi({ request: async () => { throw authError; } });
  await assert.rejects(auth.myReview(36), error => error === authError);
  const malformed = createPlaceApi({ request: async () => ({}) });
  await assert.rejects(malformed.reviews(36, 0), /응답/);
});

test('IDs, rejection reason, rating and stored image references are validated before transport', () => {
  for (const id of ['0', '-1', '3.5', '1x', '9007199254740993']) assert.equal(parsePlaceId(id), undefined);
  assert.equal(parsePlaceId('36'), 36);
  assert.throws(() => normalizeVisit({ outcome: 'REJECTED' }), /거절 사유/);
  assert.throws(() => validateReview({ ...review, rating: 0 }), /별점/);
  for (const ref of ['file:///x', 'content://x', 'https://s3.test/x?X-Amz-Signature=secret']) {
    assert.throws(() => validateReview({ ...review, imageUrls: [ref] }), /업로드/);
  }
});


test('credential replacement resets unresolved identities while known-user refresh preserves state', () => {
  const unknown = { isLoggedIn: true, user: null, accessToken: 'a' };
  assert.equal(samePlaceSession(unknown, { ...unknown, accessToken: 'b' }), false);
  const known = { ...unknown, user: { id: 1 } };
  assert.equal(samePlaceSession(known, { ...known, accessToken: 'b' }), true);
  assert.equal(samePlaceSession(known, { ...known, user: { id: 2 } }), false);
  assert.equal(samePlaceSession(known, { ...known, isLoggedIn: false }), false);
});

test('injected catalog identity is shared without overriding stateful visit/rating updates', async () => {
  const catalog = [{ ...await sample(), id: 101, name: '공통 카페', rating: 1 }];
  const provider = createProvider(createMockPlaceAdapter({ catalog, delayMs: 0 }));
  await provider.loadDetail(101);
  assert.equal(provider.getSnapshot().places[101]?.detail.data?.name, '공통 카페');
  await provider.visit(101, { outcome: 'VISITED' });
  assert.equal(provider.getSnapshot().places[101]?.detail.data?.verifiedCount, 44);
});

test('adapter session events reset provider even without mounted detail UI; dispose unsubscribes', async () => {
  let sessionChanged = () => {};
  let unsubscribed = false;
  const provider = createProvider({ ...mock(), subscribeSession: listener => {
    sessionChanged = listener; return () => { unsubscribed = true; };
  } });
  await provider.loadDetail(36);
  sessionChanged();
  assert.deepEqual(provider.getSnapshot().places, {});
  assert.equal(provider.getSnapshot().sessionRevision, 1);
  provider.dispose();
  assert.equal(unsubscribed, true);
});


test('place mapper keeps legacy catalog behavior and correctly preserves SDK detail zero/structured fields', () => {
  const mapped = mapPlace({ id: 36, name: '카페', category: 'CAFE', address: '주소', tags: ['LEASH'],
    averageRating: 0, rating: 4, visitedCount: 0, recentVisitedCount: 0,
    businessHours: [{ day: 'MON', open: '09:00', close: '18:00' }], images: ['https://image.test/photo.webp'] },
  { categories: [{ code: 'CAFE', name: '카페' }], tags: [{ id: 1, code: 'LEASH', name: '목줄', sortOrder: 1 }] });
  assert.equal(mapped?.rating, 0);
  assert.equal(mapped?.verifiedCount, 0);
  assert.equal(mapped?.recentVisitedCount, 0);
  assert.deepEqual(mapped?.tags, ['목줄']);
  assert.equal(mapped?.businessHourEntries?.[0].day, 'MON');
  assert.equal(mapped?.imageUrl, 'https://image.test/photo.webp');
  const legacy = mapPlace({ id: 36, name: '카페', category: 'CAFE', address: '주소', businessHours: '매일 09:00–18:00', rating: 4 });
  assert.equal(legacy?.businessHours, '매일 09:00–18:00');
  assert.equal(legacy?.rating, 4);
});
