import { create } from 'zustand';

import { MOCK_REVIEWS, type MockReview } from './reviews';

interface ReviewsMockState {
  removeReview: (id: number) => void;
  reviews: MockReview[];
}

/**
 * TODO(#11): 목데이터 전용 스토어. 리뷰 조회/삭제 API가 생기면 서버 상태로 교체한다.
 * "방문 장소/리뷰"와 "전체 리뷰" 두 화면이 같은 삭제 결과를 보도록 상태를 공유한다.
 */
export const useReviewsMockStore = create<ReviewsMockState>(set => ({
  removeReview: id =>
    set(state => ({ reviews: state.reviews.filter(review => review.id !== id) })),
  reviews: MOCK_REVIEWS,
}));
