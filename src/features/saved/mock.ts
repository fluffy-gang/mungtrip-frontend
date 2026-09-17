import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';
import type { MockProviderOptions, MockScenario, RealSavedAdapter, SavedTab } from './types';

const clonePlace = (place: Place): Place => ({ ...place, tags: [...place.tags], tagCodes: [...place.tagCodes] });
const cloneCourse = (course: Course): Course => ({ ...course });
/** ISO timestamp N days in the past, for a deterministic relative "N일전" label regardless of run date. */
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const place = (id: number, name: string, overrides: Partial<Place> = {}): Place => ({
  id, name, category: 'CAFE', categoryName: '카페', address: '서울시 마포구',
  imageUrl: 'saved-fixture://place', tags: ['실내', '소형견'], tagCodes: ['INDOOR', 'SMALL_DOG'],
  latitude: 37.556 + id * 0.001, longitude: 126.925 + id * 0.001,
  isOfficial: true, isLiked: true, ...overrides,
});
const course = (id: number, title: string): Course => ({
  id, title, region: '애월', placeCount: 6, totalDistanceKm: 14,
  thumbnailUrl: 'saved-fixture://course', isLiked: true,
});

function fixtures(scenario: MockScenario, options: MockProviderOptions) {
  const places = scenario === 'empty' ? [] : options.places?.map(clonePlace) ?? [
    place(1, '소형견 동반 카페', { verifiedCount: 24, rating: 4.8, lastVerifiedAt: daysAgo(3) }),
    place(2, '반려견과 함께하는 식당', { category: 'RESTAURANT', categoryName: '식당', isOfficial: false, verifiedCount: 8, rating: 4.5, lastVerifiedAt: daysAgo(0) }),
    place(3, '반려견 산책 공원', { category: 'ATTRACTION', categoryName: '관광지', tags: ['실외', '목줄 필수'], tagCodes: ['OUTDOOR', 'LEASH_REQUIRED'] }),
  ];
  const courses = scenario === 'empty' ? [] : options.courses?.map(cloneCourse) ?? [
    course(10, '제주 바다 따라 걷는 하루'), course(11, '반려견과 함께하는 애월 여행'),
  ];
  if (scenario === 'long-content') {
    if (places[0]) places[0].name = '반려견과 함께 방문하기 좋은 아주 긴 장소 이름을 가진 동반 카페';
    if (courses[0]) courses[0].title = '반려견과 함께 떠나는 아주 긴 이름의 제주도 추천 산책 코스';
  }
  if (scenario === 'missing-image') {
    places.forEach(item => { item.imageUrl = undefined; });
    courses.forEach(item => { item.thumbnailUrl = undefined; });
  }
  return { places, courses };
}

export interface MockSavedAdapter extends RealSavedAdapter {
  reset: (scenario?: MockScenario) => void;
}

/** Deterministic in-memory catalog. Reset restores likes and per-tab failure counters. */
export function createMockSavedAdapter(options: MockProviderOptions = {}): MockSavedAdapter {
  let scenario = options.scenario ?? 'populated';
  let places: Place[] = [];
  let courses: Course[] = [];
  let retries = new Set<SavedTab>();
  const reset = (next = scenario) => {
    scenario = next;
    const data = fixtures(scenario, options);
    places = [...new Map([...data.places, ...(options.catalogPlaces ?? []).map(clonePlace)].map(item => [item.id, item])).values()];
    courses = [...new Map([...data.courses, ...(options.catalogCourses ?? []).map(cloneCourse)].map(item => [item.id, item])).values()];
    retries = new Set(scenario === 'retry' ? ['places', 'courses'] : []);
  };
  reset();
  const beforeRead = async (tab: SavedTab) => {
    if (scenario === 'loading') await new Promise(resolve => setTimeout(resolve, 1500));
    if (scenario === 'error' || retries.delete(tab)) throw new Error('저장 목록을 불러오지 못했습니다.');
  };
  const toggle = <T extends { id: number; isLiked: boolean }>(items: T[], id: number) => {
    const item = items.find(value => value.id === id);
    if (!item) throw new Error('항목을 찾을 수 없습니다.');
    item.isLiked = !item.isLiked;
    return { liked: item.isLiked };
  };
  return {
    async getPlaces(page = 0, size = 50) {
      await beforeRead('places');
      const saved = places.filter(item => item.isLiked);
      return { totalCount: saved.length, page, size, items: saved.slice(page * size, (page + 1) * size).map(clonePlace) };
    },
    async getCourses(page = 0, size = 10) {
      await beforeRead('courses');
      return { totalCount: courses.length, page, size, items: courses.slice(page * size, (page + 1) * size).map(cloneCourse) };
    },
    async togglePlaceLike(id) { return toggle(places, id); },
    async toggleCourseLike(id) { return toggle(courses, id); },
    reset,
  };
}
