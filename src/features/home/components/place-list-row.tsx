import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';


import { styles } from '../styles';
import { getVerifiedDiffDays } from '../utils/place-utils';
import { PlaceThumbnail } from './place-thumbnail';

import type { HomeDogProfile } from '../types';
import type { Place } from '@/features/places/types';

const DOG_SIZE_TAG_CODES = new Set(['SMALL_DOG', 'MEDIUM_DOG', 'LARGE_DOG']);

const getCompatibleDogs = (
  place: Place,
  dogs: HomeDogProfile[],
): HomeDogProfile[] => {
  const placeSizeTagCodes = place.tagCodes.filter(tagCode =>
    DOG_SIZE_TAG_CODES.has(tagCode),
  );

  if (placeSizeTagCodes.length === 0) {
    return [];
  }

  return dogs.filter(dog => {
    const isSizeAllowed = placeSizeTagCodes.includes(dog.sizeTagCode);
    const isDangerousDogBlocked =
      dog.isDangerousDog && place.tagCodes.includes('NO_DANGEROUS_DOG');

    return isSizeAllowed && !isDangerousDogBlocked;
  });
};

const formatRelativeVerifiedTime = (diffDays: number | null): string | null => {
  if (diffDays === null) {
    return null;
  }

  return diffDays === 0 ? '오늘' : `${diffDays}일전`;
};

export function PlaceListRow({
  compact = false,
  dogs = [],
  onPress,
  place,
}: {
  compact?: boolean;
  dogs?: HomeDogProfile[];
  onPress?: (place: Place) => void;
  place: Place;
}) {
  const compatibleDogs = getCompatibleDogs(place, dogs);
  const displayTags = place.tags.slice(0, compact ? 2 : 3);
  const relativeVerifiedTime = formatRelativeVerifiedTime(
    getVerifiedDiffDays(place.lastVerifiedAt),
  );
  const userVerifiedText = place.verifiedCount
    ? `유저인증 ${place.verifiedCount}${
        relativeVerifiedTime ? ` · ${relativeVerifiedTime}` : ''
      }`
    : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress ? () => onPress(place) : undefined}
      style={[styles.placeRow, compact && styles.placeRowCompact]}
    >
      <View style={styles.placeRowImageFrame}>
        <PlaceThumbnail imageUrl={place.imageUrl} style={styles.placeRowImage} />
        <View style={styles.placeLikeBadge}>
          <SymbolView
            name={{ android: 'favorite', ios: place.isLiked ? 'heart.fill' : 'heart', web: 'favorite' }}
            size={18}
            tintColor="#FFFFFF"
          />
        </View>
        {compatibleDogs.length > 0 ? (
          <View style={styles.compatibleDogStack}>
            {compatibleDogs.slice(0, 2).map((dog, index) => (
              <Image
                key={dog.id}
                contentFit="cover"
                source={{ uri: dog.imageUrl }}
                style={[
                  styles.compatibleDogAvatar,
                  { marginLeft: index === 0 ? 0 : -8 },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.placeRowBody}>
        <View style={styles.placeRowHeader}>
          <Text numberOfLines={1} style={styles.placeRowTitle}>
            {place.name}
          </Text>
          <Pressable accessibilityRole="button" style={styles.addTripButton}>
            <SymbolView
              name={{ android: 'add', ios: 'plus', web: 'add' }}
              size={13}
              tintColor="#4E5968"
            />
            <Text style={styles.addTripText}>내 여행</Text>
          </Pressable>
        </View>
        {displayTags.length > 0 ? (
          <View style={styles.placeTagRow}>
            {displayTags.map(tag => (
              <View key={tag} style={styles.placeTagChip}>
                <Text numberOfLines={1} style={styles.placeTagText}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.placeProofRow}>
          {place.isOfficial ? (
            <View style={styles.placeOfficialBadge}>
              <SymbolView
                name={{ android: 'verified', ios: 'checkmark.seal.fill', web: 'verified' }}
                size={15}
                tintColor="#1C7CFE"
              />
              <Text style={styles.placeOfficialText}>공식인증</Text>
            </View>
          ) : null}
          {userVerifiedText ? (
            <View style={styles.placeUserProof}>
              <SymbolView
                name={{ android: 'person', ios: 'person.fill', web: 'person' }}
                size={15}
                tintColor="#B0B8C1"
              />
              <Text numberOfLines={1} style={styles.placeUserProofText}>
                {userVerifiedText}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.placeRatingRow}>
          <SymbolView
            name={{ android: 'star', ios: 'star.fill', web: 'star' }}
            size={13}
            tintColor="#6B7684"
          />
          <Text style={styles.placeRatingText}>
            {place.rating?.toFixed(1) ?? '-'}
          </Text>
          <Text numberOfLines={1} style={styles.placeAddressText}>
            {place.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
