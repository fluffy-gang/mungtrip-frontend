import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { reviewStyles } from '../review-styles';

const REVIEW_STARS = require('../assets/review-stars.svg');

interface StarRatingProps {
  onChange?: (rating: number) => void;
  rating: number;
}

/** Uses the Figma star strip when displaying a saved review and keeps editable stars interactive. */
export function StarRating({ onChange, rating }: StarRatingProps) {
  if (!onChange) {
    return (
      <View style={reviewStyles.reviewRatingRow}>
        <Image contentFit="contain" source={REVIEW_STARS} style={reviewStyles.readonlyStars} />
        <Text style={reviewStyles.reviewRatingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  }

  return (
    <View style={reviewStyles.reviewRatingRow}>
      {[1, 2, 3, 4, 5].map(position => {
        const selected = position <= rating;

        return (
          <Pressable
            accessibilityLabel={`별점 ${position}점`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={position}
            onPress={() => onChange(position)}
            style={reviewStyles.starButton}
          >
            <Text style={reviewStyles.editableStar}>{selected ? '★' : '☆'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
