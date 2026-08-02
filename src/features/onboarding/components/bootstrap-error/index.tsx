import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { styles } from './style';

import type { BootstrapErrorProps } from './type';

export function BootstrapError({ onRetry }: BootstrapErrorProps) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text fontSize={18} fontWeight="bold" lineHeight={28} style={styles.title}>
          연결 상태를 확인해주세요
        </Text>
        <Text color="textTertiary" fontSize={14} lineHeight={20} style={styles.description}>
          로그인 정보는 안전하게 유지하고 있어요.
        </Text>
        <Button onPress={onRetry}>다시 시도</Button>
      </View>
    </SafeAreaView>
  );
}
