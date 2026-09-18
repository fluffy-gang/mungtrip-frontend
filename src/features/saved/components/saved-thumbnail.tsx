import { useState } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { tokens } from '@/constants/tokens';

import type { ImageStyle, StyleProp } from 'react-native';

const fixtureImages = {
  'saved-fixture://place': require('../assets/place-fixture.webp'),
  'saved-fixture://course': require('../assets/course-fixture.webp'),
};

/** Fixture URIs stay in the mock source; real URLs use the same failure placeholder. */
export function SavedThumbnail({ imageUrl, style }: { imageUrl?: string; style: StyleProp<ImageStyle> }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const colors = tokens.colors.semantic.light;
  if (!imageUrl || imageUrl === failedUrl) {
    return (
      <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSubtle }]}>
        <SymbolView name={{ android: 'image', ios: 'photo', web: 'image' }} size={22} tintColor={colors.textPlaceholder} />
      </View>
    );
  }
  const source = imageUrl === 'saved-fixture://place' || imageUrl === 'saved-fixture://course'
    ? fixtureImages[imageUrl] : { uri: imageUrl };
  return <Image source={source} contentFit="cover" style={style} onError={() => setFailedUrl(imageUrl)} />;
}
