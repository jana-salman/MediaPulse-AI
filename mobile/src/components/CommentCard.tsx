import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { Comment } from "../types";
import { Badge } from "./Badge";

const sentimentColors: Record<string, { color: string; bg: string }> = {
  positive: { color: colors.positive, bg: colors.positiveBg },
  neutral: { color: colors.neutral, bg: colors.neutralBg },
  negative: { color: colors.negative, bg: colors.negativeBg },
};

const urgencyColors: Record<string, { color: string; bg: string }> = {
  low: { color: colors.urgencyLow, bg: colors.urgencyLowBg },
  medium: { color: colors.urgencyMedium, bg: colors.urgencyMediumBg },
  high: { color: colors.urgencyHigh, bg: colors.urgencyHighBg },
};

export function CommentCard({
  comment,
  onPress,
}: {
  comment: Comment;
  onPress: () => void;
}) {
  const sentiment = sentimentColors[comment.sentiment] ?? sentimentColors.neutral;
  const urgency = urgencyColors[comment.urgency] ?? urgencyColors.low;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
      {/* Urgency strip -- scan the list by color before reading a word */}
      <View style={[styles.edgeStrip, { backgroundColor: urgency.color }]} />
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Badge label={comment.sentiment} color={sentiment.color} backgroundColor={sentiment.bg} />
          <Badge
            label={comment.category.replace("_", " ")}
            color={colors.primary}
            backgroundColor={colors.primarySoft}
          />
          <Badge label={`${comment.urgency} urgency`} color={urgency.color} backgroundColor={urgency.bg} />
        </View>
        <Text style={styles.commentText} numberOfLines={2}>
          {comment.text}
        </Text>
        <Text style={styles.summary} numberOfLines={2}>
          {comment.summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  edgeStrip: { width: 5 },
  card: { flex: 1, padding: 14 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  commentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
