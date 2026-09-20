import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  completionContent: {
    padding: tokens.spacing[20],
    paddingTop: tokens.spacing[32],
  },
  dogCard: {
    alignItems: 'center',
    borderColor: tokens.colors.semantic.light.border,
    borderRadius: tokens.radius[16],
    borderWidth: 1,
    flexDirection: 'row',
    gap: tokens.spacing[12],
    minHeight: 104,
    padding: tokens.spacing[16],
  },
  dogCardImage: {
    borderRadius: tokens.radius.full,
    height: 64,
    width: 64,
  },
  dogCards: {
    gap: tokens.spacing[10],
    marginTop: tokens.spacing[32],
  },
  dogNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.spacing[6],
  },
  flex: {
    flex: 1,
  },
  locationImage: {
    borderRadius: tokens.radius.full,
    height: 64,
    width: 64,
  },
  locationSheet: {
    alignItems: 'center',
    gap: tokens.spacing[16],
    paddingBottom: tokens.spacing[8],
  },
  personalityBadge: {
    borderColor: tokens.colors.semantic.light.border,
    borderRadius: tokens.radius[4],
    borderWidth: 1,
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[2],
  },
  personalitySummary: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing[4],
    marginTop: tokens.spacing[8],
  },
  sizeBadge: {
    backgroundColor: tokens.colors.semantic.light.inverse,
    borderRadius: tokens.radius[4],
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[2],
  },
});
