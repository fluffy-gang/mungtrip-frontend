import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface ChildrenProps {
  children: ReactNode;
}

export interface ScreenTitleProps extends ChildrenProps {
  style?: StyleProp<TextStyle>;
}

export interface BackButtonProps {
  onPress: () => void;
}

export interface StepHeaderProps {
  current: number;
  onBack: () => void;
}

export interface FadeSequenceProps extends ChildrenProps {
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export interface BottomSheetProps extends ChildrenProps {
  onClose: () => void;
  visible: boolean;
}

export interface DogPlaceholderProps {
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}
