import { Pressable } from "react-native";
import { styled, type DefaultTheme } from "styled-components/native";

import { Text } from "@/components/ui/text";

import type { ButtonSize, ButtonType } from "./types";

const buttonHeight = {
  l: 56,
  m: 48,
} as const satisfies Record<ButtonSize, number>;

type ButtonVisualState = "default" | "active" | "pressed" | "disabled";
type ButtonWidthMode = "content" | "full";
type BooleanKey = "false" | "true";

const buttonTextStyleMap = {
  primary: {
    color: "onPrimary",
    fontWeight: "bold",
  },
  sub: {
    color: "textSecondary",
    fontWeight: "semibold",
  },
  ghost: {
    color: "textSecondary",
    fontWeight: "semibold",
  },
} as const satisfies Record<ButtonType, { color: "onPrimary" | "textSecondary"; fontWeight: "bold" | "semibold" }>;

const disabledTextColorMap = {
  primary: "onPrimary",
  sub: "textDisabled",
  ghost: "textDisabled",
} as const satisfies Record<ButtonType, "onPrimary" | "textDisabled">;

const buttonSizeTextMap = {
  l: {
    fontSize: 18,
    lineHeight: undefined,
  },
  m: {
    fontSize: 16,
    lineHeight: 24,
  },
} as const satisfies Record<ButtonSize, { fontSize: 16 | 18; lineHeight: 24 | undefined }>;

const pressedStateMap = {
  false: "default",
  true: "pressed",
} as const satisfies Record<BooleanKey, ButtonVisualState>;

const activeStateMap = {
  false: pressedStateMap,
  true: {
    false: "active",
    true: "pressed",
  },
} as const satisfies Record<BooleanKey, Record<BooleanKey, ButtonVisualState>>;

const disabledStateMap = {
  false: activeStateMap,
  true: {
    false: {
      false: "disabled",
      true: "disabled",
    },
    true: {
      false: "disabled",
      true: "disabled",
    },
  },
} as const satisfies Record<BooleanKey, Record<BooleanKey, Record<BooleanKey, ButtonVisualState>>>;

const fullWidthModeMap = {
  false: "content",
  true: "full",
} as const satisfies Record<BooleanKey, ButtonWidthMode>;

const textColorByStateMap = {
  active: "default",
  default: "default",
  disabled: "disabled",
  pressed: "default",
} as const satisfies Record<ButtonVisualState, "default" | "disabled">;

const widthMap = {
  content: "auto",
  full: "100%",
} as const satisfies Record<ButtonWidthMode, string>;

const opacityMap = {
  active: 1,
  default: 1,
  disabled: 0.9,
  pressed: 1,
} as const satisfies Record<ButtonVisualState, number>;

function getBooleanKey(value?: boolean): BooleanKey {
  return String(Boolean(value)) as BooleanKey;
}

function getVisualState($disabled?: boolean, $active?: boolean, $pressed?: boolean): ButtonVisualState {
  return disabledStateMap[getBooleanKey($disabled)][getBooleanKey($active)][getBooleanKey($pressed)];
}

function getWidthMode($fullWidth: boolean): ButtonWidthMode {
  return fullWidthModeMap[String($fullWidth) as BooleanKey];
}

function getBackgroundColor(
  $type: ButtonType,
  visualState: ButtonVisualState,
  theme: DefaultTheme,
) {
  const backgroundColorMap = {
    primary: {
      active: theme.colors.semantic.light.primary,
      default: theme.colors.semantic.light.primary,
      disabled: theme.colors.semantic.light.primaryDisabled,
      pressed: theme.colors.semantic.light.primaryPressed,
    },
    sub: {
      active: theme.colors.semantic.light.surfaceSubtle,
      default: theme.colors.semantic.light.surface,
      disabled: theme.colors.primitive.gray[50],
      pressed: theme.colors.semantic.light.surfaceSubtle,
    },
    ghost: {
      active: theme.colors.primitive.gray[50],
      default: "transparent",
      disabled: "transparent",
      pressed: theme.colors.primitive.gray[50],
    },
  } as const satisfies Record<ButtonType, Record<ButtonVisualState, string>>;

  return backgroundColorMap[$type][visualState];
}

function getBorderWidth($type: ButtonType, theme: DefaultTheme) {
  const borderWidthMap = {
    primary: 0,
    sub: theme.borderWidth[1],
    ghost: 0,
  } as const satisfies Record<ButtonType, number>;

  return borderWidthMap[$type];
}

export const ButtonRoot = styled(Pressable)<{
  $fullWidth: boolean;
}>`
  width: ${({ $fullWidth }) => widthMap[getWidthMode($fullWidth)]};
`;

export const ButtonSurface = styled.View<{
  $active?: boolean;
  $disabled?: boolean;
  $fullWidth: boolean;
  $pressed?: boolean;
  $size: ButtonSize;
  $type: ButtonType;
}>`
  align-items: center;
  background-color: ${({ $active, $disabled, $pressed, $type, theme }) =>
    getBackgroundColor($type, getVisualState($disabled, $active, $pressed), theme)};
  border-color: ${({ theme }) => theme.colors.semantic.light.border};
  border-radius: ${({ theme }) => theme.radius[16]}px;
  border-width: ${({ $type, theme }) => getBorderWidth($type, theme)}px;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[8]}px;
  height: ${({ $size }) => buttonHeight[$size]}px;
  justify-content: center;
  opacity: ${({ $active, $disabled, $pressed }) => opacityMap[getVisualState($disabled, $active, $pressed)]};
  padding: 0 ${({ theme }) => theme.spacing[20]}px;
  width: ${({ $fullWidth }) => widthMap[getWidthMode($fullWidth)]};
`;

export const ButtonLabel = styled(Text).attrs<{
  $active?: boolean;
  $disabled?: boolean;
  $size: ButtonSize;
  $type: ButtonType;
}>(({ $active, $disabled, $size, $type }) => {
  const textStyle = buttonTextStyleMap[$type];
  const sizeStyle = buttonSizeTextMap[$size];

  return {
    color: {
      default: textStyle.color,
      disabled: disabledTextColorMap[$type],
    }[textColorByStateMap[getVisualState($disabled, $active)]],
    fontSize: sizeStyle.fontSize,
    fontWeight: textStyle.fontWeight,
    lineHeight: sizeStyle.lineHeight,
  };
})``;
