import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { TextInputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { useTripSnapshot } from '../context';
import { addDays } from '../date-utils';
import { createTripFlowController } from '../flow';
import { errorMessage } from '../provider';
import { TripCalendar } from './trip-calendar';
import { tripColors, Column, ErrorNotice, Muted, Row, Scrim, Thumbnail } from './ui';

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
      // A delivered result hands off to onResult's navigation; re-enabling the button while that
      // transition is still settling let a second tap re-trigger submit() mid-teardown, which is
      // what produced the Fabric "child already has a parent" double-mount crash.
      if (alive.current && !delivered.current)
        setBusy(false);
    }
  };
  const locked = busy || !!controller.createdTripId;
  const empty = !loading && !snapshot.brief.length;
  const createNew = () => { setCreating(true); setDay(1); };
  const canSubmit = !busy && !loading && !controller.uncertain && (creating ? !!start && !!end && !!selectedDogs.length : !!tripId);
  return <Modal transparent animationType="slide" visible statusBarTranslucent navigationBarTranslucent onRequestClose={calendar ? () => setCalendar(false) : cancel}>
    <Scrim>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="바깥 영역 닫기" onPress={calendar ? () => setCalendar(false) : cancel} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={calendar ? { flex: 1, paddingTop: insets.top, backgroundColor: tripColors.calendarBackground } : { maxHeight: '94%' }}>
        {calendar ? <View style={{ flex: 1 }}>
          <TripCalendar startDate={start || undefined} endDate={end || undefined} onCancel={() => setCalendar(false)} onSelect={(first, last) => { setStart(first); setEnd(last); setCalendar(false); }} />
          <View style={{ height: insets.bottom, backgroundColor: tripColors.surface }} />
        </View> : <View style={[s.sheet, { paddingBottom: insets.bottom }]}>
          <View {...dismissGesture.panHandlers} style={s.header}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text fontSize={18} lineHeight={24} fontWeight="bold">{creating ? '새 일정 생성' : '내 여행에 추가'}</Text>
              <Text fontSize={14} lineHeight={20} color="textPlaceholder">{creating ? '반려견과 함께할 여행 일정을 만들어보세요' : '장소를 추가할 일정을 선택해주세요'}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="닫기" disabled={busy} onPress={cancel} hitSlop={12}>
              <Image source={require('../assets/close.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.body, !creating && !empty && { minHeight: 290 }]}>
            {creating ? <Column style={{ gap: 20 }}>
              <Column style={{ gap: 8 }}>
                <FieldLabel>이름 (선택)</FieldLabel>
                <TextInputField accessibilityLabel="일정 이름" size="compact" placeholder="이름을 입력해주세요" value={title} onChange={setTitle} maxLength={100} disabled={locked} style={{ fontSize: 14, lineHeight: 20, letterSpacing: -0.28 }} />
              </Column>
              <Column style={{ gap: 8 }}>
                <FieldLabel>여행 기간</FieldLabel>
                <Row>
                  <DateField label="시작일" value={start} disabled={locked} onPress={() => setCalendar(true)} />
                  <DateField label="종료일" value={end} disabled={locked} onPress={() => setCalendar(true)} />
                </Row>
              </Column>
              <Column style={{ gap: 8 }}>
                <FieldLabel>동행 반려견</FieldLabel>
                {!loading && !snapshot.dogs.length ? <Muted>등록된 반려견이 없어요. 프로필에서 반려견을 등록한 뒤 다시 열어 주세요.</Muted> : null}
                <Row style={{ flexWrap: 'wrap' }}>
                  {snapshot.dogs.map(dog => {
                    const selected = dogs.includes(dog.dogId);
                    return <Pressable key={dog.dogId} accessibilityRole="button" accessibilityLabel={dog.name} accessibilityState={{ selected, disabled: locked }} disabled={locked} style={[s.dog, selected && s.dogSelected]} onPress={() => setDogs(current => current.includes(dog.dogId) ? current.filter(id => id !== dog.dogId) : [...current, dog.dogId])}>
                      {dog.profileImageUrl?.trim() ? <View style={{ borderRadius: 14, overflow: 'hidden' }}><Thumbnail uri={dog.profileImageUrl} size={28} /></View> : null}
                      <Text fontSize={14} lineHeight={20} fontWeight="semibold" color={selected ? 'primary' : 'textSecondary'}>{dog.name}</Text>
                    </Pressable>;
                  })}
                </Row>
              </Column>
            </Column> : empty ? <Column style={s.empty}>
              <View style={s.illustration}><Image source={require('../assets/calendar-empty.svg')} style={{ width: 40, height: 40 }} contentFit="contain" /></View>
              <Text fontSize={16} lineHeight={24} fontWeight="bold" color="textSecondary">아직 만든 일정이 없어요</Text>
              <Text fontSize={14} lineHeight={20} color="textTertiary">새 일정을 만들어 장소를 저장해보세요</Text>
            </Column> : <View>
              {snapshot.brief.map(trip => <View key={trip.tripId}>
                <Pressable accessibilityRole="radio" accessibilityLabel={trip.title} accessibilityState={{ checked: tripId === trip.tripId }} onPress={() => { setTripId(trip.tripId); setDay(1); }} disabled={busy} style={s.trip}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text fontSize={16} lineHeight={24} fontWeight="bold" color="textSecondary">{trip.title}</Text>
                    <Text fontSize={12} lineHeight={16} color="textDisabled">{dotDate(trip.startDate)} ~ {dotDate(trip.endDate, trip.startDate.slice(0, 4) !== trip.endDate.slice(0, 4))}</Text>
                  </View>
                  <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}><Image source={tripId === trip.tripId ? require('../assets/radio-selected.svg') : require('../assets/radio-empty.svg')} style={{ width: 24, height: 24 }} contentFit="contain" /></View>
                </Pressable>
                {tripId === trip.tripId ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.days}>
                  {Array.from({ length: trip.totalDays }, (_, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`DAY ${index + 1}`} accessibilityState={{ selected: day === index + 1 }} disabled={busy} onPress={() => setDay(index + 1)} style={[s.day, day === index + 1 && s.daySelected]}>
                    <Text fontSize={12} lineHeight={16} fontWeight="semibold" color="textSecondary">DAY {index + 1}</Text>
                    <Text fontSize={11} lineHeight={16.5} color="textDisabled">{dotDate(addDays(trip.startDate, index), false)}</Text>
                  </Pressable>)}
                </ScrollView> : null}
              </View>)}
            </View>}
            {loading ? <Muted>불러오는 중…</Muted> : null}
            {controller.createdTripId ? <Muted>일정은 생성되었어요. 장소 추가를 다시 시도할 수 있어요.</Muted> : null}
            <ErrorNotice message={error} onRetry={!busy && !controller.createdTripId && !controller.uncertain ? load : undefined} />
          </ScrollView>
          <Row style={s.footer}>
            {!creating && <View style={{ flex: 1 }}><Button size="m" type={empty ? 'primary' : 'sub'} disabled={busy || loading} onPress={createNew}>새 일정 생성</Button></View>}
            {(creating || !empty) && <View style={{ flex: 1 }}><Button size="m" disabled={!canSubmit} onPress={submit}>
              {busy ? '저장 중…' : controller.createdTripId ? '장소 추가 다시 시도' : creating ? '일정 생성하기' : '이 일정에 추가'}
            </Button></View>}
          </Row>
        </View>}
      </KeyboardAvoidingView>
    </Scrim>
  </Modal>;
}
function FieldLabel({ children }: { children: string }) {
  return <Text fontSize={14} lineHeight={20} fontWeight="semibold" color="textSecondary">{children}</Text>;
}
function dotDate(value: string, withYear = true) { return (withYear ? value : value.slice(5)).replaceAll('-', '.'); }
function DateField({ label, value, disabled, onPress }: { label: string; value: string; disabled: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={value ? `${label} ${dotDate(value)}` : label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.date, disabled && { opacity: 0.5 }]}>
    <Image source={require('../assets/calendar.svg')} style={{ width: 20, height: 20 }} contentFit="contain" />
    <Text fontSize={14} lineHeight={20} color={value ? 'textSecondary' : 'textDisabled'}>{value ? dotDate(value) : label}</Text>
  </Pressable>;
}
const s = StyleSheet.create({
  sheet: { maxHeight: '100%', backgroundColor: tripColors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  body: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  footer: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  date: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: tripColors.border, borderRadius: 12 },
  dog: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8, paddingRight: 16, paddingVertical: 6, borderWidth: 1, borderColor: tripColors.border, borderRadius: 999 },
  dogSelected: { borderWidth: 1.5, borderColor: tripColors.primary, backgroundColor: tripColors.accentOrangeSubtle },
  trip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  days: { gap: 8, paddingTop: 4, paddingBottom: 12 },
  day: { borderWidth: 1, borderColor: tripColors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, gap: 2, alignItems: 'center' },
  daySelected: { borderWidth: 1.5, borderColor: tripColors.primary },
  empty: { alignItems: 'center', paddingVertical: 8, gap: 8 },
  illustration: { width: 80, height: 80, borderRadius: 40, backgroundColor: tripColors.accentOrangeSubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
});
