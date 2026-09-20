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

test('home APIs consume envelopes through the shared interceptor exactly once', async () => {
  const originalAdapter = apiClient.defaults.adapter;
  const payloads: Record<string, unknown> = {
    '/api/v1/categories': [{ code: 'CAFE', name: '카페' }],
    '/api/v1/tags': [{ id: 1, code: 'SMALL_DOG', name: '소형견', sortOrder: 1 }],
    '/api/v1/places': { places: [place], totalCount: 1, page: 0, size: 50 },
    '/api/v1/courses': { courses: [course], totalCount: 1, page: 0, size: 10 },
    '/api/v1/places/recently-verified': { places: [place] },
    '/api/v1/places/top': { places: [place] },
  };
  apiClient.defaults.adapter = async config => ({
    config, status: 200, statusText: 'OK', headers: {},
    data: { code: 'SUCCESS', message: '요청이 성공했습니다.', data: payloads[config.url!] },
  });
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
    apiClient.defaults.adapter = originalAdapter;
  }
});
