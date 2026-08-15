import {
  ActivityIndicator,
  type GestureResponderHandlers,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { Place, PlaceCategory } from '@/features/places/types';

import { colors, styles } from '../styles';
import type { HomeDogProfile } from '../types';
import { CompactPlacePreview } from './compact-place-preview';
import { FeedContent } from './feed-content';
import { PlaceList } from './place-list';

interface HomeMapSheetProps {
  bottom: number;
  categories: PlaceCategory[];
  dogs: HomeDogProfile[];
  hasError: boolean;
  height: number;
  isPlaceList: boolean;
  loading: boolean;
  onRetry: () => void;
  onSelectPlace: (place: Place) => void;
  onShowCategoryPlaces: () => void;
  onShowMap: () => void;
  onShowRecommendedPlaces: () => void;
  panHandlers: GestureResponderHandlers;
  places: Place[];
  recentlyVerified: Place[];
  selectedCategoryCode: string | null;
  selectedPlace: Place | null;
  sheetLabel: string;
  sheetTitle: string;
  topPlaces: Place[];
}

export function HomeMapSheet({
  bottom,
  categories,
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
  selectedCategoryCode,
  selectedPlace,
  sheetLabel,
  sheetTitle,
  topPlaces,
}: HomeMapSheetProps) {
  const renderHeader = () => (
    <View style={styles.sheetHeader}>
      <View>
        <Text style={styles.sheetLabel}>{sheetLabel}</Text>
        <Text style={styles.sheetTitle}>{sheetTitle}</Text>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
    </View>
  );

  return (
    <View style={[styles.mapBottomSheet, { bottom, height }]}>
      <View style={styles.sheetDragArea} {...panHandlers}>
        <View style={styles.sheetHandle} />
      </View>
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
      ) : selectedPlace ? (
        <>
          {renderHeader()}
          <CompactPlacePreview
            dogs={dogs}
            onSelectPlace={onSelectPlace}
            places={[selectedPlace]}
          />
        </>
      ) : isPlaceList ? (
        <PlaceList
          dogs={dogs}
          places={places}
          onSelectPlace={onSelectPlace}
          onShowMap={onShowMap}
          showMapSwitchButton={false}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.mapSheetFeedContent}
          showsVerticalScrollIndicator={false}
          style={styles.mapSheetFeedScroll}
        >
          <FeedContent
            categories={categories}
            onSelectPlace={onSelectPlace}
            onShowCategoryPlaces={onShowCategoryPlaces}
            onShowRecommendedPlaces={onShowRecommendedPlaces}
            recentlyVerified={recentlyVerified}
            selectedCategoryCode={selectedCategoryCode}
            topPlaces={topPlaces}
          />
        </ScrollView>
      )}
    </View>
  );
}
