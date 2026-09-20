import { useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import { consumeKakaoCallback } from '../../../features/onboarding/social';

export default function KakaoOAuthCallback() {
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string }>();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    if (params.error) {
      router.replace({ pathname: '/onboarding/login', params: { oauthError: 'kakao-denied' } });
      return;
    }
    if (!params.code || !params.state) {
      router.replace({ pathname: '/onboarding/login', params: { oauthError: 'kakao-response' } });
      return;
    }
    try {
      consumeKakaoCallback(params.code, params.state);
      router.replace('/onboarding/login?oauth=kakao');
    } catch {
      router.replace({ pathname: '/onboarding/login', params: { oauthError: 'kakao-state' } });
    }
  }, [params.code, params.error, params.state, router]);

  return <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}><Text>카카오 로그인 확인 중...</Text></View>;
}
