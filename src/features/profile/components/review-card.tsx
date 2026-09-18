import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { reviewStyles } from '../review-styles';
import { StarRating } from './star-rating';

import type { StyleProp, ViewStyle } from 'react-native';
import type { MockReview } from '../mock/reviews';

interface ReviewCardProps {
  contentNumberOfLines?: number;
  onPressMenu: (review: MockReview) => void;
  review: MockReview;
  style?: StyleProp<ViewStyle>;
}

export function ReviewCard({ contentNumberOfLines, onPressMenu, review, style }: ReviewCardProps) {
  return (
    <View style={[reviewStyles.reviewCard, style]}>
      <View style={reviewStyles.reviewCardHeader}>
        <Text style={reviewStyles.reviewPlaceName}>{review.placeName}</Text>
        <Pressable
          accessibilityLabel="리뷰 관리"
          accessibilityRole="button"
          onPress={() => onPressMenu(review)}
        >
          <SymbolView
            name={{ android: 'more_vert', ios: 'ellipsis', web: 'more_vert' }}
            size={18}
            tintColor="#8B95A1"
          />
        </Pressable>
      </View>
      <StarRating rating={review.rating} />
      <Text style={reviewStyles.reviewMeta}>
        {review.date} · {review.dogName}
      </Text>
      <Text numberOfLines={contentNumberOfLines} style={reviewStyles.reviewContent}>
        {review.content}
      </Text>
    </View>
  );
}
