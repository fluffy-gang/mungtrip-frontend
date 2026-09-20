export interface DialogButtonConfig {
  onPress?: () => void;
  style?: 'cancel' | 'default' | 'destructive';
  text: string;
}

export interface DialogConfig {
  buttons?: DialogButtonConfig[];
  description?: string;
  title: string;
}
