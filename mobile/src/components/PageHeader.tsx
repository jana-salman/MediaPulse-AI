import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  onIconPress,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onIconPress?: () => void;
}) {
  return (
    <View style={[styles.shell, shadows.card]}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.row}>
        <View style={styles.copy}>
          {eyebrow ? (
            <View style={styles.eyebrowPill}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>{eyebrow}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {icon ? (
          <Pressable
            onPress={onIconPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
            hitSlop={10}
          >
            <Ionicons name={icon} size={21} color={colors.textInverse} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 156,
    backgroundColor: colors.ink,
    borderRadius: radii.xxl,
    paddingHorizontal: 20,
    paddingVertical: 20,
    overflow: "hidden",
  },
  glowOne: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(91, 91, 214, 0.45)",
    top: -92,
    right: -38,
  },
  glowTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(18, 184, 166, 0.18)",
    bottom: -76,
    left: -35,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  copy: { flex: 1 },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.white10,
    borderWidth: 1,
    borderColor: colors.white16,
    marginBottom: 13,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyan },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9.5,
    color: colors.textInverse,
    textTransform: "uppercase",
    letterSpacing: 1.15,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.textInverse,
    letterSpacing: -1,
    lineHeight: 35,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.white72,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 360,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white10,
    borderWidth: 1,
    borderColor: colors.white16,
  },
  iconPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
