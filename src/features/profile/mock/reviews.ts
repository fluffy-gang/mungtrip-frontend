// TODO(#11): 목데이터. 리뷰/방문 장소 조회 API가 추가되면 실제 API 응답으로 교체한다.

export interface MockReview {
  content: string;
  date: string;
  dogName: string;
  id: number;
  placeName: string;
  rating: number;
}

export interface MockVisitedPlace {
  id: number;
  placeName: string;
  visitedAt: string;
}

export const MOCK_REVIEWS: MockReview[] = [
  {
    content:
      '반려견과 함께 걷기 좋은 해안 산책로였어요. 풍경이 예쁘고 아이가 편안하게 안전한 공간에서 뛰어다닐 수 있었어요.',
    date: '2026.11.11',
    dogName: '보리',
    id: 1,
    placeName: '애월 댕댕카페',
    rating: 5,
  },
  {
    content:
      '실내 공간이 넓어서 여러 마리가 함께 있어도 여유로웠어요. 다음에 또 방문하고 싶어요.',
    date: '2026.10.20',
    dogName: '보리',
    id: 2,
    placeName: '숲속 강아지 카페',
    rating: 5,
  },
];

export const MOCK_VISITED_PLACES: MockVisitedPlace[] = [
  { id: 1, placeName: '비대여울 밍카페', visitedAt: '2026.10.20' },
  { id: 2, placeName: '밤빛 멍냥 카페', visitedAt: '2026.10.15' },
  { id: 3, placeName: '달빛 강아지 카페', visitedAt: '2026.10.28' },
];
