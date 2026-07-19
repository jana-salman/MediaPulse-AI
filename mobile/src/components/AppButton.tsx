import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";

type Variant = "primary" | "secondary" | "soft" | "danger" | "ghost";

export function AppButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
}) {
  const blocked = loading || disabled;
  const palette = variants[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.button,
        palette.container,
        variant === "primary" && styles.primaryShadow,
        blocked && styles.disabled,
        pressed && !blocked && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text.color} />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={18} color={palette.text.color} />
          ) : null}
          <Text style={[styles.label, palette.text]} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const variants = {
  primary: {
    container: { backgroundColor: colors.primary, borderColor: colors.primary },
    text: { color: colors.textInverse },
  },
  secondary: {
    container: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
    text: { color: colors.textPrimary },
  },
  soft: {
    container: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
    text: { color: colors.primaryDark },
  },
  danger: {
    container: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
    text: { color: colors.danger },
  },
  ghost: {
    container: { backgroundColor: "transparent", borderColor: "transparent" },
    text: { color: colors.textSecondary },
  },
} satisfies Record<Variant, { container: ViewStyle; text: { color: string } }>;

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 19,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  primaryShadow: { ...shadows.card, shadowColor: colors.primary },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13.5,
    letterSpacing: 0.05,
  },
  disabled: { opacity: 0.48, shadowOpacity: 0, elevation: 0 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
});
