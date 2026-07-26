import { DarkTheme, DefaultTheme, Stack, ThemeProvider as ExpoThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { tokens } from '@/constants/tokens';
import { setupAuthInterceptor } from '@/features/auth/api';
import { useAuth } from '@/features/auth/useAuth';

SplashScreen.preventAutoHideAsync();
setupAuthInterceptor();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initAuth } = useAuth();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return (
    <ExpoThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StyledThemeProvider theme={tokens}>
        <Stack screenOptions={{ headerShown: false }} />
      </StyledThemeProvider>
    </ExpoThemeProvider>
  );
}
