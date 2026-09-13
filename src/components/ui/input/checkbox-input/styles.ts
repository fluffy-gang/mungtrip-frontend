import { Pressable } from 'react-native';
import { styled } from 'styled-components/native';

import { Text } from '@/components/ui/text';

import { booleanKey, getDisabledOpacity } from '../shared-styles';

import type { DefaultTheme } from 'styled-components/native';
import type { BooleanKey } from '../shared-styles';

function getCheckboxBackgroundColor(selected: boolean | undefined, theme: DefaultTheme) {
  const backgroundColorMap = {
    false: theme.colors.semantic.light.surface,
    true: theme.colors.semantic.light.primary,
  } as const satisfies Record<BooleanKey, string>;

  return backgroundColorMap[booleanKey(selected)];
}

function getCheckboxBorderColor(selected: boolean | undefined, theme: DefaultTheme) {
  const borderColorMap = {
    false: theme.colors.primitive.gray[300],
    true: theme.colors.semantic.light.primary,
  } as const satisfies Record<BooleanKey, string>;

  return borderColorMap[booleanKey(selected)];
}

export const CheckboxRow = styled(Pressable)<{ $disabled?: boolean }>`
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[10]}px;
  opacity: ${({ $disabled }) => getDisabledOpacity($disabled)};
`;

export const CheckboxControl = styled.View<{ $selected?: boolean }>`
  align-items: center;
  background-color: ${({ $selected, theme }) => getCheckboxBackgroundColor($selected, theme)};
  border-color: ${({ $selected, theme }) => getCheckboxBorderColor($selected, theme)};
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-width: ${({ theme }) => theme.borderWidth[2]}px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

export const CheckboxLabel = styled(Text).attrs({
  color: 'textSecondary',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 24,
})``;
