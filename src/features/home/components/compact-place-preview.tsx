import { View } from 'react-native';

import type { Place } from '@/features/places/types';

import { styles } from '../styles';
import type { HomeDogProfile } from '../types';
import { PlaceListRow } from './place-list-row';

export function CompactPlacePreview({
  dogs = [],
  onSelectPlace,
  places,
}: {
  dogs?: HomeDogProfile[];
  onSelectPlace?: (place: Place) => void;
  places: Place[];
}) {
  return (
    <View style={styles.previewList}>
      {places.slice(0, 2).map(place => (
        <PlaceListRow
          key={place.id}
          compact
          dogs={dogs}
          onPress={onSelectPlace}
          place={place}
        />
      ))}
    </View>
  );
}
