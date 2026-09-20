import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Toast } from '@/components/ui/toast';

import { TripFlowSheet } from '../components/trip-flow-sheet';
import { tripColors, Card, Center, Column, Content, ErrorNotice, Heading, Muted, Page, Row, Scrim, Sheet, Spread, Thumbnail } from '../components/ui';
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
  const card = (trip: TripSummary) => <Card key={trip.tripId} style={{ borderWidth: 0, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' }}>
    <Spread style={{ alignItems: 'flex-start', gap: 16 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${trip.title} 상세`} onPress={() => onOpenTrip(trip.tripId)} style={{ flex: 1, gap: 8 }}>
        <Text fontSize={16} lineHeight={24} fontWeight="bold" color="textSecondary">{trip.title}</Text>
        <Text color="textTertiary" fontSize={14} lineHeight={20}>{trip.startDate.replaceAll('-', '.')} – {(trip.endDate.slice(0, 4) === trip.startDate.slice(0, 4) ? trip.endDate.slice(5) : trip.endDate).replaceAll('-', '.')}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${trip.title} 삭제`} onPress={() => { setDeleting(trip); setError(''); }} hitSlop={12}>
        <Image source={require('../assets/list-close.svg')} style={{ width: 18, height: 18 }} contentFit="contain" />
      </Pressable>
    </Spread>
    <Pressable accessibilityRole="button" accessibilityLabel={`${trip.title} 장소 보기`} onPress={() => onOpenTrip(trip.tripId)} style={{ gap: 16 }}>
      <Row>
        {trip.thumbnailUrls.slice(0, 4).map((uri, index) => <Thumbnail key={`${uri}-${index}`} uri={uri} size={48} radius={4} />)}
        {trip.totalPlaceCount > 4 ? <View style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: tripColors.surfaceSubtle, justifyContent: 'center', alignItems: 'center' }}><Text fontSize={12} lineHeight={16} fontWeight="semibold" color="textTertiary">+{trip.totalPlaceCount - 4}</Text></View> : null}
        {!trip.thumbnailUrls.length ? <Muted>{trip.totalPlaceCount ? '등록된 장소의 이미지가 없어요' : '장소를 추가해 일정을 완성해 보세요'}</Muted> : null}
      </Row>
      <Column style={{ gap: 8 }}>
        <Spread><Text fontSize={12} lineHeight={16} color="textSecondary">{trip.totalPlaceCount}개 장소</Text><Text fontSize={12} lineHeight={16} color="textTertiary">{trip.visitedPlaceCount}/{trip.totalPlaceCount} 방문완료</Text></Spread>
        <View style={{ height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: tripColors.surfaceSubtle }}><View style={{ height: 4, width: `${trip.totalPlaceCount ? trip.visitedPlaceCount / trip.totalPlaceCount * 100 : 0}%`, backgroundColor: tripColors.primary }} /></View>
      </Column>
    </Pressable>
  </Card>;
  return <Page style={{ paddingTop: insets.top }}>
    <StatusBar style="dark" />
    <Spread style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
      <Text fontSize={24} lineHeight={32} fontWeight="bold">여행</Text>
      <Pressable accessibilityRole="button" onPress={() => setCreating(true)} hitSlop={12}><Text fontSize={16} lineHeight={24}>새 코스 추가</Text></Pressable>
    </Spread>

    <ScrollView refreshControl={<RefreshControl refreshing={snapshot.status === 'loading'} onRefresh={() => { void provider.refresh().catch(() => undefined); }} />} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>

      <Content>
        <ErrorNotice message={snapshot.error} onRetry={() => { void provider.refresh().catch(() => undefined); }} />

        {snapshot.upcomingTrips.length ? <Column style={{ gap: 12 }}><Text fontSize={14} lineHeight={20} fontWeight="semibold" color="textTertiary">예정된 여행</Text>{snapshot.upcomingTrips.map(card)}</Column> : null}

        {snapshot.pastTrips.length ? <Column style={{ marginTop: 32, gap: 12 }}><Text fontSize={14} lineHeight={20} fontWeight="semibold" color="textTertiary">다녀온 여행</Text>{snapshot.pastTrips.map(card)}</Column> : null}

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

    <Toast message={notice} onDismiss={() => setNotice('')} />

  </Page>;
}
