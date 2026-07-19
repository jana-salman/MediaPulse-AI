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
  xl: 22,
  xxl: 28,
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
    ios: iosShadow(0.045, 12, 5),
    android: { elevation: 2 },
    default: {
      shadowColor: "rgba(16, 20, 38, 0.08)",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 14,
    },
  }) as ViewStyle,
  card: Platform.select({
    ios: iosShadow(0.07, 20, 9),
    android: { elevation: 4 },
    default: {
      shadowColor: "rgba(16, 20, 38, 0.10)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 22,
    },
  }) as ViewStyle,
  floating: Platform.select({
    ios: iosShadow(0.13, 28, 14),
    android: { elevation: 10 },
    default: {
      shadowColor: "rgba(16, 20, 38, 0.16)",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 30,
    },
  }) as ViewStyle,
};
