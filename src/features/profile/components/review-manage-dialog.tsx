import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { tokens } from '@/constants/tokens';

export interface ReviewMenuAnchor {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface ReviewActionMenuProps {
  anchor: ReviewMenuAnchor;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

interface ReviewDeleteDialogProps {
  deleting?: boolean;
  onClose: () => void;
  onDelete: () => void;
  visible: boolean;
}

const colors = tokens.colors.semantic.light;
const { spacing } = tokens;
const ACTION_MENU_WIDTH = 140;
const SCREEN_EDGE = 16;

/** Floating edit/delete actions anchored to a review card's more button. */
export function ReviewActionMenu({ anchor, onClose, onDelete, onEdit }: ReviewActionMenuProps) {
  const { width: screenWidth } = useWindowDimensions();
  if (!anchor) return null;

  const left = Math.max(
    SCREEN_EDGE,
    Math.min(anchor.x + anchor.width - ACTION_MENU_WIDTH, screenWidth - ACTION_MENU_WIDTH - SCREEN_EDGE),
  );

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible>
      <View style={styles.actionModal}>
        <Pressable
          accessibilityLabel="리뷰 관리 메뉴 닫기"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.dismissLayer}
        />
        <View style={[styles.actionMenu, { left, top: anchor.y + anchor.height + spacing[16] }]}>
          <Pressable accessibilityRole="button" onPress={onEdit} style={styles.actionButton}>
            <Text style={styles.actionText}>수정하기</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onDelete} style={styles.actionButton}>
            <Text style={styles.deleteActionText}>삭제하기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Centered review deletion confirmation matching the Figma review-management dialog. */
export function ReviewDeleteDialog({ deleting, onClose, onDelete, visible }: ReviewDeleteDialogProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.deleteModal}>
        <Pressable
          accessibilityLabel="리뷰 삭제 취소"
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.deleteDialog}>
          <View style={styles.deleteCopy}>
            <Text style={styles.deleteTitle}>리뷰를 삭제할까요?</Text>
            <Text style={styles.deleteDescription}>삭제 후에는 복구나 재작성이 불가능해요</Text>
          </View>
          <View style={styles.deleteButtonRow}>
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={onClose}
              style={styles.deleteButton}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deleting}
              onPress={onDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.confirmButtonText}>{deleting ? '삭제 중...' : '삭제'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionModal: { flex: 1 },
  actionButton: {
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[8],
  },
  actionMenu: {
    backgroundColor: colors.surface,
    borderColor: '#F2F4F6',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: spacing[12],
    position: 'absolute',
    shadowColor: '#001B37',
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    width: ACTION_MENU_WIDTH,
    zIndex: 2,
  },
  actionText: {
    color: '#333D4B',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  cancelButtonText: {
    color: '#333D4B',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.32,
    lineHeight: 24,
  },
  confirmButtonText: {
    color: '#F04452',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.32,
    lineHeight: 24,
  },
  deleteActionText: {
    color: '#F04452',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.28,
    lineHeight: 20,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#E5E8EB',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  deleteButtonRow: {
    flexDirection: 'row',
    gap: spacing[8],
    paddingBottom: spacing[16],
    paddingHorizontal: spacing[16],
    paddingTop: spacing[20],
    width: '100%',
  },
  deleteCopy: {
    alignItems: 'center',
    gap: spacing[8],
    paddingHorizontal: spacing[20],
    paddingTop: spacing[24],
    width: '100%',
  },
  deleteDescription: {
    color: '#636368',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.32,
    lineHeight: 26,
    textAlign: 'center',
  },
  deleteDialog: { backgroundColor: colors.surface, borderRadius: 24, overflow: 'hidden', width: 311 },
  deleteModal: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  deleteTitle: {
    color: '#262630',
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.36,
    lineHeight: 29,
    textAlign: 'center',
  },
  dismissLayer: { ...StyleSheet.absoluteFill, zIndex: 1 },
});
