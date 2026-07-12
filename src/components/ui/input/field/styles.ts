import { styled } from 'styled-components/native';

import { Text } from '@/components/ui/text';
import type { SemanticColorName } from '@/constants/tokens';

import type { FieldState } from '../types';

const fieldMessageColorMap = {
  default: 'textTertiary',
  disabled: 'textTertiary',
  error: 'primaryPressed',
} as const satisfies Record<FieldState, SemanticColorName>;

export const FieldContainer = styled.View`
  gap: ${({ theme }) => theme.spacing[8]}px;
  width: 100%;
`;

export const FieldLabel = styled(Text).attrs({
  color: 'textSecondary',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 24,
})``;

export const FieldRequiredMark = styled(Text).attrs({
  color: 'primary',
  fontSize: 16,
  fontWeight: 'bold',
  lineHeight: 24,
})``;

export const FieldLabelRow = styled.View`
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[2]}px;
`;

export const FieldMessage = styled(Text).attrs<{ $state: FieldState }>(
  ({ $state }) => ({
    color: fieldMessageColorMap[$state],
    fontSize: 12,
    fontWeight: 'medium',
    lineHeight: 16,
  }),
)``;
