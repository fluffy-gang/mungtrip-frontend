import { SegmentContainer, SegmentItem, OptionText } from './styles';

import type { InputOption, SegmentInputProps } from '../types';

export function SegmentInput<TValue extends string = string>({
  disabled,
  onChange,
  options,
  value,
}: SegmentInputProps<TValue>) {
  return (
    <SegmentContainer $disabled={disabled}>
      {options.map((option: InputOption<TValue>) => {
        const selected = option.value === value;
        const optionDisabled = disabled || option.disabled;

        return (
          <SegmentItem
            $selected={selected}
            accessibilityRole="button"
            accessibilityState={{ disabled: optionDisabled, selected }}
            disabled={optionDisabled}
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <OptionText $selected={selected}>{option.label}</OptionText>
          </SegmentItem>
        );
      })}
    </SegmentContainer>
  );
}
