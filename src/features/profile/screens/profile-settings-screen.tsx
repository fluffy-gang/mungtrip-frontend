import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showDialog } from '@/components/ui/dialog';
import { ScreenHeader } from '@/components/ui/screen-header';

import { getMyAgreements } from '@/features/agreements/api';
import { useAuthStore } from '@/features/auth/authStore';
import { useAuth } from '@/features/auth/useAuth';
import { styles } from '../styles';

import type { Agreement, AgreementType } from '@/features/agreements/types';

const agreementLabels: Record<AgreementType, string> = {
  ELECTRONIC_FINANCE: '전자금융거래 이용약관',
  LOCATION: '위치기반 서비스 이용약관',
  MARKETING: '마케팅 정보 수신 동의',
  PRIVACY: '개인정보 처리방침',
  SERVICE: '서비스 이용약관',
  TELECOM: '통신사 이용약관',
};

export function ProfileSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const { handleWithdrawAccount } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!isLoggedIn) return;

    void getMyAgreements()
      .then(response => {
        if (isMounted) setAgreements(response.agreements);
      })
      .catch(() => {
        if (isMounted) setAgreements([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const withdraw = async () => {
    if (withdrawing) return;

    setWithdrawing(true);
    try {
      await handleWithdrawAccount();
      showDialog(
        '탈퇴 신청이 완료됐어요',
        '30일 이내 다시 로그인하면 계정을 복구할 수 있어요.',
        [{ text: '확인', onPress: () => router.replace('/') }],
      );
    } catch {
      showDialog('탈퇴 신청에 실패했어요', '잠시 후 다시 시도해주세요.');
    } finally {
      setWithdrawing(false);
    }
  };

  const confirmWithdraw = () => {
    showDialog(
      '정말 탈퇴할까요?',
      '탈퇴 신청 즉시 로그아웃되며, 30일 동안 계정 복구가 가능해요.',
      [
        { style: 'cancel', text: '취소' },
        {
          style: 'destructive',
          text: withdrawing ? '처리 중...' : '탈퇴하기',
          onPress: () => void withdraw(),
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader onBack={() => router.back()} title="약관 및 정책" />
        <View style={styles.section}>
          {loading ? <ActivityIndicator color="#FE6A20" /> : null}
          <View style={styles.menuCard}>
            {Object.entries(agreementLabels).map(([type, label], index, entries) => {
              const agreement = agreements.find(item => item.type === type);
              return (
                <View
                  key={type}
                  style={[
                    styles.menuRow,
                    index === entries.length - 1 && styles.menuRowLast,
                  ]}
                >
                  <Text style={styles.menuText}>{label}</Text>
                  <Text style={styles.agreementStatus}>
                    {agreement ? (agreement.agreed ? '동의' : '미동의') : '보기'}
                  </Text>
                </View>
              );
            })}
          </View>
          {isLoggedIn ? (
            <Pressable
              accessibilityRole="button"
              disabled={withdrawing}
              onPress={confirmWithdraw}
              style={styles.withdrawButton}
            >
              <Text style={styles.dangerText}>
                {withdrawing ? '탈퇴 처리 중...' : '회원탈퇴'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
