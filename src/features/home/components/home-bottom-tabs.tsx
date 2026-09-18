import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { showComingSoon } from '@/shared/utils/show-coming-soon';
import { styles } from '../styles';

import type { ImageSource } from 'expo-image';

export type HomeBottomTab = 'home' | 'trip' | 'search' | 'favorite' | 'my';

const TAB_ITEMS: readonly { key: HomeBottomTab; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'trip', label: '여행' },
  { key: 'search', label: '검색' },
  { key: 'favorite', label: '저장' },
  { key: 'my', label: '프로필' },
];

const TAB_ICON_SOURCES: Record<HomeBottomTab, { active: ImageSource; inactive: ImageSource }> = {
  home: {
    active: require('../assets/navbar/home-active.svg'),
    inactive: require('../assets/navbar/home.svg'),
  },
  trip: {
    active: require('../assets/navbar/trip-active.svg'),
    inactive: require('../assets/navbar/trip.svg'),
  },
  search: {
    active: require('../assets/navbar/search-active.svg'),
    inactive: require('../assets/navbar/search.svg'),
  },
  favorite: {
    active: require('../assets/navbar/favorite-active.svg'),
    inactive: require('../assets/navbar/favorite.svg'),
  },
  my: {
    active: require('../assets/navbar/my-active.svg'),
    inactive: require('../assets/navbar/my.svg'),
  },
};

/**
 * Controlled when selectedTab is supplied; it defaults to home. onSelectTab owns
 * every press when present; otherwise home/search use callbacks and trip/saved use routes.
 */
interface HomeBottomTabsProps {
  height: number;
  onOpenSearch: () => void;
  onShowHome: () => void;
  paddingBottom: number;
  onSelectTab?: (tab: HomeBottomTab) => void;
  selectedTab?: HomeBottomTab;
}

export function HomeBottomTabs({
  height,
  onOpenSearch,
  onShowHome,
  paddingBottom,
  onSelectTab,
  selectedTab = 'home',
}: HomeBottomTabsProps) {
  const router = useRouter();
  const selectTab = (tab: HomeBottomTab) => {
    if (onSelectTab) return onSelectTab(tab);
    if (tab === selectedTab && tab !== 'home' && tab !== 'search') return;
    if (tab === 'home') return onShowHome();
    if (tab === 'search') return onOpenSearch();
    if (tab === 'trip') return router.navigate('/trips');
    if (tab === 'favorite') return router.navigate('/saved');
    showComingSoon();
  };
  return (
    <View style={[styles.bottomTabs, { height, paddingBottom }]}>
      {TAB_ITEMS.map(({ key, label }) => {
        const isSelected = selectedTab === key;
        const homeIconStyle = isSelected
          ? { height: 18.5909, left: 3, position: 'absolute' as const, top: 2.41, width: 18 }
          : { height: 19.3674, left: 2.63, position: 'absolute' as const, top: 2.0326, width: 18.7412 };

        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={key}
            onPress={() => selectTab(key)}
            style={styles.tabButton}
          >
            <View style={{ alignItems: 'center', height: 24, justifyContent: 'center', width: 24 }}>
              <Image
                contentFit="contain"
                source={TAB_ICON_SOURCES[key][isSelected ? 'active' : 'inactive']}
                style={key === 'home' ? homeIconStyle : { height: 24, width: 24 }}
              />
            </View>
            <Text style={isSelected ? styles.tabLabelActive : styles.tabLabel}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
