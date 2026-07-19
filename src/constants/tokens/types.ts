import type { tokens } from './index';

export type ColorFamily = keyof typeof tokens.colors.primitive;
export type ColorShade<TFamily extends ColorFamily = ColorFamily> =
  keyof (typeof tokens.colors.primitive)[TFamily];
export type SemanticColorName = keyof typeof tokens.colors.semantic.light;
export type ThemeName = keyof typeof tokens.colors.semantic;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type FontFamilyToken = keyof typeof tokens.fonts;
export type FontSizeToken = keyof typeof tokens.typography.fontSize;
export type FontWeightToken = keyof typeof tokens.typography.fontWeight;
