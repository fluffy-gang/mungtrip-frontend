import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/constants/tokens';

import type { ReactNode } from 'react';

const colors = tokens.colors.semantic.light;
const { spacing } = tokens;
const BACK_ICON = require('./assets/screen-header-back.svg');

interface ScreenHeaderProps {
  onBack?: () => void;
  rightAction?: ReactNode;
  title: string;
}

/** 뒤로가기(선택)와 가운데 정렬 제목을 가진 화면 상단 헤더. */
export function ScreenHeader({ onBack, rightAction, title }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Image contentFit="contain" source={BACK_ICON} style={styles.backIcon} />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerAction}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginLeft: -spacing[8],
    width: 40,
  },
  backIcon: { height: 24, width: 24 },
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: tokens.fonts.sansSerif,
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  headerAction: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 40 },
});
