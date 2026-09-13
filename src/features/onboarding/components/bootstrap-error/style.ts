import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[20],
  },
  description: {
    marginBottom: tokens.spacing[20],
    marginTop: tokens.spacing[8],
    textAlign: 'center',
  },
  page: {
    backgroundColor: tokens.colors.semantic.light.background,
    flex: 1,
  },
  title: {
    textAlign: 'center',
  },
});
