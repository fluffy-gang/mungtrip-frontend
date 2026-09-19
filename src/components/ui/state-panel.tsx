import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { tokens } from '@/constants/tokens';
import { Button } from './button';

import type { ReactNode } from 'react';

const colors = tokens.colors.semantic.light;
const { spacing } = tokens;

interface StatePanelProps {
  description?: string;
  icon?: Parameters<typeof SymbolView>[0]['name'];
  iconElement?: ReactNode;
  loading?: boolean;
  onRetry?: () => void;
  title: string;
}

/**
 * 로딩/빈/오류 상태를 한 화면 안에서 공통으로 보여주는 패널.
 * 화면 전체, 바텀시트, 목록 내부 등 어디서든 재사용한다.
 */
export function StatePanel({ description, icon, iconElement, loading, onRetry, title }: StatePanelProps) {
  return (
    <View style={styles.stateBox}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {iconElement && !loading ? iconElement : null}
      {icon && !iconElement && !loading ? <SymbolView name={icon} size={32} tintColor="#8B95A1" /> : null}
      <Text style={styles.stateTitle}>{title}</Text>
      {description ? <Text style={styles.stateText}>{description}</Text> : null}
      {onRetry ? (
        <Button fullWidth={false} onPress={onRetry} size="m" type="sub">
          다시 시도
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    alignItems: 'center',
    gap: spacing[12],
    justifyContent: 'center',
    minHeight: 160,
    padding: spacing[24],
  },
  stateTitle: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  stateText: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    textAlign: 'center',
  },
});
