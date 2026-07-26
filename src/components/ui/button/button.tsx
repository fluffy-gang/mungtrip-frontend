import { ButtonLabel, ButtonRoot, ButtonSurface } from "./styles";
import type { ButtonProps } from "./types";

const defaultFullWidthMap = {
  ghost: false,
  primary: true,
  sub: true,
} as const;

export function Button({
  accessibilityLabel,
  active,
  children,
  disabled,
  fullWidth,
  leftAccessory,
  rightAccessory,
  size = "l",
  type = "primary",
  ...pressableProps
}: ButtonProps) {
  const resolvedFullWidth = fullWidth ?? defaultFullWidthMap[type];

  return (
    <ButtonRoot
      {...pressableProps}
      $fullWidth={resolvedFullWidth}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
    >
      {({ pressed }) => (
        <ButtonSurface
          $active={active}
          $disabled={disabled}
          $fullWidth={resolvedFullWidth}
          $pressed={pressed}
          $size={size}
          $type={type}
        >
          {leftAccessory}
          <ButtonLabel $active={active} $disabled={disabled} $size={size} $type={type}>
            {children}
          </ButtonLabel>
          {rightAccessory}
        </ButtonSurface>
      )}
    </ButtonRoot>
  );
}
