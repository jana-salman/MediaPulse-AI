import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";

export function Notice({
  message,
  type = "error",
}: {
  message: string;
  type?: "error" | "success" | "info";
}) {
  const palette = {
    error: { bg: colors.dangerSoft, fg: colors.danger, icon: "alert-circle-outline" as const },
    success: { bg: colors.successSoft, fg: colors.success, icon: "checkmark-circle-outline" as const },
    info: { bg: colors.primarySoft, fg: colors.primaryDark, icon: "information-circle-outline" as const },
  }[type];

  return (
    <View style={[styles.notice, { backgroundColor: palette.bg }]}> 
      <Ionicons name={palette.icon} size={18} color={palette.fg} />
      <Text style={[styles.text, { color: palette.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
    borderRadius: radii.md,
    padding: 12,
  },
  text: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 12.5, lineHeight: 18 },
});
