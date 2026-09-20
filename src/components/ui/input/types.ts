import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';

export type FieldState = 'default' | 'error' | 'disabled';
export type InputSize = 'default' | 'compact';
export type SelectionMode = 'single' | 'multiple';
export type ValidationTrigger = 'change' | 'blur' | 'submit';

export type InputValidationRule<TValue> = (value: TValue) => string | undefined;

export interface FieldProps {
  children: ReactNode;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  state?: FieldState;
}

export interface InputOption<TValue extends string = string> {
  description?: string;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  value: TValue;
}

export interface BaseFieldInputProps<TValue> extends Omit<FieldProps, 'children'> {
  onBlur?: () => void;
  onChange: (value: TValue) => void;
  value: TValue;
}

export interface TextInputFieldProps
  extends Omit<TextInputProps, 'editable' | 'onBlur' | 'onChange' | 'onChangeText' | 'value'>,
    BaseFieldInputProps<string> {
  rightAccessory?: ReactNode;
  size?: InputSize;
}

export interface NumberInputFieldProps extends Omit<TextInputFieldProps, 'keyboardType' | 'onChange' | 'value'> {
  onChange: (value: string) => void;
  unitText?: string;
  value: string;
}

export interface SegmentInputProps<TValue extends string = string> {
  disabled?: boolean;
  onChange: (value: TValue) => void;
  options: readonly InputOption<TValue>[];
  value: TValue;
}

export interface ToggleInputProps {
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}

export interface TagSelectInputProps<TValue extends string = string> {
  disabled?: boolean;
  mode: SelectionMode;
  onChange: (value: TValue | TValue[]) => void;
  options: readonly InputOption<TValue>[];
  value: TValue | TValue[];
  variant?: 'filled' | 'outlined';
}

export interface DateInputProps extends Omit<BaseFieldInputProps<Date | undefined>, 'onChange'> {
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (value: Date | undefined) => void;
  placeholder?: string;
  size?: InputSize;
}

export interface RadioInputProps<TValue extends string = string> {
  disabled?: boolean;
  onChange: (value: TValue) => void;
  options: readonly InputOption<TValue>[];
  value: TValue | undefined;
  variant?: 'label' | 'card';
}

export interface CheckboxInputProps {
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}

export interface UseInputFieldOptions<TValue> {
  initialValue: TValue;
  rules?: readonly InputValidationRule<TValue>[];
  validateOn?: ValidationTrigger;
}
