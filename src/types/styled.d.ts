import 'styled-components/native';

import type { tokens } from '@/constants/tokens';

declare module 'styled-components/native' {
  type AppTheme = typeof tokens;

  // styled-components의 theme 추론을 토큰 aggregate와 맞춘다.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
