import { Pressable } from 'react-native';
import { styled, type DefaultTheme } from 'styled-components/native';

import { Text } from '@/components/ui/text';
import type { FontWeightToken, SemanticColorName } from '@/constants/tokens';

import { booleanKey, getDisabledOpacity, type BooleanKey } from '../shared-styles';

const selectedTextColorMap = {
  false: 'textTertiary',
  true: 'textSecondary',
} as const satisfies Record<BooleanKey, SemanticColorName>;

const selectedTextWeightMap = {
  false: 'semibold',
  true: 'bold',
} as const satisfies Record<BooleanKey, FontWeightToken>;

function getSegmentBackgroundColor(selected: boolean | undefined, theme: DefaultTheme) {
  const backgroundColorMap = {
    false: 'transparent',
    true: theme.colors.semantic.light.surface,
  } as const satisfies Record<BooleanKey, string>;

  return backgroundColorMap[booleanKey(selected)];
}

function getSegmentShadow(selected: boolean | undefined, theme: DefaultTheme) {
  const shadowMap = {
    false: '',
    true: theme.shadow.segmentSelected,
  } as const;

  return shadowMap[booleanKey(selected)];
}

export const SegmentContainer = styled.View<{ $disabled?: boolean }>`
  background-color: ${({ theme }) => theme.colors.semantic.light.surfaceSubtle};
  border-radius: ${({ theme }) => theme.radius[12]}px;
  flex-direction: row;
  height: ${({ theme }) => theme.spacing[48]}px;
  opacity: ${({ $disabled }) => getDisabledOpacity($disabled)};
  padding: ${({ theme }) => theme.spacing[4]}px;
  width: 100%;
`;

export const SegmentItem = styled(Pressable)<{ $selected?: boolean }>`
  align-items: center;
  background-color: ${({ $selected, theme }) => getSegmentBackgroundColor($selected, theme)};
  border-radius: ${({ theme }) => theme.radius[8]}px;
  flex: 1;
  justify-content: center;
  ${({ $selected, theme }) => getSegmentShadow($selected, theme)};
`;

export const OptionText = styled(Text).attrs<{ $selected?: boolean }>(
  ({ $selected }) => ({
    color: selectedTextColorMap[booleanKey($selected)],
    fontSize: 14,
    fontWeight: selectedTextWeightMap[booleanKey($selected)],
    lineHeight: 20,
  }),
)``;
