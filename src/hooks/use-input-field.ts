import { useCallback, useMemo, useState } from 'react';

import type { FieldProps, UseInputFieldOptions } from '@/components/ui/input';

export function useInputField<TValue>({
  initialValue,
  rules = [],
  validateOn = 'submit',
}: UseInputFieldOptions<TValue>) {
  const [value, setValueState] = useState(initialValue);
  const [errorText, setErrorText] = useState<string>();

  const validate = useCallback(
    (nextValue = value) => {
      const nextErrorText = rules.map((rule) => rule(nextValue)).find(Boolean);
      setErrorText(nextErrorText);
      return !nextErrorText;
    },
    [rules, value],
  );

  const setValue = useCallback(
    (nextValue: TValue) => {
      setValueState(nextValue);
      if (validateOn === 'change') {
        const nextErrorText = rules.map((rule) => rule(nextValue)).find(Boolean);
        setErrorText(nextErrorText);
      }
    },
    [rules, validateOn],
  );

  const handleBlur = useCallback(() => {
    if (validateOn === 'blur') {
      validate();
    }
  }, [validate, validateOn]);

  const reset = useCallback(() => {
    setValueState(initialValue);
    setErrorText(undefined);
  }, [initialValue]);

  const fieldProps = useMemo<Pick<FieldProps, 'errorText'>>(
    () => ({
      errorText,
    }),
    [errorText],
  );

  return {
    errorText,
    fieldProps,
    isValid: !errorText,
    onBlur: handleBlur,
    reset,
    setValue,
    validate,
    value,
  };
}
