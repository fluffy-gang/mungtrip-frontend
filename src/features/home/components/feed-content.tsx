import { Pressable, ScrollView, Text, View } from 'react-native';


import { styles } from '../styles';
import { PlaceCard } from './place-card';
import { RecommendedCourseCard } from './recommended-course-card';

import type { ReactNode } from 'react';
import type { Place } from '@/features/places/types';
import type { Course } from '@/features/courses/types';

interface FeedContentProps {
  courses: Course[];
  onSelectPlace?: (place: Place) => void;
  onShowCategoryPlaces: (categoryCode: string) => void;
  onShowRecommendedPlaces: () => void;
  recentlyVerified: Place[];
  topCafePlaces: Place[];
  topRestaurantPlaces: Place[];
}

interface FeedSectionProps<TItem> {
  actionLabel?: string;
  items: TItem[];
  limit?: number;
  onPressAction?: () => void;
  renderItem: (item: TItem) => ReactNode;
  title: string;
}

function FeedSection<TItem>({
  actionLabel,
  items,
  limit,
  onPressAction,
  renderItem,
  title,
}: FeedSectionProps<TItem>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.feedSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {actionLabel && onPressAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onPressAction}
            style={styles.moreButton}
          >
            <Text style={styles.moreText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalCardRail}
      >
        {(limit === undefined ? items : items.slice(0, limit)).map(renderItem)}
      </ScrollView>
    </View>
  );
}

export function FeedContent({
  courses,
  onSelectPlace,
  onShowCategoryPlaces,
  onShowRecommendedPlaces,
  recentlyVerified,
  topCafePlaces,
  topRestaurantPlaces,
}: FeedContentProps) {
  const renderPlace = (place: Place) => (
    <PlaceCard key={place.id} onPress={onSelectPlace} place={place} />
  );

  return (
    <>
      <FeedSection
        items={courses}
        renderItem={course => (
          <RecommendedCourseCard key={course.id} course={course} />
        )}
        title="제주 지역별 추천 코스"
      />
      <FeedSection
        actionLabel="더보기"
        items={recentlyVerified}
        limit={4}
        onPressAction={onShowRecommendedPlaces}
        renderItem={renderPlace}
        title="최근 견주들이 인증한 곳"
      />
      <FeedSection
        actionLabel="지도에서 보기"
        items={topCafePlaces}
        limit={4}
        onPressAction={() => onShowCategoryPlaces('CAFE')}
        renderItem={renderPlace}
        title="사람들이 많이 찾는 카페"
      />
      <FeedSection
        actionLabel="지도에서 보기"
        items={topRestaurantPlaces}
        limit={4}
        onPressAction={() => onShowCategoryPlaces('RESTAURANT')}
        renderItem={renderPlace}
        title="사람들이 많이 찾는 맛집"
      />
    </>
  );
}
