import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { categoryLabel } from '../categories';
import { TripMap } from '../components/trip-map';
import { tripColors, Column, Content, ErrorNotice, Header, Heading, Muted, Page, PlaceFacts, Row, SmallTitle, Spread, Thumbnail } from '../components/ui';
import { useTripEnvironment, useTripSnapshot } from '../context';
import { completeTripVisit } from '../flow';
import { visitStatusLabel } from '../visit-status';
import { formatDate } from '../date-utils';
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
  return <Column>
    <Pressable accessibilityRole="button" accessibilityLabel={liked ? '저장 해제' : '장소 저장'} disabled={busy} onPress={async () => {
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
    }}>
      <Text fontSize={18} color={liked ? 'primary' : 'textTertiary'}>{liked ? '♥' : '♡'}</Text>
    </Pressable>
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
    <Header onBack={onBack} right={<Button type="ghost" size="m" disabled={!trip || !!visitBusy} onPress={onEdit}>편집</Button>} />
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <Content>
        <ErrorNotice message={error || snapshot.error} onRetry={reload} />
        {!trip ? <Muted>여행을 불러오는 중…</Muted> : <><Heading>{trip.title}</Heading><TripMap key={places.map(place => place.id).join(',')} places={places} onSelect={place => callbacks?.onOpenPlace?.({ source: provider.source, placeId: place.id })} />
          {trip.days.map(day => <Column key={day.day} style={{ gap: 24, marginTop: 24 }}>
            <Row>
              <Text color="primary" fontWeight="bold">DAY {day.day}</Text>
              <Muted>{formatDate(day.date)}</Muted>
            </Row>

            {day.items.map((item, index) => <Column key={item.tripItemId}>
              <Row style={{ alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 24, alignItems: 'center' }}>
                  <Icon name="paw" size={28} tintColor={tripColors.primary} />
                  <Text color="primary" fontSize={12}>{index + 1}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`${item.placeName} 상세`} disabled={!callbacks?.onOpenPlace} onPress={() => callbacks?.onOpenPlace?.({ source: provider.source, placeId: item.placeId })}>
                  <Thumbnail uri={item.thumbnailUrl} />
                </Pressable>
                <Column style={{ flex: 1, gap: 6 }}>
                  <Spread>
                    <SmallTitle style={{ flex: 1 }}>{item.placeName}</SmallTitle>
                    {saved ? <Like saved={saved} id={item.placeId} /> : null}
                  </Spread>
                  {item.category ? <Muted>{categoryLabel(item.category)}</Muted> : null}
                  <PlaceFacts place={places.find(place => place.id === item.placeId)} />
                  <Muted>
                    {visitStatusLabel(item.visitStatus)}
                  </Muted>
                  {callbacks?.onVisit ? <Button type="sub" size="m" disabled={!!visitBusy} onPress={() => visit(item)}>
                    {visitBusy === item.tripItemId ? '처리 중…' : '방문여부'}
                  </Button> : null}
                </Column>
              </Row>
              {item.rejectReason ? <Text color="primaryPressed" fontSize={12}>{item.rejectDetail || item.rejectReason}</Text> : null}
              {item.visitStatus === 'REJECTED' ? <Button type="sub" size="m" onPress={() => onReplace(item)}>대체 장소 추천</Button> : null}
            </Column>)}

            {!day.items.length ? <Muted>아직 추가한 장소가 없어요.</Muted> : null}
            <Button type="sub" size="m" onPress={() => onAdd(day.day)}>장소 추가</Button>

          </Column>)}</>}
      </Content>
    </ScrollView>
  </Page>;
}
