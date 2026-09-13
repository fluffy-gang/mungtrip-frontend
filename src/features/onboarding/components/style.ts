import { StyleSheet } from 'react-native';

import { tokens } from '@/constants/tokens';

import type { Animated} from 'react-native';

export const styles = StyleSheet.create({
  actions: {
    backgroundColor: tokens.colors.semantic.light.background,
    gap: tokens.spacing[8],
    paddingBottom: tokens.spacing[8],
    paddingHorizontal: tokens.spacing[20],
    paddingTop: tokens.spacing[12],
  },
  backButton: {
    alignItems: 'flex-start',
    height: 52,
    justifyContent: 'center',
    marginLeft: tokens.spacing[20],
    width: 44,
  },
  dogPlaceholder: {
    alignItems: 'center',
    backgroundColor: tokens.colors.semantic.light.surfaceMuted,
    borderRadius: tokens.radius.full,
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  dogPlaceholderCompact: {
    height: 64,
    width: 64,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  page: {
    backgroundColor: tokens.colors.semantic.light.background,
    flex: 1,
  },
  pressed: {
    opacity: 0.55,
  },
  progress: {
    flexDirection: 'row',
    gap: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[20],
  },
  progressActive: {
    backgroundColor: tokens.colors.semantic.light.primary,
  },
  progressItem: {
    backgroundColor: tokens.colors.semantic.light.surfaceMuted,
    borderRadius: tokens.radius.full,
    flex: 1,
    height: 4,
  },
  scrim: {
    backgroundColor: tokens.colors.semantic.light.overlayScrim,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  screenTitle: {
    paddingBottom: tokens.spacing[10],
  },
  sheet: {
    backgroundColor: tokens.colors.semantic.light.background,
    borderTopLeftRadius: tokens.radius[24],
    borderTopRightRadius: tokens.radius[24],
    paddingHorizontal: tokens.spacing[20],
    paddingTop: tokens.spacing[32],
  },
});

export function createFadeStyle(opacity: Animated.Value, translateY: Animated.Value) {
  return {
    opacity,
    transform: [{ translateY }],
  };
}
