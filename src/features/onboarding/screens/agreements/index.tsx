import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  BottomActions,
  InlineError,
  OnboardingPage,
  ScreenTitle,
} from '@/features/onboarding/components';

import { tokens } from '@/constants/tokens';
import { getAgreementDefinitions, getUserAgreements, saveAgreements } from '../../api';
import { AGREEMENT_FALLBACKS } from '../../constants';
import { useOnboarding } from '../../context';
import { getErrorMessage } from '@/utils/error';
import { styles } from './style';

import type { AgreementDefinition, AgreementState } from '../../types';

export function AgreementsScreen() {
  const { completeAgreements } = useOnboarding();
  const [definitions, setDefinitions] = useState<AgreementDefinition[]>(AGREEMENT_FALLBACKS);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void Promise.all([getAgreementDefinitions(), getUserAgreements()])
      .then(([items, state]) => {
        setDefinitions(items.length ? items : AGREEMENT_FALLBACKS);
        setSelected(Object.fromEntries(state.agreements.map((item) => [item.type, item.agreed])));
      })
      .catch((nextError) => setError(getErrorMessage(nextError)));
  }, []);

  const allSelected = definitions.length > 0 && definitions.every((item) => selected[item.type]);
  const requiredSelected = definitions
    .filter((item) => item.required)
    .every((item) => selected[item.type]);

  const submit = async () => {
    try {
      setPending(true);
      setError(undefined);
      const payload: AgreementState[] = definitions.map((item) => ({
        agreed: Boolean(selected[item.type]),
        type: item.type,
      }));
      await saveAgreements(payload);
      completeAgreements();
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setPending(false);
    }
  };

  return (
    <OnboardingPage>
      <ScrollView contentContainerStyle={styles.agreementContent}>
        <ScreenTitle>
          우리 아이와 함께하려면{`\n`}약관 동의가 필요해요
        </ScreenTitle>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: allSelected }}
          onPress={() => setSelected(
            Object.fromEntries(definitions.map((item) => [item.type, !allSelected])),
          )}
          style={styles.allAgreement}
        >
          <Icon
            name="paw"
            size={24}
            tintColor={allSelected
              ? tokens.colors.semantic.light.primary
              : tokens.colors.semantic.light.textDisabled}
          />
          <View style={styles.flex}>
            <Text fontSize={16} fontWeight="bold" lineHeight={24}>모든 약관 동의</Text>
            <Text color="textDisabled" fontSize={14} lineHeight={20}>
              서비스 이용을 위한 모든 약관에 동의합니다.
            </Text>
          </View>
        </Pressable>
        <View style={styles.divider} />
        <View>
          {definitions.map((item) => (
            <View key={item.type} style={styles.agreementRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: Boolean(selected[item.type]) }}
                onPress={() => setSelected((current) => ({
                  ...current,
                  [item.type]: !current[item.type],
                }))}
                style={styles.agreementSelect}
              >
                <Icon
                  name="paw"
                  size={20}
                  tintColor={selected[item.type]
                    ? tokens.colors.semantic.light.primary
                    : tokens.colors.semantic.light.textDisabled}
                />
                <Text color="textSecondary" fontSize={16} lineHeight={24}>
                  {item.name} ({item.required ? '필수' : '선택'})
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`${item.name} 상세 보기`}
                disabled={!item.url}
                onPress={() => item.url && void WebBrowser.openBrowserAsync(item.url)}
                style={!item.url && styles.disabledChevron}
              >
                <Icon
                  name="chevronRight"
                  size={24}
                  tintColor={tokens.colors.semantic.light.textSecondary}
                />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.legalNotes}>
          <Text color="textDisabled" fontSize={12} lineHeight={20}>
            - 별도의 정보입력 없이 회원가입이 이루어집니다.
          </Text>
          <Text color="textDisabled" fontSize={12} lineHeight={20}>
            - SNS 회원가입 / 로그인을 하시면 서비스 이용약관, 개인정보 수집 및 이용동의,
            전자금융거래 이용약관에 필수 동의해야 합니다.
          </Text>
        </View>
        <InlineError message={error} />
      </ScrollView>
      <BottomActions>
        <Button disabled={!requiredSelected || pending} onPress={() => void submit()}>
          {pending ? '저장 중...' : '동의 했어요'}
        </Button>
      </BottomActions>
    </OnboardingPage>
  );
}
