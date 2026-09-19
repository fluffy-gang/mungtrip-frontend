import { create } from 'zustand';

import { createReview, deleteReview, getMyReviews, getMyVisits, updateReview } from '../api';

import type { ProfileDog } from '@/features/dogs/types';
import type { Review, VisitedPlace } from '../types';

interface ReviewDraft {
  content: string;
  imageUrls: string[];
  rating: number;
}

interface ReviewsState {
  addReview: (
    placeId: number,
    dog: ProfileDog,
    draft: ReviewDraft,
  ) => Promise<Review>;
  commitPendingReview: () => void;
  fetchAll: () => Promise<void>;
  hasError: boolean;
  loading: boolean;
  pendingReview: Review | null;
  removeReview: (reviewId: number) => Promise<void>;
  reviews: Review[];
  updateReview: (reviewId: number, draft: Pick<ReviewDraft, 'content' | 'rating'>) => Promise<void>;
  visitedPlaces: VisitedPlace[];
}

/** "방문 장소/리뷰"와 "전체 리뷰" 두 화면이 같은 결과를 보도록 상태를 공유한다. */
export const useReviewsStore = create<ReviewsState>((set, get) => ({
  addReview: async (placeId, dog, draft) => {
    const review = await createReview(placeId, {
      content: draft.content,
      dogId: dog.dogId,
      imageUrls: draft.imageUrls,
      rating: draft.rating,
    });
    set({ pendingReview: review });
    return review;
  },

  commitPendingReview: () => {
    const review = get().pendingReview;
    if (!review) return;

    set(state => ({
      pendingReview: null,
      reviews: state.reviews.some(item => item.reviewId === review.reviewId)
        ? state.reviews.map(item => (item.reviewId === review.reviewId ? review : item))
        : [review, ...state.reviews],
      visitedPlaces: state.visitedPlaces.map(place =>
        place.placeId === review.placeId ? { ...place, hasReview: true } : place,
      ),
    }));
  },

  fetchAll: async () => {
    set({ hasError: false, loading: true });
    const [reviewsResult, visitedPlacesResult] = await Promise.allSettled([
      getMyReviews(),
      getMyVisits(),
    ]);

    set(state => ({
      // Every consumer needs the review list. Do not present a failed review
      // request as an empty state just because the visited-place request passed.
      hasError: reviewsResult.status === 'rejected',
      loading: false,
      reviews: reviewsResult.status === 'fulfilled' ? reviewsResult.value : state.reviews,
      visitedPlaces:
        visitedPlacesResult.status === 'fulfilled'
          ? visitedPlacesResult.value
          : state.visitedPlaces,
    }));
  },

  hasError: false,
  loading: true,
  pendingReview: null,

  removeReview: async reviewId => {
    await deleteReview(reviewId);
    set(state => {
      const reviews = state.reviews.filter(review => review.reviewId !== reviewId);
      const removedReview = state.reviews.find(review => review.reviewId === reviewId);

      return {
        reviews,
        visitedPlaces: removedReview
          ? state.visitedPlaces.map(place =>
              place.placeId === removedReview.placeId
                ? { ...place, hasReview: reviews.some(review => review.placeId === place.placeId) }
                : place,
            )
          : state.visitedPlaces,
      };
    });
  },

  reviews: [],

  updateReview: async (reviewId, draft) => {
    const updated = await updateReview(reviewId, draft);
    set({ pendingReview: updated });
  },

  visitedPlaces: [],
}));
