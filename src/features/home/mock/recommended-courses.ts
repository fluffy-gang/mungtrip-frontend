import type { RecommendedCourse } from '../types';

// TODO(#10): 목데이터. "제주 지역별 추천 코스"는 아직 백엔드 API가 없다.
// 코스 API가 생기면 이 파일과 사용처(feed-content.tsx)를 실제 연동으로 교체한다.
export const MOCK_RECOMMENDED_COURSES: RecommendedCourse[] = [
  {
    distanceLabel: '도보 5분 · 12km',
    id: 1,
    imageUrl: 'http://tong.visitkorea.or.kr/cms/resource/45/3523545_image2_1.jpg',
    isLiked: true,
    subtitle: '동쪽 한적 카페 투어',
    title: '애월 반려견 동반 코스',
  },
  {
    distanceLabel: '도보 5분 · 12km',
    id: 2,
    imageUrl: 'http://tong.visitkorea.or.kr/cms/resource/75/3400775_image2_1.jpg',
    isLiked: false,
    subtitle: '산책하기 좋은 해안 코스',
    title: '성산 해안 산책 코스',
  },
  {
    distanceLabel: '도보 8분 · 15km',
    id: 3,
    imageUrl: 'http://tong.visitkorea.or.kr/cms/resource/35/3352435_image2_1.jpg',
    isLiked: false,
    subtitle: '오름 정상까지 반려견과 함께',
    title: '금오름 트레킹 코스',
  },
];
