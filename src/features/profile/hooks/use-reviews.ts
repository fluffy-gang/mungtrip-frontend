import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { useReviewsStore } from '../store/reviews-store';

export function useReviews(enabled = true) {
  const reviews = useReviewsStore(state => state.reviews);
  const visitedPlaces = useReviewsStore(state => state.visitedPlaces);
  const loading = useReviewsStore(state => state.loading);
  const hasError = useReviewsStore(state => state.hasError);
  const fetchAll = useReviewsStore(state => state.fetchAll);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      void fetchAll();
    }, [enabled, fetchAll]),
  );

  const retry = useCallback(() => {
    void fetchAll();
  }, [fetchAll]);

  return { hasError, loading, retry, reviews, visitedPlaces };
}
