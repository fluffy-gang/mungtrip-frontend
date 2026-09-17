import { normalizeVisit, requireId, validateReview } from './validation';

import type { Place } from '../types';
import type { DogChoice, FixtureScenario, PlaceAdapter, PlaceReview, PlaceVisit, ReviewDog, ReviewFeed, ReviewItem } from './types';

export interface MockPlaceOptions { scenario?: FixtureScenario; delayMs?: number; catalog?: Place[] }
const TODAY = '2026-09-09';
/** Account-level dog list (matches the same mock account's dogs used by the trips fixture); not place-specific. */
const MOCK_DOGS: DogChoice[] = [
  { id: 1, name: '보리', breed: '골든리트리버', weight: 16 },
  { id: 2, name: '콩이', breed: '포메라니안', weight: 3 },
];
const dogFor = (dogId?: number): ReviewDog | undefined => {
  const dog = MOCK_DOGS.find(item => item.id === dogId);
  return dog ? { name: dog.name, breed: dog.breed, weight: dog.weight } : undefined;
};
/** Stateful fixture store: one visit and review per place, all reads share the same mutations. */
export function createMockPlaceAdapter(options: MockPlaceOptions = {}): PlaceAdapter {
  const scenario = options.scenario ?? 'populated';
  let generation = 0;
  let nextId = 100;
  let attempts = 0;
  let uploadAttempts = 0;
  let visits = new Map<number, PlaceVisit>();
  let reviews = new Map<number, PlaceReview>();
  const pause = async () => {
    const started = generation;
    await new Promise(resolve => setTimeout(resolve, options.delayMs ?? 80));
    if (started !== generation) throw new Error('검증 데이터가 초기화됐어요.');
  };
  const identity = (id: number): Partial<Place> => {
    const place = options.catalog?.find(item => item.id === id);
    if (!place) return {};
    return { name: place.name, category: place.category, categoryName: place.categoryName, address: place.address,
      imageUrl: place.imageUrl, images: place.images, tags: place.tags, tagCodes: place.tagCodes,
      isOfficial: place.isOfficial, latitude: place.latitude, longitude: place.longitude };
  };
  const sample = (id: number): Place => ({
    id, name: scenario === 'long-content' ? '반려견과 함께하는 멍멍판교베이커리와 정원 카페' : '멍멍판교베이커리',
    category: 'CAFE', categoryName: '카페', address: '제주특별자치도 서귀포시 표선면 표선로 38',
    tags: ['리드줄 필수', '맹견 불가', '배변봉투 지참', '실외 테라스', '전용 공간 있음'],
    tagCodes: [], isOfficial: true, isLiked: false,
    description: scenario === 'long-content' ? '반려견과 함께 편하게 쉬어가는 공간이에요. '.repeat(45) : '반려견과 함께 편하게 쉬어가는 공간이에요.',
    phoneNumber: '064-123-4567', businessHourEntries: [{ day: '월', open: '09:00', close: '21:00' }, { day: '수', open: '09:00', close: '21:00' }],
    operationStatus: 'OPEN', petRestrictions: '리드줄과 배변봉투를 준비해 주세요.',
    rating: reviews.has(id) ? scenario === 'empty' ? reviews.get(id)?.rating : (4.83 * 43 + (reviews.get(id)?.rating ?? 0)) / 44 : scenario === 'empty' ? 0 : 4.83,
    verifiedCount: (scenario === 'empty' ? 0 : 43) + (visits.get(id)?.outcome === 'VISITED' ? 1 : 0), recentVisitedCount: (scenario === 'empty' ? 0 : 12) + (visits.get(id)?.outcome === 'VISITED' ? 1 : 0),
    // The UI supplies bundled Figma photographs for mock fixtures only.
    images: [],
    ...identity(id),
    ...(scenario === 'long-content' ? { description: '반려견과 함께 편하게 쉬어가는 공간이에요. '.repeat(45) } : {}),
    ...(scenario === 'missing-image' ? { images: [], imageUrl: undefined } : {}),
  });
  const feed = (id: number): ReviewFeed => {
    const own = reviews.get(id);
    const visit = visits.get(id);
    const items: ReviewItem[] = scenario === 'empty' ? [] : [{ type: 'REVIEW', reviewId: 1, rating: 5,
      content: scenario === 'long-content' ? '반려견과 편안하게 다녀왔어요. '.repeat(40) : '반려견과 편안하게 다녀왔어요. 직원분들도 친절했어요.',
      imageUrls: scenario === 'missing-image' ? [] : Array(4).fill('mock-photo:review'), userNickname: '보리와 여행', reviewerVisitCount: 5, occurredAt: TODAY,
      dog: { name: '보리', breed: '골든리트리버', weight: 16 } }];
    if (own) items.unshift({ type: 'REVIEW', ...own, userNickname: '나', reviewerVisitCount: 1, occurredAt: TODAY });
    if (visit?.outcome === 'REJECTED') items.unshift({ type: 'REJECTED', imageUrls: [], userNickname: '나',
      rejectReason: visit.rejectReason, rejectDetail: visit.rejectDetail, occurredAt: TODAY });
    return { items, hasNext: false, averageRating: sample(id).rating,
      visitedCount: sample(id).verifiedCount };
  };
  return {
    source: 'mock',
    detail: async id => {
      requireId(id); await pause(); attempts += 1;
      if (scenario === 'error' || (scenario === 'retry' && attempts === 1)) throw new Error('장소를 불러오지 못했어요. 다시 시도해 주세요.');
      return sample(id);
    },
    reviews: async (id, page) => { await pause(); return page === 0 ? feed(id) : { ...feed(id), items: [], hasNext: false }; },
    nearby: async id => { await pause(); return { places: scenario === 'empty' ? [] : options.catalog
      ? options.catalog.filter(place => place.id !== id).map(place => sample(place.id))
      : [{ ...sample(id + 1), name: '더 클리프', distanceLabel: '350m' }] }; },
    visit: async (id, input) => {
      requireId(id); const normalized = normalizeVisit(input); await pause();
      const result = { ...normalized, placeId: id, placeVisitId: visits.get(id)?.placeVisitId ?? nextId++ };
      visits.set(id, result); return { ...result };
    },
    myReview: async id => { await pause(); return reviews.get(id) ?? null; },
    createReview: async (id, input) => {
      requireId(id); validateReview(input); await pause();
      if (visits.get(id)?.outcome !== 'VISITED') throw new Error('먼저 방문 체크를 완료해 주세요.');
      if (reviews.has(id)) throw new Error('이미 작성한 후기가 있어요. 수정 화면을 다시 열어 주세요.');
      const result: PlaceReview = { ...input, placeId: id, reviewId: nextId++, createdAt: TODAY,
        dog: dogFor(input.dogId) };
      reviews.set(id, result); return { ...result };
    },
    updateReview: async (reviewId, input) => {
      validateReview({ ...input, imageUrls: [] }); await pause();
      const existing = [...reviews.values()].find(review => review.reviewId === reviewId);
      if (!existing) throw new Error('후기를 찾지 못했어요.');
      const result = { ...existing, ...input }; reviews.set(existing.placeId, result); return { ...result };
    },
    upload: async () => { await pause(); uploadAttempts += 1;
      if (scenario === 'upload-failure' && uploadAttempts === 1) throw new Error('사진 업로드에 실패했어요. 다시 시도해 주세요.');
      return `review-image/mock-${nextId++}.jpg`;
    },
    dogs: async () => MOCK_DOGS,
    reset: () => { generation += 1; visits = new Map(); reviews = new Map(); nextId = 100; attempts = 0; uploadAttempts = 0; },
  };
}
