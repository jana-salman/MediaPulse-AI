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
          <PulseWaveform color={colors.primary} width={76} height={17} />
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
    paddingHorizontal: 28,
    paddingVertical: 42,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { paddingVertical: 28 },
  visual: { height: 64, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  wave: {
    position: "absolute",
    bottom: -2,
    right: -46,
    opacity: 0.32,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 5,
    maxWidth: 260,
  },
});
