import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  centerText: { textAlign: 'center' },
  promptCopy: {
    alignItems: 'center',
    gap: tokens.spacing[12],
    paddingHorizontal: tokens.spacing[20],
    paddingTop: tokens.spacing[24],
  },
  promptHero: {
    backgroundColor: tokens.colors.semantic.light.surfaceMuted,
    height: 256,
    marginTop: tokens.spacing[56],
    width: '100%',
  },
  spacer: { flex: 1 },
});
