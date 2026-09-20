import { useEffect } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

import { styles } from './style';

import type { ToastProps } from './type';

const DEFAULT_DURATION = 3_000;

export function Toast({
  bottomOffset = 32,
  duration = DEFAULT_DURATION,
  message,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, message, onDismiss]);

  if (!message) return null;

  return (
    <View
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      pointerEvents="none"
      style={[styles.container, { bottom: bottomOffset }]}
    >
      <Text color="onInverse" fontSize={14} lineHeight={20} style={styles.message}>
        {message}
      </Text>
    </View>
  );
}
