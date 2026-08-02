import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

export const styles = StyleSheet.create({
  editBadge: {
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.light.surface,
    borderColor: tokens.colors.semantic.light.border,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 32,
  },
  fieldBlock: {
    gap: tokens.spacing[10],
  },
  formContent: {
    padding: tokens.spacing[20],
    paddingBottom: tokens.spacing[32],
  },
  formFields: {
    gap: tokens.spacing[24],
    marginTop: tokens.spacing[24],
  },
  profileBlock: {
    alignItems: 'center',
    marginVertical: tokens.spacing[24],
  },
  profileImage: {
    borderRadius: tokens.radius.full,
    height: 100,
    width: 100,
  },
  skipButtonLabel: {
    fontSize: 16,
  },
});
