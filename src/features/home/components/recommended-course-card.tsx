import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { CourseLikeButton } from '@/features/app-integration/place-actions';
import { colors, styles } from '../styles';
import { PlaceThumbnail } from './place-thumbnail';

import type { Course } from '@/features/courses/types';

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
        <PlaceThumbnail imageUrl={course.thumbnailUrl} style={styles.courseCardImage} />
        <View style={styles.courseCardBadge}>
          <Text style={styles.courseCardBadgeText}>
            {course.placeCount}곳 · {course.totalDistanceKm}km
          </Text>
        </View>
        <CourseLikeButton course={course} style={styles.courseCardLikeBadge} />
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
