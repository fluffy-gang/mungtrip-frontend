import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  agreementContent: { padding: tokens.spacing[20], paddingTop: tokens.spacing[32] },
  agreementRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  agreementSelect: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: tokens.spacing[10],
  },
  allAgreement: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[32],
  },
  disabledChevron: { opacity: 0.35 },
  divider: {
    backgroundColor: tokens.colors.semantic.light.border,
    height: 1,
    marginVertical: tokens.spacing[16],
  },
  flex: { flex: 1 },
  legalNotes: { gap: tokens.spacing[2], marginTop: tokens.spacing[40] },
});
