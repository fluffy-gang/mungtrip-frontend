import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

import { openExternalUrlWithFallback } from '@/shared/utils/open-external-url';

it('지도 앱을 열지 못하면 웹 fallback을 연다', async () => {
  const openURL = jest
    .spyOn(Linking, 'openURL')
    .mockRejectedValueOnce(new Error('app unavailable'))
    .mockResolvedValueOnce(true);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation();

  await openExternalUrlWithFallback(
    'nmap://route/public?dlat=33.4',
    'https://map.naver.com/p/search/place',
    '네이버지도',
  );

  expect(openURL).toHaveBeenNthCalledWith(1, 'nmap://route/public?dlat=33.4');
  expect(openURL).toHaveBeenNthCalledWith(
    2,
    'https://map.naver.com/p/search/place',
  );
  expect(alert).not.toHaveBeenCalled();
});
