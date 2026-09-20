import { Image } from 'expo-image';
import { Pressable } from 'react-native';

import type { PressableProps } from 'react-native';

export interface LikeButtonProps extends Omit<PressableProps, 'children' | 'accessibilityRole' | 'accessibilityState'> {
  liked: boolean;
  size?: 24 | 28;
  variant?: 'outline' | 'photo' | 'muted';
  busy?: boolean;
}

const assets = {
  outline: require('./assets/outline.svg'),
  photo: require('./assets/photo.svg'),
  muted: require('./assets/muted.svg'),
  selected: require('./assets/selected.svg'),
};

/** Controlled visual toggle. Callers own persistence; presses never open a containing card.
 * Size is the SVG's outer box (including its authored inset), not the heart path width.
 */
export function LikeButton({ liked, size = 24, variant = 'outline', busy = false, disabled = false, style, onPress, accessibilityLabel, hitSlop, ...props }: LikeButtonProps) {
  const locked = disabled || busy;
  return <Pressable {...props} accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? (liked ? '찜 해제' : '찜하기')}
    accessibilityState={{ selected: liked, disabled: locked, busy }}
    disabled={locked} hitSlop={hitSlop ?? (44 - size) / 2}
    style={state => [{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, typeof style === 'function' ? style(state) : style]}
    onPress={event => { event.stopPropagation(); if (!locked) onPress?.(event); }}>
    <Image accessible={false} source={assets[liked ? 'selected' : variant]} style={{ width: size, height: size }} contentFit="contain" />
  </Pressable>;
}
