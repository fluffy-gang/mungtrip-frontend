import { Stack } from 'expo-router';
import { ThemeProvider } from 'styled-components/native';

import { tokens } from '@/constants/tokens';

export default function RootLayout() {
  // styled-components/native 프리미티브가 참조할 루트 테마 원본이다.
  return (
    <ThemeProvider theme={tokens}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
