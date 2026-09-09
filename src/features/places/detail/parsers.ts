import { isRejectReason, requireId } from './validation';

import type { NearbyResult, PlaceReview, PlaceVisit, ReviewDog, ReviewFeed, ReviewItem } from './types';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('응답 형식이 올바르지 않아요.');
  return value as Record<string, unknown>;
}
const text = (value: unknown) => typeof value === 'string' ? value : undefined;
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
function strings(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw new Error('사진 응답이 올바르지 않아요.');
  return value;
}
function dog(value: unknown): ReviewDog | undefined {
  if (value == null) return undefined;
  const d = object(value);
  return { name: text(d.name), breed: text(d.breed), size: text(d.size), weight: number(d.weight) };
}
function reason(value: unknown) {
  if (value == null) return undefined;
  if (!isRejectReason(value)) throw new Error('거절 사유 응답이 올바르지 않아요.');
  return value;
}
export function parseVisit(raw: unknown): PlaceVisit {
  const v = object(raw);
  requireId(v.placeVisitId); requireId(v.placeId);
  if (v.outcome !== 'VISITED' && v.outcome !== 'REJECTED') throw new Error('방문 결과가 올바르지 않아요.');
  const rejectReason = reason(v.rejectReason);
  if (v.outcome === 'REJECTED' && !rejectReason) throw new Error('거절 사유가 없는 응답이에요.');
  return { placeVisitId: v.placeVisitId, placeId: v.placeId, outcome: v.outcome,
    visitedAt: text(v.visitedAt), rejectReason, rejectDetail: text(v.rejectDetail) };
}
export function parseReview(raw: unknown): PlaceReview {
  const v = object(raw);
  requireId(v.reviewId); requireId(v.placeId);
  const rating = number(v.rating);
  if (rating === undefined || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('후기 별점 응답이 올바르지 않아요.');
  return { reviewId: v.reviewId, placeId: v.placeId, rating, content: text(v.content),
    imageUrls: strings(v.imageUrls), dog: dog(v.dog), createdAt: text(v.createdAt) };
}
function parseItem(raw: unknown): ReviewItem {
  const v = object(raw);
  if (v.type !== 'REVIEW' && v.type !== 'REJECTED') throw new Error('후기 유형이 올바르지 않아요.');
  const reviewId = number(v.reviewId);
  const rating = number(v.rating);
  if (v.type === 'REVIEW') {
    requireId(reviewId);
    if (rating === undefined || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('후기 별점이 올바르지 않아요.');
  }
  return { type: v.type, reviewId, rating, userNickname: text(v.userNickname),
    reviewerVisitCount: number(v.reviewerVisitCount), content: text(v.content),
    imageUrls: strings(v.imageUrls), rejectReason: reason(v.rejectReason),
    rejectDetail: text(v.rejectDetail), dog: dog(v.dog), occurredAt: text(v.occurredAt) };
}
export function parseFeed(raw: unknown): ReviewFeed {
  const v = object(raw);
  if (!Array.isArray(v.items) || typeof v.hasNext !== 'boolean') throw new Error('후기 목록 응답이 올바르지 않아요.');
  return { averageRating: number(v.averageRating), visitedCount: number(v.visitedCount),
    items: v.items.map(parseItem), hasNext: v.hasNext };
}
export function parseNearby(raw: unknown): NearbyResult {
  const v = object(raw);
  if (!Array.isArray(v.places)) throw new Error('주변 장소 응답이 올바르지 않아요.');
  return { expandedRadiusMeters: number(v.expandedRadiusMeters), expandedCount: number(v.expandedCount),
    places: v.places.map(rawPlace => {
      const p = object(rawPlace); requireId(p.id);
      if (typeof p.name !== 'string') throw new Error('장소 이름이 없는 응답이에요.');
      const distance = number(p.distanceMeters);
      return { id: p.id, name: p.name, category: text(p.category) ?? '', categoryName: text(p.category) ?? '',
        address: text(p.address) ?? '', imageUrl: text(p.thumbnailUrl), tags: strings(p.tags), tagCodes: strings(p.tags),
        isOfficial: p.isOfficial === true, isLiked: p.isLiked === true, rating: number(p.averageRating),
        verifiedCount: number(p.visitCount), lastVerifiedAt: text(p.lastVisitedAt),
        latitude: number(p.mapy), longitude: number(p.mapx), distanceLabel: distance === undefined ? undefined : `${distance}m` };
    }) };
}
