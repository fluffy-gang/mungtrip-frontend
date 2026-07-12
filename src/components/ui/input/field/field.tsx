import {
  FieldContainer,
  FieldLabel,
  FieldLabelRow,
  FieldMessage,
  FieldRequiredMark,
} from "./styles";
import { booleanKey } from "../shared-styles";
import type { FieldProps } from "../types";

const messageStateMap = {
  false: "default",
  true: "error",
} as const;

export function Field({
  children,
  errorText,
  helperText,
  label,
  required,
}: FieldProps) {
  const message = errorText ?? helperText;
  const messageState = messageStateMap[booleanKey(errorText)];

  return (
    <FieldContainer>
      {label ? (
        <FieldLabelRow>
          <FieldLabel>{label}</FieldLabel>
          {required ? <FieldRequiredMark>*</FieldRequiredMark> : null}
        </FieldLabelRow>
      ) : null}
      {children}
      {message ? (
        <FieldMessage $state={messageState}>{message}</FieldMessage>
      ) : null}
    </FieldContainer>
  );
}
