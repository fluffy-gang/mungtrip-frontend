import { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { Column, Content, ErrorNotice, Header, Muted, Page, Row, SmallTitle, Thumbnail } from '../components/ui';
import { useTripEnvironment } from '../context';
import { errorMessage } from '../provider';
import { editFingerprint, positions } from '../validation';

import type { Trip, TripPosition } from '../types';
export function TripEditScreen({ tripId, onBack, onComplete }: {
  tripId: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { provider } = useTripEnvironment();
  const [trip, setTrip] = useState<Trip>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void provider.loadTrip(tripId).then(value => {
      if (active) {
        setTrip(value);
        setError('');
      }
    }).catch(reason => {
      if (active)
        setError(errorMessage(reason));
    });
    return () => { active = false; };
  }, [provider, tripId, attempt]);
  return trip ? <Editor key={`${tripId}-${attempt}-${editFingerprint(trip)}`} trip={trip} onBack={onBack} onComplete={onComplete} onReload={() => setAttempt(value => value + 1)} />
    : <Page>
      <Header title="일정 편집" onBack={onBack} />
      <Content>
        <ErrorNotice message={error} onRetry={() => setAttempt(value => value + 1)} />
        <Muted>일정을 불러오는 중…</Muted>
      </Content>
    </Page>;
}
function Editor({ trip, onBack, onComplete, onReload }: {
  trip: Trip;
  onBack: () => void;
  onComplete: () => void;
  onReload: () => void;
}) {
  const { provider } = useTripEnvironment();
  const [title, setTitle] = useState(trip.title);
  const [items, setItems] = useState(() => positions(trip));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const insets = useSafeAreaInsets();
  useEffect(() => { const subscription = BackHandler.addEventListener('hardwareBackPress', () => lock.current); return () => subscription.remove(); }, []);
  const normalized = (values: TripPosition[]) => trip.days.flatMap(day => values.filter(item => item.day === day.day).map((item, index) => ({ ...item, sortOrder: index + 1 })));
  const move = (item: TripPosition, offset: number) => {
    const dayItems = items.filter(value => value.day === item.day);
    const index = dayItems.findIndex(value => value.tripItemId === item.tripItemId), target = index + offset;
    if (target < 0 || target >= dayItems.length)
      return;
    [dayItems[index], dayItems[target]] = [dayItems[target], dayItems[index]];
    setItems(normalized([...items.filter(value => value.day !== item.day), ...dayItems]));
  };
  const save = async () => {
    if (lock.current)
      return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await provider.update(trip.tripId, { baseline: trip, title, items });
      onComplete();
    }
    catch (reason) {
      setError(errorMessage(reason));
    }
    finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return <Page style={{ paddingTop: insets.top }}>
    <Header title="일정 편집" onBack={() => {
      if (!busy)
        onBack();
    }} right={<Button type="ghost" size="m" disabled={busy} onPress={save}>{busy ? '저장 중…' : '완료'}</Button>} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <Content>
        <TextInputField label="여행 이름" value={title} onChange={setTitle} maxLength={100} disabled={busy} />
        <ErrorNotice message={error} />
        {error ? <Button type="sub" disabled={busy} onPress={onReload}>최신 일정으로 다시 편집</Button> : null}
        <Muted>날짜와 동행 반려견은 생성한 일정에서 변경할 수 없어요.</Muted>

        {trip.days.map(day => <Column key={day.day} style={{ gap: 20 }}>
          <Text color="primary" fontWeight="bold">DAY {day.day}</Text>
          {items.filter(item => item.day === day.day).map((position, index, list) => {
            const item = trip.days.flatMap(value => value.items).find(value => value.tripItemId === position.tripItemId);
            if (!item)
              return null;
            return <Column key={item.tripItemId}>
              <Row>
                <Thumbnail uri={item.thumbnailUrl} size={64} />
                <View style={{ flex: 1 }}><SmallTitle>{item.placeName}</SmallTitle></View>
                <Button type="ghost" size="m" disabled={busy} accessibilityLabel={`${item.placeName} 삭제`} onPress={() => setItems(normalized(items.filter(value => value.tripItemId !== item.tripItemId)))}>
                  ×
                </Button>
              </Row>
              <Row>
                <Button type="sub" size="m" fullWidth={false} disabled={busy || index === 0} accessibilityLabel={`${item.placeName} 위로`} onPress={() => move(position, -1)}>
                  위로
                </Button>
                <Button type="sub" size="m" fullWidth={false} disabled={busy || index === list.length - 1} accessibilityLabel={`${item.placeName} 아래로`} onPress={() => move(position, 1)}>
                  아래로
                </Button>
                {day.day < trip.days.length ? <Button type="ghost" size="m" disabled={busy} onPress={() => setItems(normalized([...items.filter(value => value.tripItemId !== item.tripItemId), { ...position, day: day.day + 1 }]))}>
                  다음 날로
                </Button> : null}
                {day.day > 1 ? <Button type="ghost" size="m" disabled={busy} onPress={() => setItems(normalized([...items.filter(value => value.tripItemId !== item.tripItemId), { ...position, day: day.day - 1 }]))}>
                  이전 날로
                </Button> : null}
              </Row>
            </Column>;
          })}
        </Column>)}
      </Content>
    </ScrollView>
  </Page>;
}
