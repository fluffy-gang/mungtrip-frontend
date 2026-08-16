import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { getMyAgreements } from '@/features/agreements/api';
import type { Agreement, AgreementType } from '@/features/agreements/types';
import { useAuthStore } from '@/features/auth/authStore';

import { styles } from '../styles';

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
  const isMockSession = useAuthStore(state => state.isMockSession);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(isLoggedIn);

  useEffect(() => {
    let isMounted = true;
    if (!isLoggedIn) return;

    // TODO(#11): 실제 로그인 화면(#9)이 머지되면 이 분기를 제거한다.
    // 목로그인 상태에는 진짜 토큰이 없으니 실제 API를 아예 호출하지 않는다.
    if (isMockSession) {
      void Promise.resolve().then(() => {
        if (!isMounted) return;

        setAgreements([]);
        setLoading(false);
      });
      return;
    }

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
  }, [isLoggedIn, isMockSession]);

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
        </View>
      </ScrollView>
    </View>
  );
}
