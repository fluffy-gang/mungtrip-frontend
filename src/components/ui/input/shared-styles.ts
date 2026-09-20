import { styled } from 'styled-components/native';

import type { DefaultTheme } from 'styled-components/native';
import type { FieldState, InputSize } from './types';

export type BooleanKey = 'false' | 'true';

type InputShellBorderState = 'default' | 'error' | 'focused';

const fieldHeight = {
  compact: 48,
  default: 56,
} as const satisfies Record<InputSize, number>;

const inputShellBorderStateMap = {
  default: {
    false: 'default',
    true: 'focused',
  },
  disabled: {
    false: 'default',
    true: 'default',
  },
  error: {
    false: 'error',
    true: 'error',
  },
} as const satisfies Record<FieldState, Record<BooleanKey, InputShellBorderState>>;

const disabledOpacityMap = {
  false: 1,
  true: 0.5,
} as const satisfies Record<BooleanKey, number>;

export const booleanKey = (value?: boolean | string) => String(Boolean(value)) as BooleanKey;

export function resolveFieldState({
  disabled,
  errorText,
  state,
}: {
  disabled?: boolean;
  errorText?: string;
  state?: FieldState;
}) {
  if (disabled) return 'disabled';
  if (errorText) return 'error';

  return state ?? 'default';
}

export function getDisabledOpacity(disabled: boolean | undefined) {
  return disabledOpacityMap[booleanKey(disabled)];
}

function getInputShellBorderColor(
  state: FieldState,
  focused: boolean | undefined,
  theme: DefaultTheme,
) {
  const borderColorMap = {
    default: theme.colors.semantic.light.inputBorder,
    error: theme.colors.semantic.light.primaryPressed,
    focused: theme.colors.semantic.light.primary,
  } as const satisfies Record<InputShellBorderState, string>;

  return borderColorMap[inputShellBorderStateMap[state][booleanKey(focused)]];
}

export const InputShell = styled.View<{
  $disabled?: boolean;
  $focused?: boolean;
  $state?: FieldState;
  $size: InputSize;
}>`
  align-items: center;
  border-color: ${({ $focused, $state = 'default', theme }) => getInputShellBorderColor($state, $focused, theme)};
  border-radius: ${({ theme }) => theme.radius[12]}px;
  border-width: ${({ theme }) => theme.borderWidth[1]}px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
  height: ${({ $size }) => fieldHeight[$size]}px;
  opacity: ${({ $disabled }) => getDisabledOpacity($disabled)};
  padding: 0 ${({ theme }) => theme.spacing[16]}px;
  width: 100%;
`;
