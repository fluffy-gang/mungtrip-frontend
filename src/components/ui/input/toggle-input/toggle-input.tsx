import { ToggleLabel, ToggleRow, ToggleThumb, ToggleTrack } from './styles';
import type { ToggleInputProps } from '../types';

export function ToggleInput({ disabled, label, onChange, value }: ToggleInputProps) {
  return (
    <ToggleRow
      $disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
    >
      <ToggleLabel>{label}</ToggleLabel>
      <ToggleTrack $selected={value}>
        <ToggleThumb $selected={value} />
      </ToggleTrack>
    </ToggleRow>
  );
}
