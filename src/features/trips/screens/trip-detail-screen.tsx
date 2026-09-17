import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LikeButton } from '@/components/ui/like-button';
import { Button } from '@/components/ui/button';
import { CourseOrderPin } from '@/components/ui/course-order-pin';
import { Text } from '@/components/ui/text';

import { tagLabel } from '../categories';
import { TripMap } from '../components/trip-map';
import { tripColors, Column, Content, ErrorNotice, Header, Muted, Page, Row, Thumbnail } from '../components/ui';
import { useTripEnvironment, useTripSnapshot } from '../context';
import { completeTripVisit } from '../flow';
import { rejectReasonLabel, visitStatusLabel } from '../visit-status';
import { errorMessage } from '../provider';

import type { TripItem, TripPlaceSelection, TripSavedPort } from '../types';
function Like({ saved, id }: {
  saved: TripSavedPort;
  id: number;
}) {
  const state = useSyncExternalStore(saved.subscribe, saved.getSnapshot, saved.getSnapshot);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const liked = state.placeLikedById[id];
  const disabled = busy || !state.places.loaded;
  return <Column style={{ position: 'absolute', right: 6, top: 6 }}>
    <LikeButton liked={!!liked} variant="photo" busy={busy} disabled={disabled} onPress={async () => {
      if (lock.current)
        return;
      lock.current = true;
      setBusy(true);
      setError('');
      try {
        await saved.togglePlaceLike(id);
      }
      catch (reason) {
        setError(errorMessage(reason));
      }
      finally {
        lock.current = false;
        setBusy(false);
      }
    }} />
    <ErrorNotice message={error} />
  </Column>;
}
export interface TripDetailScreenProps {
  tripId: number;
  onBack: () => void;
  onEdit: () => void;
  onAdd: (day: number) => void;
  onReplace: (item: TripItem) => void;
}
export function TripDetailScreen({ tripId, onBack, onEdit, onAdd, onReplace }: TripDetailScreenProps) {
  const { provider, saved, callbacks } = useTripEnvironment();
  const snapshot = useTripSnapshot(provider);
  const trip = snapshot.details[tripId];
  const [error, setError] = useState('');
  const [places, setPlaces] = useState<TripPlaceSelection[]>([]);
  const [visitBusy, setVisitBusy] = useState<number>();
  const visitLock = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (saved && !saved.getSnapshot().places.loaded) void saved.refresh('places').catch(reason => { if (alive.current) setError(errorMessage(reason)); });
  }, [saved]);
  const reload = () => { setError(''); void provider.loadTrip(tripId).catch(reason => setError(errorMessage(reason))); };
  useEffect(() => {
    let active = true; void provider.loadTrip(tripId).catch(reason => {
      if (active)
        setError(errorMessage(reason));
    }); return () => { active = false; };
  }, [provider, tripId]);
  const ids = trip ? [...new Set(trip.days.flatMap(day => day.items.map(item => item.placeId)))].join(',') : '';
  useEffect(() => {
    let active = true;
    void Promise.allSettled(ids ? ids.split(',').map(id => provider.place(Number(id))) : []).then(results => {
      if (active)
        setPlaces(results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []));
    });
    return () => { active = false; };
  }, [provider, ids, snapshot.sessionRevision]);
  const visit = async (item: TripItem) => {
    if (!callbacks?.onVisit || visitLock.current)
      return;
    visitLock.current = true;
    setVisitBusy(item.tripItemId);
    setError('');
    try {
      const result = await completeTripVisit(provider, { source: provider.source, tripId, tripItemId: item.tripItemId, placeId: item.placeId, placeName: item.placeName }, callbacks.onVisit);
      if (!alive.current)
        return;
      if (result.status === 'completed' && result.outcome === 'REJECTED')
        onReplace({ ...item, visitStatus: result.outcome, rejectReason: result.rejectReason, rejectDetail: result.rejectDetail });
    }
    catch (reason) {
      setError(errorMessage(reason));
    }
    finally {
      visitLock.current = false;
      setVisitBusy(undefined);
    }
  };
  return <Page style={{ paddingTop: insets.top }}>
    <StatusBar style="dark" />
    <Header onBack={onBack} right={<Pressable accessibilityRole="button" disabled={!trip || !!visitBusy} onPress={onEdit} style={{ padding: 8 }}><Text fontSize={16} lineHeight={24}>편집</Text></Pressable>} />
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <Content>
        <ErrorNotice message={error || snapshot.error} onRetry={reload} />
        {!trip ? <Muted>여행을 불러오는 중…</Muted> : <>
          <Text fontSize={20} lineHeight={26} fontWeight="bold">{trip.title}</Text>
          <TripMap key={places.map(place => place.id).join(',')} numbered places={trip.days.flatMap(day => day.items.flatMap(item => { const place = places.find(p => p.id === item.placeId); return place ? [place] : []; }))} onSelect={place => callbacks?.onOpenPlace?.({ source: provider.source, placeId: place.id })} />
          {trip.days.map(day => <Column key={day.day} style={{ gap: 24, marginTop: 24 }}>
            <Row><Text fontSize={18} lineHeight={24} color="primary" fontWeight="bold">DAY {day.day}</Text><Text fontSize={14} lineHeight={20} color="textTertiary">{day.date.replaceAll('-', '.')} {['일', '월', '화', '수', '목', '금', '토'][new Date(`${day.date}T00:00:00Z`).getUTCDay()]}</Text></Row>
            {day.items.map((item, index) => {
              const place = places.find(p => p.id === item.placeId);
              return <Column key={item.tripItemId} style={{ gap: 8 }}>
                <Row style={{ alignItems: 'stretch', gap: 12 }}>
                  <View style={{ width: 32, alignItems: 'center' }}><CourseOrderPin order={index + 1} />{index < day.items.length - 1 && <View style={{ width: 1, flex: 1, marginTop: 6, backgroundColor: tripColors.surfaceSubtle }} />}</View>
                  <View style={{ width: 88, height: 88 }}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`${item.placeName} 상세`} disabled={!callbacks?.onOpenPlace} onPress={() => callbacks?.onOpenPlace?.({ source: provider.source, placeId: item.placeId })}><Thumbnail uri={item.thumbnailUrl} radius={12} /></Pressable>
                    {saved ? <Like saved={saved} id={item.placeId} /> : null}
                  </View>
                  <Column style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text fontSize={14} lineHeight={20} fontWeight="bold" color="textSecondary" numberOfLines={1}>{item.placeName}</Text>
                    {!!place?.tags?.length && <Row style={{ gap: 4, flexWrap: 'wrap' }}>{place.tags.map(tag => <View key={tag} style={{ height: 20, paddingHorizontal: 4, borderRadius: 4, backgroundColor: tripColors.surfaceSubtle, justifyContent: 'center' }}><Text fontSize={11} lineHeight={16.5} fontWeight="semibold" color="textTertiary">{tagLabel(tag)}</Text></View>)}</Row>}
                    <Row style={{ gap: 4, flexWrap: 'wrap' }}>
                      {place?.isOfficial && <Row style={{ gap: 2 }}><Image source={require('../assets/official.svg')} style={{ width: 16, height: 16 }} /><Text fontSize={11} lineHeight={16.5} color="accentBlue" fontWeight="semibold">공식인증</Text></Row>}
                      {place?.visitCount !== undefined && <Row style={{ gap: 2 }}><Image source={require('../assets/user.svg')} style={{ width: 16, height: 16 }} /><Text fontSize={11} lineHeight={16.5} color="textPlaceholder" fontWeight="semibold">유저인증 {place.visitCount}</Text></Row>}
                    </Row>
                    {place?.averageRating !== undefined && <Row style={{ gap: 2 }}><Image source={require('../assets/star.svg')} style={{ width: 8, height: 8 }} /><Text fontSize={10} lineHeight={12} color="textTertiary">{place.averageRating.toFixed(1)}</Text></Row>}
                  </Column>
                  {callbacks?.onVisit && <Pressable accessibilityRole="button" accessibilityLabel={`${item.placeName} 방문여부`} disabled={!!visitBusy} onPress={() => visit(item)} style={{ alignSelf: 'flex-start', height: 28, justifyContent: 'center', paddingHorizontal: 8, borderWidth: 1, borderColor: tripColors.border, borderRadius: 8 }}><Text fontSize={11} lineHeight={16.5} color="textSecondary">{visitBusy === item.tripItemId ? '처리 중…' : item.visitStatus && item.visitStatus !== 'NOT_VISITED' ? visitStatusLabel(item.visitStatus) : '방문여부'}</Text></Pressable>}
                </Row>
                {item.rejectReason ? <Text color="primaryPressed" fontSize={12}>{item.rejectDetail || rejectReasonLabel(item.rejectReason)}</Text> : null}
                {item.visitStatus === 'REJECTED' ? <Button type="sub" size="m" onPress={() => onReplace(item)}>대체 장소 추천</Button> : null}
              </Column>;
            })}
            {!day.items.length ? <Muted>아직 추가한 장소가 없어요.</Muted> : null}
            <Button type="sub" size="m" onPress={() => onAdd(day.day)}>장소 추가</Button>
          </Column>)}
        </>}
      </Content>
    </ScrollView>
  </Page>;
}
