import { Image } from 'expo-image';
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
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => void getProviderToken('GOOGLE').then(onCredential, onError)}
      style={({ pressed }) => [styles.socialButton, styles.googleButton, pressed && styles.pressed]}
    >
      <Image contentFit="contain" source={googleIcon} style={styles.socialIcon} />
      <Text fontSize={16} fontWeight="bold" lineHeight={24}>Google로 시작하기</Text>
    </Pressable>
  );
}
