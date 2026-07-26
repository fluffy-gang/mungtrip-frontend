import {
  CheckboxControl,
  CheckboxLabel,
  CheckboxMark,
  CheckboxRow,
} from "./styles";
import type { CheckboxInputProps } from "../types";

export function CheckboxInput({
  disabled,
  label,
  onChange,
  value,
}: CheckboxInputProps) {
  return (
    <CheckboxRow
      $disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
    >
      <CheckboxControl $selected={value}>
        <CheckboxMark $selected={value}>✓</CheckboxMark>
      </CheckboxControl>
      <CheckboxLabel>{label}</CheckboxLabel>
    </CheckboxRow>
  );
}
