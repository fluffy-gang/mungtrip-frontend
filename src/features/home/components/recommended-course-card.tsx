import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import type { Course } from '@/features/courses/types';

import { colors, styles } from '../styles';
import { getImageSource } from '../utils/place-utils';

export function RecommendedCourseCard({
  course,
  onPress,
}: {
  course: Course;
  onPress?: (course: Course) => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress ? () => onPress(course) : undefined}
      style={styles.courseCardRoot}
    >
      <View style={styles.courseCardImageFrame}>
        <Image source={getImageSource(course.thumbnailUrl)} style={styles.courseCardImage} />
        <View style={styles.courseCardBadge}>
          <Text style={styles.courseCardBadgeText}>
            {course.placeCount}곳 · {course.totalDistanceKm}km
          </Text>
        </View>
        <View style={styles.courseCardLikeBadge}>
          <SymbolView
            name={{ android: 'favorite', ios: course.isLiked ? 'heart.fill' : 'heart', web: 'favorite' }}
            size={15}
            tintColor={colors.onInverse}
          />
        </View>
        <View style={styles.courseCardOverlay}>
          <Text numberOfLines={1} style={styles.courseCardTitle}>
            {course.title}
          </Text>
          <Text numberOfLines={1} style={styles.courseCardSubtitle}>
            {course.region}
          </Text>
          <View style={styles.courseCardFooter}>
            <View style={styles.courseCardTripButton}>
              <SymbolView
                name={{ android: 'add', ios: 'plus', web: 'add' }}
                size={12}
                tintColor={colors.textSecondary}
              />
              <Text style={styles.courseCardTripText}>내 여행</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
