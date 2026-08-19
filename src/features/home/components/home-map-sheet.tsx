import { useEffect } from 'react';
import {
  ActivityIndicator,
  type GestureResponderHandlers,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';

import { colors, styles } from '../styles';
import type { HomeDogProfile } from '../types';
import { FeedContent } from './feed-content';
import { PlaceList } from './place-list';

interface HomeMapSheetProps {
  bottom: number;
  courses: Course[];
  dogs: HomeDogProfile[];
  hasError: boolean;
  height: number;
  isPlaceList: boolean;
  loading: boolean;
  onRetry: () => void;
  onSelectPlace: (place: Place) => void;
  onShowCategoryPlaces: (categoryCode: string) => void;
  onShowMap: () => void;
  onShowRecommendedPlaces: () => void;
  panHandlers: GestureResponderHandlers;
  places: Place[];
  recentlyVerified: Place[];
  topCafePlaces: Place[];
  topRestaurantPlaces: Place[];
}

export function HomeMapSheet({
  bottom,
  courses,
  dogs,
  hasError,
  height,
  isPlaceList,
  loading,
  onRetry,
  onSelectPlace,
  onShowCategoryPlaces,
  onShowMap,
  onShowRecommendedPlaces,
  panHandlers,
  places,
  recentlyVerified,
  topCafePlaces,
  topRestaurantPlaces,
}: HomeMapSheetProps) {
  const animatedHeight = useSharedValue(height);

  useEffect(() => {
    animatedHeight.value = withTiming(height, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedHeight, height]);

  const sheetHeightStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View style={[styles.mapBottomSheet, { bottom }, sheetHeightStyle]}>
      <View style={styles.sheetDragArea} {...panHandlers}>
        <View style={styles.sheetHandle} />
      </View>
      {loading ? (
        <View style={styles.sheetLoadingRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      {hasError ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyListTitle}>장소 정보를 불러오지 못했어요</Text>
          <Text style={styles.emptyListText}>
            네트워크 연결을 확인한 뒤 다시 시도해주세요.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : isPlaceList ? (
        <>
          <Text style={styles.placeListCount}>{places.length}개 장소</Text>
          <PlaceList
            dogs={dogs}
            places={places}
            onSelectPlace={onSelectPlace}
            onShowMap={onShowMap}
            showMapSwitchButton={false}
          />
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.mapSheetFeedContent}
          showsVerticalScrollIndicator={false}
          style={styles.mapSheetFeedScroll}
        >
          <FeedContent
            courses={courses}
            onSelectPlace={onSelectPlace}
            onShowCategoryPlaces={onShowCategoryPlaces}
            onShowRecommendedPlaces={onShowRecommendedPlaces}
            recentlyVerified={recentlyVerified}
            topCafePlaces={topCafePlaces}
            topRestaurantPlaces={topRestaurantPlaces}
          />
        </ScrollView>
      )}
    </Animated.View>
  );
}
