import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const colors = tokens.colors.semantic.light;
const font = { fontFamily: tokens.fonts.sansSerif, color: colors.textPrimary };
export const placeStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { ...font, fontSize: 14, lineHeight: 22, letterSpacing: -0.28 },
  small: { ...font, fontSize: 12, lineHeight: 18, color: colors.textTertiary },
  muted: { ...font, fontSize: 14, lineHeight: 20, color: colors.textTertiary },
  title: { ...font, fontSize: 24, lineHeight: 32, fontWeight: '700' },
  heading: { ...font, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  label: { ...font, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  link: { ...font, fontSize: 14, color: colors.primary, fontWeight: '600' },
  error: { ...font, fontSize: 14, lineHeight: 22, color: colors.primaryPressed },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  grow: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  section: { paddingVertical: 20, gap: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceSubtle },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  selectedChip: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  selectedText: { color: colors.onInverse },
  tap: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, backgroundColor: colors.background },
  fixedBottom: { paddingTop: 12, paddingHorizontal: 20, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 },
  hint: { backgroundColor: colors.surfaceSubtle, borderRadius: 8, padding: 12 },
  statRow: { flexDirection: 'row' },
  statColumn: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: { textAlign: 'center' },
  reviewRatingValue: { ...font, fontSize: 32, fontWeight: '700' },
  reviewCaption: { ...font, fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: -0.36, color: colors.textDisabled, textAlign: 'center' },
  reviewListTitle: { ...font, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  reviewListLink: { ...font, fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.textPlaceholder },
  mutedCenter: { ...font, fontSize: 14, lineHeight: 20, color: colors.textTertiary, textAlign: 'center' },
});
