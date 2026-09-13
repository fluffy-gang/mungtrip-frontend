import { TagChip, TagList, TagText } from './styles';

import type { InputOption, TagSelectInputProps } from '../types';

function hasValue<TValue extends string>(value: TValue | TValue[], optionValue: TValue) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

function getNextValue<TValue extends string>(
  currentValue: TValue | TValue[],
  optionValue: TValue,
  mode: 'single' | 'multiple',
) {
  if (mode === 'single') {
    return optionValue;
  }

  const values = Array.isArray(currentValue) ? currentValue : [];
  return values.includes(optionValue) ? values.filter((value) => value !== optionValue) : [...values, optionValue];
}

export function TagSelectInput<TValue extends string = string>({
  disabled,
  mode,
  onChange,
  options,
  value,
  variant = 'filled',
}: TagSelectInputProps<TValue>) {
  return (
    <TagList>
      {options.map((option: InputOption<TValue>) => {
        const selected = hasValue(value, option.value);
        const optionDisabled = disabled || option.disabled;

        return (
          <TagChip
            $disabled={optionDisabled}
            $outlined={variant === 'outlined'}
            $selected={selected}
            accessibilityRole="button"
            accessibilityState={{ disabled: optionDisabled, selected }}
            disabled={optionDisabled}
            key={option.value}
            onPress={() => onChange(getNextValue(value, option.value, mode))}
          >
            <TagText $selected={selected}>{option.label}</TagText>
          </TagChip>
        );
      })}
    </TagList>
  );
}
