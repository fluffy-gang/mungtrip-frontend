import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

import { PlaceTextArea } from '../detail/text-area';
import { placeStyles as s } from '../detail/styles';
import { errorMessage, REJECTION_LABELS } from '../detail/validation';
import { ReviewComposer } from '../reviews/review-composer';
import { SheetShell } from './sheet-shell';

import type { PlaceVisit, RejectReason } from '../detail/types';
import type { PlaceVisitFlowSheetProps } from './types';

/** Owns the entire visit→review flow; cancelling an optional review still reports the saved visit. */
export function PlaceVisitFlowSheet(props: PlaceVisitFlowSheetProps) {
  const snapshot = useSyncExternalStore(props.provider.subscribe, props.provider.getSnapshot, props.provider.getSnapshot);
  if (!props.visible) return null;
  return <VisitSession key={`${props.input.source}:${props.input.placeId}:${snapshot.sessionRevision}`} {...props} />;
}
function VisitSession({ input, provider, onResult }: PlaceVisitFlowSheetProps) {
  const [stage, setStage] = useState<'choice' | 'rejection' | 'review'>(input.initialOutcome === 'REJECTED' ? 'rejection' : 'choice');
  const [reason, setReason] = useState<RejectReason>();
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const saved = useRef<PlaceVisit | undefined>(undefined);
  const locked = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const finish = (reviewId?: number) => {
    if (locked.current) return;
    if (saved.current) onResult({ status: 'completed', source: input.source, ...saved.current, reviewId });
    else onResult({ status: 'cancelled', source: input.source });
  };
  const submit = async (outcome: 'VISITED' | 'REJECTED') => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(undefined);
    try {
      if (provider.source !== input.source) throw new Error('데이터 출처가 일치하지 않아요. 화면을 다시 열어 주세요.');
      const result = await provider.visit(input.placeId, { outcome, rejectReason: reason, rejectDetail: detail });
      if (!active.current) return;
      saved.current = result; locked.current = false; setBusy(false);
      if (outcome === 'REJECTED') finish(); else setStage('review');
    } catch (cause) { if (active.current) { locked.current = false; setBusy(false); setError(errorMessage(cause)); } }
  };
  return <SheetShell busy={busy} onClose={() => finish()}>
    {stage === 'review' ? <ReviewComposer provider={provider} placeId={input.placeId} defaultDogId={input.dogId}
      onBusy={value => { locked.current = value; setBusy(value); }} onDone={finish} /> : <>
      {stage === 'choice' ? <>
        <Text style={[s.heading, s.link, { textAlign: 'center' }]}>{input.placeName ?? '이 장소'}</Text>
        <Text style={[s.label, { textAlign: 'center' }]}>방문하셨나요?</Text>
        <Button disabled={busy} onPress={() => void submit('VISITED')}>{busy ? '저장 중…' : '다녀왔어요'}</Button>
        <Button type="sub" disabled={busy} onPress={() => setStage('rejection')}>거절당했어요</Button>
      </> : <>
        <Text style={s.heading}>거절 사유를 알려주세요</Text>
        <View style={s.wrap}>{(Object.keys(REJECTION_LABELS) as RejectReason[]).map(value => <Pressable key={value}
          accessibilityRole="radio" accessibilityState={{ selected: value === reason }} disabled={busy}
          style={[s.chip, value === reason && s.selectedChip]} onPress={() => setReason(value)}>
          <Text style={[s.body, value === reason && s.selectedText]}>{REJECTION_LABELS[value]}</Text>
        </Pressable>)}</View>
        <PlaceTextArea value={detail} onChange={setDetail} disabled={busy} maxLength={500}
          placeholder="거절 당한 상세 사유를 알려주시면 다른 유저에게 도움이 될 수 있어요" />
        <Button type="sub" disabled={busy || !reason} onPress={() => void submit('REJECTED')}>{busy ? '저장 중…' : '거절 처리'}</Button>
      </>}
      {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Button type="ghost" disabled={busy} onPress={() => finish()}>취소</Button>
    </>}
  </SheetShell>;
}
