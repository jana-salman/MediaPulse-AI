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
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {icon ? (
        <Pressable
          accessibilityRole={onIconPress ? "button" : undefined}
          onPress={onIconPress}
          disabled={!onIconPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && onIconPress && styles.iconPressed,
          ]}
          hitSlop={10}
        >
          <Ionicons name={icon} size={20} color={colors.textPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
  },
  copy: { flex: 1, maxWidth: 620 },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.5,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.45,
    marginBottom: 7,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 29,
    color: colors.textPrimary,
    letterSpacing: -0.95,
    lineHeight: 35,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 560,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  iconPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});
