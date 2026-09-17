import { View } from 'react-native';

import { CourseOrderPin } from '@/components/ui/course-order-pin';

import { MapCanvas } from '@/features/home/components/map-canvas';
import { loadNativeMapModule } from '@/features/home/utils/native-modules';
import { tripColors, Muted } from './ui';

import type { TripPlaceSelection } from '../types';
import type { Place } from '@/features/places/types';
const nativeMap = loadNativeMapModule();
/** Only known coordinates become markers; numbered pins share the course timeline component. */
export function TripMap({ places, onSelect, height = 172, numbered = false }: {
  places: TripPlaceSelection[];
  height?: number;
  numbered?: boolean;
  onSelect?: (place: TripPlaceSelection) => void;
}) {
  const valid = places.filter((place): place is TripPlaceSelection & { latitude: number; longitude: number } => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
  const first = valid[0];
  const mapped: Place[] = valid.map(place => ({ id: place.id, name: place.name, category: place.category ?? '', categoryName: place.category ?? '', address: place.address ?? '', latitude: place.latitude, longitude: place.longitude, imageUrl: place.thumbnailUrl, tags: place.tags ?? [], tagCodes: [], isOfficial: false, isLiked: false }));
  const renderNumbered = () => {
    if (!nativeMap || !first) return null;
    const { NaverMapView, NaverMapMarkerOverlay, NaverMapPolylineOverlay } = nativeMap;
    const latitudes = valid.map(p => p.latitude), longitudes = valid.map(p => p.longitude);
    const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes), minLng = Math.min(...longitudes), maxLng = Math.max(...longitudes);
    const latDelta = Math.max((maxLat - minLat) * 1.8, 0.012), lngDelta = Math.max((maxLng - minLng) * 1.8, 0.02);
    return <NaverMapView style={{ flex: 1 }} initialRegion={{ latitude: (minLat + maxLat - latDelta) / 2, longitude: (minLng + maxLng - lngDelta) / 2, latitudeDelta: latDelta, longitudeDelta: lngDelta }} isRotateGesturesEnabled={false} isShowCompass={false} isShowZoomControls={false} isShowScaleBar={false} locale="ko">
      {/* TODO(#27): Figma shows a dashed connector, but @mj-studio/react-native-naver-map@2.9.0's
          NaverMapPolylineOverlay wrapper never forwards its `pattern` prop to the native view
          (checked lib/module, lib/commonjs and src -- the JSX call omits `pattern` entirely) even
          though the Android/iOS native managers implement it. A solid line renders reliably; a
          dashed one needs either an upstream fix or reaching past the wrapper to the codegen'd
          NativeNaverMapPolyline component directly. */}
      {valid.length > 1 && <NaverMapPolylineOverlay coords={valid.map(({ latitude, longitude }) => ({ latitude, longitude }))} width={2} color={tripColors.primary} />}
      {valid.map((place, index) => <NaverMapMarkerOverlay key={`${place.id}-${index}`} latitude={place.latitude} longitude={place.longitude} width={44} height={41} anchor={{ x: 0.5, y: 0.5 }} onTap={() => onSelect?.(place)}>
        <View collapsable={false} style={{ width: 44, height: 41 }}><CourseOrderPin order={index + 1} variant="map" /></View>
      </NaverMapMarkerOverlay>)}
    </NaverMapView>;
  };
  return <View style={{ height, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: tripColors.surfaceSubtle, backgroundColor: tripColors.surfaceSubtle }}>
    {first ? numbered && nativeMap ? renderNumbered() : <MapCanvas mapCamera={{ latitude: first.latitude, longitude: first.longitude, zoom: 12 }} setMapCamera={() => undefined} setMapBounds={() => undefined} places={mapped} onSelectPlace={place => {
      const original = places.find(item => item.id === place.id); if (original) onSelect?.(original);
    }} userCoordinate={null} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Muted>지도에 표시할 장소가 없어요.</Muted></View>}
  </View>;
}
