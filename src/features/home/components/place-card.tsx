import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { PlaceLikeButton } from '@/features/app-integration/place-actions';
import { colors, styles } from '../styles';
import { getVerifiedDiffDays } from '../utils/place-utils';
import { PlaceThumbnail } from './place-thumbnail';

import type { Place } from '@/features/places/types';

const starIcon = require('../assets/icons/star.svg');

const getBadgeLabel = (place: Place): string | null => {
  if (place.rank !== undefined) {
    return `오늘 ${place.rank}위`;
  }

  const diffDays = getVerifiedDiffDays(place.lastVerifiedAt);

  if (diffDays === null) {
    return null;
  }

  return diffDays === 0 ? '오늘 인증' : `${diffDays}일 전 인증`;
};

export function PlaceCard({
  onPress,
  place,
}: {
  onPress?: (place: Place) => void;
  place: Place;
}) {
  const displayTags = place.tags.slice(0, 2);
  const badgeLabel = getBadgeLabel(place);
  const userVerifiedText = place.verifiedCount
    ? `유저인증 ${place.verifiedCount}`
    : null;

  return (
    <View style={styles.placeCardRoot}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        onPress={onPress ? () => onPress(place) : undefined}
      >
        <View style={styles.placeCardImageFrame}>
          <PlaceThumbnail imageUrl={place.imageUrl} style={styles.placeCardImage} />
          {badgeLabel ? (
            <View style={styles.placeCardBadge}>
              <Text style={styles.placeCardBadgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.placeCardBody}>
          <Text numberOfLines={1} style={styles.placeName}>
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
          <View style={styles.placeProofRow}>
            {place.isOfficial ? (
              <View style={styles.placeOfficialBadge}>
                <SymbolView
                  name={{ android: 'verified', ios: 'checkmark.seal.fill', web: 'verified' }}
                  size={13}
                  tintColor={colors.accentBlue}
                />
                <Text style={styles.placeOfficialText}>공식인증</Text>
              </View>
            ) : null}
            {userVerifiedText ? (
              <Text numberOfLines={1} style={styles.placeUserProofText}>
                {userVerifiedText}
              </Text>
            ) : null}
          </View>
          <View style={styles.placeScore}>
            <Image contentFit="contain" source={starIcon} style={{ height: 8, width: 8 }} />
            <Text style={styles.scoreText}>{place.rating?.toFixed(1) ?? '-'}</Text>
          </View>
        </View>
      </Pressable>
      <PlaceLikeButton place={place} style={styles.placeCardLikeBadge} size={24} />
    </View>
  );
}
