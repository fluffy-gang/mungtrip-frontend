import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeBottomTabs } from '@/features/home/components/home-bottom-tabs';
import { BOTTOM_TAB_HEIGHT } from '@/features/home/constants';

import type { ReactNode } from 'react';
import type { HomeBottomTab } from '@/features/home/components/home-bottom-tabs';

export function useTabNavigation() {
  const router = useRouter();
  return (tab: HomeBottomTab) => {
    if (tab === 'my') router.replace('/profile');
    else if (tab === 'trip') router.replace('/trips');
    else if (tab === 'favorite') router.replace('/saved');
    else router.replace({ pathname: '/', params: { view: tab === 'search' ? 'search' : 'home' } });
  };
}
/** Home owns its overlay footer; list routes reserve footer space instead of covering their actions. */
export function TabShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const navigate = useTabNavigation();
  const selected = pathname === '/saved' ? 'favorite'
    : pathname === '/trips' ? 'trip'
      : pathname === '/profile' || pathname === '/profile/reviews' ? 'my'
        : undefined;
  const height = BOTTOM_TAB_HEIGHT + insets.bottom;
  return <View style={{ flex: 1, paddingBottom: selected ? height : 0 }}>
    {children}
    {selected && <HomeBottomTabs height={height} paddingBottom={insets.bottom} selectedTab={selected}
      onShowHome={() => navigate('home')} onOpenSearch={() => navigate('search')} onShowProfile={() => navigate('my')} onSelectTab={navigate} />}
  </View>;
}
