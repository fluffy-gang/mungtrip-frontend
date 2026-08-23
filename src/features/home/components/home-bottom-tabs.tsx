import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { styles } from '../styles';

interface HomeBottomTabsProps {
  height: number;
  onOpenSearch: () => void;
  onShowHome: () => void;
  paddingBottom: number;
}

export function HomeBottomTabs({
  height,
  onOpenSearch,
  onShowHome,
  paddingBottom,
}: HomeBottomTabsProps) {
  return (
    <View style={[styles.bottomTabs, { height, paddingBottom }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onShowHome}
        style={styles.tabButton}
      >
        <SymbolView name={{ android: 'home', ios: 'house.fill', web: 'home' }} size={22} tintColor="#208AEF" />
        <Text style={styles.tabLabelActive}>홈</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.tabButton}>
        <SymbolView name={{ android: 'route', ios: 'map', web: 'route' }} size={22} tintColor="#8B95A1" />
        <Text style={styles.tabLabel}>여행</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onOpenSearch}
        style={styles.tabButton}
      >
        <SymbolView name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }} size={22} tintColor="#8B95A1" />
        <Text style={styles.tabLabel}>검색</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.tabButton}>
        <SymbolView name={{ android: 'favorite', ios: 'heart', web: 'favorite' }} size={22} tintColor="#8B95A1" />
        <Text style={styles.tabLabel}>찜</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.tabButton}>
        <SymbolView name={{ android: 'person', ios: 'person.crop.circle', web: 'person' }} size={22} tintColor="#8B95A1" />
        <Text style={styles.tabLabel}>프로필</Text>
      </Pressable>
    </View>
  );
}
