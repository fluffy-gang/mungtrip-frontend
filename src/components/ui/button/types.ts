import type { ReactNode } from "react";
import type { PressableProps } from "react-native";

export type ButtonType = "primary" | "sub" | "ghost";
export type ButtonSize = "l" | "m";

export interface ButtonProps
  extends Omit<PressableProps, "children" | "disabled"> {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  size?: ButtonSize;
  type?: ButtonType;
}
