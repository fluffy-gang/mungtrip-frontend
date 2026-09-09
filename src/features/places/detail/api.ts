import { parseFeed, parseNearby, parseReview, parseVisit } from './parsers';
import { normalizeVisit, requireId, validateReview } from './validation';

import type { PlaceAdapter, ReviewInput } from './types';

export interface PlaceTransport {
  request(method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown,
    params?: Record<string, number>): Promise<unknown>;
}
/** OpenAPI 2026-09-17. Private endpoint ownership avoids concurrent shared endpoint edits. */
export function createPlaceApi(transport: PlaceTransport): Pick<PlaceAdapter,
  'reviews' | 'nearby' | 'visit' | 'myReview' | 'createReview' | 'updateReview'> {
  const place = (id: number) => { requireId(id); return `/api/v1/places/${id}`; };
  return {
    reviews: async (id, page) => {
      if (!Number.isInteger(page) || page < 0) throw new Error('페이지 번호가 올바르지 않아요.');
      return parseFeed(await transport.request('GET', `${place(id)}/reviews`, undefined, { page, size: 20 }));
    },
    nearby: async (id, radius) => parseNearby(await transport.request('GET', `${place(id)}/nearby`, undefined,
      radius ? { radiusMeters: radius } : undefined)),
    visit: async (id, input) => parseVisit(await transport.request('POST', `${place(id)}/visits`, normalizeVisit(input))),
    myReview: async id => {
      try { return parseReview(await transport.request('GET', `${place(id)}/reviews/me`)); }
      catch (error) {
        // The shared ApiError carries the backend envelope in data, not a code property.
        if (error && typeof error === 'object' && 'data' in error &&
          error.data && typeof error.data === 'object' && 'code' in error.data &&
          error.data.code === 'REVIEW_404_1') return null;
        throw error;
      }
    },
    createReview: async (id, input) => {
      validateReview(input);
      return parseReview(await transport.request('POST', `${place(id)}/reviews`, input));
    },
    updateReview: async (id, input) => {
      requireId(id); validateReview({ ...input, imageUrls: [] });
      const body: Pick<ReviewInput, 'rating' | 'content'> = { rating: input.rating, content: input.content };
      return parseReview(await transport.request('PATCH', `/api/v1/reviews/${id}`, body));
    },
  };
}
