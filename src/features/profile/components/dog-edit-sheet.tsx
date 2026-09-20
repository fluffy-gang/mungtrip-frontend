import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';

import { tokens } from '@/constants/tokens';

import type { ReactNode } from 'react';

interface DogEditSheetProps {
  children: ReactNode;
  disabled?: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  visible: boolean;
}

const colors = tokens.colors.semantic.light;

/**
 * A non-modal sheet lets the dimmed edit rows switch fields directly.
 * The sheet itself still owns all of its controls and Android back closes it.
 */
export function DogEditSheet({ children, disabled, onClose, onSave, title, visible }: DogEditSheetProps) {
  const insets = useSafeAreaInsets();
  const [backdropOpacity] = useState(() => new Animated.Value(visible ? 1 : 0));
  const [sheetOffset] = useState(() => new Animated.Value(visible ? 0 : 1000));

  useEffect(() => {
    if (!visible) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose, visible]);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(backdropOpacity, {
        duration: visible ? 180 : 140,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOffset, {
        duration: visible ? 220 : 160,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        toValue: visible ? 0 : 1000,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [backdropOpacity, sheetOffset, visible]);

  return (
    <View
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      pointerEvents={visible ? 'box-none' : 'none'}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
        style={styles.overlay}
      >
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, tokens.spacing[16]),
              transform: [{ translateY: sheetOffset }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityLabel="닫기" accessibilityRole="button" hitSlop={12} onPress={onClose}>
              <SymbolView
                name={{ android: 'close', ios: 'xmark', web: 'close' }}
                size={20}
                tintColor={colors.textSecondary}
              />
            </Pressable>
          </View>
          <View style={styles.body}>{visible ? children : null}</View>
          <Button disabled={disabled} onPress={onSave} size="m">
            변경
          </Button>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlayScrim },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: tokens.radius[24],
    borderTopRightRadius: tokens.radius[24],
    gap: tokens.spacing[16],
    paddingHorizontal: tokens.spacing[20],
    paddingTop: tokens.spacing[16],
  },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: colors.textPrimary, fontFamily: tokens.fonts.sansSerif, fontSize: 16, fontWeight: '700' },
  body: { gap: tokens.spacing[12] },
});
