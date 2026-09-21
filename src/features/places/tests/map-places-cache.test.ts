import assert from 'node:assert/strict';
import test from 'node:test';

process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test';
const { apiClient } = await import('@/shared/api/client');
const { getCachedMapPlaces } = await import('@/features/places/map-places-cache');

const place = { id: 1, name: '제주 장소', category: 'CAFE', address: '제주', mapx: 126.5, mapy: 33.4, tags: [], isLiked: false };

function stubPlaces(handler: () => unknown) {
  const originalAdapter = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async config => ({
    config, status: 200, statusText: 'OK', headers: {},
    data: { code: 'SUCCESS', message: '요청이 성공했습니다.', data: handler() },
  });
  return () => { apiClient.defaults.adapter = originalAdapter; };
}

test('identical map bounds reuse the cached response within the TTL', async () => {
  let calls = 0;
  const restore = stubPlaces(() => { calls++; return { places: [place], totalCount: 1, page: 0, size: 50 }; });
  try {
    const bounds = { swLng: 126.1, swLat: 33.1, neLng: 127, neLat: 33.6 };
    const first = await getCachedMapPlaces(bounds);
    const second = await getCachedMapPlaces({ ...bounds });
    assert.equal(calls, 1);
    assert.deepEqual(first, second);

    const differentBounds = await getCachedMapPlaces({ ...bounds, swLat: 33.2 });
    assert.equal(calls, 2);
    assert.deepEqual(differentBounds, first);
  } finally {
    restore();
  }
});

test('dogIds/tags order does not bust the cache key', async () => {
  let calls = 0;
  const restore = stubPlaces(() => { calls++; return { places: [place], totalCount: 1, page: 0, size: 50 }; });
  try {
    await getCachedMapPlaces({ dogIds: [2, 1], tags: ['B', 'A'] });
    await getCachedMapPlaces({ dogIds: [1, 2], tags: ['A', 'B'] });
    assert.equal(calls, 1);
  } finally {
    restore();
  }
});

test('a concurrent identical request is deduplicated to one network call', async () => {
  let calls = 0;
  let release: (() => void) | undefined;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const originalAdapter = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async config => {
    calls++;
    await gate;
    return { config, status: 200, statusText: 'OK', headers: {}, data: { code: 'SUCCESS', message: 'ok', data: { places: [place], totalCount: 1, page: 0, size: 50 } } };
  };
  try {
    const bounds = { swLng: 50, swLat: 50, neLng: 51, neLat: 51 };
    const pending = [getCachedMapPlaces(bounds), getCachedMapPlaces(bounds), getCachedMapPlaces(bounds)];
    release?.();
    const results = await Promise.all(pending);
    assert.equal(calls, 1);
    assert.equal(results[0].length, 1);
  } finally {
    apiClient.defaults.adapter = originalAdapter;
  }
});

test('a failed request is not cached and the next call retries', async () => {
  let calls = 0;
  const originalAdapter = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async () => { calls++; throw new Error('network down'); };
  const bounds = { swLng: 10, swLat: 10, neLng: 11, neLat: 11 };
  try {
    await assert.rejects(getCachedMapPlaces(bounds));
    await assert.rejects(getCachedMapPlaces(bounds));
    assert.equal(calls, 2);
  } finally {
    apiClient.defaults.adapter = originalAdapter;
  }
  const restore = stubPlaces(() => ({ places: [place], totalCount: 1, page: 0, size: 50 }));
  try {
    const recovered = await getCachedMapPlaces(bounds);
    assert.equal(recovered.length, 1);
  } finally {
    restore();
  }
});

test('the cache expires 5 minutes after the first fetch', async (t) => {
  t.mock.timers.enable({ apis: ['Date'] });
  let calls = 0;
  const restore = stubPlaces(() => { calls++; return { places: [place], totalCount: 1, page: 0, size: 50 }; });
  try {
    const bounds = { swLng: 33, swLat: 33, neLng: 34, neLat: 34 };
    await getCachedMapPlaces(bounds);
    t.mock.timers.tick(4 * 60 * 1000 + 59_000);
    await getCachedMapPlaces(bounds);
    assert.equal(calls, 1, '4분 59초 후에는 여전히 캐시를 사용한다');

    t.mock.timers.tick(2_000);
    await getCachedMapPlaces(bounds);
    assert.equal(calls, 2, '5분을 넘기면 다시 조회한다');
  } finally {
    restore();
  }
});
