import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showDialog } from '@/components/ui/dialog';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { EmptyReviewCard } from '../components/empty-review-card';
import { ReviewActionMenu, ReviewDeleteDialog } from '../components/review-manage-dialog';
import { ReviewCard } from '../components/review-card';
import { ReviewVectorIcon } from '../components/review-vector-icon';
import { useReviews } from '../hooks/use-reviews';
import { reviewStyles } from '../review-styles';
import { useReviewsStore } from '../store/reviews-store';
import { styles } from '../styles';

import type { ReviewMenuAnchor } from '../components/review-manage-dialog';
import type { Review } from '../types';

interface OpenReviewMenu {
  anchor: ReviewMenuAnchor;
  review: Review;
}

export function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const { hasError, loading, retry, reviews, visitedPlaces } = useReviews();
  const commitPendingReview = useReviewsStore(state => state.commitPendingReview);
  const removeReview = useReviewsStore(state => state.removeReview);
  const [openMenu, setOpenMenu] = useState<OpenReviewMenu | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      commitPendingReview();
    }, [commitPendingReview]),
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const openReviewMenu = (review: Review, anchor?: ReviewMenuAnchor) => {
    if (!anchor) return;

    setOpenMenu({ anchor, review });
  };

  const editReview = () => {
    if (!openMenu) return;

    const { review } = openMenu;
    setOpenMenu(null);
    // The action menu's Modal must finish unmounting before the stack push starts,
    // or Android Fabric can try to reparent a view that is still attached to it
    // (react-native-screens#2803).
    requestAnimationFrame(() => {
      router.push({
        params: { reviewId: String(review.reviewId) },
        pathname: '/profile/reviews/[reviewId]/edit',
      });
    });
  };

  const openDeleteConfirmation = () => {
    if (!openMenu) return;

    setReviewToDelete(openMenu.review);
    setOpenMenu(null);
  };

  const deleteReview = async () => {
    if (!reviewToDelete || deleting) return;

    setDeleting(true);
    try {
      await removeReview(reviewToDelete.reviewId);
      setReviewToDelete(null);
      setOpenMenu(null);
      showToast('리뷰가 삭제되었어요');
    } catch {
      showDialog('리뷰를 삭제하지 못했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <ScreenHeader onBack={() => router.back()} title="방문 장소/리뷰" />
        {loading ? (
          <StatePanel loading title="정보를 불러오는 중이에요" />
        ) : hasError ? (
          <StatePanel
            description="잠시 후 다시 시도해주세요."
            onRetry={retry}
            title="정보를 불러오지 못했어요"
          />
        ) : (
          <>
            <View style={reviewStyles.reviewCountRow}>
              <Text style={[reviewStyles.reviewCountLabel, { marginTop: 0 }]}>
                내가 쓴 리뷰 {reviews.length}개
              </Text>
              {reviews.length > 0 ? (
                <Text
                  accessibilityRole="link"
                  onPress={() => router.push('/profile/reviews/all')}
                  style={reviewStyles.viewAllLink}
                >
                  전체보기
                </Text>
              ) : null}
            </View>
            {reviews.length === 0 ? (
              <EmptyReviewCard />
            ) : (
              <ScrollView
                contentContainerStyle={reviewStyles.reviewPreviewContent}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={reviewStyles.reviewPreviewScroll}
              >
                {reviews.map(review => (
                  <ReviewCard
                    contentNumberOfLines={2}
                    key={review.reviewId}
                    onPressMenu={openReviewMenu}
                    review={review}
                    style={[reviewStyles.reviewPreviewCard, { width: windowWidth - 64 }]}
                  />
                ))}
              </ScrollView>
            )}
            {visitedPlaces.length > 0 ? (
              <View style={reviewStyles.visitedSection}>
                <Text style={reviewStyles.reviewCountLabel}>내가 방문한 곳</Text>
                {visitedPlaces.map(place => (
                  <View key={place.placeId} style={reviewStyles.visitedRow}>
                    <View style={reviewStyles.visitedThumbnail}>
                      {place.thumbnailUrl ? (
                        <Image source={{ uri: place.thumbnailUrl }} style={reviewStyles.visitedThumbnailImage} />
                      ) : (
                        <ReviewVectorIcon name="placePlaceholder" size={18} />
                      )}
                    </View>
                    <View style={reviewStyles.visitedBody}>
                      <Text style={reviewStyles.visitedPlaceName}>{place.placeName}</Text>
                      <Text style={reviewStyles.visitedDate}>{place.visitedAt}</Text>
                    </View>
                    {place.hasReview ? null : (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          router.navigate({
                            params: { placeId: String(place.placeId), placeName: place.placeName },
                            pathname: '/profile/reviews/write',
                          })
                        }
                        style={reviewStyles.writeReviewButton}
                      >
                        <Text style={reviewStyles.writeReviewButtonText}>리뷰 작성</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      {toastMessage ? (
        <View pointerEvents="none" style={[reviewStyles.toast, { bottom: insets.bottom + 12 }]}>
          <Text style={reviewStyles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
      {openMenu ? (
        <ReviewActionMenu
          anchor={openMenu.anchor}
          onClose={() => setOpenMenu(null)}
          onDelete={openDeleteConfirmation}
          onEdit={editReview}
        />
      ) : null}
      <ReviewDeleteDialog
        deleting={deleting}
        onClose={() => !deleting && setReviewToDelete(null)}
        onDelete={() => void deleteReview()}
        visible={reviewToDelete !== null}
      />
    </View>
  );
}
