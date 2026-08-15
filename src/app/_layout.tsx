import { DarkTheme, DefaultTheme, Stack, ThemeProvider as ExpoThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { tokens } from '@/constants/tokens';
import { setupAuthInterceptor } from '@/features/auth/api';
import { useAuth } from '@/features/auth/useAuth';

void SplashScreen.preventAutoHideAsync();
setupAuthInterceptor();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    void initAuth()
      .catch(error => {
        console.warn('인증 초기화 중 문제가 발생했습니다.', error);
      })
      .finally(() => {
        if (isMounted) {
          void SplashScreen.hideAsync();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initAuth]);

  return (
    <ExpoThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StyledThemeProvider theme={tokens}>
        <Stack screenOptions={{ headerShown: false }} />
      </StyledThemeProvider>
    </ExpoThemeProvider>
  );
}
