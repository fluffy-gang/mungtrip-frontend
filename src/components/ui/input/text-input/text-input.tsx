import { useState } from 'react';
import { useTheme } from 'styled-components/native';

import { Field } from '../field';
import { booleanKey, InputShell, type BooleanKey } from '../shared-styles';
import type { FieldState, TextInputFieldProps } from '../types';
import { StyledTextInput } from './styles';

const errorStateMap = {
  false: undefined,
  true: 'error',
} as const satisfies Record<BooleanKey, FieldState | undefined>;

const disabledStateMap = {
  false: errorStateMap,
  true: {
    false: 'disabled',
    true: 'disabled',
  },
} as const satisfies Record<BooleanKey, Record<BooleanKey, FieldState | undefined>>;

export function TextInputField({
  disabled,
  errorText,
  helperText,
  label,
  onBlur,
  onFocus,
  onChange,
  required,
  rightAccessory,
  size = 'default',
  state,
  value,
  ...textInputProps
}: TextInputFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const resolvedState = disabledStateMap[booleanKey(disabled)][booleanKey(errorText)] ?? state;

  return (
    <Field
      disabled={disabled}
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
      state={resolvedState}
    >
      <InputShell $disabled={disabled} $focused={focused} $size={size} $state={resolvedState}>
        <StyledTextInput
          {...textInputProps}
          editable={!disabled}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onChangeText={onChange}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={theme.colors.semantic.light.inputPlaceholder}
          value={value}
        />
        {rightAccessory}
      </InputShell>
    </Field>
  );
}
