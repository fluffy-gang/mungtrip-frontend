import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

const colors = tokens.colors.semantic.light;
const { radius, spacing } = tokens;

/** Review lists, cards, and feedback shown throughout the profile feature. */
export const reviewStyles = StyleSheet.create({
  reviewCountLabel: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing[20],
  },
  reviewCountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[20],
  },
  viewAllLink: {
    color: colors.primary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewPreviewScroll: { marginTop: spacing[12] },
  reviewPreviewCard: { marginRight: spacing[12], width: 280 },
  reviewCard: {
    borderColor: colors.border,
    borderRadius: radius[12],
    borderWidth: 1,
    gap: spacing[8],
    padding: spacing[16],
  },
  reviewCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewPlaceName: {
    color: colors.textPrimary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 15,
    fontWeight: '700',
  },
  reviewRatingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing[4],
  },
  reviewRatingText: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '700',
  },
  reviewMeta: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
  },
  reviewContent: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    lineHeight: 19,
  },
  visitedSection: { gap: spacing[10], marginTop: spacing[24] },
  visitedRow: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius[12],
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing[12],
    justifyContent: 'space-between',
    padding: spacing[16],
  },
  visitedBody: { gap: spacing[2] },
  visitedPlaceName: {
    color: colors.textPrimary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '600',
  },
  visitedDate: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.foreground,
    borderRadius: radius[12],
    bottom: 0,
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[12],
    position: 'absolute',
  },
  toastText: {
    color: colors.surface,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    fontWeight: '600',
  },
});
