import { useState } from 'react';
import { View } from 'react-native';

import { MapCanvas } from '@/features/home/components/map-canvas';
import { tripColors, Muted } from './ui';

import type { TripPlaceSelection } from '../types';
import type { Place } from '@/features/places/types';
/** Only known coordinates become markers; the shared map owns native availability. */
export function TripMap({ places, onSelect, height = 170 }: {
  places: TripPlaceSelection[];
  height?: number;
  onSelect?: (place: TripPlaceSelection) => void;
}) {
  const valid = places.filter(place => place.latitude !== undefined && place.longitude !== undefined);
  const first = valid[0];
  const [camera, setCamera] = useState({ latitude: first?.latitude ?? 33.38, longitude: first?.longitude ?? 126.55, zoom: 12 });
  const mapped: Place[] = valid.map(place => ({ id: place.id, name: place.name, category: place.category ?? '', categoryName: place.category ?? '', address: place.address ?? '', latitude: place.latitude, longitude: place.longitude, imageUrl: place.thumbnailUrl, tags: place.tags ?? [], tagCodes: [], isOfficial: false, isLiked: false }));
  return <View style={{ height, borderRadius: 12, overflow: 'hidden', backgroundColor: tripColors.surfaceSubtle }}>
    {first ? <MapCanvas mapCamera={camera} setMapCamera={setCamera} setMapBounds={() => undefined} places={mapped} onSelectPlace={place => {
      const original = places.find(item => item.id === place.id); if (original)
        onSelect?.(original);
    }} userCoordinate={null} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Muted>지도에 표시할 장소가 없어요.</Muted>
    </View>}
  </View>;
}
