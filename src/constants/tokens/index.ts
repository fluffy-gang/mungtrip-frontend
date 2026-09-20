import { primitiveColors, semanticColors } from './colors';
import { fonts } from './fonts';
import { borderWidth, radius, shadow, spacing } from './layout';
import { typography } from './typography';

export const tokens = {
  colors: {
    primitive: primitiveColors,
    semantic: semanticColors,
  },
  fonts,
  spacing,
  radius,
  borderWidth,
  shadow,
  typography,
} as const;

export type {
  ColorFamily,
  ColorShade,
  FontFamilyToken,
  FontSizeToken,
  FontWeightToken,
  RadiusToken,
  SemanticColorName,
  SpacingToken,
  ThemeName,
} from './types';
