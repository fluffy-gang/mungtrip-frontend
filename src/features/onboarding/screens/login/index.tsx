import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';
import { showDialog } from '@/components/ui/dialog';
import { OnboardingPage, ScreenTitle } from '@/features/onboarding/components';

import { INTRO_SLIDES } from '../../constants';
import { useOnboarding } from '../../context';
import { PendingDeletionError } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/utils/error';
import { styles } from './style';
import { GoogleGISButton } from '@/features/onboarding/google-gis-button';

import type { Href } from 'expo-router';
import type { LoginProvider } from '../../types';

const LOOP_SLIDES = [INTRO_SLIDES[2], ...INTRO_SLIDES, INTRO_SLIDES[0]];
const INTRO_SLIDE_IMAGES: Record<(typeof INTRO_SLIDES)[number]['id'], number> = {
  courses: require('../../../../../assets/images/onboarding/onboard-2.png'),
  places: require('../../../../../assets/images/onboarding/onboard-1.png'),
  verified: require('../../../../../assets/images/onboarding/onboard-3.png'),
};
export function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login } = useOnboarding();
  const params = useLocalSearchParams<{ oauth?: string; oauthError?: string }>();
  const listRef = useRef<FlatList<(typeof LOOP_SLIDES)[number]>>(null);
  const [slideWidth, setSlideWidth] = useState(width);
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState<LoginProvider>();
  const [error, setError] = useState<string | undefined>(() => {
    if (params.oauthError === 'kakao-denied') return '카카오 로그인이 취소되었어요. 다시 시도해주세요.';
    if (params.oauthError === 'kakao-response') return '카카오 로그인 응답이 올바르지 않아요. 다시 시도해주세요.';
    if (params.oauthError === 'kakao-state') return '카카오 로그인 상태 확인에 실패했어요. 다시 시도해주세요.';
    return undefined;
  });

  const callbackHandled = useRef(false);

  const handleLogin = useCallback(async (provider: LoginProvider, restoreToken?: string, providerToken?: string) => {
    try {
      setError(undefined);
      setPending(provider);
      const next = await login(provider, restoreToken, providerToken);
      const path = next === 'agreements'
        ? '/onboarding/agreements'
        : next === 'dogPrompt'
          ? '/onboarding/dog-prompt'
          : next === 'ready'
            ? '/'
            : undefined;
      if (path) router.replace(path as Href);
    } catch (nextError) {
      if (nextError instanceof PendingDeletionError) {
        showDialog(
          '계정을 복구할까요?',
          '탈퇴 신청 후 30일 이내에는 계정을 복구할 수 있어요.',
          [
            { style: 'cancel', text: '취소' },
            {
              text: '복구하기',
              onPress: () => {
                void handleLogin(provider, nextError.restoreToken);
              },
            },
          ],
        );
        return;
      }

      setError(getErrorMessage(nextError));
    } finally {
      setPending(undefined);
    }
  }, [login, router]);

  const handleGoogleCredential = useCallback((credential: string) => {
    void handleLogin('GOOGLE', undefined, credential);
  }, [handleLogin]);
  const handleGoogleError = useCallback((loginError: unknown) => {
    setError(getErrorMessage(loginError));
  }, []);

  useEffect(() => {
    if (params.oauth === 'kakao' && !callbackHandled.current) {
      callbackHandled.current = true;
      void handleLogin('KAKAO');
    }
  }, [handleLogin, params.oauth]);

  return (
    <OnboardingPage>
      <ScrollView bounces={false} contentContainerStyle={styles.loginScroll}>
        <FlatList
          data={LOOP_SLIDES}
          getItemLayout={(_, index) => ({ index, length: slideWidth, offset: slideWidth * index })}
          horizontal
          initialScrollIndex={1}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onLayout={(event) => setSlideWidth(event.nativeEvent.layout.width)}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
            if (index === 0) {
              listRef.current?.scrollToIndex({ animated: false, index: 3 });
            } else if (index === LOOP_SLIDES.length - 1) {
              listRef.current?.scrollToIndex({ animated: false, index: 1 });
            }
          }}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
            const nextPage = index <= 0
              ? INTRO_SLIDES.length - 1
              : index >= LOOP_SLIDES.length - 1
                ? 0
                : index - 1;
            setPage(nextPage);
          }}
          pagingEnabled
          ref={listRef}
          scrollEventThrottle={16}
          style={styles.introCarousel}
          renderItem={({ item }) => (
            <View style={[styles.introSlide, { width: slideWidth }]}>
              <Image
                accessibilityLabel={`${item.title} 미리보기`}
                contentFit="cover"
                source={INTRO_SLIDE_IMAGES[item.id]}
                style={styles.heroImage}
              />
              <View style={styles.introCopy}>
                <ScreenTitle>{item.title}</ScreenTitle>
                <Text color="textSecondary" fontSize={16} lineHeight={28} style={styles.centerText}>
                  {item.description}
                </Text>
              </View>
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
        <GoogleGISButton
          disabled={Boolean(pending)}
          onCredential={handleGoogleCredential}
          onError={handleGoogleError}
        />
        <Text color="textTertiary" fontSize={12} lineHeight={20} style={styles.centerText}>
          로그인하면 이용약관 및 개인정보처리방침에{`\n`}동의하는 것으로 간주합니다
        </Text>
      </View>
      <Toast bottomOffset={176} message={error} onDismiss={() => setError(undefined)} />
    </OnboardingPage>
  );
}
