import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: tokens.colors.semantic.light.inverse,
    borderRadius: tokens.radius[12],
    left: tokens.spacing[20],
    maxWidth: 480,
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[12],
    position: 'absolute',
    right: tokens.spacing[20],
    zIndex: 10,
    ...tokens.shadow.floating,
  },
  message: {
    textAlign: 'center',
  },
});
