import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { useTripSnapshot } from '../context';
import { addDays, formatDate } from '../date-utils';
import { createTripFlowController } from '../flow';
import { errorMessage } from '../provider';
import { TripCalendar } from './trip-calendar';
import { tripColors, Chip, Column, ErrorNotice, Heading, Muted, Row, Scrim, Sheet, SmallTitle, Spread, Thumbnail } from './ui';

import type { TripFlowInput, TripFlowResult, TripProvider } from '../types';
export interface TripFlowSheetProps {
  visible: boolean;
  input: TripFlowInput;
  provider: TripProvider;
  onResult: (result: TripFlowResult) => void;
}
/** Each opening owns a controller; caller keeps input/provider fixed until it closes. */
export function TripFlowSheet(props: TripFlowSheetProps) {
  return props.visible ? <FlowSession {...props} /> : null;
}
function FlowSession({ input, provider, onResult }: TripFlowSheetProps) {
  const insets = useSafeAreaInsets();
  const snapshot = useTripSnapshot(provider);
  const [controller] = useState(() => createTripFlowController(provider, input));
  const [creating, setCreating] = useState(input.mode === 'create');
  const [calendar, setCalendar] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [dogs, setDogs] = useState(input.dogIds ?? []);
  const selectedDogs = dogs.filter(id => snapshot.dogs.some(dog => dog.dogId === id));
  const [tripId, setTripId] = useState(input.tripId);
  const [day, setDay] = useState(input.day ?? 1);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const delivered = useRef(false);
  const alive = useRef(true);
  const send = (result: TripFlowResult | undefined) => {
    if (result && !delivered.current) {
      delivered.current = true;
      onResult(result);
    }
  };
  const cancel = () => {
    if (!controller.busy)
      send(controller.cancel());
  };
  const dismissGesture = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 12 && Math.abs(gesture.dx) < gesture.dy,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 80) {
        const result = controller.cancel();
        if (result) onResult(result);
      }
    },
  }), [controller, onResult]);
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      await provider.refreshOptions();
    }
    catch (reason) {
      if (alive.current)
        setError(errorMessage(reason));
    }
    finally {
      if (alive.current)
        setLoading(false);
    }
  };
  useEffect(() => {
    alive.current = true;
    void provider.refreshOptions().catch(reason => {
      if (alive.current)
        setError(errorMessage(reason));
    }).finally(() => {
      if (alive.current)
        setLoading(false);
    });
    return () => { alive.current = false; };
  }, [provider]);
  const submit = async () => {
    if (controller.busy)
      return;
    setBusy(true);
    setError('');
    try {
      const result = await controller.submit({ tripId, day, ...(creating ? { create: { title: title.trim() || '새 여행', startDate: start, endDate: end, dogIds: selectedDogs } } : {}) });
      if (alive.current)
        send(result);
    }
    catch (reason) {
      if (alive.current)
        setError(errorMessage(reason));
    }
    finally {
      if (alive.current)
        setBusy(false);
    }
  };
  const count = input.selection?.kind === 'place' ? input.selection.places.length : undefined;
  const locked = busy || !!controller.createdTripId;
  return <Modal transparent animationType="slide" visible onRequestClose={calendar ? () => setCalendar(false) : cancel}>

    <Scrim style={creating && !calendar ? { justifyContent: 'center', paddingHorizontal: 24 } : undefined}>

      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="바깥 영역 닫기" onPress={calendar ? () => setCalendar(false) : cancel} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={calendar ? { flex: 1, paddingTop: insets.top } : { maxHeight: '94%' }}>

        {calendar ? <View style={{ flex: 1, backgroundColor: tripColors.calendarBackground, paddingBottom: insets.bottom }}>
          <TripCalendar startDate={start || undefined} endDate={end || undefined} onCancel={() => setCalendar(false)} onSelect={(first, last) => { setStart(first); setEnd(last); setCalendar(false); }} />
        </View>
          : <Sheet style={{ maxHeight: '100%', borderRadius: creating ? 24 : undefined, paddingBottom: Math.max(insets.bottom, 20) }}>

            <Spread {...dismissGesture.panHandlers}>
              <Heading>{creating ? '새 일정 생성' : '여행 일정 만들기'}</Heading>
              <Pressable accessibilityRole="button" accessibilityLabel="닫기" disabled={busy} onPress={cancel} hitSlop={12}>
                <Text fontSize={28}>×</Text>
              </Pressable>
            </Spread>

            <Muted>
              {creating ? '반려견과 함께할 여행 일정을 만들어보세요' : count ? `선택한 ${count}곳을 어떻게 담을까요?` : input.selection?.kind === 'course' ? `${input.selection.title || '선택한 코스'}를 일정에 담아보세요` : '여행 일정을 선택해 주세요'}
            </Muted>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 20 }}>

              {creating ? <Column style={{ gap: 20 }}>

                <TextInputField label="이름 (선택)" placeholder="새 여행" value={title} onChange={setTitle} maxLength={100} disabled={locked} />

                <Column>
                  <SmallTitle>여행 기간</SmallTitle>
                  <Row>
                    <View style={{ flex: 1 }}>
                      <Button type="sub" size="m" disabled={locked} onPress={() => setCalendar(true)}>
                        {start ? formatDate(start) : '시작일'}
                      </Button>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button type="sub" size="m" disabled={locked} onPress={() => setCalendar(true)}>
                        {end ? formatDate(end) : '종료일'}
                      </Button>
                    </View>
                  </Row>
                </Column>

                <Column>
                  <SmallTitle>동행 반려견</SmallTitle>
                  {!loading && !snapshot.dogs.length ? <Muted>등록된 반려견이 없어요. 프로필에서 반려견을 등록한 뒤 다시 열어 주세요.</Muted> : null}
                  <Row style={{ flexWrap: 'wrap' }}>
                    {snapshot.dogs.map(dog => <Chip key={dog.dogId} selected={dogs.includes(dog.dogId)} disabled={locked} onPress={() => setDogs(current => current.includes(dog.dogId) ? current.filter(id => id !== dog.dogId) : [...current, dog.dogId])}>
                      <Row><Thumbnail uri={dog.profileImageUrl} size={24} /><Text fontSize={14}>{dog.name}</Text></Row>
                    </Chip>)}
                  </Row>
                </Column>

              </Column> : <Column style={{ gap: 20 }}>

                <Button type="sub" disabled={busy} onPress={() => { setCreating(true); setDay(1); }}>＋ 새 여행 일정 만들기</Button>

                <SmallTitle>기존 일정에 추가</SmallTitle>

                {!loading && !snapshot.brief.length ? <Column style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Heading>아직 여행 일정이 없어요</Heading>
                  <Muted>새 일정을 만들고 장소를 담아보세요.</Muted>
                </Column> : null}

                {snapshot.brief.map(trip => <Column key={trip.tripId}>
                  <Pressable accessibilityRole="radio" accessibilityState={{ checked: tripId === trip.tripId }} onPress={() => { setTripId(trip.tripId); setDay(1); }} disabled={busy}>
                    <Spread>
                      <Column>
                        <SmallTitle>{trip.title}</SmallTitle>
                        <Muted>{trip.startDate} ~ {trip.endDate}</Muted>
                      </Column>
                      <Text color={tripId === trip.tripId ? 'primary' : 'textDisabled'}>
                        {tripId === trip.tripId ? '●' : '○'}
                      </Text>
                    </Spread>
                  </Pressable>
                  {tripId === trip.tripId ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {Array.from({ length: trip.totalDays }, (_, index) => <Chip key={index} selected={day === index + 1} disabled={busy} onPress={() => setDay(index + 1)}>
                      <Column>
                        <SmallTitle>DAY {index + 1}</SmallTitle>
                        <Muted>{formatDate(addDays(trip.startDate, index))}</Muted>
                      </Column>
                    </Chip>)}
                  </ScrollView> : null}
                </Column>)}

              </Column>}

              {loading ? <Muted>불러오는 중…</Muted> : null}

              {controller.createdTripId ? <Muted>일정은 생성되었어요. 장소 추가를 다시 시도할 수 있어요.</Muted> : null}

              <ErrorNotice message={error} onRetry={!busy && !controller.createdTripId && !controller.uncertain ? load : undefined} />

            </ScrollView>

            <Button disabled={busy || loading || controller.uncertain || (creating ? !start || !end || !selectedDogs.length : !tripId)} onPress={submit}>
              {busy ? '저장 중…' : controller.createdTripId ? '장소 추가 다시 시도' : creating ? '일정 생성하기' : '이 일정에 추가'}
            </Button>

            {creating && input.mode === 'add' && !locked ? <Button type="ghost" size="m" onPress={() => setCreating(false)}>기존 일정 선택</Button> : null}

          </Sheet>}

      </KeyboardAvoidingView>

    </Scrim>

  </Modal>;
}
