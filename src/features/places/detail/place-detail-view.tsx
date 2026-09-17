import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';

import { ImageViewer } from '../reviews/image-viewer';
import { ReviewCard } from '../reviews/review-card';
import { PlaceVisitFlowSheet } from '../visits';
import { usePlaceData } from './environment';
import { DetailHeader, DetailHero } from './hero';
import { MOCK_HERO, PlaceIcon } from './media';
import { NearbyPlaces, PlaceFootnotes, PlaceInformation } from './sections';
import { colors, placeStyles as s } from './styles';
import { usePlaceActions } from './use-actions';
import { displayImageUri } from './validation';

import type { PlaceIntegration } from './environment';
import type { PhotoSource } from './media';
import type { FixtureScenario, PlaceProvider } from './types';

export interface PlaceDetailViewProps {
  placeId: number;
  provider: PlaceProvider;
  scenario?: FixtureScenario;
  integration: PlaceIntegration;
  onBack(): void;
  onReviews(): void;
  onPlace(id: number): void;
}
/** Route-independent view also used by the native fixture; all writes use the supplied provider. */
export function PlaceDetailView({ placeId, provider, scenario, integration, onBack, onReviews, onPlace }: PlaceDetailViewProps) {
  const insets = useSafeAreaInsets();
  const { data, sessionRevision } = usePlaceData(provider, placeId);
  const place = data.detail.data;
  const actions = usePlaceActions(place, provider.source, integration);
  const [solid, setSolid] = useState(false);
  const [viewer, setViewer] = useState<number>();
  const [visitOpen, setVisitOpen] = useState(false);
  useEffect(() => {
    void provider.loadDetail(placeId);
    void provider.loadReviews(placeId);
    void provider.loadNearby(placeId);
  }, [placeId, provider, sessionRevision]);
  const remoteImages = (place?.images?.length ? place.images : place?.imageUrl ? [place.imageUrl] : [])
    .filter(displayImageUri).map(uri => ({ uri }));
  const images: PhotoSource[] = provider.source === 'mock' && !remoteImages.length
    ? scenario === 'missing-image' || scenario === 'empty' ? [] : [MOCK_HERO, MOCK_HERO, MOCK_HERO]
    : remoteImages;
  const feed = data.reviews.data;
  return <View style={s.root}>
    {!place ? <View style={[s.center, { paddingTop: insets.top + 48 }]}>
      {data.detail.error ? <><Text accessibilityRole="alert" style={s.error}>{data.detail.error}</Text>
        <Button disabled={data.detail.loading} onPress={() => void provider.loadDetail(placeId)}>다시 시도</Button></>
        : <ActivityIndicator accessibilityLabel="장소 불러오는 중" />}
    </View> : <>
      <ScrollView onScroll={event => setSolid(event.nativeEvent.contentOffset.y > 240)} scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: 24 }}>
        <DetailHero images={images} onImage={setViewer} />
        <View style={{ paddingHorizontal: 20 }}>
          {provider.source === 'mock' && <View style={[s.between, s.hint, { marginTop: 12 }]}>
            <Text style={s.small}>검증용 샘플 데이터 · {scenario ?? 'populated'}</Text>
            <Pressable accessibilityRole="button" onPress={() => provider.resetForSession()} style={s.tap}><Text style={s.link}>초기화</Text></Pressable>
          </View>}
          <View style={s.section}>
            {place.recentVisitedCount !== undefined && <View style={s.row}>
              <PlaceIcon name="users" size={18} />
              <Text style={[s.body, { color: colors.textSecondary }]}><Text style={s.link}>최근 7일 </Text>{place.recentVisitedCount}명이 방문인증했어요</Text>
            </View>}
            <View style={s.between}><Text style={[s.title, s.grow]}>{place.name}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="내 여행에 추가" disabled={!actions.canTrip || actions.busy}
                style={[s.tap, s.chip, s.row, { opacity: actions.canTrip ? 1 : 0.4 }]} onPress={() => void actions.trip()}>
                <PlaceIcon name="plus" size={16} /><Text style={s.label}>내 여행</Text></Pressable></View>
            <Text style={s.muted}>{place.categoryName}</Text>
            <View style={s.statRow}>
              {place.rating !== undefined && <View style={s.statColumn}>
                <Text style={s.heading}>{place.rating.toFixed(2)}</Text>
                <View style={s.row}>{Array.from({ length: 5 }, (_, i) => (
                  <PlaceIcon key={i} name="star" size={14} />
                ))}</View>
              </View>}
              {place.isOfficial && <View style={s.statColumn}>
                <PlaceIcon name="official" size={20} />
                <Text style={[s.small, s.statLabel]}>사장님{`\n`}공식 인증</Text>
              </View>}
              {place.verifiedCount !== undefined && <View style={s.statColumn}>
                <Text style={s.heading}>{place.verifiedCount}명</Text>
                <Text style={s.small}>방문 인증</Text>
              </View>}
            </View>
          </View>
          <PlaceInformation place={place} onError={actions.setMessage} />
          <View style={s.section}>
            <View style={s.between}><Text style={s.heading}>방문 후기</Text><Pressable accessibilityRole="button" onPress={onReviews} style={s.tap}><Text style={s.link}>전체 보기</Text></Pressable></View>
            {feed && <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <View style={s.row}><PlaceIcon name="star" size={32} /><Text style={s.reviewRatingValue}>{(feed.averageRating ?? 0).toFixed(2)}</Text></View>
                <View style={s.row}><PlaceIcon name="users" size={20} /><Text style={s.label}><Text style={{ color: colors.primary }}>{feed.visitedCount ?? 0}명</Text> 방문인증</Text></View>
              </View>
              <Text style={s.reviewCaption}>반려견과 함께 정상적으로{`\n`}매장 방문을 인증한 사용자들의 후기예요.</Text>
            </View>}
            {data.reviews.loading && <ActivityIndicator accessibilityLabel="후기 불러오는 중" />}
            {data.reviews.error && <><Text style={s.error}>{data.reviews.error}</Text><Button type="sub" disabled={data.reviews.loading} onPress={() => void provider.loadReviews(placeId)}>후기 다시 불러오기</Button></>}
            {feed && !feed.items.length && <Text style={s.muted}>아직 후기가 없어요. 첫 방문 후기를 남겨 주세요.</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              {feed?.items.slice(0, 3).map((item, index) => <View key={`${item.type}:${item.reviewId ?? index}`} style={{ width: 240 }}><ReviewCard item={item} source={provider.source} compact /></View>)}
            </ScrollView>
            <Button type="sub" onPress={() => setVisitOpen(true)}>방문 체크하고 후기 남기기</Button>
          </View>
          {data.nearby.loading && <ActivityIndicator accessibilityLabel="주변 장소 불러오는 중" />}
          {data.nearby.error && <View style={s.section}><Text style={s.error}>{data.nearby.error}</Text><Button type="sub" onPress={() => void provider.loadNearby(placeId)}>주변 장소 다시 불러오기</Button></View>}
          {data.nearby.data && <NearbyPlaces result={data.nearby.data} onPlace={onPlace} onExpand={() => void provider.loadNearby(placeId, data.nearby.data?.expandedRadiusMeters ?? 5000)} />}
          <PlaceFootnotes source={provider.source} />
        </View>
      </ScrollView>
      <View style={[s.fixedBottom, { paddingBottom: Math.max(12, insets.bottom) }]}>
        {actions.message && <Text accessibilityRole="alert" style={s.small}>{actions.message}</Text>}
        {!actions.canTrip && <Text style={s.small}>여행 추가는 여행 기능 연결 후 사용할 수 있어요.</Text>}
        <View style={s.row}><View style={s.grow}><Button type="sub" onPress={() => setVisitOpen(true)}>방문 체크</Button></View>
          <View style={{ flex: 2 }}><Button disabled={!actions.canTrip || actions.busy} onPress={() => void actions.trip()}>내 여행에 추가</Button></View></View>
      </View>
    </>}
    <DetailHeader title={place?.name ?? '장소 상세'} top={insets.top} solid={solid || !place} liked={actions.liked}
      disabled={!place || !actions.canSave || actions.busy} onBack={onBack} onShare={() => void actions.share()} onLike={() => void actions.toggle()} />
    {viewer !== undefined && <ImageViewer images={images} initialIndex={viewer} onClose={() => setViewer(undefined)} />}
    <PlaceVisitFlowSheet visible={visitOpen} provider={provider} input={{ source: provider.source, placeId, placeName: place?.name }}
      onResult={result => { setVisitOpen(false); if (result.status === 'completed') actions.setMessage(result.outcome === 'VISITED' ? '방문 체크를 저장했어요.' : '거절 기록을 저장했어요.'); integration.onVisitResult?.(result); }} />
  </View>;
}
