import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { tokens } from '@/constants/tokens';
import { createFadeStyle, styles } from './style';

import type {
  BackButtonProps,
  BottomSheetProps,
  ChildrenProps,
  DogPlaceholderProps,
  FadeSequenceProps,
  ScreenTitleProps,
  StepHeaderProps,
} from './type';

export { InlineError } from './inline-error';
export { BootstrapError } from './bootstrap-error';

export function OnboardingPage({ children }: ChildrenProps) {
  return <SafeAreaView style={styles.page}>{children}</SafeAreaView>;
}

export function BackButton({ disabled = false, onPress }: BackButtonProps) {
  return (
    <Pressable
      accessibilityLabel="이전 화면"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Icon
        name="chevronLeft"
        size={28}
        tintColor={tokens.colors.semantic.light.textPrimary}
      />
    </Pressable>
  );
}

export function StepHeader({ current, disabled = false, onBack }: StepHeaderProps) {
  return (
    <View>
      <BackButton disabled={disabled} onPress={onBack} />
      <View
        accessibilityLabel={`반려견 등록 ${current}단계, 총 4단계`}
        accessibilityRole="progressbar"
        style={styles.progress}
      >
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={[styles.progressItem, step <= current && styles.progressActive]} />
        ))}
      </View>
    </View>
  );
}

export function FadeSequence({ children, delay = 0, style }: FadeSequenceProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(8));

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        delay,
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        delay,
        duration: 220,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[createFadeStyle(opacity, translateY), style]}>
      {children}
    </Animated.View>
  );
}

export function BottomActions({ children }: ChildrenProps) {
  return <View style={styles.actions}>{children}</View>;
}

export function BottomSheet({ children, onClose, visible }: BottomSheetProps) {
  if (!visible) return null;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="닫기" onPress={onClose} style={styles.scrim} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export function ScreenTitle({ children, style }: ScreenTitleProps) {
  return (
    <Text
      fontFamily="rounded"
      fontSize={28}
      fontWeight="bold"
      lineHeight={40}
      style={[styles.screenTitle, style]}
    >
      {children}
    </Text>
  );
}

export function DogPlaceholder({ compact = false, style }: DogPlaceholderProps) {
  return (
    <View
      accessibilityLabel="반려견 이미지 자리"
      style={[styles.dogPlaceholder, compact && styles.dogPlaceholderCompact, style]}
    />
  );
}
