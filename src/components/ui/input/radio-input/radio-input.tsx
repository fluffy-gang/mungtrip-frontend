import {
  RadioControl,
  RadioDescription,
  RadioDot,
  RadioIconBlock,
  RadioItem,
  RadioList,
  RadioTextStack,
  RadioTitle,
} from "./styles";

import type { InputOption, RadioInputProps } from "../types";

export function RadioInput<TValue extends string = string>({
  disabled,
  onChange,
  options,
  value,
  variant = "label",
}: RadioInputProps<TValue>) {
  return (
    <RadioList>
      {options.map((option: InputOption<TValue>) => {
        const selected = option.value === value;
        const optionDisabled = disabled || option.disabled;

        return (
          <RadioItem
            $disabled={optionDisabled}
            $variant={variant}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: optionDisabled }}
            disabled={optionDisabled}
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            {variant === "card" ? (
              <RadioIconBlock>{option.icon}</RadioIconBlock>
            ) : null}
            <RadioTextStack>
              <RadioTitle>{option.label}</RadioTitle>
              {option.description ? (
                <RadioDescription>{option.description}</RadioDescription>
              ) : null}
            </RadioTextStack>
            <RadioControl $selected={selected}>
              {selected ? <RadioDot $selected={selected} /> : null}
            </RadioControl>
          </RadioItem>
        );
      })}
    </RadioList>
  );
}
