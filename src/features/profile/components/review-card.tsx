import { Image } from 'expo-image';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { reviewStyles } from '../review-styles';
import { formatReviewDate } from '../utils/format-review-date';
import { ReviewVectorIcon } from './review-vector-icon';
import { StarRating } from './star-rating';

import type { StyleProp, ViewStyle } from 'react-native';
import type { Review } from '../types';
import type { ReviewMenuAnchor } from './review-manage-dialog';

interface ReviewCardProps {
  contentNumberOfLines?: number;
  onPressMenu: (review: Review, anchor: ReviewMenuAnchor) => void;
  review: Review;
  style?: StyleProp<ViewStyle>;
}

/** A written review card shared by the overview and the full review-management screen. */
export function ReviewCard({
  contentNumberOfLines,
  onPressMenu,
  review,
  style,
}: ReviewCardProps) {
  const menuButtonRef = useRef<View>(null);

  const openMenu = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      onPressMenu(review, { height, width, x, y });
    });
  };

  return (
    <View style={[reviewStyles.reviewCard, style]}>
      <View style={reviewStyles.reviewCardCopy}>
        <View style={reviewStyles.reviewCardHeader}>
          <Text style={reviewStyles.reviewPlaceName}>{review.placeName}</Text>
          <Pressable
            accessibilityLabel="리뷰 관리"
            accessibilityRole="button"
            hitSlop={8}
            onPress={openMenu}
            ref={menuButtonRef}
            style={reviewStyles.reviewMenuButton}
          >
            <ReviewVectorIcon name="more" size={20} />
          </Pressable>
        </View>
        <View style={reviewStyles.reviewRatingMetaRow}>
          <StarRating rating={review.rating} />
          <Text style={reviewStyles.reviewMeta}>{formatReviewDate(review.createdAt)}</Text>
        </View>
        <Text numberOfLines={contentNumberOfLines} style={reviewStyles.reviewContent}>
          {review.content}
        </Text>
      </View>
      {review.imageUrls.length > 0 ? (
        <ScrollView
          contentContainerStyle={reviewStyles.reviewPhotos}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {review.imageUrls.map((photoUrl, index) => (
            <Image
              contentFit="cover"
              key={`${photoUrl}-${index}`}
              source={{ uri: photoUrl }}
              style={reviewStyles.reviewPhoto}
            />
          ))}
        </ScrollView>
      ) : null}
      <View style={reviewStyles.reviewDogChip}>
        <View style={reviewStyles.reviewDogAvatar}>
          {review.dog?.imageUrl ? (
            <Image
              contentFit="cover"
              source={{ uri: review.dog.imageUrl }}
              style={reviewStyles.reviewDogAvatarImage}
            />
          ) : (
            <ReviewVectorIcon name="paw" size={12} />
          )}
        </View>
        <Text style={reviewStyles.reviewDogName}>{review.dog?.name ?? '반려견 정보 없음'}</Text>
      </View>
    </View>
  );
}
