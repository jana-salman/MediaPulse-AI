import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";
import { Comment, CommentStatus } from "../types";
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

const statusColors: Record<CommentStatus, { label: string; color: string; background: string }> = {
  unanswered: { label: "New", color: colors.primary, background: colors.primarySoft },
  reply_ready: { label: "Reply ready", color: colors.warning, background: colors.warningSoft },
  sent: { label: "Sent", color: colors.cyan, background: colors.cyanSoft },
  resolved: { label: "Resolved", color: colors.success, background: colors.successSoft },
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
  const status = statusColors[comment.status] ?? statusColors.unanswered;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.soft, pressed && styles.pressed]}
    >
      <View style={[styles.priorityRail, { backgroundColor: urgency.color }]} />

      <View style={styles.headerRow}>
        <View style={[styles.sentimentIcon, { backgroundColor: sentiment.bg }]}> 
          <Ionicons name={sentiment.icon} size={19} color={sentiment.color} />
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.category}>{comment.category.replace(/_/g, " ")}</Text>
          <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
        </View>

        <Badge label={status.label} color={status.color} backgroundColor={status.background} />
      </View>

      <Text style={styles.commentText} numberOfLines={3}>{comment.text}</Text>
      <Text style={styles.summary} numberOfLines={2}>{comment.summary}</Text>

      <View style={styles.footer}>
        <View style={styles.metaPills}>
          <View style={[styles.metaPill, { backgroundColor: sentiment.bg }]}>
            <View style={[styles.metaDot, { backgroundColor: sentiment.color }]} />
            <Text style={[styles.metaText, { color: sentiment.color }]}>{comment.sentiment}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: urgency.bg }]}>
            <Ionicons name="flash-outline" size={12} color={urgency.color} />
            <Text style={[styles.metaText, { color: urgency.color }]}>{comment.urgency} priority</Text>
          </View>
        </View>

        <View style={styles.openAction}>
          <Text style={styles.openText}>Review</Text>
          <View style={styles.chevronShell}>
            <Ionicons name="arrow-forward" size={14} color={colors.textInverse} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    paddingLeft: 19,
    marginBottom: 12,
    overflow: "hidden",
  },
  priorityRail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  pressed: { transform: [{ scale: 0.992 }], opacity: 0.93 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sentimentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  category: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11.5,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  date: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 2 },
  commentText: {
    fontFamily: fonts.displayMedium,
    fontSize: 15.5,
    lineHeight: 22,
    color: colors.textPrimary,
    marginTop: 15,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 12.2,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 12,
  },
  metaPills: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  metaDot: { width: 5, height: 5, borderRadius: 3 },
  metaText: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, textTransform: "capitalize" },
  openAction: { flexDirection: "row", alignItems: "center", gap: 7 },
  openText: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, color: colors.textPrimary },
  chevronShell: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
});
