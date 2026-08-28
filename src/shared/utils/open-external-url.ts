import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

/** 외부 앱 열기 실패를 화면 중단 없이 사용자에게 알린다. */
export async function openExternalUrl(url: string, targetName: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(`${targetName}을 열 수 없어요`, '잠시 후 다시 시도해 주세요.');
  }
}

/** 지도 앱 실행 실패 시 설치 유도 대신 동일 목적의 웹 화면으로 연결한다. */
export async function openExternalUrlWithFallback(
  appUrl: string,
  fallbackUrl: string,
  targetName: string,
) {
  try {
    await Linking.openURL(appUrl);
  } catch {
    await openExternalUrl(fallbackUrl, targetName);
  }
}
