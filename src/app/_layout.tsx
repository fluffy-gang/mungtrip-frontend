import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ThemeProvider } from 'styled-components/native';

import { BootstrapError } from '@/features/onboarding/components';

import { OnboardingProvider, useOnboarding } from '@/features/onboarding/context';
import { tokens } from '@/constants/tokens';
import { useAppFonts } from '@/hooks/use-app-fonts';

import type { Href } from 'expo-router';

function OnboardingGate() {
  const router = useRouter();
  const segments = useSegments();
  const { bootstrap, status } = useOnboarding();
  const started = useRef(false);
  const path = segments.join('/');

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status === 'initializing') return;
    if (path === 'onboarding/oauth-callback') return;

    if (status === 'anonymous' && path !== 'onboarding/login') {
      router.replace('/onboarding/login' as Href);
      return;
    }
    if (status === 'agreements' && path !== 'onboarding/agreements') {
      router.replace('/onboarding/agreements' as Href);
      return;
    }
    if (status === 'dogPrompt' && !path.startsWith('onboarding/dog') && path !== 'onboarding/complete') {
      router.replace('/onboarding/dog-prompt' as Href);
      return;
    }
    if (status === 'ready' && path.startsWith('onboarding')) {
      router.replace('/' as Href);
    }
  }, [path, router, status]);

  if (status === 'bootstrapError') {
    return <BootstrapError onRetry={() => void bootstrap()} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const fontsReady = useAppFonts();

  if (!fontsReady) return null;

  // styled-components/native 프리미티브가 참조할 루트 테마 원본이다.
  return (
    <ThemeProvider theme={tokens}>
      <OnboardingProvider>
        <OnboardingGate />
      </OnboardingProvider>
    </ThemeProvider>
  );
}
