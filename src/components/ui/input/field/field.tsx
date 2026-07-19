import {
  FieldContainer,
  FieldLabel,
  FieldLabelRow,
  FieldMessage,
  FieldRequiredMark,
} from './styles';
import { resolveFieldState } from '../shared-styles';
import type { FieldProps } from '../types';

export function Field({
  children,
  disabled,
  errorText,
  helperText,
  label,
  required,
  state,
}: FieldProps) {
  const message = errorText ?? helperText;
  const resolvedState = resolveFieldState({ disabled, errorText, state });

  return (
    <FieldContainer>
      {label ? (
        <FieldLabelRow>
          <FieldLabel $state={resolvedState}>{label}</FieldLabel>
          {required ? <FieldRequiredMark $state={resolvedState}>*</FieldRequiredMark> : null}
        </FieldLabelRow>
      ) : null}
      {children}
      {message ? (
        <FieldMessage $state={resolvedState}>{message}</FieldMessage>
      ) : null}
    </FieldContainer>
  );
}
