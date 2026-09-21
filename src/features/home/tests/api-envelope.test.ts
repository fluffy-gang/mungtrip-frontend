import assert from 'node:assert/strict';
import test from 'node:test';

// 실제 클라이언트 인터셉터를 사용하되 HTTP 전송만 대체한다.
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test';
const { apiClient } = await import('@/shared/api/client');
const { getCourses } = await import('@/features/courses/api');
const { getPlaces, getPlaceCategories, getPlaceTags, getRecentlyVerifiedPlaces, getTopPlaces } =
  await import('@/features/places/api');

const place = { id: 1, name: '제주 장소', category: 'CAFE', address: '제주', mapx: 126.5, mapy: 33.4, tags: [], isLiked: false };
const course = { id: 1, title: '제주 코스', region: '제주', placeCount: 1, totalDistanceKm: 1, isLiked: false };
// RecentlyVerifiedPlaceResponse / TopPlaceResponse 에는 address 가 없다.
const verifiedPlace = (id: number) => ({
  id, name: `인증 장소 ${id}`, category: 'ACCOMMODATION', thumbnailUrl: null, tags: [],
  isOfficial: true, verifiedCount: 1, lastVerifiedAt: '2026-09-21T15:08:30.854736', isLiked: false,
});
const topPlace = (id: number, rank: number) => ({
  id, name: `인기 장소 ${id}`, category: 'CAFE', thumbnailUrl: null, rank, tags: [],
  isOfficial: false, verifiedCount: 2, isLiked: false,
});

const stubPayloads = (payloads: Record<string, unknown>) => {
  const originalAdapter = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async config => ({
    config, status: 200, statusText: 'OK', headers: {},
    data: { code: 'SUCCESS', message: '요청이 성공했습니다.', data: payloads[config.url!] },
  });
  return () => { apiClient.defaults.adapter = originalAdapter; };
};

test('home APIs consume envelopes through the shared interceptor exactly once', async () => {
  const payloads: Record<string, unknown> = {
    '/api/v1/categories': [{ code: 'CAFE', name: '카페' }],
    '/api/v1/tags': [{ id: 1, code: 'SMALL_DOG', name: '소형견', sortOrder: 1 }],
    '/api/v1/places': { places: [place], totalCount: 1, page: 0, size: 50 },
    '/api/v1/courses': { courses: [course], totalCount: 1, page: 0, size: 10 },
    '/api/v1/places/recently-verified': { places: [place] },
    '/api/v1/places/top': { places: [place] },
  };
  const restore = stubPayloads(payloads);
  try {
    const categories = await getPlaceCategories();
    const tags = await getPlaceTags();
    const places = await getPlaces({ swLng: 126.1, swLat: 33.1, neLng: 127, neLat: 33.6 }, { categories, tags });
    assert.equal(places.length, 1);
    assert.equal(places[0].categoryName, '카페');
    assert.equal(places[0].latitude, 33.4);
    assert.equal(tags.length, 1);
    // 홈 피드와 동일하게 코스와 장소를 함께 읽어 한 요청의 변환 오류도 검출한다.
    const [courses, recent, top] = await Promise.all([
      getCourses(), getRecentlyVerifiedPlaces(), getTopPlaces({ category: 'CAFE' }),
    ]);
    assert.deepEqual(courses, [course]);
    assert.equal(recent.length, 1);
    assert.equal(top.length, 1);
    payloads['/api/v1/courses'] = { courses: [], totalCount: 0, page: 0, size: 10 };
    payloads['/api/v1/places'] = { places: [], totalCount: 0, page: 0, size: 50 };
    assert.deepEqual(await getCourses(), []);
    assert.deepEqual(await getPlaces({ keyword: '없는 장소' }), []);
  } finally {
    restore();
  }
});

test('address 없는 recently-verified / top 응답도 드롭되지 않는다', async () => {
  const restore = stubPayloads({
    // 두 엔드포인트의 envelope 본문은 래퍼 객체가 아니라 배열이다.
    '/api/v1/places/recently-verified': [verifiedPlace(35), verifiedPlace(36), verifiedPlace(37)],
    '/api/v1/places/top': [topPlace(41, 1), topPlace(42, 2)],
  });
  try {
    const catalog = { categories: [{ code: 'CAFE', name: '카페' }], tags: [] };
    const recent = await getRecentlyVerifiedPlaces(3, catalog);
    assert.deepEqual(recent.map(item => item.id), [35, 36, 37]);
    assert.equal(recent[0].address, undefined);
    assert.equal(recent[0].name, '인증 장소 35');
    assert.equal(recent[0].verifiedCount, 1);
    assert.equal(recent[0].lastVerifiedAt, '2026-09-21T15:08:30.854736');

    const top = await getTopPlaces({ category: 'CAFE', days: 30, limit: 3 }, catalog);
    assert.deepEqual(top.map(item => item.rank), [1, 2]);
    assert.equal(top[0].address, undefined);
    assert.equal(top[0].categoryName, '카페');
  } finally {
    restore();
  }
});

test('세 홈 피드 엔드포인트의 빈 응답은 빈 배열이 된다', async () => {
  const restore = stubPayloads({
    '/api/v1/courses': { totalCount: 0, page: 0, size: 3, courses: [] },
    '/api/v1/places/recently-verified': [],
    '/api/v1/places/top': [],
  });
  try {
    assert.deepEqual(await getCourses(3), []);
    assert.deepEqual(await getRecentlyVerifiedPlaces(3), []);
    assert.deepEqual(await getTopPlaces({ category: 'CAFE', days: 30, limit: 3 }), []);
  } finally {
    restore();
  }
});
