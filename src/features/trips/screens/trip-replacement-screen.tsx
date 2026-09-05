import { useEffect, useState } from 'react';
import { BackHandler, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { categoryLabel } from '../categories';
import { Card, Column, Content, ErrorNotice, Footer, Header, Heading, Muted, Page, PlaceFacts, Row, SmallTitle, Thumbnail } from '../components/ui';
import { useTripEnvironment } from '../context';
import { createReplacementController } from '../flow';
import { errorMessage } from '../provider';

import type { TripItem, TripNearbyResult } from '../types';
export function TripReplacementScreen({ tripId, item, onBack, onComplete }: {
  tripId: number;
  item: TripItem;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { provider } = useTripEnvironment();
  const [controller] = useState(() => createReplacementController(provider, tripId, item.tripItemId));
  const [result, setResult] = useState<TripNearbyResult>();
  const [selected, setSelected] = useState<number>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const insets = useSafeAreaInsets();
  useEffect(() => { const handler = BackHandler.addEventListener('hardwareBackPress', () => controller.busy); return () => handler.remove(); }, [controller]);
  useEffect(() => {
    let active = true; void provider.nearby(item.placeId).then(value => {
      if (active)
        setResult(value);
    }).catch(reason => {
      if (active)
        setError(errorMessage(reason));
    }); return () => { active = false; };
  }, [provider, item.placeId, attempt]);
  const submit = async () => {
    if (!selected || controller.busy)
      return;
    setBusy(true);
    setError('');
    try {
      await controller.submit(selected);
      onComplete();
    }
    catch (reason) {
      setError(errorMessage(reason));
    }
    finally {
      setBusy(false);
    }
  };
  return <Page style={{ paddingTop: insets.top }}>
    <Header title="대체 장소 추천" onBack={() => {
      if (!controller.busy)
        onBack();
    }} />
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <Content>
        <Card>
          <Muted>거절된 장소</Muted>
          <Heading>{item.placeName}</Heading>
          <Text color="primaryPressed" fontSize={14}>
            {item.rejectDetail || item.rejectReason || '방문 거절'}
          </Text>
        </Card>
        <SmallTitle>추천 장소</SmallTitle>
        <ErrorNotice message={error} onRetry={!controller.partial && !busy ? () => { setError(''); setAttempt(value => value + 1); } : undefined} />
        {!result && !error ? <Muted>추천 장소를 불러오는 중…</Muted> : null}

        {result?.places.map(place => <Column key={place.id}>
          {place.distanceMeters !== undefined ? <Text color="primary" fontSize={14}>
            {place.distanceMeters >= 1000 ? `${(place.distanceMeters / 1000).toFixed(1)}km` : `${place.distanceMeters}m`}
          </Text> : null}
          <Row>
            <Thumbnail uri={place.thumbnailUrl} />
            <Column style={{ flex: 1 }}>
              <SmallTitle>{place.name}</SmallTitle>
              {place.category ? <Muted>{categoryLabel(place.category)}</Muted> : null}
                <PlaceFacts place={place} />
              {place.address ? <Muted>{place.address}</Muted> : null}
            </Column>
            <Button accessibilityLabel={`${place.name} 선택`} type="ghost" size="m" disabled={busy || controller.partial} onPress={() => setSelected(place.id)}>
              {selected === place.id ? '●' : '○'}
            </Button>
          </Row>
        </Column>)}

        {result && !result.places.length ? <Column style={{ paddingVertical: 40 }}>
          <Heading>조건에 맞는 장소가 없어요.</Heading>
          {result.expandedRadiusMeters !== null ? <Muted>{result.expandedRadiusMeters}m 범위까지 찾아봤어요.</Muted> : null}
          {result.expandedCount !== null ? <Muted>확장 범위의 장소 {result.expandedCount}곳</Muted> : null}
          <Button type="sub" onPress={() => setAttempt(value => value + 1)}>다시 찾기</Button>
        </Column> : null}

        {controller.partial ? <Text color="primaryPressed" fontSize={14}>
          대체 장소는 추가됐어요. 기존 장소 삭제를 다시 시도해 주세요. 지금 나가면 두 장소가 일정에 남아요.
        </Text> : null}

      </Content>
    </ScrollView>
    <Footer style={{ paddingBottom: Math.max(16, insets.bottom) }}>
      <Button disabled={!selected || busy || controller.uncertain} onPress={submit}>
        {busy ? '변경 중…' : controller.partial ? '기존 장소 삭제 다시 시도' : '여기로 장소 변경'}
      </Button>
    </Footer>
  </Page>;
}
