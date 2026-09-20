import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

import { MapCanvas } from '../../home/components/map-canvas';
import { PlaceCard } from '@/features/home/components/place-card';
import { PlaceIcon } from './media';
import { colors, placeStyles as s } from './styles';
import { errorMessage } from './validation';

import type { Place } from '../types';
import type { NearbyResult, PlaceSource, ReviewFeed } from './types';

export function PlaceMapPreview({ place }: { place: Place }) {
  if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return null;
  const latitude = place.latitude as number;
  const longitude = place.longitude as number;
  return <View style={{ height: 160, borderRadius: 12, overflow: 'hidden' }} pointerEvents="none">
    <MapCanvas
      mapCamera={{ latitude, longitude, zoom: 15 }}
      onSelectPlace={() => undefined}
      places={[place]}
      setMapBounds={() => undefined}
      setMapCamera={() => undefined}
      userCoordinate={null}
    />
  </View>;
}

export function PlaceInformation({ place, onError }: { place: Place; onError(message: string): void }) {
  const open = async (url: string, phone = false) => {
    try {
      if (phone ? !/^tel:\+?[\d\s()-]+$/.test(url) : !/^https?:\/\//i.test(url)) throw new Error('연결 주소가 올바르지 않아요.');
      if (!await Linking.canOpenURL(url)) throw new Error('연결할 앱을 찾지 못했어요.');
      await Linking.openURL(url);
    } catch (cause) { onError(errorMessage(cause)); }
  };
  return <>
    {(place.tags.length > 0 || place.petRestrictions) && <View style={s.section}>
      <View style={s.wrap}>{place.tags.map(tag => <View style={s.chip} key={tag}><Text style={s.body}>{tag}</Text></View>)}</View>
      {place.petRestrictions && <Text style={s.body}>{place.petRestrictions}</Text>}
    </View>}
    <View style={s.section}>
      <View style={s.row}><PlaceIcon name="pin" size={20} /><Text style={[s.body, s.grow]}>{[place.address, place.detailAddress].filter(Boolean).join(' ')}</Text></View>
      <View style={s.row}><PlaceIcon name="clock" size={20} /><View style={s.grow}>
        {place.operationStatus === 'OPEN' && <Text style={s.link}>영업중</Text>}
        {place.businessHourEntries?.length ? place.businessHourEntries.map((hour, index) => <Text key={index} style={s.body}>{hour.day} {hour.open}–{hour.close}</Text>)
          : <Text style={s.muted}>{place.businessHours || '영업시간 정보가 없어요'}</Text>}
      </View></View>
      {place.phoneNumber && <Pressable style={s.row} accessibilityRole="link" accessibilityLabel="매장에 전화하기" onPress={() => void open(`tel:${place.phoneNumber}`, true)}>
        <PlaceIcon name="phone" size={20} /><Text style={s.body}>{place.phoneNumber}</Text>
      </Pressable>}
      {place.homepageUrl && <Pressable accessibilityRole="link" onPress={() => void open(place.homepageUrl ?? '')}><Text style={s.link}>홈페이지 열기</Text></Pressable>}
      <PlaceMapPreview place={place} />
    </View>
    {place.description && <View style={s.section}><Text style={s.heading}>사장님 공지</Text><Text style={s.body}>{place.description}</Text></View>}
  </>;
}
export function ReviewRatingSummary({ feed }: { feed: ReviewFeed }) {
  return <View style={{ alignItems: 'center', gap: 12 }}>
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={s.row}><PlaceIcon name="star" size={32} /><Text style={s.reviewRatingValue}>{(feed.averageRating ?? 0).toFixed(2)}</Text></View>
      <View style={s.row}><PlaceIcon name="users" size={20} /><Text style={s.label}><Text style={{ color: colors.primary }}>{feed.visitedCount ?? 0}명</Text> 방문인증</Text></View>
    </View>
    <Text style={s.reviewCaption}>반려견과 함께 정상적으로{`\n`}매장 방문을 인증한 사용자들의 후기예요.</Text>
  </View>;
}
export function PlaceFootnotes({ source }: { source: PlaceSource }) {
  return <View style={{ gap: 24, paddingVertical: 24 }}>
    {source === 'mock' && <View style={{ gap: 8 }}><Text style={s.heading}>데이터 출처</Text>
      <Text style={s.small}>공식 사장님 인증 · 한국관광공사 공공데이터 · 사용자 방문 제보</Text>
      <Text style={s.small}>검증용 예시이며 실제 장소 인증 이력이 아니에요.</Text></View>}
    <Text style={s.heading}>유의사항</Text>
    <Text style={s.small}>반려견 동반 조건과 영업시간은 현장 상황에 따라 달라질 수 있어요. 방문 전에 매장에 확인해 주세요. 목줄과 배변봉투를 준비하고, 매장 직원의 안내를 따라 주세요.</Text>
  </View>;
}
export function NearbyPlaces({ result, onPlace, onExpand }: { result: NearbyResult; onPlace(id: number): void; onExpand(): void }) {
  return <View style={s.section}><Text style={s.heading}>여기와 비슷한 장소</Text>
    {!result.places.length && <Text style={s.muted}>가까운 장소가 없어요.</Text>}
    {result.places.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
      {result.places.map(place => <PlaceCard key={place.id} onPress={selected => onPlace(selected.id)} place={place} />)}
    </ScrollView>}
    {!result.places.length && (result.expandedCount ?? 0) > 0 && <Button type="sub" onPress={onExpand}>5km 안의 장소 {result.expandedCount}곳 보기</Button>}
  </View>;
}
