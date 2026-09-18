import type { Dog } from '../types';

// TODO(#11): 목데이터. 실제 로그인 화면(#9)이 머지되면 이 파일과 사용처를 제거한다.
export const MOCK_DOGS: Dog[] = [
  {
    breed: '골든리트리버',
    dogId: 1,
    isDangerousDog: false,
    isNeutered: true,
    name: '코코',
    personalities: [{ id: 1, name: '활발함' }],
    profileImageUrl: '',
    size: 'L',
    weight: 8,
  },
  {
    breed: '푸들',
    dogId: 2,
    isDangerousDog: false,
    isNeutered: true,
    name: '보리',
    personalities: [{ id: 2, name: '조용함' }],
    profileImageUrl: '',
    size: 'S',
    weight: 3,
  },
  {
    breed: '웰시코기',
    dogId: 3,
    isDangerousDog: false,
    isNeutered: false,
    name: '초코',
    personalities: [
      { id: 1, name: '활발함' },
      { id: 3, name: '사람 좋아함' },
    ],
    profileImageUrl: '',
    size: 'M',
    weight: 12,
  },
];
