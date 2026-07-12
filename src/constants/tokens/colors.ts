// 원시 색상은 Figma에서 관측된 값만 복사한다.
export const primitiveColors = {
  orange: {
    50: '#FFF4EC',
    100: '#FFF1EB',
    500: '#FE6A20',
    700: '#CE4F0F',
  },
  gray: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F2F4F6',
    200: '#E5E8EB',
    300: '#D1D6DB',
    400: '#B0B8C1',
    500: '#8B95A1',
    600: '#6B7684',
    700: '#4E5968',
    800: '#333D4B',
    900: '#191F28',
  },
  black: {
    0: '#000000',
  },
  blue: {
    500: '#1C7CFE',
  },
} as const;

// 시맨틱 색상은 다크 테마가 디자인되기 전까지 라이트 전용으로 유지한다.
export const semanticColors = {
  light: {
    background: primitiveColors.gray[0],
    foreground: primitiveColors.gray[900],
    surface: primitiveColors.gray[0],
    surfaceSubtle: primitiveColors.gray[100],
    surfaceMuted: primitiveColors.gray[200],
    textPrimary: primitiveColors.gray[900],
    textSecondary: primitiveColors.gray[800],
    textTertiary: primitiveColors.gray[600],
    textPlaceholder: primitiveColors.gray[500],
    textDisabled: primitiveColors.gray[400],
    border: primitiveColors.gray[200],
    inputBorder: primitiveColors.gray[200],
    inputPlaceholder: primitiveColors.gray[500],
    primary: primitiveColors.orange[500],
    primaryPressed: primitiveColors.orange[700],
    primaryDisabled: primitiveColors.gray[200],
    accentOrangeSubtle: primitiveColors.orange[50],
    accentOrangeMuted: primitiveColors.orange[100],
    accentBlue: primitiveColors.blue[500],
    overlayScrim: 'rgba(0,0,0,0.55)',
    inverse: primitiveColors.black[0],
    onPrimary: primitiveColors.gray[0],
    onInverse: primitiveColors.gray[0],
    socialKakao: '#FEE500',
  },
} as const;
