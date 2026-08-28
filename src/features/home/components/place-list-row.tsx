import { Pressable, Text, View } from 'react-native';

import type { Place } from '@/features/places/types';

import { styles } from '../styles';
import { PlaceThumbnail } from './place-thumbnail';

export function PlaceListRow({
  compact = false,
  onPress,
  place,
  selected = false,
}: {
  compact?: boolean;
  onPress?: (place: Place) => void;
  place: Place;
  selected?: boolean;
}) {
  const displayTags = place.tags.slice(0, compact ? 2 : 3);
  const accessibilityLabel = [
    place.name,
    place.categoryName,
    displayTags[0] ? `대표 동반 조건 ${displayTags[0]}` : null,
    '상세로 이동',
  ].filter(Boolean).join(', ');

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      onPress={onPress ? () => onPress(place) : undefined}
      style={[
        styles.placeRow,
        compact && styles.placeRowCompact,
      ]}
    >
      <View style={styles.placeRowImageFrame}>
        <PlaceThumbnail imageUrl={place.imageUrl} style={styles.placeRowImage} />
      </View>
      <View style={styles.placeRowBody}>
        <View style={styles.placeRowHeader}>
          <Text style={styles.placeRowTitle}>
            {place.name}
          </Text>
        </View>
        <Text style={styles.placeCategoryText}>{place.categoryName}</Text>
        {displayTags.length > 0 ? (
          <View style={styles.placeTagRow}>
            {displayTags.map(tag => (
              <View key={tag} style={styles.placeTagChip}>
                <Text style={styles.placeTagText}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.placeAddressRow}>
          <Text style={styles.placeAddressText}>
            {place.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
