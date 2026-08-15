import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import type { Place, PlaceCategory } from '@/features/places/types';

import { PLACE_CATEGORY_META } from '../constants';
import { styles } from '../styles';
import type { NativeMapModule } from '../types';

const DIMMED_MARKER_BACKGROUND = '#F1F5F9';
const SELECTED_MARKER_BACKGROUND = '#000000';

interface PlaceMarkerProps {
  MarkerOverlay: NativeMapModule['NaverMapMarkerOverlay'];
  onSelect: (place: Place) => void;
  place: Place & { latitude: number; longitude: number };
  selectedCategory?: PlaceCategory;
  selectedPlaceId?: number;
}

export function PlaceMarker({
  MarkerOverlay,
  onSelect,
  place,
  selectedCategory,
  selectedPlaceId,
}: PlaceMarkerProps) {
  const markerMeta =
    PLACE_CATEGORY_META[
      place.category as keyof typeof PLACE_CATEGORY_META
    ] ?? PLACE_CATEGORY_META.DEFAULT;
  const hasCategoryFilter = Boolean(selectedCategory);
  const isCategoryMatch = place.category === selectedCategory?.code;
  const isSelected = place.id === selectedPlaceId;
  const isDimmed = hasCategoryFilter && !isCategoryMatch && !isSelected;
  const isHighlighted = hasCategoryFilter && isCategoryMatch && !isSelected;
  const backgroundColor = isDimmed
    ? DIMMED_MARKER_BACKGROUND
    : isSelected
      ? SELECTED_MARKER_BACKGROUND
      : markerMeta.color;
  const zIndex = isSelected ? 30 : isHighlighted ? 20 : 1;

  return (
    <MarkerOverlay
      anchor={{ x: 0.5, y: 1 }}
      caption={{
        color: isDimmed ? '#8B95A1' : '#333D4B',
        haloColor: '#FFFFFF',
        requestedWidth: 84,
        text: place.name,
        textSize: 11,
      }}
      height={42}
      isForceShowIcon
      latitude={place.latitude}
      longitude={place.longitude}
      onTap={() => onSelect(place)}
      width={42}
      zIndex={zIndex}
    >
      <View
        collapsable={false}
        style={[
          styles.placeMarkerBubble,
          { backgroundColor },
          isHighlighted && styles.placeMarkerBubbleHighlighted,
          isDimmed && styles.placeMarkerBubbleDimmed,
        ]}
      >
        <SymbolView
          name={markerMeta.symbol}
          size={17}
          style={styles.placeMarkerSymbol}
          tintColor={isDimmed ? '#333D4B' : '#FFFFFF'}
        />
      </View>
    </MarkerOverlay>
  );
}
