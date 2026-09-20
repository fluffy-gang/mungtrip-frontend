import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';

import { getFeatureProviders } from './providers';
import { createSheetRequest } from './sheet-request';
import { TripEnvironmentProvider } from '@/features/trips/context';
import { TripFlowSheet } from '@/features/trips';
import { PlaceVisitFlowSheet } from '@/features/places/visits';
import { PlaceDetailIntegrationProvider } from '@/features/places/detail/environment';

import type { ReactNode } from 'react';
import type { Place } from '@/features/places/types';
import type { PlaceVisitFlowInput, PlaceVisitFlowResult } from '@/features/places/visits/types';
import type { TripFlowInput, TripFlowResult } from '@/features/trips/types';
import type { FeatureProviders } from './providers';


interface Integration extends FeatureProviders {
  openTrip(input: TripFlowInput): Promise<'completed' | 'cancelled'>;
  openPlace(placeId: number): void;
  showSavedMap(places: Place[]): void;
  mapPlaces: Place[];
}
const Context = createContext<Integration | null>(null);
export function useFeatureIntegration() {
  const value = useContext(Context);
  if (!value) throw new Error('FeatureIntegrationProvider가 필요합니다.');
  return value;
}
export function FeatureIntegrationProvider({ children }: { children: ReactNode }) {
  return <FeatureSession providers={getFeatureProviders('real')}>{children}</FeatureSession>;
}
function FeatureSession({ providers, children }: { providers: FeatureProviders; children: ReactNode }) {
  const { source, saved, trips, places } = providers;
  const router = useRouter();
  const [mapPlaces, setMapPlaces] = useState<Place[]>([]);
  const [tripRequest] = useState(() => createSheetRequest<TripFlowInput, TripFlowResult>(input => ({ status: 'cancelled', source: input.source })));
  const [visitRequest] = useState(() => createSheetRequest<PlaceVisitFlowInput, PlaceVisitFlowResult>(input => ({ status: 'cancelled', source: input.source })));
  const tripSheet = useSyncExternalStore(tripRequest.subscribe, tripRequest.getSnapshot, tripRequest.getSnapshot);
  const visitSheet = useSyncExternalStore(visitRequest.subscribe, visitRequest.getSnapshot, visitRequest.getSnapshot);
  useEffect(() => {
    let revision = saved.getSnapshot().sessionRevision;
    const unsubscribe = saved.subscribe(() => {
      const next = saved.getSnapshot().sessionRevision;
      if (revision === next) return;
      revision = next; tripRequest.cancel(); visitRequest.cancel(); setMapPlaces([]);
    });
    return () => { unsubscribe(); tripRequest.cancel(); visitRequest.cancel(); };
  }, [saved, tripRequest, visitRequest]);
  const openPlace = useCallback((placeId: number) => {
    router.push({ pathname: '/places/[id]', params: { id: String(placeId) } });
  }, [router]);
  const openTrip = useCallback(async (input: TripFlowInput) => {
    if (input.source !== source || visitRequest.getSnapshot()) return 'cancelled' as const;
    const result = await tripRequest.open(input);
    return result.status;
  }, [source, tripRequest, visitRequest]);
  const openVisit = useCallback((input: PlaceVisitFlowInput) => {
    if (input.source !== source || tripRequest.getSnapshot()) return Promise.resolve<PlaceVisitFlowResult>({ status: 'cancelled', source: input.source });
    return visitRequest.open(input);
  }, [source, tripRequest, visitRequest]);
  const showSavedMap = useCallback((items: Place[]) => {
    setMapPlaces(items);
    router.push('/saved/map');
  }, [router]);
  const value = useMemo(() => ({ ...providers, openTrip, openPlace, showSavedMap, mapPlaces }), [providers, openTrip, openPlace, showSavedMap, mapPlaces]);
  const placeIntegration = useMemo(() => ({
    provider: places, saved, onAddToTrip: openTrip,
    onVisitResult: (result: PlaceVisitFlowResult) => {
      if (result.status !== 'completed' || result.source !== source) return;
      void trips.applyVisitResult(result).catch(() => Alert.alert('여행 갱신', '방문 기록은 저장됐어요. 여행 목록을 다시 불러와 주세요.'));
    },
  }), [places, saved, source, trips, openTrip]);
  const tripCallbacks = useMemo(() => ({
    onOpenPlace: (input: { placeId: number }) => openPlace(input.placeId),
    onVisit: openVisit,
  }), [openPlace, openVisit]);
  return <Context.Provider value={value}>
    <TripEnvironmentProvider provider={trips} saved={saved} callbacks={tripCallbacks}>
      <PlaceDetailIntegrationProvider value={placeIntegration}>
        {children}
        {tripSheet && <TripFlowSheet key={tripSheet.id} visible input={tripSheet.input} provider={trips}
          onResult={result => tripRequest.finish(tripSheet.id, result)} />}
        {visitSheet && <PlaceVisitFlowSheet key={visitSheet.id} visible input={visitSheet.input} provider={places}
          onResult={result => visitRequest.finish(visitSheet.id, result)} />}
      </PlaceDetailIntegrationProvider>
    </TripEnvironmentProvider>
  </Context.Provider>;
}
