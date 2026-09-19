import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/constants/tokens';
import { useDialogStore } from './store';

import type { DialogButtonConfig } from './types';

const colors = tokens.colors.semantic.light;
const { radius, spacing } = tokens;

const DEFAULT_BUTTONS: DialogButtonConfig[] = [{ text: '확인' }];

/** 루트 레이아웃에 한 번만 마운트한다. showDialog()가 이 컴포넌트를 통해 실제로 그려진다. */
export function DialogHost() {
  const config = useDialogStore(state => state.config);
  const hide = useDialogStore(state => state.hide);

  if (!config) return null;

  const buttons = config.buttons?.length ? config.buttons : DEFAULT_BUTTONS;
  const isSideBySide = buttons.length === 2 && buttons.some(button => button.style === 'cancel');

  const handlePress = (button: DialogButtonConfig) => {
    hide();
    button.onPress?.();
  };

  return (
    <Modal animationType="fade" onRequestClose={hide} transparent visible>
      <Pressable onPress={hide} style={styles.overlay}>
        <Pressable onPress={event => event.stopPropagation()} style={styles.card}>
          <Text style={styles.title}>{config.title}</Text>
          {config.description ? <Text style={styles.description}>{config.description}</Text> : null}
          <View style={isSideBySide ? styles.buttonRow : styles.buttonColumn}>
            {buttons.map((button, index) => (
              <Pressable
                accessibilityRole="button"
                key={`${button.text}-${index}`}
                onPress={() => handlePress(button)}
                style={[
                  isSideBySide ? styles.sideButton : styles.stackedButton,
                  buttonBackgroundStyle(button.style),
                ]}
              >
                <Text style={[styles.buttonText, buttonTextStyle(button.style)]}>
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function buttonBackgroundStyle(style: DialogButtonConfig['style']) {
  if (style === 'cancel') return styles.cancelButton;
  if (style === 'destructive') return styles.destructiveButton;
  return styles.defaultButton;
}

function buttonTextStyle(style: DialogButtonConfig['style']) {
  if (style === 'cancel') return styles.cancelText;
  return styles.lightButtonText;
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlayScrim,
    flex: 1,
    justifyContent: 'center',
    padding: spacing[24],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius[16],
    gap: spacing[8],
    padding: spacing[20],
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: tokens.fonts.sansSerif,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  description: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[8],
    marginTop: spacing[12],
  },
  buttonColumn: { gap: spacing[8], marginTop: spacing[12] },
  sideButton: {
    alignItems: 'center',
    borderRadius: radius[12],
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing[12],
  },
  stackedButton: {
    alignItems: 'center',
    borderRadius: radius[12],
    justifyContent: 'center',
    paddingVertical: spacing[12],
  },
  cancelButton: { backgroundColor: colors.surfaceSubtle },
  destructiveButton: { backgroundColor: '#D92D20' },
  defaultButton: { backgroundColor: colors.primary },
  buttonText: {
    fontFamily: tokens.fonts.sansSerif,
    fontWeight: '700',
    fontSize: 14,
  },
  cancelText: { color: colors.textSecondary },
  lightButtonText: { color: colors.onPrimary },
});
