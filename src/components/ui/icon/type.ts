import type { SymbolViewProps } from 'expo-symbols';

export type IconName =
  | 'add'
  | 'check'
  | 'chevronLeft'
  | 'chevronRight'
  | 'edit'
  | 'paw';

export interface IconProps extends Omit<SymbolViewProps, 'name'> {
  name: IconName;
}
