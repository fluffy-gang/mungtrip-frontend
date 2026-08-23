import { Pressable, ScrollView, Text, View } from 'react-native';

import type { Course } from '@/features/courses/types';
import type { Place } from '@/features/places/types';

import { styles } from '../styles';
import { PlaceCard } from './place-card';
import { RecommendedCourseCard } from './recommended-course-card';

interface FeedContentProps {
  courses: Course[];
  onSelectPlace?: (place: Place) => void;
  onShowCategoryPlaces: (categoryCode: string) => void;
  onShowRecommendedPlaces: () => void;
  recentlyVerified: Place[];
  topCafePlaces: Place[];
  topRestaurantPlaces: Place[];
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
  return (
    <>
      <View style={styles.feedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>제주 지역별 추천 코스</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalCardRail}
        >
          {courses.map(course => (
            <RecommendedCourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.feedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 견주들이 인증한 곳</Text>
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
          <Text style={styles.sectionTitle}>사람들이 많이 찾는 카페</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onShowCategoryPlaces('CAFE')}
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
          {topCafePlaces.slice(0, 4).map(place => (
            <PlaceCard key={place.id} onPress={onSelectPlace} place={place} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.feedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>사람들이 많이 찾는 맛집</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onShowCategoryPlaces('RESTAURANT')}
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
          {topRestaurantPlaces.slice(0, 4).map(place => (
            <PlaceCard key={place.id} onPress={onSelectPlace} place={place} />
          ))}
        </ScrollView>
      </View>
    </>
  );
}
