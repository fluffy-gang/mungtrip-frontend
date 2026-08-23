import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '@/constants/tokens';

const colors = tokens.colors.semantic.light;
const { spacing } = tokens;

// TODO(#10): 장소 상세페이지 미구현. 실제 상세 API/디자인이 정해지면 이 화면을 채운다.
export function PlaceDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <SymbolView
            name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }}
            size={24}
            tintColor={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>장소 상세</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.stateBox}>
        <SymbolView
          name={{ android: 'pets', ios: 'pawprint.fill', web: 'pets' }}
          size={32}
          tintColor={colors.textPlaceholder}
        />
        <Text style={styles.stateTitle}>상세 페이지 준비 중이에요</Text>
        <Text style={styles.stateText}>
          장소 #{params.id} 상세 페이지는 준비 중이에요. 조금만 기다려주세요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: spacing[16],
  },
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
  headerTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  stateBox: {
    alignItems: 'center',
    gap: spacing[12],
    justifyContent: 'center',
    minHeight: 160,
    paddingVertical: spacing[24],
  },
  stateTitle: {
    color: colors.textSecondary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    color: colors.textTertiary,
    fontFamily: tokens.fonts.sansSerif,
    fontSize: 13,
    textAlign: 'center',
  },
});
