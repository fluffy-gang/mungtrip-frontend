import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

import { MapCanvas } from '@/features/home/components/map-canvas';
import { PlaceCard } from '@/features/home/components/place-card';
import { PlaceIcon } from './media';
import { placeStyles as s } from './styles';
import { errorMessage } from './validation';

import type { Place } from '../types';
import type { NearbyResult, PlaceSource } from './types';

/** Figma shows a small static pinned map under the contact info, not an interactive one; reuses
 * the shared home map canvas with a single marker but blocks touch so a page-scroll gesture that
 * starts over the preview can't pan the map away from its own pin (and so the fixed pin can't
 * drift out of view at all -- this is a preview, not a full map). */
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
    <View style={[s.section, s.wrap]}>{place.tags.map(tag => <View style={s.chip} key={tag}><Text style={s.body}>{tag}</Text></View>)}
      {place.petRestrictions && <Text style={s.body}>{place.petRestrictions}</Text>}
    </View>
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
      {place.isOfficial && <View style={[s.hint, { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
        <PlaceIcon name="official" size={24} /><Text style={s.label}>반려견 공식 인증 장소</Text>
      </View>}
    </View>
    {place.description && <View style={s.section}><Text style={s.heading}>장소 소개</Text><Text style={s.body}>{place.description}</Text></View>}
  </>;
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
