import { Alert } from 'react-native';

/** 아직 구현되지 않은 액션에 대해 통일된 안내를 띄운다. */
export const showComingSoon = () => {
  Alert.alert('아직 지원되지 않는 기능이에요', '곧 만나보실 수 있어요.');
};
