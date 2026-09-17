import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { colors, placeStyles as s } from './styles';

import type { ImageStyle, StyleProp } from 'react-native';

export type PhotoSource = number | { uri: string };
export const MOCK_HERO = require('./assets/hero.webp');
export const MOCK_REVIEW_PHOTO = require('./assets/review-photo.webp');
const icons = {
  close: require('./assets/close.svg'),
  back: require('./assets/back.svg'), share: require('./assets/share.svg'),
  plus: require('./assets/plus.svg'),
  pin: require('./assets/pin.svg'), clock: require('./assets/clock.svg'),
  phone: require('./assets/phone.svg'), official: require('./assets/official.svg'),
  users: require('./assets/users.svg'), star: require('./assets/star.svg'),
};
/** Figma-exported vectors retain their viewBox and explicit leaf dimensions. */
export function PlaceIcon({ name, size = 24 }: { name: keyof typeof icons; size?: number }) {
  return <Image source={icons[name]} style={{ width: size, height: size }} contentFit="contain" accessibilityElementsHidden />;
}
interface PhotoProps { source?: PhotoSource; style: StyleProp<ImageStyle>; contain?: boolean }
export function PlacePhoto(props: PhotoProps) {
  const identity = typeof props.source === 'number' ? String(props.source) : props.source?.uri ?? 'missing';
  return <PhotoContent key={identity} {...props} />;
}
function PhotoContent({ source, style, contain = false }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  if (!source || failed) return <View style={[style, { backgroundColor: colors.surfaceSubtle, justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={s.small}>사진을 표시할 수 없어요</Text>
  </View>;
  return <Image source={source} style={style} contentFit={contain ? 'contain' : 'cover'} onError={() => setFailed(true)} />;
}
