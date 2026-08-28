import { useMemo, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { tokens } from '@/constants/tokens';
import { PlaceThumbnail } from '@/features/home/components/place-thumbnail';

const colors = tokens.colors.semantic.light;

export function PlaceImageCarousel({
  fallbackImageUrl,
  images,
}: {
  fallbackImageUrl?: string;
  images?: string[];
}) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const imageUrls = useMemo(
    () =>
      [...new Set((images?.length ? images : [fallbackImageUrl]).filter(
        (value): value is string => Boolean(value),
      ))],
    [fallbackImageUrl, images],
  );
  const displayedImages = imageUrls.length > 0 ? imageUrls : [undefined];

  const updateActiveIndex = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const pageWidth = event.nativeEvent.layoutMeasurement.width;

    if (pageWidth > 0) {
      setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
    }
  };

  return (
    <View style={styles.root} testID="place-image-carousel">
      <FlatList
        data={displayedImages}
        horizontal
        keyExtractor={(imageUrl, index) => imageUrl ?? `placeholder-${index}`}
        onMomentumScrollEnd={updateActiveIndex}
        pagingEnabled
        renderItem={({ item }) => (
          <PlaceThumbnail
            imageUrl={item}
            style={[styles.image, { width }]}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
      {imageUrls.length > 1 ? (
        <View style={styles.counter}>
          <Text accessibilityLiveRegion="polite" style={styles.counterText}>
            {activeIndex + 1} / {imageUrls.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    aspectRatio: 1.6,
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
  },
  image: {
    aspectRatio: 1.6,
  },
  counter: {
    backgroundColor: 'rgba(25, 31, 40, 0.68)',
    borderRadius: tokens.radius.full,
    bottom: tokens.spacing[12],
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[10],
    position: 'absolute',
    right: tokens.spacing[12],
  },
  counterText: {
    color: colors.onInverse,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 12,
    fontWeight: '600',
  },
});
