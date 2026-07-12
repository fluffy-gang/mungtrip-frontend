import { StyleSheet } from 'react-native';

import { primitiveColors } from './colors';

export const spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  44: 44,
  48: 48,
  56: 56,
  64: 64,
} as const;

export const radius = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  full: 9999,
} as const;

export const borderWidth = {
  hairline: StyleSheet.hairlineWidth,
  1: 1,
  2: 2,
  3: 3,
} as const;

// 그림자는 Figma에서 관측한 표면과 핀을 기준으로 둔다.
export const shadow = {
  smallOverlay: {
    shadowColor: primitiveColors.gray[1000],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  mapPin: {
    shadowColor: primitiveColors.orange[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.93,
    shadowRadius: 8,
    elevation: 6,
  },
  floating: {
    shadowColor: primitiveColors.gray[1000],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 8,
  },
  bottomSheet: {
    shadowColor: primitiveColors.gray[1000],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
