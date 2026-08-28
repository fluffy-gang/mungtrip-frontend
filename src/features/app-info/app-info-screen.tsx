import { styled } from 'styled-components/native';

import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import {
  APP_INFORMATION,
  getHttpsExternalUrl,
} from '@/constants/app-information';
import { openExternalUrl } from '@/shared/utils/open-external-url';

export { openExternalUrl } from '@/shared/utils/open-external-url';

export function AppInfoScreen() {
  const privacyPolicyUrl = getHttpsExternalUrl(
    APP_INFORMATION.privacyPolicyUrl,
  );
  const supportEmail = APP_INFORMATION.supportEmail?.trim();

  return (
    <Screen>
      <Content contentInsetAdjustmentBehavior="automatic">
        <Section accessibilityRole="summary">
          <Text fontSize={18} fontWeight="bold" lineHeight={26}>
            데이터 출처
          </Text>
          <BodyText color="textSecondary" lineHeight={24}>
            이 앱은 {APP_INFORMATION.dataSourceName} 제공 공개 데이터를 바탕으로
            반려견 동반 장소 정보를 안내합니다.
          </BodyText>
        </Section>

        <Section>
          <Text fontSize={18} fontWeight="bold" lineHeight={26}>
            정보 이용 안내
          </Text>
          <BodyText color="textSecondary" lineHeight={24}>
            {APP_INFORMATION.accuracyNotice}
          </BodyText>
          <BodyText color="textSecondary" lineHeight={24}>
            영업시간과 반려견 동반 조건은 변경될 수 있습니다. 출발 전에 전화나
            공식 홈페이지에서 최신 정보를 확인해 주세요.
          </BodyText>
        </Section>

        {supportEmail ? (
          <Section>
            <Text fontSize={18} fontWeight="bold" lineHeight={26}>
              지원 문의
            </Text>
            <Action
              accessibilityLabel={`지원 문의 이메일 보내기, ${supportEmail}`}
              accessibilityRole="button"
              onPress={() =>
                void openExternalUrl(
                  `mailto:${encodeURIComponent(supportEmail)}`,
                  '이메일 앱',
                )
              }
            >
              <ActionText fontWeight="semibold" lineHeight={24}>
                이메일로 문의하기
              </ActionText>
            </Action>
          </Section>
        ) : null}

        {privacyPolicyUrl ? (
          <Section>
            <Text fontSize={18} fontWeight="bold" lineHeight={26}>
              개인정보처리방침
            </Text>
            <Action
              accessibilityLabel="개인정보처리방침을 외부 브라우저에서 열기"
              accessibilityRole="button"
              onPress={() =>
                void openExternalUrl(privacyPolicyUrl, '개인정보처리방침')
              }
            >
              <ActionText fontWeight="semibold" lineHeight={24}>
                개인정보처리방침 보기
              </ActionText>
            </Action>
          </Section>
        ) : null}
      </Content>
    </Screen>
  );
}

const Content = styled.ScrollView.attrs({
  contentContainerStyle: { paddingBottom: 32 },
})`
  padding: ${({ theme }) => theme.spacing[20]}px;
`;

const Section = styled.View`
  background-color: ${({ theme }) => theme.colors.semantic.light.surface};
  border-color: ${({ theme }) => theme.colors.semantic.light.border};
  border-radius: ${({ theme }) => theme.radius[16]}px;
  border-width: ${({ theme }) => theme.borderWidth[1]}px;
  gap: ${({ theme }) => theme.spacing[12]}px;
  margin-bottom: ${({ theme }) => theme.spacing[16]}px;
  padding: ${({ theme }) => theme.spacing[20]}px;
`;

const BodyText = styled(Text)``;

const Action = styled.Pressable`
  align-items: center;
  align-self: stretch;
  background-color: ${({ theme }) => theme.colors.semantic.light.primary};
  border-radius: ${({ theme }) => theme.radius[12]}px;
  justify-content: center;
  min-height: ${({ theme }) => theme.spacing[44]}px;
  padding: ${({ theme }) => theme.spacing[12]}px
    ${({ theme }) => theme.spacing[16]}px;
`;

const ActionText = styled(Text).attrs({ color: 'onPrimary' })`
  text-align: center;
`;
