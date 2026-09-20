import { Image, useImage } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform, View } from 'react-native';

import { getPlaceCategoryMeta, PLACE_CATEGORY_META } from '../constants';
import { styles } from '../styles';
import { colors } from '../styles/style-primitives';

import type { Place, PlaceCategory } from '@/features/places/types';
import type { PlaceCategoryMeta } from '../constants';
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

interface MarkerBodyProps extends PlaceMarkerProps {
  meta: PlaceCategoryMeta;
  preparedIcon: ReturnType<typeof useImage>;
}

function MarkerBody({ MarkerOverlay, onSelect, place, selectedCategory, selectedPlaceId, meta, preparedIcon }: MarkerBodyProps) {
  const hasCategoryFilter = Boolean(selectedCategory);
  const isCategoryMatch = place.category === selectedCategory?.code;
  const isSelected = place.id === selectedPlaceId;
  const isDimmed = hasCategoryFilter && !isCategoryMatch && !isSelected;
  const isHighlighted = hasCategoryFilter && isCategoryMatch && !isSelected;
  const backgroundColor = isDimmed
    ? DIMMED_MARKER_BACKGROUND
    : isSelected
      ? SELECTED_MARKER_BACKGROUND
      : colors.primary;
  const zIndex = isSelected ? 30 : isHighlighted ? 20 : 1;
  const iconReady = meta.kind === 'image' && Boolean(preparedIcon);
  const bubbleKey = `${place.category}-${iconReady ? 'ready' : 'fallback'}-${isSelected ? 'selected' : isDimmed ? 'dimmed' : isHighlighted ? 'highlighted' : 'default'}`;
  const iconTintColor = isDimmed ? '#333D4B' : '#FFFFFF';

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
      {/* iOS snapshots on mount. Android tracks this view; remounting recycles an in-use map bitmap. */}
      <View
        key={Platform.OS === 'ios' ? bubbleKey : 'marker-body'}
        collapsable={false}
        style={[
          styles.placeMarkerBubble,
          { backgroundColor },
          isHighlighted && styles.placeMarkerBubbleHighlighted,
          isDimmed && styles.placeMarkerBubbleDimmed,
        ]}
      >
        {meta.kind === 'image' && preparedIcon ? (
          <Image
            contentFit="contain"
            source={preparedIcon}
            style={[
              styles.placeMarkerSymbol,
              meta.rotate ? { transform: [{ rotate: `${meta.rotate}deg` }] } : null,
            ]}
            tintColor={iconTintColor}
          />
        ) : (
          <SymbolView
            name={PLACE_CATEGORY_META.DEFAULT.symbol}
            size={20}
            style={styles.placeMarkerSymbol}
            tintColor={iconTintColor}
          />
        )}
      </View>
    </MarkerOverlay>
  );
}

interface PreparedPlaceMarkerProps extends PlaceMarkerProps {
  meta: Extract<PlaceCategoryMeta, { kind: 'image' }>;
}

function PreparedPlaceMarker({ meta, ...props }: PreparedPlaceMarkerProps) {
  const preparedIcon = useImage(meta.icon);

  return <MarkerBody {...props} meta={meta} preparedIcon={preparedIcon} />;
}

export function PlaceMarker(props: PlaceMarkerProps) {
  const meta = getPlaceCategoryMeta(props.place.category);

  if (meta.kind === 'image') {
    return <PreparedPlaceMarker key={`${props.place.category}-${meta.icon}`} {...props} meta={meta} />;
  }

  return <MarkerBody {...props} meta={meta} preparedIcon={null} />;
}
