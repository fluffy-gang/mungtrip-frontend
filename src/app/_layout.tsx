import { DefaultTheme, Stack, ThemeProvider as ExpoThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { tokens } from '@/constants/tokens';
import { PlaceCatalogProvider } from '@/features/places/place-catalog-context';

void SplashScreen.preventAutoHideAsync();

const lightColors = tokens.colors.semantic.light;
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightColors.background,
    border: lightColors.border,
    card: lightColors.surface,
    text: lightColors.textPrimary,
  },
};

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <ExpoThemeProvider value={navigationTheme}>
      <StyledThemeProvider theme={tokens}>
        <PlaceCatalogProvider>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: lightColors.background },
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="info"
              options={{
                headerBackTitle: '뒤로',
                headerShadowVisible: false,
                headerShown: true,
                headerStyle: { backgroundColor: lightColors.surface },
                headerTintColor: lightColors.textPrimary,
                statusBarStyle: 'dark',
                title: '앱 정보',
              }}
            />
          </Stack>
        </PlaceCatalogProvider>
      </StyledThemeProvider>
    </ExpoThemeProvider>
  );
}
