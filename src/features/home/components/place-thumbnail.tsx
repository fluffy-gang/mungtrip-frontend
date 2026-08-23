import type { ImageStyle, StyleProp } from 'react-native';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { colors, styles } from '../styles';

/** 썸네일 URL이 없을 때 빈 공간 대신 이미지 없음 placeholder를 보여준다. */
export function PlaceThumbnail({
  imageUrl,
  style,
}: {
  imageUrl?: string;
  style: StyleProp<ImageStyle>;
}) {
  if (!imageUrl) {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <SymbolView
          name={{ android: 'image', ios: 'photo', web: 'image' }}
          size={22}
          tintColor={colors.textPlaceholder}
        />
      </View>
    );
  }

  return <Image source={{ uri: imageUrl }} style={style} />;
}
