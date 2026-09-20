import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showDialog } from '@/components/ui/dialog';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { EmptyReviewCard } from '../components/empty-review-card';
import { ReviewActionMenu, ReviewDeleteDialog } from '../components/review-manage-dialog';
import { ReviewCard } from '../components/review-card';
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

export function AllReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasError, loading, retry, reviews } = useReviews();
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
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <ScreenHeader onBack={() => router.back()} title={openMenu ? '리뷰 관리' : '전체 리뷰'} />
        <Text style={reviewStyles.reviewCountLabel}>내가 쓴 리뷰 {reviews.length}개</Text>
        {loading ? (
          <StatePanel loading title="리뷰를 불러오는 중이에요" />
        ) : hasError ? (
          <StatePanel
            description="잠시 후 다시 시도해주세요."
            onRetry={retry}
            title="리뷰를 불러오지 못했어요"
          />
        ) : reviews.length === 0 ? (
          <EmptyReviewCard />
        ) : (
          <View style={reviewStyles.reviewList}>
            {reviews.map(review => (
              <ReviewCard
                contentNumberOfLines={2}
                key={review.reviewId}
                onPressMenu={openReviewMenu}
                review={review}
              />
            ))}
          </View>
        )}
      </ScrollView>
      {toastMessage ? (
        <View pointerEvents="none" style={[reviewStyles.toast, { bottom: insets.bottom + 100 }]}>
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
