import { Text } from '@/components/ui/text';

import { styles } from './style';

import type { InlineErrorProps } from './type';

export function InlineError({ message }: InlineErrorProps) {
  return message ? (
    <Text color="primary" fontSize={14} lineHeight={20} style={styles.message}>
      {message}
    </Text>
  ) : null;
}
