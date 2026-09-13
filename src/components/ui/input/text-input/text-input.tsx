import { useState } from 'react';
import { useTheme } from 'styled-components/native';

import { Field } from '../field';
import { InputShell, resolveFieldState } from '../shared-styles';
import { StyledTextInput } from './styles';

import type { TextInputFieldProps } from '../types';

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
  const resolvedState = resolveFieldState({ disabled, errorText, state });

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
