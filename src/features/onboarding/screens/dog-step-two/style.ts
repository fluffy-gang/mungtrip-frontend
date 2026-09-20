import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  fieldBlock: {
    gap: tokens.spacing[10],
  },
  flex: {
    flex: 1,
  },
  formContent: {
    padding: tokens.spacing[20],
    paddingBottom: tokens.spacing[32],
  },
  formFields: {
    gap: tokens.spacing[24],
    marginTop: tokens.spacing[24],
  },
  sheetContent: {
    alignItems: 'center',
    gap: tokens.spacing[16],
    paddingBottom: tokens.spacing[8],
  },
  sheetCopy: {
    alignItems: 'center',
    gap: tokens.spacing[4],
  },
  warningIcon: {
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.light.surfaceSubtle,
    borderRadius: tokens.radius.full,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
});
