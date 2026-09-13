import { TextInputField } from '../text-input';
import { UnitText } from './styles';

import type { NumberInputFieldProps } from '../types';

export function NumberInputField({ unitText, ...props }: NumberInputFieldProps) {
  return (
    <TextInputField
      keyboardType="numeric"
      {...props}
      rightAccessory={unitText ? <UnitText>{unitText}</UnitText> : undefined}
    />
  );
}
