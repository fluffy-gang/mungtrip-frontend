import { useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOTTOM_TAB_HEIGHT, BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { StatePanel } from '@/components/ui/state-panel';

import { ReviewCard } from '../components/review-card';
import { MOCK_VISITED_PLACES } from '../mock/reviews';
import { useReviewsMockStore } from '../mock/reviews-store';
import { reviewStyles } from '../review-styles';
import { styles } from '../styles';

const showComingSoon = () => {
  Alert.alert('아직 지원되지 않는 기능이에요', '곧 만나보실 수 있어요.');
};

export function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reviews = useReviewsMockStore(state => state.reviews);
  const bottomTabHeight = insets.bottom + BOTTOM_TAB_HEIGHT;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomTabHeight + 16 }]}
      >
        <ScreenHeader onBack={() => router.back()} title="방문 장소/리뷰" />

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
          <StatePanel
            description="다음 여행에서 다녀간 곳을 기록해보세요"
            icon={{ android: 'chat_bubble_outline', ios: 'bubble.left', web: 'chat_bubble_outline' }}
            title="아직 작성한 리뷰가 없어요"
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={reviewStyles.reviewPreviewScroll}
          >
            {reviews.map(review => (
              <ReviewCard
                contentNumberOfLines={2}
                key={review.id}
                onPressMenu={() => router.push('/profile/reviews/all')}
                review={review}
                style={reviewStyles.reviewPreviewCard}
              />
            ))}
          </ScrollView>
        )}

        {MOCK_VISITED_PLACES.length > 0 ? (
          <View style={reviewStyles.visitedSection}>
            <Text style={reviewStyles.reviewCountLabel}>내가 방문한 곳</Text>
            {MOCK_VISITED_PLACES.map(place => (
              <View key={place.id} style={reviewStyles.visitedRow}>
                <View style={reviewStyles.visitedBody}>
                  <Text style={reviewStyles.visitedPlaceName}>{place.placeName}</Text>
                  <Text style={reviewStyles.visitedDate}>{place.visitedAt}</Text>
                </View>
                <Button fullWidth={false} onPress={showComingSoon} size="m" type="sub">
                  리뷰 작성
                </Button>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
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
