import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

import { openExternalUrl } from '@/features/app-info/app-info-screen';

it('informs the user when an external target cannot be opened', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('failed'));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation();

  await openExternalUrl('https://example.com', '개인정보처리방침');

  expect(alert).toHaveBeenCalledWith(
    '개인정보처리방침을 열 수 없어요',
    '잠시 후 다시 시도해 주세요.',
  );
});
