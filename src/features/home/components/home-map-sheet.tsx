import { useEffect } from 'react';
import {
  ActivityIndicator,
  type GestureResponderHandlers,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Place } from '@/features/places/types';

import type { PlaceExplorationStatus } from '../hooks/use-place-exploration';
import { colors, styles } from '../styles';
import { PlaceList } from './place-list';

interface HomeMapSheetProps {
  height: number;
  onResetConditions: () => void;
  onRetry: () => void;
  onSelectPlace: (place: Place) => void;
  onShowMap: () => void;
  panHandlers: GestureResponderHandlers;
  places: Place[];
  selectedPlaceId?: number;
  status: PlaceExplorationStatus;
}

export function HomeMapSheet({
  height,
  onResetConditions,
  onRetry,
  onSelectPlace,
  onShowMap,
  panHandlers,
  places,
  selectedPlaceId,
  status,
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
    <Animated.View style={[styles.mapBottomSheet, sheetHeightStyle]}>
      <View style={styles.sheetDragArea} {...panHandlers}>
        <View style={styles.sheetHandle} />
      </View>
      {status === 'initial-loading' || status === 'refreshing' ? (
        <View accessibilityLiveRegion="polite" style={styles.emptyList}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.emptyListText}>
            {status === 'initial-loading'
              ? '장소를 불러오는 중이에요'
              : '새 조건으로 다시 조회하는 중이에요'}
          </Text>
        </View>
      ) : status === 'error' ? (
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
      ) : status === 'empty' ? (
        <View accessibilityLiveRegion="polite" style={styles.emptyList}>
          <Text style={styles.placeListCount}>총 0곳</Text>
          <Text style={styles.emptyListTitle}>현재 조건에 맞는 장소가 없어요</Text>
          <Text style={styles.emptyListText}>
            조건을 초기화한 뒤 다시 찾아보세요.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onResetConditions}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>조건 초기화</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text accessibilityLiveRegion="polite" style={styles.placeListCount}>
            총 {places.length}곳
          </Text>
          <PlaceList
            places={places}
            onSelectPlace={onSelectPlace}
            onShowMap={onShowMap}
            selectedPlaceId={selectedPlaceId}
            showMapSwitchButton={false}
          />
        </>
      )}
    </Animated.View>
  );
}
