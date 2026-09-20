import { useEffect, useRef } from 'react';
import { Modal, Keyboard, KeyboardAvoidingView, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../detail/styles';

import type { ReactNode } from 'react';

/** 배경 터치·뒤로가기·접근성 닫기를 같은 경로로 처리하며 저장 중에는 닫기를 막는다. */
export function SheetShell({ children, onClose, busy }: { children: ReactNode; onClose(): void; busy: boolean }) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const close = () => {
    if (busy) return;
    Keyboard.dismiss();
    onClose();
  };
  useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', () => scroll.current?.scrollToEnd({ animated: true }));
    return () => listener.remove();
  }, []);
  const drag = PanResponder.create({
    onStartShouldSetPanResponder: () => !busy,
    onMoveShouldSetPanResponder: (_, gesture) => !busy && gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => { if (gesture.dy > 50) close(); },
  });
  return <Modal visible transparent animationType="slide" onRequestClose={close}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="시트 닫기" disabled={busy} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]} accessibilityViewIsModal onAccessibilityEscape={close}>
        <View {...drag.panHandlers} style={{ minHeight: 44, justifyContent: 'center' }} accessibilityLabel="아래로 밀어 닫기"><View style={styles.handle} /></View>
        <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayScrim },
  sheet: { maxHeight: '90%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { height: 4, width: 32, borderRadius: 4, backgroundColor: colors.surfaceMuted, alignSelf: 'center', marginVertical: 0 },
  content: { paddingHorizontal: 20, gap: 20, paddingBottom: 8 },
});
