import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Place, PlaceCategory } from '@/features/places/types';

import { styles } from '../styles';
import { PlaceCard } from './place-card';

interface FeedContentProps {
  categories: PlaceCategory[];
  onSelectPlace?: (place: Place) => void;
  onShowCategoryPlaces: () => void;
  onShowRecommendedPlaces: () => void;
  recentlyVerified: Place[];
  selectedCategoryCode: string | null;
  topPlaces: Place[];
}

export function FeedContent({
  categories,
  onSelectPlace,
  onShowCategoryPlaces,
  onShowRecommendedPlaces,
  recentlyVerified,
  selectedCategoryCode,
  topPlaces,
}: FeedContentProps) {
  const selectedCategory = categories.find(
    category => category.code === selectedCategoryCode,
  );
  return (
    <>
      <View style={styles.feedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 검증되어 안심할 장소</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onShowRecommendedPlaces}
            style={styles.moreButton}
          >
            <Text style={styles.moreText}>더보기</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalCardRail}
        >
          {recentlyVerified.slice(0, 4).map(place => (
            <PlaceCard key={place.id} onPress={onSelectPlace} place={place} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.feedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory?.name ?? '카테고리'} 인기 장소
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onShowCategoryPlaces}
            style={styles.moreButton}
          >
            <Text style={styles.moreText}>지도에서 보기</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalCardRail}
        >
          {topPlaces.slice(0, 4).map(place => (
            <PlaceCard key={place.id} onPress={onSelectPlace} place={place} />
          ))}
        </ScrollView>
      </View>
    </>
  );
}
