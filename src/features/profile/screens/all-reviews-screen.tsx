import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOTTOM_TAB_HEIGHT, BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { ReviewCard } from '../components/review-card';
import type { MockReview } from '../mock/reviews';
import { useReviewsMockStore } from '../mock/reviews-store';
import { styles } from '../styles';

const showComingSoon = () => {
  Alert.alert('아직 지원되지 않는 기능이에요', '곧 만나보실 수 있어요.');
};

export function AllReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reviews = useReviewsMockStore(state => state.reviews);
  const removeReview = useReviewsMockStore(state => state.removeReview);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const bottomTabHeight = insets.bottom + BOTTOM_TAB_HEIGHT;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const confirmDeleteReview = (review: MockReview) => {
    Alert.alert('리뷰를 삭제할까요?', '삭제 후엔 복구나 재작성이 불가능해요.', [
      { style: 'cancel', text: '취소' },
      {
        style: 'destructive',
        text: '삭제',
        onPress: () => {
          removeReview(review.id);
          showToast('리뷰가 삭제되었어요');
        },
      },
    ]);
  };

  const openReviewMenu = (review: MockReview) => {
    Alert.alert(review.placeName, undefined, [
      { style: 'cancel', text: '취소' },
      { onPress: showComingSoon, text: '수정하기' },
      { onPress: () => confirmDeleteReview(review), style: 'destructive', text: '삭제하기' },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomTabHeight + 16 }]}
      >
        <ScreenHeader onBack={() => router.back()} title="전체 리뷰" />
        <Text style={styles.reviewCountLabel}>내가 쓴 리뷰 {reviews.length}개</Text>

        {reviews.length === 0 ? (
          <StatePanel
            description="다음 여행에서 다녀간 곳을 기록해보세요"
            icon={{ android: 'chat_bubble_outline', ios: 'bubble.left', web: 'chat_bubble_outline' }}
            title="아직 작성한 리뷰가 없어요"
          />
        ) : (
          <View style={styles.section}>
            {reviews.map(review => (
              <ReviewCard key={review.id} onPressMenu={openReviewMenu} review={review} />
            ))}
          </View>
        )}
      </ScrollView>
      {toastMessage ? (
        <View style={[styles.toast, { bottom: bottomTabHeight + insets.bottom + 12 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
      <BottomTabBar
        active="profile"
        height={bottomTabHeight}
        onPressHome={() => router.push('/')}
        onPressProfile={() => router.push('/profile')}
        paddingBottom={insets.bottom}
      />
    </View>
  );
}
