import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showDialog } from '@/components/ui/dialog';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { uploadFile } from '@/features/uploads/api';
import { getUploadSource } from '@/features/uploads/types';
import { ReviewForm, type ReviewFormValues } from '../components/review-form';
import { useDogs } from '../hooks/use-dogs';
import { useReviewsStore } from '../store/reviews-store';
import { styles } from '../styles';

export function ReviewWriteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId: string; placeName: string }>();
  const { dogs, hasError, loading, retry } = useDogs();
  const addReview = useReviewsStore(state => state.addReview);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values: ReviewFormValues) => {
    const dog = dogs.find(item => item.dogId === values.dogId);
    if (!dog || submitting) return;

    setSubmitting(true);
    try {
      const imageUrls = await Promise.all(
        values.photos.map(photo =>
          uploadFile(getUploadSource(photo.uri, photo.file), photo.mimeType, 'REVIEW_IMAGE'),
        ),
      );

      await addReview(Number(params.placeId), dog, {
        content: values.content,
        imageUrls,
        rating: values.rating,
      });
      router.back();
    } catch {
      showDialog('리뷰를 등록하지 못했어요', '잠시 후 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader onBack={() => router.back()} title="리뷰 작성" />
        {loading ? (
          <StatePanel loading title="반려견 정보를 불러오는 중이에요" />
        ) : hasError ? (
          <StatePanel
            description="잠시 후 다시 시도해주세요."
            onRetry={retry}
            title="반려견 정보를 불러오지 못했어요"
          />
        ) : dogs.length === 0 ? (
          <StatePanel
            description="리뷰를 작성하려면 반려견을 먼저 등록해주세요."
            title="등록된 반려견이 없어요"
          />
        ) : (
          <ReviewForm
            dogs={dogs}
            onSubmit={values => void submit(values)}
            placeName={params.placeName}
            submitLabel="등록"
            submitting={submitting}
          />
        )}
      </ScrollView>
    </View>
  );
}
