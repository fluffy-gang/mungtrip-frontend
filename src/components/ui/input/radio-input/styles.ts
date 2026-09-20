import { Pressable } from 'react-native';
import { styled } from 'styled-components/native';

import { Text } from '@/components/ui/text';

import { booleanKey, getDisabledOpacity } from '../shared-styles';

import type { DefaultTheme } from 'styled-components/native';
import type { BooleanKey } from '../shared-styles';

const radioPaddingMap = {
  card: 12,
  label: 6,
} as const;

function getRadioBorderColor(selected: boolean | undefined, theme: DefaultTheme) {
  const borderColorMap = {
    false: theme.colors.semantic.light.border,
    true: theme.colors.semantic.light.primary,
  } as const satisfies Record<BooleanKey, string>;

  return borderColorMap[booleanKey(selected)];
}

function getRadioBackgroundColor(selected: boolean | undefined, theme: DefaultTheme) {
  const backgroundColorMap = {
    false: theme.colors.semantic.light.background,
    true: theme.colors.semantic.light.primary,
  } as const satisfies Record<BooleanKey, string>;

  return backgroundColorMap[booleanKey(selected)];
}

function getRadioDotColor(selected: boolean | undefined, theme: DefaultTheme) {
  const backgroundColorMap = {
    false: theme.colors.semantic.light.primary,
    true: theme.colors.semantic.light.background,
  } as const satisfies Record<BooleanKey, string>;

  return backgroundColorMap[booleanKey(selected)];
}

export const RadioList = styled.View`
  width: 100%;
`;

export const RadioItem = styled(Pressable)<{
  $disabled?: boolean;
  $variant: 'label' | 'card';
}>`
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[12]}px;
  opacity: ${({ $disabled }) => getDisabledOpacity($disabled)};
  padding: ${({ $variant, theme }) => theme.spacing[radioPaddingMap[$variant]]}px
    0;
  width: 100%;
`;

export const RadioIconBlock = styled.View`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.semantic.light.accentOrangeMuted};
  border-radius: ${({ theme }) => theme.radius[8]}px;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

export const RadioTextStack = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing[4]}px;
  min-width: 0;
`;

export const RadioTitle = styled(Text).attrs({
  color: 'textSecondary',
  fontSize: 16,
  fontWeight: 'semibold',
  lineHeight: 24,
})``;

export const RadioDescription = styled(Text).attrs({
  color: 'textDisabled',
  fontSize: 12,
  fontWeight: 'medium',
  lineHeight: 16,
})``;

export const RadioControl = styled.View<{ $selected?: boolean }>`
  align-items: center;
  background-color: ${({ $selected, theme }) => getRadioBackgroundColor($selected, theme)};
  border-color: ${({ $selected, theme }) => getRadioBorderColor($selected, theme)};
  border-radius: ${({ theme }) => theme.radius.full}px;
  border-width: ${({ theme }) => theme.borderWidth[2]}px;
  height: 30px;
  justify-content: center;
  width: 30px;
`;

export const RadioDot = styled.View<{ $selected?: boolean }>`
  background-color: ${({ $selected, theme }) => getRadioDotColor($selected, theme)};
  border-radius: ${({ theme }) => theme.radius.full}px;
  height: 10px;
  width: 10px;
`;
