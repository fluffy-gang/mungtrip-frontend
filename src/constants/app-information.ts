export const APP_INFORMATION = {
  dataSourceName: '한국관광공사',
  accuracyNotice:
    '제공 정보는 실제와 다를 수 있으니 방문 전 사업자에게 확인해 주세요.',
  privacyPolicyUrl: undefined as string | undefined,
  supportEmail: undefined as string | undefined,
} as const;

// 외부 열기 동작은 유효한 HTTPS URL에서만 노출한다.
export const getHttpsExternalUrl = (
  value: string | undefined,
): string | undefined => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) return undefined;

  try {
    return new URL(trimmedValue).protocol === 'https:'
      ? trimmedValue
      : undefined;
  } catch {
    return undefined;
  }
};
