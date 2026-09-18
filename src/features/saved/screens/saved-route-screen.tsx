import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MainTabScreen } from '@/features/home/components/main-tab-screen';
import { TripFlowSheet } from '@/features/trips/components/trip-flow-sheet';
import { TripMap } from '@/features/trips/components/trip-map';
import { Content, Header, Page } from '@/features/trips/components/ui';
import { TripSessionBoundary, useTripEnvironment } from '@/features/trips/context';
import { SavedScreen } from './saved-screen';

import type { Place } from '@/features/places/types';
import type { TripFlowInput } from '@/features/trips/types';

export function SavedRouteScreen() {
  return <TripSessionBoundary><SavedRouteContent /></TripSessionBoundary>;
}

function SavedRouteContent() {
  const router = useRouter();
  const { provider } = useTripEnvironment();
  const [flow, setFlow] = useState<TripFlowInput>();
  const [mapPlaces, setMapPlaces] = useState<Place[]>();
  const pending = useRef<((result: 'completed' | 'cancelled') => void) | undefined>(undefined);
  useEffect(() => () => { pending.current?.('cancelled'); }, []);
  const openFlow = (input: TripFlowInput) => new Promise<'completed' | 'cancelled'>(resolve => {
    pending.current?.('cancelled');
    pending.current = resolve;
    setFlow(input);
  });
  const openPlace = (id: number) => {
    setMapPlaces(undefined);
    router.push({ pathname: '/places/[id]', params: { id } });
  };

  return <MainTabScreen tab="favorite">
    <SavedScreen
      onOpenPlace={({ placeId }) => openPlace(placeId)}
      onFindPlaces={() => router.navigate('/')}
      onShowMap={({ places }) => setMapPlaces(places)}
      onCreateOrAddTrip={({ places, source }) => openFlow({
        mode: 'create', source,
        selection: { kind: 'place', places: places.map(place => ({ ...place, thumbnailUrl: place.imageUrl })) },
      })}
      onAddCourseToTrip={({ course, source }) => openFlow({
        mode: 'add', source, selection: { kind: 'course', courseId: course.id, title: course.title },
      })}
    />
    {flow && <TripFlowSheet visible input={flow} provider={provider} onResult={result => {
      pending.current?.(result.status);
      pending.current = undefined;
      setFlow(undefined);
      if (result.status === 'completed') router.push({ pathname: '/trips/[id]', params: { id: result.tripId } });
    }} />}
    <Modal visible={!!mapPlaces} onRequestClose={() => setMapPlaces(undefined)} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}><Page>
        <Header title="저장한 장소" onBack={() => setMapPlaces(undefined)} />
        <Content>{mapPlaces && <TripMap places={mapPlaces} height={400} onSelect={place => openPlace(place.id)} />}</Content>
      </Page></SafeAreaView>
    </Modal>
  </MainTabScreen>;
}
