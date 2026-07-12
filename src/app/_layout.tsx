import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { setupAuthInterceptor } from '@/features/auth/api';
import { useAuth } from '@/features/auth/useAuth';
import { AnimatedSplashOverlay } from '@/shared/components/animated-icon';
import AppTabs from '@/shared/components/app-tabs';

SplashScreen.preventAutoHideAsync();
setupAuthInterceptor();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { initAuth } = useAuth();

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
