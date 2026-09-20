import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform } from 'react-native';

import { Field } from '../field';
import { InputShell, resolveFieldState } from '../shared-styles';
import { CalendarIcon, CalendarIconTop, DateValueText } from './styles';

import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { DateInputProps } from '../types';

function formatDate(value: Date | undefined) {
  if (!value) return undefined;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function DateInput({
  disabled,
  errorText,
  helperText,
  label,
  maximumDate,
  minimumDate,
  onBlur,
  onChange,
  placeholder = '날짜 선택',
  required,
  size = 'compact',
  state,
  value,
}: DateInputProps) {
  const [visible, setVisible] = useState(false);
  const resolvedState = resolveFieldState({ disabled, errorText, state });
  const displayValue = formatDate(value);

  const handleChange = (event: DateTimePickerEvent, nextValue?: Date) => {
    setVisible(false);
    if (event.type === 'dismissed') {
      return;
    }
    onChange(nextValue);
  };

  return (
    <Field
      disabled={disabled}
      errorText={errorText}
      helperText={helperText}
      label={label}
      required={required}
      state={resolvedState}
    >
      <InputShell
        $disabled={disabled}
        $size={size}
        $state={resolvedState}
        accessibilityRole="button"
        onTouchEnd={() => {
          if (!disabled) {
            setVisible(true);
            onBlur?.();
          }
        }}
      >
        <CalendarIcon>
          <CalendarIconTop />
        </CalendarIcon>
        <DateValueText $empty={!displayValue}>{displayValue ?? placeholder}</DateValueText>
      </InputShell>
      {visible && Platform.OS !== 'web' ? (
        <DateTimePicker
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode="date"
          onChange={handleChange}
          value={value ?? new Date()}
        />
      ) : null}
    </Field>
  );
}
