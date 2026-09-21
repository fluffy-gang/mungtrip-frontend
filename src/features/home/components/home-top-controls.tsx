import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { SEARCH_PLACEHOLDER } from '../constants';
import { styles } from '../styles';

interface HomeTopControlsProps {
  onOpenSearch: () => void;
}

export function HomeTopControls({ onOpenSearch }: HomeTopControlsProps) {
  return (
    <View style={styles.topControls}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpenSearch}
        style={styles.searchButton}
      >
        <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={18} tintColor="#8B95A1" />
        <Text style={styles.searchPlaceholder}>{SEARCH_PLACEHOLDER}</Text>
      </Pressable>
    </View>
  );
}
