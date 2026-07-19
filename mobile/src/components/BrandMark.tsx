import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 38 : 54;
  const iconSize = compact ? 19 : 26;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: compact ? 13 : radii.lg }]}> 
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        <Ionicons name="pulse" size={iconSize} color={colors.textInverse} />
      </View>
      {compact ? null : (
        <View>
          <Text style={styles.wordmark}>MediaPulse</Text>
          <Text style={styles.ai}>AI</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  wrapCompact: { gap: 0 },
  mark: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...shadows.card,
  },
  glowOne: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(44,201,188,0.32)",
    top: -26,
    right: -20,
  },
  glowTwo: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,106,94,0.28)",
    bottom: -25,
    left: -16,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  ai: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 2.4,
    marginTop: -2,
  },
});
