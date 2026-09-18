import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeatureIntegration } from '@/features/app-integration/context';
import { MapCanvas } from '@/features/home/components/map-canvas';
import { PlacePreviewCard } from '@/features/home/components/place-preview-card';
import { JEJU_MAP_CAMERA } from '@/features/home/constants';
import { hasPlaceCoordinate } from '@/features/home/utils/place-utils';

import type { Place } from '@/features/places/types';

export default function SavedMapRoute() {
  const app = useFeatureIntegration();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pins = app.mapPlaces.filter(hasPlaceCoordinate);
  const [selected, setSelected] = useState<Place | null>(null);
  const [camera, setCamera] = useState(() => pins.length ? {
    latitude: pins.reduce((sum, place) => sum + place.latitude, 0) / pins.length,
    longitude: pins.reduce((sum, place) => sum + place.longitude, 0) / pins.length,
    zoom: 11,
  } : JEJU_MAP_CAMERA);
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: insets.top }}>
    <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 20 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로" hitSlop={12}
        onPress={() => router.canGoBack() ? router.back() : router.replace('/saved')}>
        <Text style={{ fontSize: 24 }}>‹</Text>
      </Pressable>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>저장한 장소 {app.mapPlaces.length}곳</Text>
    </View>
    {pins.length ? <View style={{ flex: 1 }}>
      <MapCanvas places={pins} mapCamera={camera} setMapCamera={setCamera} setMapBounds={() => undefined}
        userCoordinate={null} onSelectPlace={setSelected} selectedPlaceId={selected?.id} />
      {selected && <PlacePreviewCard bottom={insets.bottom + 16} dogs={[]} place={selected}
        onClose={() => setSelected(null)} onSelectPlace={place => app.openPlace(place.id)} />}
    </View> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text>지도에 표시할 장소가 없어요.</Text>
    </View>}
  </View>;
}
