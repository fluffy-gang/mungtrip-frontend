import { useSyncExternalStore } from 'react';
import { Alert, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';

import { useFeatureIntegration } from './context';

import type { Place } from '@/features/places/types';
import type { StyleProp, ViewStyle } from 'react-native';

export function usePlaceActions(place: Place) {
  const app = useFeatureIntegration();
  const snapshot = useSyncExternalStore(app.saved.subscribe, app.saved.getSnapshot, app.saved.getSnapshot);
  const liked = snapshot.placeLikedById[place.id] ?? place.isLiked;
  const busy = snapshot.busyPlaceIds.includes(place.id);
  return {
    liked, busy,
    toggle: async () => {
      try { await app.saved.togglePlaceLike(place.id); }
      catch (error) { Alert.alert('저장', error instanceof Error ? error.message : '저장 상태를 변경하지 못했어요.'); }
    },
    addToTrip: () => app.openTrip({ mode: 'add', source: app.source,
      selection: { kind: 'place', places: [{ ...place, thumbnailUrl: place.imageUrl }] } }),
  };
}
/** One saved provider supplies all card hearts; stop propagation prevents accidental detail navigation. */
export function PlaceLikeButton({ place, style, size = 18 }: { place: Place; style?: StyleProp<ViewStyle>; size?: number }) {
  const action = usePlaceActions(place);
  return <Pressable style={style} hitSlop={12} disabled={action.busy} accessibilityRole="button"
    accessibilityLabel={`${place.name} ${action.liked ? '찜 해제' : '찜하기'}`}
    accessibilityState={{ selected: action.liked, busy: action.busy, disabled: action.busy }}
    onPress={event => { event.stopPropagation(); void action.toggle(); }}>
    {action.liked ? <Image source={require('../saved/assets/heart-saved.svg')} style={{ width: size, height: size }} contentFit="contain" />
      : <SymbolView name={{ android: 'favorite_border', ios: 'heart', web: 'favorite_border' }} size={size} tintColor="#FFFFFF" />}
  </Pressable>;
}
