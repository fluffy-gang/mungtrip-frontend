import { useDialogStore } from './store';

import type { DialogButtonConfig } from './types';

/**
 * 앱 전체에서 쓰는 공용 다이얼로그. react-native의 Alert.alert와 같은 방식으로 호출한다.
 * 버튼을 생략하면 "확인" 버튼 하나만 있는 안내 다이얼로그가 뜬다.
 */
export const showDialog = (
  title: string,
  description?: string,
  buttons?: DialogButtonConfig[],
): void => {
  useDialogStore.getState().show({ buttons, description, title });
};

/** 아직 구현되지 않은 기능을 눌렀을 때 공통으로 쓰는 안내 다이얼로그. */
export const showComingSoonDialog = (): void => {
  showDialog('아직 지원되지 않는 기능이에요', '곧 만나보실 수 있어요.');
};
