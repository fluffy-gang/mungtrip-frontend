import {
  APP_INFORMATION,
  getHttpsExternalUrl,
} from '@/constants/app-information';

it('defines public app information without inventing release contacts', () => {
  expect(APP_INFORMATION).toEqual({
    dataSourceName: '한국관광공사',
    accuracyNotice:
      '제공 정보는 실제와 다를 수 있으니 방문 전 사업자에게 확인해 주세요.',
    privacyPolicyUrl: undefined,
    supportEmail: undefined,
  });
});

it('returns only non-empty HTTPS URLs for external actions', () => {
  expect(getHttpsExternalUrl(' https://example.com/privacy ')).toBe(
    'https://example.com/privacy',
  );

  for (const value of [
    undefined,
    '',
    '   ',
    'http://example.com/privacy',
    'mailto:support@example.com',
    'not-a-url',
  ]) {
    expect(getHttpsExternalUrl(value)).toBeUndefined();
  }
});
