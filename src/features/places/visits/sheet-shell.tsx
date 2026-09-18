import { Modal, KeyboardAvoidingView, PanResponder, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../detail/styles';

import type { ReactNode } from 'react';

export function SheetShell({ children, onClose, busy }: { children: ReactNode; onClose(): void; busy: boolean }) {
  const insets = useSafeAreaInsets();
  const drag = PanResponder.create({
    onStartShouldSetPanResponder: () => !busy,
    onMoveShouldSetPanResponder: (_, gesture) => !busy && gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => { if (!busy && gesture.dy > 50) onClose(); },
  });
  return <Modal visible transparent animationType="slide" onRequestClose={() => { if (!busy) onClose(); }}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="시트 닫기" disabled={busy} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]} accessibilityViewIsModal>
        <View {...drag.panHandlers} style={{ minHeight: 44, justifyContent: 'center' }} accessibilityLabel="아래로 밀어 닫기"><View style={styles.handle} /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView>
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
