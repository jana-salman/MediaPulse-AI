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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

const iosShadow = (opacity: number, radius: number, y: number): ViewStyle => ({
  shadowColor: colors.ink,
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

export const shadows: Record<"soft" | "card" | "floating", ViewStyle> = {
  soft: Platform.select({
    ios: iosShadow(0.05, 12, 5),
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
  card: Platform.select({
    ios: iosShadow(0.08, 20, 9),
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  floating: Platform.select({
    ios: iosShadow(0.14, 26, 12),
    android: { elevation: 9 },
    default: {},
  }) as ViewStyle,
};
