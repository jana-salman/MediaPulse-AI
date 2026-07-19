import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radii, shadows } from "../theme/tokens";

export function SectionCard({
  children,
  style,
  elevated = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}) {
  return <View style={[styles.card, elevated && shadows.soft, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
  },
});
