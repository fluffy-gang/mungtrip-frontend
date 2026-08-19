import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

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
        <Text style={styles.searchPlaceholder}>제주도 강아지 장소 검색</Text>
      </Pressable>
    </View>
  );
}
