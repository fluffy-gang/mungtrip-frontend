import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { reviewStyles } from '../review-styles';

const REVIEW_DETAIL_ICON = require('../assets/review-detail.svg');

/** Empty-review guidance that preserves the fixed card dimensions from the design. */
export function EmptyReviewCard() {
  return (
    <View style={reviewStyles.emptyReviewCard}>
      <Image contentFit="contain" source={REVIEW_DETAIL_ICON} style={reviewStyles.emptyReviewIcon} />
      <View style={reviewStyles.emptyReviewCopy}>
        <Text style={reviewStyles.emptyReviewTitle}>아직 작성한 리뷰가 없어요</Text>
        <Text style={reviewStyles.emptyReviewDescription}>
          다음 여행에서 마음에 드는 장소를 기록해보세요
        </Text>
      </View>
    </View>
  );
}
