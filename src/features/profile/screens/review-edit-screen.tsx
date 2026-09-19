import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { showDialog } from '@/components/ui/dialog';
import { TextInputField } from '@/components/ui/input';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { StarRating } from '../components/star-rating';
import { ReviewVectorIcon } from '../components/review-vector-icon';
import { useReviews } from '../hooks/use-reviews';
import { reviewStyles } from '../review-styles';
import { useReviewsStore } from '../store/reviews-store';
import { styles } from '../styles';

import type { Review } from '../types';

interface ReviewEditFormProps {
  onSubmit: (values: { content: string; rating: number }) => void;
  review: Review;
  submitting: boolean;
}

function ReviewEditForm({ onSubmit, review, submitting }: ReviewEditFormProps) {
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content);
  const contentError = content.trim() ? undefined : '리뷰 내용을 입력해주세요.';

  return (
    <View style={styles.form}>
      <Text style={reviewStyles.reviewPlaceName}>{review.placeName}</Text>

      <View style={reviewStyles.ratingField}>
        <Text style={styles.fieldLabel}>별점</Text>
        <StarRating onChange={setRating} rating={rating} />
      </View>

      <View style={reviewStyles.reviewDogChip}>
        <ReviewVectorIcon name="paw" size={12} />
        <Text style={reviewStyles.reviewDogName}>{review.dog?.name ?? '반려견 정보 없음'}</Text>
      </View>

      <TextInputField
        errorText={contentError}
        label="리뷰 내용"
        multiline
        numberOfLines={5}
        onChange={setContent}
        placeholder="반려견과 함께한 경험을 남겨주세요"
        required
        value={content}
      />

      {review.imageUrls.length > 0 ? (
        <View>
          <Text style={styles.fieldLabel}>사진</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {review.imageUrls.map((photoUrl, index) => (
              <Image key={`${photoUrl}-${index}`} source={{ uri: photoUrl }} style={reviewStyles.reviewPhoto} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <Button
        disabled={Boolean(contentError || submitting)}
        onPress={() => {
          if (contentError || submitting) return;
          onSubmit({ content: content.trim(), rating });
        }}
      >
        {submitting ? '저장 중...' : '수정 완료'}
      </Button>
    </View>
  );
}

export function ReviewEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ reviewId: string }>();
  const reviewId = Number(params.reviewId);
  const { hasError, loading, reviews, retry } = useReviews();
  const updateReview = useReviewsStore(state => state.updateReview);
  const review = reviews.find(item => item.reviewId === reviewId);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values: { content: string; rating: number }) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      await updateReview(reviewId, values);
      // Deferring past the current frame avoids a known Android Fabric crash
      // (react-native-screens#2803) when a store update lands on the same
      // frame as a stack pop.
      requestAnimationFrame(() => router.back());
    } catch {
      showDialog('리뷰를 수정하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader onBack={() => router.back()} title="리뷰 수정" />
        {loading ? (
          <StatePanel loading title="리뷰를 불러오는 중이에요" />
        ) : hasError || !review ? (
          <StatePanel
            description={hasError ? '잠시 후 다시 시도해주세요.' : undefined}
            onRetry={hasError ? retry : undefined}
            title={hasError ? '리뷰를 불러오지 못했어요' : '리뷰를 찾을 수 없어요'}
          />
        ) : (
          <ReviewEditForm onSubmit={values => void submit(values)} review={review} submitting={submitting} />
        )}
      </ScrollView>
    </View>
  );
}
