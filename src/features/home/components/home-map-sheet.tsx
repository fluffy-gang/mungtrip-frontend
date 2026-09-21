import { useEffect } from 'react';
import {
  ActivityIndicator,
  type GestureResponderHandlers,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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

import { colors, styles } from '../styles';
import { FeedContent } from './feed-content';
import { PlaceList } from './place-list';

import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';
import type { HomeDogProfile } from '../types';


interface HomeMapSheetProps {
  bottom: number;
  courses: Course[];
  dogs: HomeDogProfile[];
  hasError: boolean;
  height: number;
  isExpanded: boolean;
  isPlaceList: boolean;
  loading: boolean;
  onRetry: () => void;
  onClearFilters?: () => void;
  onExpand: () => void;
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
  isExpanded,
  isPlaceList,
  loading,
  onRetry,
  onClearFilters,
  onExpand,
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
  const handleContentScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isExpanded && nativeEvent.contentOffset.y > 8) {
      onExpand();
    }
  };
  const hasFeedItems =
    courses.length > 0 ||
    recentlyVerified.length > 0 ||
    topCafePlaces.length > 0 ||
    topRestaurantPlaces.length > 0;

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
    <Animated.View
      style={[
        styles.mapBottomSheet,
        { bottom },
        isExpanded ? styles.mapBottomSheetExpanded : null,
        sheetHeightStyle,
      ]}
    >
      {isExpanded ? null : (
        <View style={styles.sheetDragArea} {...panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
      )}
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
      ) : loading ? null : isPlaceList ? (
        <>
          <Text style={styles.placeListCount}>{places.length}개 장소</Text>
          <PlaceList
            dogs={dogs}
            places={places}
            onSelectPlace={onSelectPlace}
            onShowMap={onShowMap}
            showMapSwitchButton={false}
            emptyText={dogs.length ? '선택한 반려견의 동행 조건이 확인된 장소가 없어요. 필터를 해제하면 전체 장소를 볼 수 있어요.' : undefined}
            onClearFilters={onClearFilters}
            onScroll={handleContentScroll}
          />
        </>
      ) : !hasFeedItems ? (
        <PlaceList
          dogs={dogs}
          places={places}
          onSelectPlace={onSelectPlace}
          onShowMap={onShowMap}
          showMapSwitchButton={false}
          onClearFilters={onClearFilters}
          onScroll={handleContentScroll}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.mapSheetFeedContent}
          onScroll={handleContentScroll}
          scrollEventThrottle={16}
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
