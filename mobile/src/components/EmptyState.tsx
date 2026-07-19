import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";
import { PulseWaveform } from "./PulseWaveform";

export function EmptyState({
  icon,
  title,
  subtitle,
  compact = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.visual}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.wave}>
          <PulseWaveform color={colors.primary} width={78} height={17} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 44,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { paddingVertical: 30 },
  visual: { height: 66, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(103,87,232,0.12)",
  },
  wave: { position: "absolute", bottom: -2, right: -47, opacity: 0.28 },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 15.5,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
  },
});
