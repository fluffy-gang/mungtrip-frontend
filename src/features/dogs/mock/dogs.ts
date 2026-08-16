import type { Dog } from '../types';

// TODO(#11): 목데이터. 실제 로그인 화면(#9)이 머지되면 이 파일과 사용처를 제거한다.
export const MOCK_DOGS: Dog[] = [
  {
    breed: { breedId: 1, name: '골든리트리버' },
    dogId: 1,
    isDangerousDog: false,
    isNeutered: true,
    name: '코코',
    personalities: [{ id: 1, name: '활발함' }],
    size: 'LARGE',
    weight: 8,
  },
  {
    breed: { breedId: 2, name: '푸들' },
    dogId: 2,
    isDangerousDog: false,
    isNeutered: true,
    name: '보리',
    personalities: [{ id: 2, name: '조용함' }],
    size: 'SMALL',
    weight: 3,
  },
  {
    breed: { breedId: 3, name: '웰시코기' },
    dogId: 3,
    isDangerousDog: false,
    isNeutered: false,
    name: '초코',
    personalities: [
      { id: 1, name: '활발함' },
      { id: 3, name: '사람 좋아함' },
    ],
    size: 'MEDIUM',
    weight: 12,
  },
];
