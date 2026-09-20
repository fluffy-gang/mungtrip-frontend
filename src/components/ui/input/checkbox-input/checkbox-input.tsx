import { useTheme } from 'styled-components/native';

import { Icon } from '@/components/ui/icon';

import { CheckboxControl, CheckboxLabel, CheckboxRow } from './styles';

import type { CheckboxInputProps } from '../types';

export function CheckboxInput({
  disabled,
  label,
  onChange,
  value,
}: CheckboxInputProps) {
  const theme = useTheme();

  return (
    <CheckboxRow
      $disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onChange(!value)}
    >
      <CheckboxControl $selected={value}>
        {value ? (
          <Icon
            name="check"
            size={16}
            tintColor={theme.colors.semantic.light.onPrimary}
          />
        ) : null}
      </CheckboxControl>
      <CheckboxLabel>{label}</CheckboxLabel>
    </CheckboxRow>
  );
}
