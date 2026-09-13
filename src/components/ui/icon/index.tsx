import { SymbolView } from 'expo-symbols';

import { styles } from './style';

import type { SymbolViewProps } from 'expo-symbols';
import type { IconName, IconProps } from './type';

const ICON_NAMES = {
  add: { android: 'add', ios: 'plus', web: 'add' },
  check: { android: 'check', ios: 'checkmark', web: 'check' },
  chevronLeft: { android: 'chevron_left', ios: 'chevron.left', web: 'chevron_left' },
  chevronRight: { android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' },
  edit: { android: 'edit', ios: 'pencil', web: 'edit' },
  paw: { android: 'pets', ios: 'pawprint.fill', web: 'pets' },
} as const satisfies Record<IconName, SymbolViewProps['name']>;

export function Icon({ name, style, ...props }: IconProps) {
  return <SymbolView {...props} name={ICON_NAMES[name]} style={[styles.icon, style]} />;
}
