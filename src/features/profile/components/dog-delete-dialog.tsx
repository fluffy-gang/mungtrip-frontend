import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/constants/tokens';

interface DogDeleteDialogProps {
  deleting?: boolean;
  onClose: () => void;
  onDelete: () => void;
  visible: boolean;
}

const colors = tokens.colors.semantic.light;

/** Figma-sized destructive confirmation for a dog profile. */
export function DogDeleteDialog({
  deleting = false,
  onClose,
  onDelete,
  visible,
}: DogDeleteDialogProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="반려견 정보 삭제 취소"
          accessibilityRole="button"
          disabled={deleting}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.dialog}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>반려견 정보를 지울까요?</Text>
          </View>
          <View style={styles.buttonArea}>
            <View style={styles.buttonRow}>
              <Pressable
                accessibilityRole="button"
                disabled={deleting}
                onPress={onClose}
                style={styles.button}
              >
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={deleting}
                onPress={onDelete}
                style={styles.button}
              >
                <Text style={styles.deleteText}>{deleting ? '삭제 중' : '정보 지우기'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlayScrim,
    flex: 1,
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radius[24],
    height: 137,
    overflow: 'hidden',
    width: 311,
  },
  titleArea: { alignItems: 'center', height: 53, paddingTop: 24 },
  title: {
    color: '#262630',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
    lineHeight: 29,
  },
  buttonArea: { height: 84, paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[20] },
  buttonRow: { flexDirection: 'row', gap: tokens.spacing[8] },
  button: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: tokens.radius[16],
    borderWidth: tokens.borderWidth[1],
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.32,
    lineHeight: 24,
  },
  deleteText: {
    color: '#F04452',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.32,
    lineHeight: 24,
  },
});
