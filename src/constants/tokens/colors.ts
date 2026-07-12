// 원시 색상은 Figma에서 관측된 값만 복사한다.
export const primitiveColors = {
  orange: {
    500: '#FE6A20',
    700: '#CE4F0F',
  },
  gray: {
    0: '#FFFFFF',
    100: '#E4E4E4',
    1000: '#000000',
  },
  coolgray: {
    50: '#F9FAFB',
    100: '#F2F4F6',
    200: '#E5E8EB',
    300: '#D1D6DB',
    400: '#B0B8C1',
    500: '#8B95A1',
    600: '#6B7684',
    800: '#333D4B',
    900: '#191F28',
  },
  blue: {
    500: '#1C7CFE',
  },
} as const;

// 시맨틱 색상은 다크 테마가 디자인되기 전까지 라이트 전용으로 유지한다.
export const semanticColors = {
  light: {
    background: primitiveColors.gray[0],
    foreground: primitiveColors.coolgray[900],
    surface: primitiveColors.gray[0],
    surfaceSubtle: primitiveColors.coolgray[100],
    surfaceMuted: primitiveColors.coolgray[200],
    textPrimary: primitiveColors.coolgray[900],
    textSecondary: primitiveColors.coolgray[800],
    textTertiary: primitiveColors.coolgray[600],
    textPlaceholder: primitiveColors.coolgray[500],
    textDisabled: primitiveColors.coolgray[400],
    border: primitiveColors.coolgray[200],
    primary: primitiveColors.orange[500],
    primaryPressed: primitiveColors.orange[700],
    primaryDisabled: primitiveColors.coolgray[200],
    accentBlue: primitiveColors.blue[500],
    inverse: primitiveColors.gray[1000],
    onPrimary: primitiveColors.gray[0],
    onInverse: primitiveColors.gray[0],
    socialKakao: '#FEE500',
  },
} as const;
