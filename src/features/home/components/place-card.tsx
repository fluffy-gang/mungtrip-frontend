import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import type { Place } from '@/features/places/types';

import { styles } from '../styles';
import { getImageSource } from '../utils/place-utils';

export function PlaceCard({
  onPress,
  place,
}: {
  onPress?: (place: Place) => void;
  place: Place;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress ? () => onPress(place) : undefined}
      style={styles.placeCardRoot}
    >
      <Image source={getImageSource(place.imageUrl)} style={styles.placeCardImage} />
      <View style={styles.placeCardBody}>
        <Text numberOfLines={1} style={styles.placeName}>
          {place.name}
        </Text>
        <Text numberOfLines={1} style={styles.placeMeta}>
          {place.address}
        </Text>
        <View style={styles.placeScore}>
          <SymbolView name={{ android: 'circle', ios: 'circle.fill', web: 'circle' }} size={5} tintColor="#6B7684" />
          <Text style={styles.scoreText}>{place.rating?.toFixed(1) ?? '-'}</Text>
          <Text style={styles.distanceText}>{place.distanceLabel ?? '-'}</Text>
        </View>
      </View>
    </Pressable>
  );
}
