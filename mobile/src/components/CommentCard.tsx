import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";
import { Comment } from "../types";
import { Badge } from "./Badge";

const sentimentColors: Record<string, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  positive: { color: colors.positive, bg: colors.positiveBg, icon: "happy-outline" },
  neutral: { color: colors.neutral, bg: colors.neutralBg, icon: "remove-outline" },
  negative: { color: colors.negative, bg: colors.negativeBg, icon: "sad-outline" },
};

const urgencyColors: Record<string, { color: string; bg: string }> = {
  low: { color: colors.urgencyLow, bg: colors.urgencyLowBg },
  medium: { color: colors.urgencyMedium, bg: colors.urgencyMediumBg },
  high: { color: colors.urgencyHigh, bg: colors.urgencyHighBg },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function CommentCard({ comment, onPress }: { comment: Comment; onPress: () => void }) {
  const sentiment = sentimentColors[comment.sentiment] ?? sentimentColors.neutral;
  const urgency = urgencyColors[comment.urgency] ?? urgencyColors.low;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.soft, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={[styles.sentimentIcon, { backgroundColor: sentiment.bg }]}> 
          <Ionicons name={sentiment.icon} size={19} color={sentiment.color} />
        </View>
        <View style={styles.topCopy}>
          <View style={styles.metaRow}>
            <Badge label={comment.sentiment} color={sentiment.color} backgroundColor={sentiment.bg} dot={false} />
            <Badge
              label={comment.category.replace(/_/g, " ")}
              color={colors.primaryDark}
              backgroundColor={colors.primarySoft}
              dot={false}
            />
          </View>
          <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.commentText} numberOfLines={2}>{comment.text}</Text>
      <Text style={styles.summary} numberOfLines={2}>{comment.summary}</Text>

      <View style={styles.footer}>
        <View style={styles.urgencyWrap}>
          <View style={[styles.urgencyDot, { backgroundColor: urgency.color }]} />
          <Text style={[styles.urgencyText, { color: urgency.color }]}>
            {comment.urgency} priority
          </Text>
        </View>
        <View style={styles.openAction}>
          <Text style={styles.openText}>Open</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 12,
  },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.94 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sentimentIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  topCopy: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  date: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary },
  commentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary,
    marginTop: 13,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 13,
    paddingTop: 11,
  },
  urgencyWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  urgencyDot: { width: 7, height: 7, borderRadius: 4 },
  urgencyText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, textTransform: "capitalize" },
  openAction: { flexDirection: "row", alignItems: "center", gap: 5 },
  openText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, color: colors.primary },
});
