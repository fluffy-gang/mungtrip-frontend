import { Pressable, Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { styles } from '../styles';

import type { SymbolViewProps } from 'expo-symbols';


interface MapFloatingActionProps {
  bottom: number;
  icon: SymbolViewProps['name'];
  onPress: () => void;
  text: string;
  visible: boolean;
}

export function MapFloatingAction({
  bottom,
  icon,
  onPress,
  text,
  visible,
}: MapFloatingActionProps) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.mapFloatingAction, { bottom }]}
    >
      <Text style={styles.mapFloatingActionText}>{text}</Text>
      <SymbolView name={icon} size={18} tintColor="#4E5968" />
    </Pressable>
  );
}
