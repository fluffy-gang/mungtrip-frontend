import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';
import type { RealSavedAdapter, SavedTransport } from './types';

export const SAVED_ENDPOINTS = {
  places: ENDPOINTS.map.likedPlaces,
  // TODO(#26): The API has no saved-course endpoint; catalog pagination is intentionally filtered client-side.
  courses: ENDPOINTS.courses.list,
  placeLike: ENDPOINTS.map.placeLike,
  courseLike: ENDPOINTS.courses.like,
} as const;

const clientTransport: SavedTransport = {
  request: async <T>({ method, path, params }: { method: 'GET' | 'POST'; path: string; params?: Record<string, string | number | undefined> }) => {
    const response = await apiClient.request<T>({ method, url: path, params });
    return response.data;
  },
};

const object = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const number = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) && Number.isSafeInteger(value) ? value : undefined;
const string = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const positiveId = (id: number) => Number.isSafeInteger(id) && id > 0;
/** Canonical taxonomy order (same codes/labels as trips/categories.ts); drives saved-screen category chip order. */
export const CATEGORY_LABELS: Record<string, string> = { RESTAURANT: '식당', CAFE: '카페', ATTRACTION: '관광지', ACCOMMODATION: '동반숙소', HOSPITAL: '동물병원', ACTIVITY: '놀거리/액티비티', GROOMING: '미용실', CARE: '돌봄', SHOPPING: '쇼핑', TRAINING: '훈련소', FACILITY: '편의시설' };
export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);
const TAG_LABELS: Record<string, string> = { SMALL_DOG: '소형견', MEDIUM_DOG: '중형견', LARGE_DOG: '대형견', INDOOR: '실내', OUTDOOR: '실외', PRIVATE_SPACE: '전용 공간', PET_MENU: '반려견 메뉴', WATER_PROVIDED: '물 제공', POOP_BAG_PROVIDED: '배변봉투 제공', POOP_BAG_REQUIRED: '배변봉투 필수', OFF_LEASH: '오프리쉬 가능', LEASH_REQUIRED: '목줄 필수', CARRIER_REQUIRED: '이동장 필수', NO_DANGEROUS_DOG: '맹견 제한', VACCINATION_RECOMMENDED: '예방접종 권장', PARKING_AVAILABLE: '주차 가능', RESERVATION_AVAILABLE: '예약 가능' };

// TODO(#26): Figma (pY3MkIokNjhdgKw42zxDvN, 468:1725) shows 유저인증 N/평점/N일전 badges per card.
// Swagger 2026-09-17 confirms /api/v1/places/me/likes returns PlaceMapResponse, which has no
// verifiedCount/rating/lastVerifiedAt fields (unlike the sibling NearbyPlaceResponse that does).
// Leaving these unmapped is correct until the endpoint contract adds them; do not invent the fields.
export const mapSavedPlace = (value: unknown): Place | null => {
  const source = object(value);
  if (!source) return null;
  const id = number(source?.id);
  const name = string(source?.name);
  const category = string(source?.category);
  const address = string(source?.address);
  if (!id || !positiveId(id) || !name || !category || !address || typeof source.isLiked !== 'boolean') return null;
  if (source.tags !== undefined && !Array.isArray(source.tags)) return null;
  if (source.isOfficial !== undefined && typeof source.isOfficial !== 'boolean') return null;
  if (Array.isArray(source.tags) && !source.tags.every(item => typeof item === 'string')) return null;
  const tagCodes = strings(source.tags);
  const categoryName = CATEGORY_LABELS[category];
  const tags = tagCodes.map(tag => TAG_LABELS[tag]);
  if (!categoryName || tags.some(tag => tag === undefined)) return null;
  const mapx = typeof source?.mapx === 'number' && Number.isFinite(source.mapx) ? source.mapx : undefined;
  const mapy = typeof source?.mapy === 'number' && Number.isFinite(source.mapy) ? source.mapy : undefined;
  if (source.mapx !== undefined && mapx === undefined || source.mapy !== undefined && mapy === undefined) return null;
  if (mapx !== undefined && (mapx < -180 || mapx > 180) || mapy !== undefined && (mapy < -90 || mapy > 90)) return null;
  return {
    id, name, category, categoryName, address,
    imageUrl: string(source.thumbnailUrl), tags: tags as string[], tagCodes,
    isOfficial: source.isOfficial ?? false, isLiked: source.isLiked,
    longitude: mapx, latitude: mapy,
  };
};

// TODO(#26): Figma (pY3MkIokNjhdgKw42zxDvN, 594:3166) shows a pet-avatar pair on the course card.
// Swagger 2026-09-17 confirms CourseCardResponse (GET /api/v1/courses) has no dog/avatar field, so
// this cannot be rendered without a contract change; do not invent the field.
export const mapSavedCourse = (value: unknown): Course | null => {
  const source = object(value);
  if (!source) return null;
  const id = number(source?.id);
  const title = string(source?.title);
  const region = string(source?.region);
  const placeCount = number(source?.placeCount);
  const totalDistanceKm = typeof source?.totalDistanceKm === 'number' ? source.totalDistanceKm : undefined;
  if (!id || !positiveId(id) || !title || !region || placeCount === undefined || placeCount < 0 || totalDistanceKm === undefined || !Number.isFinite(totalDistanceKm) || totalDistanceKm < 0 || typeof source.isLiked !== 'boolean') return null;
  return { id, title, region, placeCount, totalDistanceKm, thumbnailUrl: string(source.thumbnailUrl), isLiked: source.isLiked };
};

interface Page<T> { totalCount: number; page: number; size: number; items: T[]; }
const page = <T extends { id: number }>(value: unknown, key: string, map: (item: unknown) => T | null): Page<T> => {
  const source = object(value);
  if (!source || !Array.isArray(source[key])) throw new Error('저장 목록 응답 형식이 올바르지 않습니다.');
  const totalCount = number(source.totalCount);
  const pageNumber = number(source.page);
  const size = number(source.size);
  if (totalCount === undefined || totalCount < 0 || pageNumber === undefined || pageNumber < 0 || size === undefined || size <= 0) {
    throw new Error('저장 목록 페이지 정보가 올바르지 않습니다.');
  }
  const seen = new Set<number>();
  const items = (source[key] as unknown[]).map(item => {
    const mapped = map(item);
    if (!mapped) throw new Error('저장 목록 항목 형식이 올바르지 않습니다.');
    const id = mapped.id;
    if (seen.has(id)) throw new Error('저장 목록에 중복 ID가 있습니다.');
    seen.add(id);
    return mapped;
  });
  return { totalCount, page: pageNumber, size, items };
};

const assertResponse = <T>(value: T): T => {
  if (value === null || value === undefined) throw new Error('저장 목록 응답 형식이 올바르지 않습니다.');
  return value;
};
const assertId = (id: number) => { if (!positiveId(id)) throw new Error('유효하지 않은 ID입니다.'); };

export const createRealSavedAdapter = (transport: SavedTransport = clientTransport): RealSavedAdapter => ({
  async getPlaces(pageNumber = 0, size = 50) {
    const response = await transport.request<unknown>({ method: 'GET', path: SAVED_ENDPOINTS.places, params: { page: pageNumber, size } });
    return page(assertResponse(response), 'places', mapSavedPlace);
  },
  async getCourses(pageNumber = 0, size = 10) {
    const response = await transport.request<unknown>({ method: 'GET', path: SAVED_ENDPOINTS.courses, params: { page: pageNumber, size } });
    return page(assertResponse(response), 'courses', mapSavedCourse);
  },
  async togglePlaceLike(id: number) { assertId(id); const response = await transport.request<unknown>({ method: 'POST', path: SAVED_ENDPOINTS.placeLike(id) }); return parseToggle(response); },
  async toggleCourseLike(id: number) { assertId(id); const response = await transport.request<unknown>({ method: 'POST', path: SAVED_ENDPOINTS.courseLike(id) }); return parseToggle(response); },
});

const parseToggle = (value: unknown): { liked: boolean } => {
  const source = object(value);
  if (typeof source?.liked !== 'boolean') throw new Error('저장 상태 응답 형식이 올바르지 않습니다.');
  return { liked: source.liked };
};
