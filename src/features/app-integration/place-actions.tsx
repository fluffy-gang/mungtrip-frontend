import { useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

import { LikeButton } from '@/components/ui/like-button';

import { useFeatureIntegration } from './context';

import type { Course } from '@/features/courses/types';
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
/** Shared provider adapters keep network state outside the visual button. */
export function PlaceLikeButton({ place, style, size = 24 }: { place: Place; style?: StyleProp<ViewStyle>; size?: 24 | 28 }) {
  const action = usePlaceActions(place);
  return <LikeButton liked={action.liked} busy={action.busy} size={size} variant="photo" style={style}
    accessibilityLabel={`${place.name} ${action.liked ? '찜 해제' : '찜하기'}`} onPress={() => { void action.toggle(); }} />;
}

export function CourseLikeButton({ course, style }: { course: Course; style?: StyleProp<ViewStyle> }) {
  const { saved } = useFeatureIntegration();
  const state = useSyncExternalStore(saved.subscribe, saved.getSnapshot, saved.getSnapshot);
  const liked = state.courseLikedById[course.id] ?? course.isLiked;
  return <LikeButton liked={liked} size={28} variant="muted" style={style} busy={state.busyCourseIds.includes(course.id)}
    accessibilityLabel={`${course.title} ${liked ? '찜 해제' : '찜하기'}`} onPress={async () => {
      try { await saved.toggleCourseLike(course.id); }
      catch (error) { Alert.alert('저장', error instanceof Error ? error.message : '저장 상태를 변경하지 못했어요.'); }
    }} />;
}
