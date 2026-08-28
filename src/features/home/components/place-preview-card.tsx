import { Pressable, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import type { Place } from '@/features/places/types';

import { colors, styles } from '../styles';
import { PlaceListRow } from './place-list-row';

export function PlacePreviewCard({
  bottom,
  onClose,
  onSelectPlace,
  place,
}: {
  bottom: number;
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
  place: Place;
}) {
  return (
    <View style={[styles.placePreviewWrapper, { bottom }]}>
      <Pressable
        accessibilityLabel="장소 요약 닫기"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.placePreviewCloseButton}
      >
        <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={18} tintColor={colors.textSecondary} />
      </Pressable>
      <View style={styles.placePreviewCard}>
        <PlaceListRow compact onPress={onSelectPlace} place={place} selected />
      </View>
    </View>
  );
}
