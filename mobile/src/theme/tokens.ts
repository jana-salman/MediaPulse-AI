import { Platform, ViewStyle } from "react-native";
import { colors } from "./colors";

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
};

const iosShadow = (
  opacity: number,
  radius: number,
  y: number
): ViewStyle => ({
  shadowColor: colors.ink,
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

export const shadows: Record<"soft" | "card" | "floating", ViewStyle> = {
  soft: Platform.select({
    ios: iosShadow(0.05, 10, 4),
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
  card: Platform.select({
    ios: iosShadow(0.08, 18, 8),
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  floating: Platform.select({
    ios: iosShadow(0.16, 24, 12),
    android: { elevation: 10 },
    default: {},
  }) as ViewStyle,
};
