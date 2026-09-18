import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/constants/tokens';

export type NeuteredStatus = 'no' | 'unknown' | 'yes';

interface NeuteredStatusSelectorProps {
  disabled?: boolean;
  onChange: (status: NeuteredStatus) => void;
  value: NeuteredStatus;
}

const options: readonly { label: string; value: NeuteredStatus; width: number }[] = [
  { label: '완료', value: 'yes', width: 56 },
  { label: '미완료', value: 'no', width: 68 },
  { label: '모름', value: 'unknown', width: 56 },
];

const colors = tokens.colors.semantic.light;

/** Status choices laid out to the exact three-chip width of the profile edit screen. */
export function NeuteredStatusSelector({
  disabled,
  onChange,
  value,
}: NeuteredStatusSelectorProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.list}>
      {options.map(option => {
        const selected = option.value === value;

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ disabled, selected }}
            disabled={disabled}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, { width: option.width }, selected && styles.selectedOption]}
          >
            <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', gap: tokens.spacing[4] },
  option: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: tokens.radius.full,
    borderWidth: tokens.borderWidth[1],
    height: 36,
    justifyContent: 'center',
  },
  optionText: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.36,
    lineHeight: 20,
  },
  selectedOption: { borderColor: colors.primary },
  selectedOptionText: { color: colors.primary },
});
