import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge } from "../components/Badge";
import { generateReply, getComment } from "../config/api";
import { colors } from "../theme/colors";
import { Comment, ReplySource } from "../types";
import { MainStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "CommentDetail">;

export default function CommentDetailScreen({ route }: Props) {
  const { commentId } = route.params;
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sources, setSources] = useState<ReplySource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { comment: c } = await getComment(commentId);
        setComment(c);
      } catch (err: any) {
        setError(err.message ?? "Could not load this comment.");
      } finally {
        setLoading(false);
      }
    })();
  }, [commentId]);

  const handleGenerateReply = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await generateReply(commentId);
      setComment((prev) =>
        prev
          ? {
              ...prev,
              suggested_reply: res.reply,
              reply_source: res.comment.reply_source ?? prev.reply_source,
            }
          : prev
      );
      setSources(res.sources);
    } catch (err: any) {
      setError(err.message ?? "Could not generate a grounded reply.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!comment) return;
    await Clipboard.setStringAsync(comment.suggested_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!comment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? "Comment not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgeRow}>
        <Badge label={comment.sentiment} color={colors.primary} backgroundColor="#EEF2FF" />
        <Badge label={comment.category.replace("_", " ")} color={colors.primary} backgroundColor="#EEF2FF" />
        <Badge label={`${comment.urgency} urgency`} color={colors.primary} backgroundColor="#EEF2FF" />
      </View>

      <Text style={styles.sectionLabel}>Customer comment</Text>
      <Text style={styles.commentText}>{comment.text}</Text>

      <Text style={styles.sectionLabel}>AI summary</Text>
      <Text style={styles.bodyText}>{comment.summary}</Text>

      <Text style={styles.sectionLabel}>Suggested reply</Text>
      <View style={styles.replyBox}>
        <Text style={styles.bodyText}>{comment.suggested_reply}</Text>
      </View>

      {comment.reply_source ? (
        <Text style={styles.sourceLine}>Grounded in: {comment.reply_source}</Text>
      ) : null}

      {sources.length > 0 && (
        <View style={styles.sourcesBox}>
          {sources.map((s) => (
            <View key={s.id} style={styles.sourceItem}>
              <Text style={styles.sourceTitle}>{s.title}</Text>
              <Text style={styles.sourceContent} numberOfLines={2}>
                {s.content}
              </Text>
            </View>
          ))}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleGenerateReply} disabled={generating}>
          {generating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {comment.reply_source ? "Regenerate grounded reply" : "Generate grounded reply"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCopy}>
          <Text style={styles.buttonText}>{copied ? "Copied!" : "Copy reply"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 6,
  },
  commentText: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  bodyText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  replyBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
  },
  sourceLine: { fontSize: 12, color: colors.textSecondary, marginTop: 8, fontStyle: "italic" },
  sourcesBox: { marginTop: 12 },
  sourceItem: {
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  sourceTitle: { fontSize: 12, fontWeight: "700", color: colors.primaryDark, marginBottom: 2 },
  sourceContent: { fontSize: 12, color: colors.textSecondary },
  error: { color: colors.danger, fontSize: 13, marginTop: 12 },
  actionsRow: { marginTop: 24, gap: 10 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButtonText: { color: colors.primary, fontWeight: "600", fontSize: 15 },
});
