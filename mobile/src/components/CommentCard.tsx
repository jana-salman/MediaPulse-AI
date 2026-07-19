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
  const isHighPriority = comment.urgency === "high";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${comment.sentiment} ${comment.category} comment`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.soft,
        isHighPriority && styles.highPriorityCard,
        pressed && styles.pressed,
      ]}
    >
      {isHighPriority ? (
        <View style={[styles.priorityRail, { backgroundColor: urgency.color }]} />
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.categoryRow}>
          <View style={[styles.sentimentIcon, { backgroundColor: sentiment.bg }]}>
            <Ionicons name={sentiment.icon} size={18} color={sentiment.color} />
          </View>
          <View style={styles.categoryCopy}>
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {comment.category.replace(/_/g, " ")}
            </Text>
            <Text style={styles.sentimentLabel}>{comment.sentiment} sentiment</Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
      </View>

      <Text style={styles.commentText} numberOfLines={2}>{comment.text}</Text>
      <Text style={styles.summary} numberOfLines={1}>{comment.summary}</Text>

      <View style={styles.footer}>
        <View style={styles.footerMeta}>
          <View style={[styles.priorityPill, { backgroundColor: urgency.bg }]}>
            <View style={[styles.urgencyDot, { backgroundColor: urgency.color }]} />
            <Text style={[styles.urgencyText, { color: urgency.color }]}>
              {comment.urgency} priority
            </Text>
          </View>
        </View>

        <View style={styles.openAction}>
          <Badge label={status.label} color={status.color} backgroundColor={status.background} dot={false} />
          <View style={styles.chevronButton}>
            <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
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
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  highPriorityCard: { borderColor: "rgba(207,73,96,0.20)" },
  priorityRail: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
  pressed: { transform: [{ scale: 0.992 }], opacity: 0.94 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  sentimentIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCopy: { flex: 1 },
  categoryLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  sentimentLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: "capitalize",
    marginTop: 2,
  },
  date: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary },
  commentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.textPrimary,
    marginTop: 14,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 12,
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
    marginTop: 14,
    paddingTop: 12,
    gap: 10,
  },
  footerMeta: { flex: 1 },
  priorityPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  urgencyText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.25,
    textTransform: "capitalize",
  },
  openAction: { flexDirection: "row", alignItems: "center", gap: 7 },
  chevronButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});
