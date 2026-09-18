import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { TripFlowSheet } from '../components/trip-flow-sheet';
import { tripColors, Card, Center, Column, Content, ErrorNotice, Heading, Muted, Page, Row, Scrim, Sheet, SmallTitle, Spread, Thumbnail } from '../components/ui';
import { useTripEnvironment, useTripSnapshot } from '../context';
import { errorMessage } from '../provider';

import type { TripSummary } from '../types';
export interface TripListScreenProps {
  onOpenTrip: (id: number) => void;
}
export function TripListScreen({ onOpenTrip }: TripListScreenProps) {
  const { provider } = useTripEnvironment();
  const snapshot = useTripSnapshot(provider);
  const insets = useSafeAreaInsets();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TripSummary>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const deleteLock = useRef(false);
  useFocusEffect(useCallback(() => { void provider.refresh().catch(() => undefined); }, [provider]));
  const remove = async () => {
    if (!deleting || deleteLock.current)
      return;
    deleteLock.current = true;
    setBusy(true);
    setError('');
    try {
      await provider.remove(deleting.tripId);
      setDeleting(undefined);
      setNotice('여행 일정이 삭제되었어요.');
    }
    catch (reason) {
      setError(errorMessage(reason));
    }
    finally {
      deleteLock.current = false;
      setBusy(false);
    }
  };
  const card = (trip: TripSummary) => <Card key={trip.tripId} style={{ shadowColor: tripColors.inverse, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 }}>

    <Spread>
      <Pressable accessibilityRole="button" onPress={() => onOpenTrip(trip.tripId)} style={{ flex: 1 }}>
        <SmallTitle>{trip.title}</SmallTitle>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${trip.title} 삭제`} onPress={() => { setDeleting(trip); setError(''); }} hitSlop={12}>
        <Text color="textDisabled" fontSize={18}>×</Text>
      </Pressable>
    </Spread>

    <Pressable accessibilityRole="button" accessibilityLabel={`${trip.title} 상세`} onPress={() => onOpenTrip(trip.tripId)} style={{ gap: 16 }}>

      <Text color="textTertiary" fontSize={14}>
        {trip.startDate.replaceAll('-', '.')} ~
        {trip.endDate.slice(5).replace('-', '.')}
      </Text>

      <Row>
        {trip.thumbnailUrls.slice(0, 4).map((uri, index) => <Thumbnail key={`${uri}-${index}`} uri={uri} size={48} />)}
        {trip.totalPlaceCount > 4 ? <View style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: tripColors.surfaceSubtle, justifyContent: 'center', alignItems: 'center' }}>
          <Muted>+{trip.totalPlaceCount - 4}</Muted>
        </View> : null}
        {!trip.thumbnailUrls.length ? <Muted>{trip.totalPlaceCount ? '등록된 장소의 이미지가 없어요' : '장소를 추가해 일정을 완성해 보세요'}</Muted> : null}
      </Row>

      <Column>
        <Spread>
          <Text fontSize={12}>{trip.totalPlaceCount}개 장소</Text>
          <Muted>{trip.visitedPlaceCount}/{trip.totalPlaceCount} 방문완료</Muted>
        </Spread>
        <View style={{ height: 4, backgroundColor: tripColors.surfaceSubtle }}>
          <View style={{ height: 4, width: `${trip.totalPlaceCount ? trip.visitedPlaceCount / trip.totalPlaceCount * 100 : 0}%`, backgroundColor: tripColors.primary }} />
        </View>
      </Column>

    </Pressable>

  </Card>;
  return <Page style={{ paddingTop: insets.top }}>
    <Spread style={{ paddingHorizontal: 20, minHeight: 64 }}>
      <Heading>여행</Heading>
      <Button type="ghost" size="m" onPress={() => setCreating(true)}>새 코스 추가</Button>
    </Spread>

    <ScrollView refreshControl={<RefreshControl refreshing={snapshot.status === 'loading'} onRefresh={() => { void provider.refresh().catch(() => undefined); }} />} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>

      <Content>
        <ErrorNotice message={snapshot.error} onRetry={() => { void provider.refresh().catch(() => undefined); }} />
        {notice ? <Pressable onPress={() => setNotice('')} accessibilityRole="button">
          <Text color="primary" accessibilityLiveRegion="polite">{notice}</Text>
        </Pressable> : null}

        {snapshot.upcomingTrips.length ? <Column><Muted>예정된 여행</Muted>{snapshot.upcomingTrips.map(card)}</Column> : null}

        {snapshot.pastTrips.length ? <Column style={{ marginTop: 24 }}><Muted>다녀온 여행</Muted>{snapshot.pastTrips.map(card)}</Column> : null}

      </Content>

      {snapshot.loaded && !snapshot.upcomingTrips.length && !snapshot.pastTrips.length ? <Center>
        <Heading>아직 여행 코스가 없어요</Heading>
        <Muted>찜한 장소를 모아 나만의 반려견 제주 코스를 만들어보세요.</Muted>
        <Button fullWidth={false} onPress={() => setCreating(true)}>첫 여행 만들기</Button>
      </Center> : null}

    </ScrollView>

    <TripFlowSheet visible={creating} input={{ mode: 'create', source: provider.source }} provider={provider} onResult={result => {
      setCreating(false); if (result.status === 'completed')
        onOpenTrip(result.tripId);
    }} />

    <Modal visible={!!deleting} transparent animationType="fade" onRequestClose={() => {
      if (!busy)
        setDeleting(undefined);
    }}>
      <Scrim style={{ justifyContent: 'center', padding: 24 }}>
        <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} accessibilityRole="button" accessibilityLabel="삭제 취소" onPress={() => { if (!busy) setDeleting(undefined); }} />
        <Sheet style={{ borderRadius: 24 }}>
          <Heading>이 여행을 삭제할까요?</Heading>
          <Muted>삭제 후에는 복구나 재작성이 불가능해요.</Muted>
          <ErrorNotice message={error} />
          <Row>
            <View style={{ flex: 1 }}>
              <Button type="sub" disabled={busy} onPress={() => setDeleting(undefined)}>취소</Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button type="sub" labelStyle={{ color: tripColors.danger }} disabled={busy} onPress={remove}>{busy ? '삭제 중…' : '삭제'}</Button>
            </View>
          </Row>
        </Sheet>
      </Scrim>
    </Modal>

  </Page>;
}
