import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { OnboardingPage, ScreenTitle } from '@/features/onboarding/components';

import { INTRO_SLIDES } from '../../constants';
import { useOnboarding } from '../../context';
import { getErrorMessage } from '@/utils/error';
import { styles } from './style';

import type { Href } from 'expo-router';
import type { LoginProvider } from '../../types';

const LOOP_SLIDES = [INTRO_SLIDES[2], ...INTRO_SLIDES, INTRO_SLIDES[0]];

export function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login } = useOnboarding();
  const listRef = useRef<FlatList<(typeof LOOP_SLIDES)[number]>>(null);
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState<LoginProvider>();
  const [error, setError] = useState<string>();

  const handleLogin = async (provider: LoginProvider) => {
    try {
      setError(undefined);
      setPending(provider);
      const next = await login(provider);
      const path = next === 'agreements'
        ? '/onboarding/agreements'
        : next === 'dogPrompt'
          ? '/onboarding/dog-prompt'
          : next === 'ready'
            ? '/'
            : undefined;
      if (path) router.replace(path as Href);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setPending(undefined);
    }
  };

  return (
    <OnboardingPage>
      <ScrollView bounces={false} contentContainerStyle={styles.loginScroll}>
        <View style={styles.heroPlaceholder} />
        <FlatList
          data={LOOP_SLIDES}
          getItemLayout={(_, index) => ({ index, length: width, offset: width * index })}
          horizontal
          initialScrollIndex={1}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            if (index === 0) {
              listRef.current?.scrollToIndex({ animated: false, index: 3 });
              setPage(2);
            } else if (index === LOOP_SLIDES.length - 1) {
              listRef.current?.scrollToIndex({ animated: false, index: 1 });
              setPage(0);
            } else {
              setPage(index - 1);
            }
          }}
          pagingEnabled
          ref={listRef}
          renderItem={({ item }) => (
            <View style={[styles.introSlide, { width }]}>
              <ScreenTitle>{item.title}</ScreenTitle>
              <Text color="textSecondary" fontSize={16} lineHeight={28} style={styles.centerText}>
                {item.description}
              </Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
        <View accessibilityLabel={`현재 ${page + 1}/3 페이지`} style={styles.pagination}>
          {INTRO_SLIDES.map((item, index) => (
            <View key={item.id} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
      </ScrollView>
      <View style={styles.loginActions}>
        <Pressable
          accessibilityRole="button"
          disabled={Boolean(pending)}
          onPress={() => void handleLogin('KAKAO')}
          style={({ pressed }) => [styles.socialButton, styles.kakaoButton, pressed && styles.pressed]}
        >
          <Text fontSize={18} fontWeight="bold" lineHeight={24}>●</Text>
          <Text fontSize={16} fontWeight="bold" lineHeight={24}>
            {pending === 'KAKAO' ? '로그인 중...' : '카카오로 시작하기'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={Boolean(pending)}
          onPress={() => void handleLogin('GOOGLE')}
          style={({ pressed }) => [styles.socialButton, styles.googleButton, pressed && styles.pressed]}
        >
          <Text color="accentBlue" fontSize={18} fontWeight="bold" lineHeight={24}>G</Text>
          <Text fontSize={16} fontWeight="bold" lineHeight={24}>
            {pending === 'GOOGLE' ? '로그인 중...' : 'Google로 시작하기'}
          </Text>
        </Pressable>
        <Text color="textTertiary" fontSize={12} lineHeight={20} style={styles.centerText}>
          로그인하면 이용약관 및 개인정보처리방침에{`\n`}동의하는 것으로 간주합니다
        </Text>
      </View>
      <Toast bottomOffset={176} message={error} onDismiss={() => setError(undefined)} />
    </OnboardingPage>
  );
}
