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
  { icon: { android: 'home', ios: 'house.fill', web: 'home' }, key: 'home', label: '홈' },
  { icon: { android: 'route', ios: 'map', web: 'route' }, key: 'travel', label: '여행' },
  { icon: { android: 'search', ios: 'magnifyingglass', web: 'search' }, key: 'search', label: '검색' },
  { icon: { android: 'favorite', ios: 'heart', web: 'favorite' }, key: 'saved', label: '저장' },
  {
    icon: { android: 'person', ios: 'person.crop.circle', web: 'person' },
    key: 'profile',
    label: '프로필',
  },
] as const satisfies { icon: unknown; key: BottomTabKey; label: string }[];

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
              name={item.icon}
              size={22}
              tintColor={isActive ? colors.primary : '#8B95A1'}
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
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: tokens.typography.fontSize[11].fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: tokens.typography.fontSize[11].fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
  },
});
