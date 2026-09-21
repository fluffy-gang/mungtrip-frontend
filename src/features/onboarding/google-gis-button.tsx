import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { Text } from '@/components/ui/text';

import { getProviderToken } from './social';
import { styles } from './screens/login/style';

interface Props {
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (error: unknown) => void;
}

const googleIcon = require('../../../assets/images/onboarding/google-icon.png');

export function GoogleGISButton({ disabled, onCredential, onError }: Props) {
  const [selectingAccount, setSelectingAccount] = useState(false);

  const handlePress = () => {
    setSelectingAccount(true);
    void getProviderToken('GOOGLE').then(onCredential, (error: unknown) => {
      setSelectingAccount(false);
      onError(error);
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || selectingAccount}
      onPress={handlePress}
      style={({ pressed }) => [styles.socialButton, styles.googleButton, pressed && styles.pressed]}
    >
      <Image contentFit="contain" source={googleIcon} style={styles.socialIcon} />
      <Text fontSize={16} fontWeight="bold" lineHeight={24}>Google로 시작하기</Text>
    </Pressable>
  );
}
