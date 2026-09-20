import { useState } from 'react';
import { View } from 'react-native';

import { Field } from '../field';
import { InputShell, resolveFieldState } from '../shared-styles';
import { CalendarIcon, CalendarIconTop, DateValueText } from './styles';

import type { DateInputProps } from '../types';

function formatDate(value?: Date) {
  if (!value) return '';
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function DateInput({
  disabled, errorText, helperText, label, maximumDate, minimumDate, onBlur, onChange,
  placeholder = '날짜 선택', required, size = 'compact', state, value,
}: DateInputProps) {
  const [focused, setFocused] = useState(false);
  const resolvedState = resolveFieldState({ disabled, errorText, state });
  const displayValue = formatDate(value);

  return (
    <Field disabled={disabled} errorText={errorText} helperText={helperText} label={label} required={required} state={resolvedState}>
      <View style={{ position: 'relative' }}>
        <InputShell $disabled={disabled} $focused={focused} $size={size} $state={resolvedState}>
          <CalendarIcon><CalendarIconTop /></CalendarIcon>
          <DateValueText $empty={!displayValue}>{displayValue ? displayValue.replaceAll('-', '.') : placeholder}</DateValueText>
          <input
            aria-label={label || placeholder}
            aria-required={required || undefined}
            disabled={disabled}
            max={formatDate(maximumDate) || undefined}
            min={formatDate(minimumDate) || undefined}
            onBlur={() => { setFocused(false); onBlur?.(); }}
            onChange={(event) => {
              const [year, month, day] = event.currentTarget.value.split('-').map(Number);
              onChange(event.currentTarget.value ? new Date(year, month - 1, day) : undefined);
            }}
            onFocus={() => setFocused(true)}
            style={{ cursor: disabled ? 'default' : 'pointer', height: '100%', inset: 0, opacity: 0, position: 'absolute', width: '100%' }}
            type="date"
            value={displayValue}
          />
        </InputShell>
      </View>
    </Field>
  );
}
