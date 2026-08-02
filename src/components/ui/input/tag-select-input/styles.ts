import { Pressable } from 'react-native';
import { styled } from 'styled-components/native';

import { Text } from '@/components/ui/text';

import { booleanKey, getDisabledOpacity } from '../shared-styles';

import type { DefaultTheme } from 'styled-components/native';
import type { SemanticColorName } from '@/constants/tokens';
import type { BooleanKey } from '../shared-styles';

type TagChipVisualState = 'filled' | 'outlined' | 'selected';

const tagChipOutlinedStateMap = {
  false: 'filled',
  true: 'outlined',
} as const satisfies Record<BooleanKey, TagChipVisualState>;

const tagChipSelectedStateMap = {
  false: tagChipOutlinedStateMap,
  true: {
    false: 'selected',
    true: 'selected',
  },
} as const satisfies Record<BooleanKey, Record<BooleanKey, TagChipVisualState>>;

const tagTextColorMap = {
  false: 'textSecondary',
  true: 'onInverse',
} as const satisfies Record<BooleanKey, SemanticColorName>;

function getTagChipState(selected: boolean | undefined, outlined: boolean | undefined) {
  return tagChipSelectedStateMap[booleanKey(selected)][booleanKey(outlined)];
}

function getTagChipBackgroundColor(
  selected: boolean | undefined,
  outlined: boolean | undefined,
  theme: DefaultTheme,
) {
  const backgroundColorMap = {
    filled: theme.colors.semantic.light.surfaceSubtle,
    outlined: theme.colors.semantic.light.surface,
    selected: theme.colors.semantic.light.inverse,
  } as const satisfies Record<TagChipVisualState, string>;

  return backgroundColorMap[getTagChipState(selected, outlined)];
}

function getTagChipBorderWidth(
  selected: boolean | undefined,
  outlined: boolean | undefined,
  theme: DefaultTheme,
) {
  const borderWidthMap = {
    filled: 0,
    outlined: theme.borderWidth[1],
    selected: 0,
  } as const satisfies Record<TagChipVisualState, number>;

  return borderWidthMap[getTagChipState(selected, outlined)];
}

export const TagList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[6]}px;
`;

export const TagChip = styled(Pressable)<{
  $disabled?: boolean;
  $outlined?: boolean;
  $selected?: boolean;
}>`
  align-items: center;
  background-color: ${({ $outlined, $selected, theme }) => getTagChipBackgroundColor($selected, $outlined, theme)};
  border-color: ${({ theme }) => theme.colors.semantic.light.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-width: ${({ $outlined, $selected, theme }) => getTagChipBorderWidth($selected, $outlined, theme)}px;
  height: 40px;
  justify-content: center;
  opacity: ${({ $disabled }) => getDisabledOpacity($disabled)};
  padding: ${({ theme }) => theme.spacing[8]}px
    ${({ theme }) => theme.spacing[16]}px;
`;

export const TagText = styled(Text).attrs<{ $selected?: boolean }>(
  ({ $selected }) => ({
    color: tagTextColorMap[booleanKey($selected)],
    fontSize: 14,
    fontWeight: 'semibold',
    lineHeight: 20,
  }),
)`
  padding-right: 1px;
`;
