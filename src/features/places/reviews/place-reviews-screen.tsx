import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';

import { usePlaceData, usePlaceEnvironment } from '../detail/environment';
import { PlaceIcon } from '../detail/media';
import { ReviewRatingSummary } from '../detail/sections';
import { placeStyles as s } from '../detail/styles';
import { parsePlaceId } from '../detail/validation';
import { ReviewCard } from './review-card';

import type { PlaceProvider } from '../detail/types';

export function PlaceReviewsView({ placeId, provider, onBack }: { placeId: number; provider: PlaceProvider; onBack(): void }) {
  const insets = useSafeAreaInsets();
  const { data, sessionRevision } = usePlaceData(provider, placeId);
  const resource = data.reviews;
  useEffect(() => { void provider.loadReviews(placeId); }, [provider, placeId, sessionRevision]);
  const feed = resource.data;
  return <View style={[s.root, { paddingTop: insets.top }]}>
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" style={s.tap} onPress={onBack}><PlaceIcon name="back" /></Pressable>
      <Text style={s.heading}>전체 후기</Text><View style={{ width: 44 }} /></View>
    {provider.source === 'mock' && <Text style={[s.small, { textAlign: 'center' }]}>검증용 샘플 데이터</Text>}
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
      {feed && <View style={[s.section, { alignItems: 'center' }]}><ReviewRatingSummary feed={feed} /></View>}
      {resource.error && <View style={{ gap: 12, paddingVertical: 20 }}><Text style={s.error}>{resource.error}</Text>
        <Button type="sub" size="m" disabled={resource.loading} onPress={() => void provider.loadReviews(placeId, resource.page >= 0 && Boolean(feed?.hasNext))}>다시 시도</Button></View>}
      {resource.loading && <ActivityIndicator accessibilityLabel="후기 불러오는 중" />}
      {feed && !feed.items.length && !resource.loading && <Text style={[s.mutedCenter, { paddingVertical: 24 }]}>아직 후기가 없어요.</Text>}
      {feed?.items.map((item, index) => <ReviewCard key={`${item.type}:${item.reviewId ?? index}`} item={item} source={provider.source} />)}
      {feed?.hasNext && <Button type="sub" disabled={resource.loading} onPress={() => void provider.loadReviews(placeId, true)}>후기 더 보기</Button>}
    </ScrollView>
  </View>;
}
export function PlaceReviewsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const id = parsePlaceId(params.id);
  const source = 'real' as const;
  const { provider } = usePlaceEnvironment(source, 'populated');
  const back = () => router.canGoBack() ? router.back() : router.replace('/');
  if (!id || provider.source !== source) return <View style={s.center}><Text style={s.body}>장소 정보가 올바르지 않아요.</Text><Button onPress={back}>돌아가기</Button></View>;
  return <PlaceReviewsView key={`${id}:${source}`} placeId={id} provider={provider} onBack={back} />;
}
