import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  centerText: { textAlign: 'center' },
  dot: {
    backgroundColor: tokens.colors.semantic.light.surfaceMuted,
    borderRadius: tokens.radius.full,
    height: 8,
    width: 8,
  },
  dotActive: { backgroundColor: tokens.colors.semantic.light.primary, width: 16 },
  googleButton: {
    backgroundColor: tokens.colors.semantic.light.surface,
    borderColor: tokens.colors.semantic.light.border,
    borderWidth: 1,
  },
  heroPlaceholder: {
    backgroundColor: tokens.colors.semantic.light.surfaceMuted,
    height: 256,
    marginTop: tokens.spacing[56],
    width: '100%',
  },
  introSlide: {
    alignItems: 'center',
    gap: tokens.spacing[10],
    paddingHorizontal: tokens.spacing[20],
    paddingTop: tokens.spacing[24],
  },
  kakaoButton: { backgroundColor: tokens.colors.semantic.light.socialKakao },
  loginActions: {
    gap: tokens.spacing[12],
    paddingBottom: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[20],
  },
  loginScroll: { paddingBottom: tokens.spacing[12] },
  pagination: {
    flexDirection: 'row',
    gap: tokens.spacing[6],
    justifyContent: 'center',
    marginTop: tokens.spacing[20],
  },
  pressed: { opacity: 0.7 },
  socialButton: {
    alignItems: 'center',
    borderRadius: tokens.radius[16],
    flexDirection: 'row',
    gap: tokens.spacing[12],
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
});
