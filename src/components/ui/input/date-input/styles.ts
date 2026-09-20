import { styled } from 'styled-components/native';

import { Text } from '@/components/ui/text';

import { booleanKey } from '../shared-styles';

import type { SemanticColorName } from '@/constants/tokens';
import type { BooleanKey } from '../shared-styles';

const dateValueColorMap = {
  false: 'textPrimary',
  true: 'textDisabled',
} as const satisfies Record<BooleanKey, SemanticColorName>;

export const DateValueText = styled(Text).attrs<{ $empty?: boolean }>(
  ({ $empty }) => ({
    color: dateValueColorMap[booleanKey($empty)],
    fontSize: 14,
    fontWeight: 'medium',
    lineHeight: 20,
  }),
)`
  flex: 1;
`;

export const CalendarIcon = styled.View`
  border-color: ${({ theme }) => theme.colors.semantic.light.textDisabled};
  border-radius: ${({ theme }) => theme.radius[4]}px;
  border-width: ${({ theme }) => theme.borderWidth[1]}px;
  height: 16px;
  width: 16px;
`;

export const CalendarIconTop = styled.View`
  background-color: ${({ theme }) => theme.colors.semantic.light.textDisabled};
  height: ${({ theme }) => theme.borderWidth[1]}px;
  margin-top: ${({ theme }) => theme.spacing[4]}px;
  width: 100%;
`;
