import type { AgreementDefinition, BreedDefinition, DogSize } from './types';

export const INTRO_SLIDES = [
  {
    id: 'places',
    title: '내 반려견 맞춤 장소',
    description: '더 이상 눈치 보는 일 없이\n우리 아이가 갈 수 있는 곳만 찾아요',
  },
  {
    id: 'courses',
    title: '제주 여행 코스를 한번에',
    description: '함께할 하루 동선까지 한번에\n추천받고 계획해요',
  },
  {
    id: 'verified',
    title: '방문인증 진짜 정보',
    description: '신뢰도 높은 공공 정보 뿐만아니라\n실제 반려인들의 방문 인증을 참고해요',
  },
] as const;

export const AGREEMENT_URLS: Record<AgreementDefinition['type'], string> = {
  ELECTRONIC_FINANCE: '',
  LOCATION: '',
  MARKETING: '',
  PRIVACY: '',
  SERVICE: '',
  TELECOM: '',
};

export const AGREEMENT_FALLBACKS: AgreementDefinition[] = [
  { type: 'SERVICE', name: '이용약관', required: true, url: '' },
  {
    type: 'ELECTRONIC_FINANCE',
    name: '전자금융거래 이용약관 동의',
    required: true,
    url: '',
  },
  {
    type: 'PRIVACY',
    name: '개인정보 수집 및 이용 동의',
    required: true,
    url: '',
  },
  {
    type: 'LOCATION',
    name: '위치기반 서비스 이용약관',
    required: true,
    url: '',
  },
  {
    type: 'TELECOM',
    name: '통신사 이용약관 (SKT, KT, LGU+)',
    required: true,
    url: '',
  },
  { type: 'MARKETING', name: '마케팅 수신 동의', required: false, url: '' },
];

export const BREEDS: BreedDefinition[] = [
  ['maltese', '말티즈', 'SMALL', false],
  ['bichon', '비숑 프리제', 'SMALL', false],
  ['welsh-corgi', '웰시코기', 'MEDIUM', false],
  ['golden-retriever', '골든 리트리버', 'LARGE', false],
  ['shiba', '시바견', 'MEDIUM', false],
  ['poodle', '푸들', 'SMALL', false],
  ['pomeranian', '포메라니안', 'SMALL', false],
  ['jindo', '진돗개', 'MEDIUM', false],
  ['labrador', '래브라도 리트리버', 'LARGE', false],
  ['dachshund', '닥스훈트', 'SMALL', false],
  ['rottweiler', '로트와일러', 'LARGE', true],
  ['pit-bull', '핏불테리어', 'MEDIUM', true],
].map(([id, name, defaultSize, isDangerousDog], index) => ({
  defaultSize: defaultSize as DogSize,
  id: id as string,
  isDangerousDog: isDangerousDog as boolean,
  name: name as string,
  sortOrder: index + 1,
}));

export const createEmptyDraft = (): import('./types').OnboardingDraft => ({
  breed: '',
  breedInputMode: 'skipped',
  isDangerousDog: false,
  name: '',
  personalities: [],
  profileImageUrl: '',
  size: 'MEDIUM',
  weight: '',
});

export const DOG_SIZE_OPTIONS = [
  { label: '소 (~7kg)', value: 'SMALL' },
  { label: '중 (7~25kg)', value: 'MEDIUM' },
  { label: '대 (25kg+)', value: 'LARGE' },
] as const;
