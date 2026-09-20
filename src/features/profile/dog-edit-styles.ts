import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

const colors = tokens.colors.semantic.light;
const { radius, spacing } = tokens;

/** Styles used only by the dog-profile editing screen. */
export const dogEditStyles = StyleSheet.create({
  content: { paddingBottom: spacing[40], paddingHorizontal: spacing[20] },
  avatarWrap: { alignItems: 'center', paddingBottom: spacing[24], paddingTop: spacing[20] },
  avatarBadge: {
    alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border,
    borderRadius: radius.full, borderWidth: 1, bottom: 0, height: 32,
    justifyContent: 'center', position: 'absolute', right: 0, width: 32,
  },
  inlineSelectionRow: { alignItems: 'center', flexDirection: 'row', height: 36, justifyContent: 'space-between' },
  rows: { gap: spacing[24] },
  row: { alignItems: 'center', flexDirection: 'row', height: 24 },
  label: {
    color: colors.textPrimary, fontFamily: tokens.fonts.sansSerif,
    fontSize: 13, fontWeight: '600',
  },
  value: {
    color: colors.textTertiary, flex: 1, fontFamily: tokens.fonts.sansSerif,
    fontSize: 13, textAlign: 'right',
  },
  toggleRow: { height: 28, justifyContent: 'center' },
});
