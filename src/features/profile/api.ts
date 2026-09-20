import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

import type {
  CreateReviewRequest,
  Review,
  UpdateReviewRequest,
  VisitedPlace,
} from './types';

interface MyReviewsApiResponse {
  reviews: Review[];
}

interface MyVisitsApiResponse {
  items: VisitedPlace[];
}

export const getMyReviews = async (): Promise<Review[]> => {
  const { data } = await apiClient.get<MyReviewsApiResponse>(ENDPOINTS.reviews.mine);

  return data.reviews;
};

export const getMyVisits = async (): Promise<VisitedPlace[]> => {
  const { data } = await apiClient.get<MyVisitsApiResponse>(ENDPOINTS.visits.mine);

  return data.items;
};

export const createReview = async (
  placeId: number,
  body: CreateReviewRequest,
): Promise<Review> => {
  const { data } = await apiClient.post<Review>(
    ENDPOINTS.reviews.byPlace(placeId),
    body,
  );

  return data;
};

export const updateReview = async (
  reviewId: number,
  body: UpdateReviewRequest,
): Promise<Review> => {
  const { data } = await apiClient.patch<Review>(
    ENDPOINTS.reviews.detail(reviewId),
    body,
  );

  return data;
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(ENDPOINTS.reviews.detail(reviewId));
};
