import { Pressable } from 'react-native';
import { styled, type DefaultTheme } from 'styled-components/native';

import { Text } from '@/components/ui/text';

import { booleanKey, getDisabledOpacity, type BooleanKey } from '../shared-styles';

const selectedAlignMap = {
  false: 'flex-start',
  true: 'flex-end',
} as const;

function getToggleTrackBackgroundColor(selected: boolean | undefined, theme: DefaultTheme) {
  const backgroundColorMap = {
    false: theme.colors.semantic.light.surfaceMuted,
    true: theme.colors.semantic.light.primary,
  } as const satisfies Record<BooleanKey, string>;

  return backgroundColorMap[booleanKey(selected)];
}

export const ToggleRow = styled(Pressable)<{ $disabled?: boolean }>`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  opacity: ${({ $disabled }) => getDisabledOpacity($disabled)};
  width: 100%;
`;

export const ToggleLabel = styled(Text).attrs({
  color: 'textPrimary',
  fontSize: 14,
  fontWeight: 'medium',
  lineHeight: 20,
})``;

export const ToggleTrack = styled.View<{ $selected?: boolean }>`
  align-items: center;
  background-color: ${({ $selected, theme }) => getToggleTrackBackgroundColor($selected, theme)};
  border-radius: ${({ theme }) => theme.radius.full}px;
  height: 28px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[2]}px;
  width: 48px;
`;

export const ToggleThumb = styled.View<{ $selected?: boolean }>`
  align-self: ${({ $selected }) => selectedAlignMap[booleanKey($selected)]};
  background-color: ${({ theme }) => theme.colors.semantic.light.surface};
  border-radius: ${({ theme }) => theme.radius.full}px;
  height: 24px;
  width: 24px;
`;
