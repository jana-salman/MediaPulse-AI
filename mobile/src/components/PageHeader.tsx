import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";

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
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {icon ? (
        <Pressable onPress={onIconPress} style={styles.iconButton} hitSlop={10}>
          <Ionicons name={icon} size={21} color={colors.textPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  copy: { flex: 1 },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.9,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 6,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
