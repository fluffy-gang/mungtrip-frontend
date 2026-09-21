import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { PlaceLikeButton, usePlaceActions } from '@/features/app-integration/place-actions';
import { colors, styles } from '../styles';
import { getVerifiedDiffDays } from '../utils/place-utils';
import { PlaceThumbnail } from './place-thumbnail';

import type { HomeDogProfile } from '../types';
import type { Place } from '@/features/places/types';

const DOG_SIZE_TAG_CODES = new Set(['SMALL_DOG', 'MEDIUM_DOG', 'LARGE_DOG']);
const MAX_TAGS = 3;

const officialIcon = require('../assets/icons/official.svg');
const userIcon = require('../assets/icons/user.svg');
const starIcon = require('../assets/icons/star.svg');

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
  const actions = usePlaceActions(place);
  const compatibleDogs = getCompatibleDogs(place, dogs);
  const displayTags = [...new Set(place.tags)].slice(0, MAX_TAGS);
  const relativeVerifiedTime = formatRelativeVerifiedTime(
    getVerifiedDiffDays(place.lastVerifiedAt),
  );
  // TODO(#26): /api/v1/places가 돌려주는 PlaceMapResponse에는 averageRating/visitCount/lastVisitedAt이
  // 없어 평점·유저인증 줄은 실데이터로 채울 수 없다. 계약이 추가되기 전까지 값이 없으면 줄을 숨긴다.
  const userVerifiedCount = place.verifiedCount
    ? `유저인증 ${place.verifiedCount}`
    : null;
  const hasProof = place.isOfficial || userVerifiedCount !== null;
  const hasRating = place.rating !== undefined;
  const hasRatingRow = hasRating || Boolean(place.address);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress ? () => onPress(place) : undefined}
      style={[styles.placeRow, compact && styles.placeRowCompact]}
    >
      <View style={styles.placeRowImageFrame}>
        <PlaceThumbnail imageUrl={place.imageUrl} style={styles.placeRowImage} />
        <PlaceLikeButton place={place} style={styles.placeLikeBadge} />
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
        <Text numberOfLines={1} style={styles.placeRowTitle}>
          {place.name}
        </Text>
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
        {hasProof ? (
          <View style={styles.placeProofRow}>
            {place.isOfficial ? (
              <View style={styles.placeOfficialBadge}>
                <Image source={officialIcon} style={styles.placeProofIcon} />
                <Text style={styles.placeOfficialText}>공식인증</Text>
              </View>
            ) : null}
            {userVerifiedCount ? (
              <View style={styles.placeUserProof}>
                <Image source={userIcon} style={styles.placeProofIcon} />
                <Text numberOfLines={1} style={styles.placeUserProofText}>
                  {userVerifiedCount}
                  {relativeVerifiedTime ? (
                    <Text style={styles.placeUserProofRelative}>
                      {` · ${relativeVerifiedTime}`}
                    </Text>
                  ) : null}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
        {hasRatingRow ? (
          <View style={styles.placeRatingRow}>
            {hasRating ? (
              <>
                <Image source={starIcon} style={styles.placeStarIcon} />
                <Text style={styles.placeRatingText}>
                  {place.rating?.toFixed(1)}
                </Text>
              </>
            ) : null}
            {place.address ? (
              <Text
                numberOfLines={1}
                style={[styles.placeAddressText, !hasRating && { marginLeft: 0 }]}
              >
                {place.address}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" style={styles.addTripButton}
        onPress={event => { event.stopPropagation(); void actions.addToTrip(); }}>
        <SymbolView
          name={{ android: 'add', ios: 'plus', web: 'add' }}
          size={16}
          tintColor={colors.textSecondary}
        />
        <Text style={styles.addTripText}>내 여행</Text>
      </Pressable>
    </Pressable>
  );
}
