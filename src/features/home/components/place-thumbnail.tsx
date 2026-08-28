import { useState } from 'react';
import type { ImageStyle, StyleProp } from 'react-native';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { colors, styles } from '../styles';

/** 썸네일 URL 누락·로딩 실패 시 크기를 유지한 placeholder를 보여준다. */
export function PlaceThumbnail({
  imageUrl,
  style,
}: {
  imageUrl?: string;
  style: StyleProp<ImageStyle>;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();

  if (!imageUrl || failedUrl === imageUrl) {
    return (
      <View
        accessibilityLabel="장소 이미지 없음"
        accessibilityRole="image"
        style={[style, styles.imagePlaceholder]}
      >
        <SymbolView
          name={{ android: 'image', ios: 'photo', web: 'image' }}
          size={22}
          tintColor={colors.textPlaceholder}
        />
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel="장소 이미지"
      onError={() => setFailedUrl(imageUrl)}
      source={{ uri: imageUrl }}
      style={style}
    />
  );
}
