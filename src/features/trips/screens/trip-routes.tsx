import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { TripFlowSheet } from '../components/trip-flow-sheet';
import { Content, ErrorNotice, Header, Page } from '../components/ui';
import { useTripEnvironment } from '../context';
import { errorMessage } from '../provider';
import { TripDetailScreen } from './trip-detail-screen';
import { TripEditScreen } from './trip-edit-screen';
import { TripListScreen } from './trip-list-screen';
import { TripPlacePickerScreen } from './trip-place-picker-screen';
import { TripReplacementScreen } from './trip-replacement-screen';

import type { TripItem } from '../types';

/** Root selects a source-bound environment from route params, so every new route preserves it. */
function useTripNavigation() {
  const { provider } = useTripEnvironment();
  const source = provider.source;
  return {
    provider,
    source,
    back: () => {
      if (router.canGoBack()) router.back();
      else router.replace({ pathname: '/trips', params: { source } });
    },
    replaceDetail: (id: number) => router.replace({ pathname: '/trips/[id]', params: { id, source } }),
  };
}
export function TripListRoute() {
  const { source } = useTripNavigation();
  return <TripListScreen onOpenTrip={id => router.push({ pathname: '/trips/[id]', params: { id, source } })} />;
}
export function TripDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { source, back } = useTripNavigation();
  return <TripDetailScreen tripId={Number(id)} onBack={back}
    onEdit={() => router.push({ pathname: '/trips/[id]/edit', params: { id, source } })}
    onAdd={day => router.push({ pathname: '/trips/[id]/add', params: { id, day, source } })}
    onReplace={item => router.push({ pathname: '/trips/[id]/replace', params: { id, itemId: item.tripItemId, source } })} />;
}
export function TripEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { back } = useTripNavigation();
  return <TripEditScreen tripId={Number(id)} onBack={back} onComplete={back} />;
}
export function TripAddRoute() {
  const { id, day } = useLocalSearchParams<{ id?: string; day?: string }>();
  const { back, replaceDetail } = useTripNavigation();
  return <TripPlacePickerScreen tripId={id ? Number(id) : undefined} day={day ? Number(day) : 1} onBack={back} onComplete={replaceDetail} />;
}
export function TripCreateRoute() {
  const { provider, source, back, replaceDetail } = useTripNavigation();
  return <Page><TripFlowSheet visible input={{ mode: 'create', source }} provider={provider} onResult={result => {
    if (result.status === 'completed') replaceDetail(result.tripId);
    else back();
  }} /></Page>;
}
export function TripReplacementRoute() {
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const { provider, back } = useTripNavigation();
  const [item, setItem] = useState<TripItem>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void provider.loadTrip(Number(id)).then(trip => {
      const found = trip.days.flatMap(day => day.items).find(value => value.tripItemId === Number(itemId));
      if (!found) throw new Error('일정의 장소를 찾을 수 없어요.');
      if (active) setItem(found);
    }).catch(reason => { if (active) setError(errorMessage(reason)); });
    return () => { active = false; };
  }, [provider, id, itemId]);
  return item ? <TripReplacementScreen tripId={Number(id)} item={item} onBack={back} onComplete={back} />
    : <Page><Header title="대체 장소 추천" onBack={back} /><Content><ErrorNotice message={error} /></Content></Page>;
}
