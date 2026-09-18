import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { reviewStyles } from '../review-styles';

export function StarRating({ rating }: { rating: number }) {
  return (
    <View style={reviewStyles.reviewRatingRow}>
      {[1, 2, 3, 4, 5].map(position => (
        <SymbolView
          key={position}
          name={{
            android: position <= rating ? 'star' : 'star_border',
            ios: position <= rating ? 'star.fill' : 'star',
            web: position <= rating ? 'star' : 'star_border',
          }}
          size={13}
          tintColor="#FE6A20"
        />
      ))}
      <Text style={reviewStyles.reviewRatingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}
