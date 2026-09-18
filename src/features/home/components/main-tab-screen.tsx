import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOTTOM_TAB_HEIGHT } from '../constants';
import { HomeBottomTabs } from './home-bottom-tabs';

import type { ReactNode } from 'react';

/** 여행·저장 루트에서도 하단 탭을 유지하고 콘텐츠가 탭에 가려지지 않게 한다. */
export function MainTabScreen({ children, tab }: { children: ReactNode; tab: 'trip' | 'favorite' }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const height = BOTTOM_TAB_HEIGHT + insets.bottom;
  return (
    <View style={{ flex: 1, paddingBottom: height }}>
      {children}
      <HomeBottomTabs
        height={height}
        paddingBottom={insets.bottom}
        selectedTab={tab}
        onShowHome={() => router.navigate('/')}
        onOpenSearch={() => router.navigate({ pathname: '/', params: { mode: 'search' } })}
      />
    </View>
  );
}
