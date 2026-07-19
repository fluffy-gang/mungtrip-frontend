import { TextInputField } from '../text-input';
import type { NumberInputFieldProps } from '../types';
import { UnitText } from './styles';

export function NumberInputField({ unitText, ...props }: NumberInputFieldProps) {
  return (
    <TextInputField
      keyboardType="numeric"
      {...props}
      rightAccessory={unitText ? <UnitText>{unitText}</UnitText> : undefined}
    />
  );
}
