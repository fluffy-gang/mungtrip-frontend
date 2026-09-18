import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as ExpoThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { BootstrapError } from '@/features/onboarding/components';

import { FeatureIntegrationProvider } from '@/features/app-integration/context';
import { TabShell } from '@/features/app-integration/tab-shell';
import { tokens } from '@/constants/tokens';
import { setupAuthInterceptor } from '@/features/auth/api';
import {
  OnboardingProvider,
  useOnboarding,
} from '@/features/onboarding/context';
import { useAppFonts } from '@/hooks/use-app-fonts';

import type { Href } from 'expo-router';

void SplashScreen.preventAutoHideAsync();
setupAuthInterceptor();

function OnboardingGate() {
  const router = useRouter();
  const segments = useSegments();
  const { bootstrap, status } = useOnboarding();
  const started = useRef(false);
  const path = segments.join('/');

  useEffect(() => {
    if (started.current) return;

    started.current = true;
    void bootstrap().finally(() => {
      void SplashScreen.hideAsync();
    });
  }, [bootstrap]);

  useEffect(() => {
    if (status === 'initializing') return;

    if (status === 'anonymous' && path !== 'onboarding/login') {
      router.replace('/onboarding/login' as Href);
      return;
    }

    if (status === 'agreements' && path !== 'onboarding/agreements') {
      router.replace('/onboarding/agreements' as Href);
      return;
    }

    if (
      status === 'dogPrompt' &&
      !path.startsWith('onboarding/dog') &&
      path !== 'onboarding/complete'
    ) {
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
  const colorScheme = useColorScheme();
  const fontsReady = useAppFonts();

  if (!fontsReady) return null;

  return (
    <ExpoThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StyledThemeProvider theme={tokens}>
        <OnboardingProvider>
          <FeatureIntegrationProvider>
            <TabShell><OnboardingGate /></TabShell>
          </FeatureIntegrationProvider>
        </OnboardingProvider>
      </StyledThemeProvider>
    </ExpoThemeProvider>
  );
}
