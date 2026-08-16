import type { User } from '../types';

// TODO(#11): 목데이터. 실제 로그인 화면(#9)이 머지되면 이 파일과 사용처를 제거한다.
export const MOCK_USER: User = {
  id: 999,
  email: 'test@mungtrip.dev',
  nickname: '아리주인',
  provider: 'GOOGLE',
};
