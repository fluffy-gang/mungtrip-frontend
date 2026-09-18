import { useState } from 'react';
import { TextInput } from 'react-native';

import { colors, placeStyles as s } from './styles';

/** The shared single-line field has a fixed shell height; this feature's multiline entry sizes its own border. */
export function PlaceTextArea({ value, onChange, disabled, placeholder, maxLength }: {
  value: string; onChange(value: string): void; disabled: boolean; placeholder: string; maxLength: number;
}) {
  const [focused, setFocused] = useState(false);
  return <TextInput value={value} onChangeText={onChange} editable={!disabled} multiline maxLength={maxLength}
    placeholder={placeholder} accessibilityLabel={placeholder} placeholderTextColor={colors.textTertiary}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    style={[s.body, { minHeight: 120, borderWidth: 1, borderRadius: 12, padding: 16,
      borderColor: focused ? colors.primary : colors.border, textAlignVertical: 'top', opacity: disabled ? 0.5 : 1 }]} />;
}
