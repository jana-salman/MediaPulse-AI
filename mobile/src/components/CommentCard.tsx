import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.badgeRow}>
        <Badge label={comment.sentiment} color={sentiment.color} backgroundColor={sentiment.bg} />
        <Badge
          label={comment.category.replace("_", " ")}
          color={colors.primary}
          backgroundColor="#EEF2FF"
        />
        <Badge label={`${comment.urgency} urgency`} color={urgency.color} backgroundColor={urgency.bg} />
      </View>
      <Text style={styles.commentText} numberOfLines={2}>
        {comment.text}
      </Text>
      <Text style={styles.summary} numberOfLines={2}>
        {comment.summary}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
