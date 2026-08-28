import type { Place } from '@/features/places/types';
import {
  getPlaceMarkerIconMask,
  placeMarkerBackgroundMask,
} from '@/features/places/map-marker-images';

import type { NativeMapModule } from '../types';

interface PlaceMarkerProps {
  MarkerOverlay: NativeMapModule['NaverMapMarkerOverlay'];
  onSelect: (place: Place) => void;
  place: Place & { latitude: number; longitude: number };
  selectedPlaceId?: number;
}

export function PlaceMarker({
  MarkerOverlay,
  onSelect,
  place,
  selectedPlaceId,
}: PlaceMarkerProps) {
  const isSelected = place.id === selectedPlaceId;
  const zIndex = isSelected ? 30 : 1;
  const backgroundColor = isSelected ? '#FE6A20' : '#FFFFFF';
  const iconColor = isSelected ? '#FFFFFF' : '#191F28';

  return (
    <>
      <MarkerOverlay
        anchor={{ x: 0.5, y: 0.5 }}
        caption={{
          color: '#4E5968',
          haloColor: '#FFFFFF',
          requestedWidth: 84,
          text: place.name,
          textSize: 11,
        }}
        height={44}
        image={placeMarkerBackgroundMask}
        isForceShowIcon={isSelected}
        isHideCollidedCaptions
        latitude={place.latitude}
        longitude={place.longitude}
        onTap={() => onSelect(place)}
        tintColor={backgroundColor}
        width={44}
        zIndex={zIndex}
      />
      <MarkerOverlay
        anchor={{ x: 0.5, y: 0.5 }}
        height={18}
        image={getPlaceMarkerIconMask(place.category)}
        isForceShowIcon={isSelected}
        latitude={place.latitude}
        longitude={place.longitude}
        onTap={() => onSelect(place)}
        tintColor={iconColor}
        width={18}
        zIndex={zIndex + 1}
      />
    </>
  );
}
