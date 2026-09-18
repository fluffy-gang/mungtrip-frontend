import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextInputField } from '@/components/ui/input';

import { categoryLabel, TRIP_CATEGORIES } from '../categories';
import { TripFlowSheet } from '../components/trip-flow-sheet';
import { TripMap } from '../components/trip-map';
import { Chip, Column, Content, ErrorNotice, Footer, Muted, Page, PlaceFacts, Row, SmallTitle, Spread, Thumbnail } from '../components/ui';
import { useTripEnvironment, useTripSnapshot } from '../context';
import { createPlaceQueryController, createPlaceSelection } from '../selection';

import type { TripPlaceSelection, TripSearchResult } from '../types';
export function TripPlacePickerScreen({ tripId, day = 1, onBack, onComplete }: {
  tripId?: number;
  day?: number;
  onBack: () => void;
  onComplete: (id: number) => void;
}) {
  const { provider, saved } = useTripEnvironment();
  const snapshot = useTripSnapshot(provider);
  const [query] = useState(createPlaceQueryController);
  const data = useSyncExternalStore(query.subscribe, query.getSnapshot, query.getSnapshot);
  const [selection] = useState(createPlaceSelection);
  const [selected, setSelected] = useState<TripPlaceSelection[]>([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [tab, setTab] = useState<'saved' | 'recommended' | 'recent'>(saved ? 'saved' : 'recommended');
  const [dogIds, setDogIds] = useState<number[]>([]);
  const [dogsOpen, setDogsOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [targetTripId, setTargetTripId] = useState(tripId);
  const [targetDay, setTargetDay] = useState(day);
  const [savedRevision, setSavedRevision] = useState(0);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  useEffect(() => saved?.subscribe(() => {
    const { status } = saved.getSnapshot().places;
    // 로딩 알림으로 검색을 재시작하면 아직 미완료인 저장 목록을 중복 요청한다.
    if (status !== 'loading' && status !== 'refreshing') setSavedRevision(value => value + 1);
  }), [saved]);
  useEffect(() => { void provider.refreshOptions().catch(() => undefined); }, [provider]);
  const request = useCallback(async (page: number): Promise<TripSearchResult> => {
    if (keyword.trim())
      return provider.search({ keyword: keyword.trim(), category: category || undefined, dogIds, page, size: 20 });
    if (tab === 'recommended')
      return provider.recommendations(category || undefined);
    if (tab === 'recent')
      return provider.recent(category || undefined);
    if (!saved)
      throw new Error('저장 목록을 연결하지 못했어요.');
    const state = saved.getSnapshot();
    if (!state.places.loaded)
      await saved.refresh('places');
    const latest = saved.getSnapshot();
    if (latest.places.error)
      throw new Error(latest.places.error);
    const places = latest.places.items.filter(place => !category || place.category === category).map(place => ({ ...place, thumbnailUrl: place.imageUrl }));
    return { places, page: 0, size: Math.max(1, places.length), totalCount: places.length };
  }, [provider, saved, keyword, category, dogIds, tab]);
  useEffect(() => { const timer = setTimeout(() => { void query.load(request); }, keyword ? 250 : 0); return () => { clearTimeout(timer); query.invalidate(); }; }, [query, request, savedRevision, keyword, snapshot.sessionRevision]);
  const toggle = (place: TripPlaceSelection) => setSelected(selection.toggle(place));
  return <Page style={{ paddingTop: insets.top }}>
    <Row style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={() => { selection.cancel(); onBack(); }} hitSlop={12}><Icon name="chevronLeft" size={24} /></Pressable>
      <View style={{ flex: 1 }}><TextInputField value={keyword} onChange={setKeyword} placeholder="어디로 방문 예정인가요?" returnKeyType="search" /></View>
    </Row>

    <ScrollView horizontal style={{ height: 56, flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
      <Chip selected={!!dogIds.length} onPress={() => setDogsOpen(value => !value)}>
        반려견
        {dogIds.length || ''}
      </Chip>
      {TRIP_CATEGORIES.map(([code, name]) => <Chip key={code} selected={category === code} onPress={() => setCategory(code)}>{name}</Chip>)}
    </ScrollView>

    {dogsOpen ? <Content>
      <Row style={{ flexWrap: 'wrap' }}>
        {snapshot.dogs.map(dog => <Chip key={dog.dogId} selected={dogIds.includes(dog.dogId)} onPress={() => setDogIds(ids => ids.includes(dog.dogId) ? ids.filter(id => id !== dog.dogId) : [...ids, dog.dogId])}>
          {dog.name}
        </Chip>)}
      </Row>
      <Muted>반려견 조건은 검색 결과에 적용돼요.</Muted>
    </Content> : null}

    {!keyword ? <TripMap key={`${tab}-${category}-${data.places.map(place => place.id).join(',')}`} places={data.places} height={Math.min(240, height * 0.28)} onSelect={toggle} /> : null}

    <Row style={{ padding: 20 }}>
      {(['saved', 'recommended', 'recent'] as const).map((value, index) => <Chip key={value} selected={tab === value} onPress={() => setTab(value)}>
        {['찜한 장소', '추천 장소', '최근 본 장소'][index]}
      </Chip>)}
    </Row>



    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 20 }}>
      <ErrorNotice message={data.error} onRetry={() => { void query.load(request); }} />
      {data.loading ? <Muted>장소를 불러오는 중…</Muted> : null}
      {!data.loading && !data.error && !data.places.length ? <Column style={{ paddingVertical: 32 }}>
        <SmallTitle>조건에 맞는 장소가 없어요.</SmallTitle>
        <Muted>검색어나 조건을 변경해 보세요.</Muted>
      </Column> : null}

      {data.places.map(place => <Row key={place.id} style={{ alignItems: 'flex-start' }}>
        <Thumbnail uri={place.thumbnailUrl} />
        <Column style={{ flex: 1, gap: 6 }}>
          <Spread>
            <SmallTitle style={{ flex: 1 }}>{place.name}</SmallTitle>
            <Button type="sub" size="m" fullWidth={false} onPress={() => toggle(place)}>
              {selected.some(item => item.id === place.id) ? '✓ 선택됨' : '＋ 선택'}
            </Button>
          </Spread>
          {place.category ? <Muted>{categoryLabel(place.category)}</Muted> : null}
                <PlaceFacts place={place} />
          {place.address ? <Muted>{place.address}</Muted> : null}
        </Column>
      </Row>)}

      {data.hasMore && !!keyword ? <Button type="sub" disabled={data.loading} onPress={() => { void query.load(request, true); }}>
        더 보기
      </Button> : null}

    </ScrollView>
    <Footer style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
    {selected.length ? <ScrollView horizontal style={{ height: 44, flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ gap: 8 }}>
      {selected.map(place => <Chip key={place.id} selected onPress={() => toggle(place)}>{place.name} ×</Chip>)}
    </ScrollView> : null}
      <Button disabled={!selected.length} onPress={() => setConfirming(true)}>
        {selected.length ? `${selected.length}개 장소 추가` : '장소를 선택해 주세요'}
      </Button>
    </Footer>

    <TripFlowSheet visible={confirming} provider={provider} input={{ mode: 'add', source: provider.source, tripId: targetTripId, day: targetDay, selection: { kind: 'place', places: selected } }} onResult={result => {
      setConfirming(false);
      if (result.status === 'cancelled' && result.createdTripId) { setTargetTripId(result.createdTripId); setTargetDay(1); }
      if (result.status === 'completed') {
        selection.cancel();
        setSelected([]);
        onComplete(result.tripId);
      }
    }} />

  </Page>;
}
