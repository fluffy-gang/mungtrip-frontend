import { Pressable } from 'react-native';
import { styled, type DefaultTheme } from 'styled-components/native';

import { Text } from '@/components/ui/text';

import { booleanKey, getDisabledOpacity, type BooleanKey } from '../shared-styles';

const checkboxMarkColorMap = {
  false: 'gray300',
  true: 'onPrimary',
} as const;

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

function getCheckboxMarkColor(selected: boolean | undefined, theme: DefaultTheme) {
  const colorMap = {
    gray300: theme.colors.primitive.gray[300],
    onPrimary: theme.colors.semantic.light.onPrimary,
  } as const satisfies Record<(typeof checkboxMarkColorMap)[BooleanKey], string>;

  return colorMap[checkboxMarkColorMap[booleanKey(selected)]];
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

export const CheckboxMark = styled.Text<{ $selected?: boolean }>`
  color: ${({ $selected, theme }) => getCheckboxMarkColor($selected, theme)};
  font-family: ${({ theme }) => theme.fonts.sansSerif};
  font-size: ${({ theme }) => theme.typography.fontSize[14].fontSize}px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.fontSize[14].letterSpacing}px;
  line-height: 14px;
`;

export const CheckboxLabel = styled(Text).attrs({
  color: 'textSecondary',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 24,
})``;
