import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/constants/tokens';

const colors = tokens.colors.semantic.light;
const { borderWidth, spacing } = tokens;

export type BottomTabKey = 'home' | 'profile' | 'saved' | 'search' | 'travel';

export const BOTTOM_TAB_HEIGHT = 56;

interface BottomTabBarProps {
  active: BottomTabKey;
  height: number;
  onPressHome?: () => void;
  onPressProfile?: () => void;
  onPressSearch?: () => void;
  paddingBottom: number;
}

const TAB_ITEMS = [
  {
    activeIcon: { android: 'home', ios: 'house.fill', web: 'home' },
    icon: { android: 'home', ios: 'house', web: 'home' },
    key: 'home',
    label: '홈',
  },
  {
    activeIcon: { android: 'flag', ios: 'flag.fill', web: 'flag' },
    icon: { android: 'flag', ios: 'flag', web: 'flag' },
    key: 'travel',
    label: '여행',
  },
  { icon: { android: 'search', ios: 'magnifyingglass', web: 'search' }, key: 'search', label: '검색' },
  {
    activeIcon: { android: 'favorite', ios: 'heart.fill', web: 'favorite' },
    icon: { android: 'favorite_border', ios: 'heart', web: 'favorite_border' },
    key: 'saved',
    label: '저장',
  },
  {
    activeIcon: { android: 'person', ios: 'person.fill', web: 'person' },
    icon: { android: 'person', ios: 'person', web: 'person' },
    key: 'profile',
    label: '프로필',
  },
] as const satisfies {
  activeIcon?: unknown;
  icon: unknown;
  key: BottomTabKey;
  label: string;
}[];

export function BottomTabBar({
  active,
  height,
  onPressHome,
  onPressProfile,
  onPressSearch,
  paddingBottom,
}: BottomTabBarProps) {
  const handlers: Partial<Record<BottomTabKey, () => void>> = {
    home: onPressHome,
    profile: onPressProfile,
    search: onPressSearch,
  };

  return (
    <View style={[styles.root, { height, paddingBottom }]}>
      {TAB_ITEMS.map(item => {
        const isActive = item.key === active;
        const onPress = handlers[item.key];

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            disabled={!onPress}
            key={item.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            <SymbolView
              name={isActive && 'activeIcon' in item ? item.activeIcon : item.icon}
              size={26}
              tintColor={isActive ? colors.primary : '#333D4B'}
            />
            <Text style={isActive ? styles.tabLabelActive : styles.tabLabel}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: borderWidth.hairline,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 30,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: spacing[2],
    justifyContent: 'center',
  },
  tabLabel: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
    fontWeight: tokens.typography.fontWeight.bold,
  },
});
