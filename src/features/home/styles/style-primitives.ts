import { tokens } from '@/constants/tokens';

export const colors = tokens.colors.semantic.light;
export { tokens };
export const { borderWidth, radius, spacing } = tokens;

export const text = (
  fontSize: keyof typeof tokens.typography.fontSize,
  fontWeight: keyof typeof tokens.typography.fontWeight = 'medium',
  color: keyof typeof colors = 'textPrimary',
  lineHeight?: number,
) => ({
  color: colors[color],
  fontFamily: tokens.fonts.sansSerif,
  fontSize: tokens.typography.fontSize[fontSize].fontSize,
  fontWeight: tokens.typography.fontWeight[fontWeight],
  letterSpacing: 0,
  lineHeight: lineHeight ?? tokens.typography.fontSize[fontSize].fontSize,
});
