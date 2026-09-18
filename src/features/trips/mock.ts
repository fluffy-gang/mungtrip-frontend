import { dateRange } from './date-utils';
import { parseTrip, positive, uniqueIds, validateCreate, validatePositions } from './validation';

import type { MockScenario, Trip, TripAdapter, TripPlaceSelection, TripSummary, TripVisitResult } from './types';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export const MOCK_PLACES: TripPlaceSelection[] = [
  { id: 101, thumbnailUrl: 'mock://fixture-1', name: '제주 반려견 동반 카페', category: 'CAFE', address: '제주 제주시 애월읍', latitude: 33.462, longitude: 126.31, tags: ['실내 동반'], distanceMeters: 320 },
  { id: 102, thumbnailUrl: 'mock://fixture-2', name: '애월 해안 산책길', category: 'ATTRACTION', address: '제주 제주시 애월읍', latitude: 33.465, longitude: 126.315, tags: ['야외 동반'], distanceMeters: 650 },
  { id: 103, thumbnailUrl: 'mock://fixture-3', name: '반려견과 함께하는 식당', category: 'RESTAURANT', address: '제주 제주시 한림읍', latitude: 33.46, longitude: 126.32, tags: ['테라스'], distanceMeters: 980 },
];
/** Deterministic, isolated fixtures. No mock path can call the real transport. */
export function createMockAdapter(initial: MockScenario = 'populated', today = '2026-09-17') {
  let scenario = initial;
  let nextId = 1000;
  let trips = new Map<number, Trip>();
  let failures = new Set<keyof TripAdapter>();
  const reset = (next: MockScenario = 'populated') => {
    scenario = next;
    nextId = 1000;
    failures = new Set();
    trips = new Map();
    if (next === 'error' || next === 'retry')
      failures.add('list');
    if (next === 'empty')
      return;
    const make = (tripId: number, startDate: string, endDate: string, title: string): Trip => ({
      tripId, title, startDate, endDate,
      days: dateRange(startDate, endDate).map((date, index) => ({
        day: index + 1, date, items: index ? [] : MOCK_PLACES.slice(0, 2).map((place, order) => ({
          tripItemId: tripId * 10 + order, sortOrder: order + 1, placeId: place.id, placeName: place.name,
          category: place.category, thumbnailUrl: next === 'missing-image' ? undefined : place.thumbnailUrl, visitStatus: tripId === 2 ? 'VISITED' : 'NOT_VISITED',
        }))
      })),
    });
    trips.set(1, make(1, '2026-10-01', '2026-10-03', next === 'long-content' ? '우리 반려견들과 오래 기다려 온 아주 특별한 제주도 가을 여행 일정' : '제주 멍캉스'));
    trips.set(2, make(2, '2026-08-01', '2026-08-01', '함께 다녀온 제주 여행'));
  };
  const check = (operation: keyof TripAdapter) => {
    if (failures.delete(operation) || (scenario === 'error' && operation === 'list'))
      throw new Error('일시적으로 요청하지 못했어요. 다시 시도해 주세요.');
  };
  const detail = (id: number): Trip => {
    const trip = trips.get(positive(id));
    if (!trip)
      throw new Error('여행을 찾을 수 없어요.');
    return clone(trip);
  };
  const summary = (trip: Trip): TripSummary => {
    const items = trip.days.flatMap(day => day.items);
    return {
      tripId: trip.tripId, title: trip.title, startDate: trip.startDate, endDate: trip.endDate,
      thumbnailUrls: items.flatMap(item => item.thumbnailUrl ? [item.thumbnailUrl] : []),
      totalPlaceCount: items.length, visitedPlaceCount: items.filter(item => item.visitStatus === 'VISITED').length
    };
  };
  const add = (id: number, ids: number[], day: number) => {
    uniqueIds(ids, true);
    const trip = detail(id), target = trip.days.find(value => value.day === day);
    if (!target)
      throw new Error('선택한 일차가 없습니다.');
    const places = ids.map(placeId => {
      const place = MOCK_PLACES.find(value => value.id === placeId);
      if (!place)
        throw new Error('등록되지 않은 mock 장소입니다.');
      return place;
    });
    const result = places.map(place => {
      const tripItemId = ++nextId;
      target.items.push({ tripItemId, sortOrder: target.items.length + 1, placeId: place.id, placeName: place.name, category: place.category, thumbnailUrl: scenario === 'missing-image' ? undefined : place.thumbnailUrl, visitStatus: 'NOT_VISITED' });
      return tripItemId;
    });
    trips.set(id, trip);
    return result;
  };
  const catalog = (category?: string, keyword?: string, page = 0, size = 20) => {
    const places = scenario === 'empty' ? [] : MOCK_PLACES.filter(place => (!category || place.category === category) && (!keyword || place.name.includes(keyword) || place.address?.includes(keyword)));
    return { places: clone(places.slice(page * size, (page + 1) * size).map(place => scenario === 'missing-image' ? { ...place, thumbnailUrl: undefined } : place)), page, size, totalCount: places.length };
  };
  reset(initial);
  const adapter: TripAdapter = {
    list: async () => { check('list'); const all = [...trips.values()]; return { upcomingTrips: all.filter(trip => trip.endDate >= today).map(summary), pastTrips: all.filter(trip => trip.endDate < today).map(summary) }; },
    brief: async () => { check('brief'); return [...trips.values()].map(trip => ({ tripId: trip.tripId, title: trip.title, startDate: trip.startDate, endDate: trip.endDate, totalDays: trip.days.length })); },
    dogs: async () => { check('dogs'); return [{ dogId: 1, name: '콩이' }, { dogId: 2, name: '보리' }]; },
    detail: async (id) => { check('detail'); return detail(id); },
    create: async (input) => {
      check('create');
      const value = validateCreate(input);
      if (value.dogIds.some(id => id !== 1 && id !== 2))
        throw new Error('등록되지 않은 mock 반려견입니다.');
      const id = ++nextId;
      trips.set(id, { tripId: id, ...value, days: dateRange(value.startDate, value.endDate).map((date, index) => ({ day: index + 1, date, items: [] })) });
      return id;
    },
    addPlaces: async (id, ids, day) => { check('addPlaces'); return add(id, ids, day); },
    addCourse: async (id, courseId, day) => {
      check('addCourse'); if (courseId !== 201)
        throw new Error('등록되지 않은 mock 코스입니다.'); return add(id, [101, 102, 103], day);
    },
    update: async (id, title, items) => {
      check('update');
      const trip = detail(id);
      validatePositions(trip, items);
      const existing = trip.days.flatMap(day => day.items);
      const updated = {
        ...trip, title, days: trip.days.map(day => ({
          ...day, items: items.filter(item => item.day === day.day).map(position => {
            const old = existing.find(item => item.tripItemId === position.tripItemId);
            if (!old)
              throw new Error('일정이 변경되었습니다.');
            return { ...old, sortOrder: position.sortOrder };
          }).sort((a, b) => a.sortOrder - b.sortOrder)
        }))
      };
      trips.set(id, parseTrip(updated));
    },
    remove: async (id) => { check('remove'); detail(id); trips.delete(id); },
    search: async (params) => { check('search'); return catalog(params.category, params.keyword, params.page, params.size); },
    recommendations: async (category) => { check('recommendations'); return catalog(category); },
    recent: async (category) => { check('recent'); return catalog(category); },
    nearby: async (id) => { check('nearby'); return { places: catalog().places.filter(place => place.id !== id), expandedRadiusMeters: scenario === 'empty' ? 3000 : null, expandedCount: scenario === 'empty' ? 0 : null }; },
    place: async (id) => {
      check('place'); const place = MOCK_PLACES.find(value => value.id === id); if (!place)
        throw new Error('장소를 찾을 수 없어요.'); return clone(place);
    },
  };
  return {
    adapter, reset, failNext: (operation: keyof TripAdapter) => { failures.add(operation); },
    applyVisit: (result: TripVisitResult) => {
      if (result.status !== 'completed')
        return;
      trips = new Map([...trips].map(([id, trip]) => [id, { ...trip, days: trip.days.map(day => ({ ...day, items: day.items.map(item => item.placeId === result.placeId ? { ...item, visitStatus: result.outcome, rejectReason: result.rejectReason, rejectDetail: result.rejectDetail } : item) })) }]));
    },
  };
}
