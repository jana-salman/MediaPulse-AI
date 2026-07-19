import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { Badge } from "../components/Badge";
import { Notice } from "../components/Notice";
import { SectionCard } from "../components/SectionCard";
import { generateReply, getComment } from "../config/api";
import { MainStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";
import { Comment, ReplySource } from "../types";

type Props = NativeStackScreenProps<MainStackParamList, "CommentDetail">;

const sentimentPalette = {
  positive: { color: colors.positive, background: colors.positiveBg, icon: "happy-outline" as const },
  neutral: { color: colors.neutral, background: colors.neutralBg, icon: "remove-outline" as const },
  negative: { color: colors.negative, background: colors.negativeBg, icon: "sad-outline" as const },
};

const urgencyPalette = {
  low: { color: colors.urgencyLow, background: colors.urgencyLowBg },
  medium: { color: colors.urgencyMedium, background: colors.urgencyMediumBg },
  high: { color: colors.urgencyHigh, background: colors.urgencyHighBg },
};

export default function CommentDetailScreen({ route, navigation }: Props) {
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
        const { comment: result } = await getComment(commentId);
        setComment(result);
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
      const response = await generateReply(commentId);
      setComment((previous) =>
        previous
          ? {
              ...previous,
              suggested_reply: response.reply,
              reply_source: response.comment.reply_source ?? previous.reply_source,
            }
          : previous
      );
      setSources(response.sources);
    } catch (err: any) {
      setError(err.message ?? "Could not generate a policy-grounded reply.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!comment) return;
    await Clipboard.setStringAsync(comment.suggested_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const sentiment = useMemo(
    () => (comment ? sentimentPalette[comment.sentiment] : sentimentPalette.neutral),
    [comment]
  );
  const urgency = useMemo(
    () => (comment ? urgencyPalette[comment.urgency] : urgencyPalette.low),
    [comment]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "left", "right"]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Opening analysis…</Text>
      </SafeAreaView>
    );
  }

  if (!comment) {
    return (
      <SafeAreaView style={styles.centered} edges={["top", "left", "right"]}>
        <Notice message={error ?? "Comment not found."} />
        <AppButton label="Go back" icon="arrow-back" onPress={navigation.goBack} variant="secondary" style={{ marginTop: 14, width: 160 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <Pressable onPress={navigation.goBack} style={styles.backButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={21} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarCopy}>
          <Text style={styles.topBarTitle}>Comment analysis</Text>
          <Text style={styles.topBarSubtitle}>
            {new Date(comment.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.classificationCard}>
          <View style={[styles.sentimentHeroIcon, { backgroundColor: sentiment.background }]}> 
            <Ionicons name={sentiment.icon} size={28} color={sentiment.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.classificationEyebrow}>CLASSIFICATION</Text>
            <Text style={styles.classificationTitle}>{comment.sentiment} customer signal</Text>
            <View style={styles.badgeRow}>
              <Badge label={comment.category.replace(/_/g, " ")} color={colors.primaryDark} backgroundColor={colors.primarySoft} />
              <Badge label={`${comment.urgency} urgency`} color={urgency.color} backgroundColor={urgency.background} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CUSTOMER COMMENT</Text>
        <SectionCard style={styles.quoteCard}>
          <View style={styles.quoteMark}>
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
        </SectionCard>

        <Text style={styles.sectionLabel}>AI SUMMARY</Text>
        <SectionCard style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="scan-outline" size={19} color={colors.cyan} />
          </View>
          <Text style={styles.summaryText}>{comment.summary}</Text>
        </SectionCard>

        <View style={styles.replyHeaderRow}>
          <Text style={styles.sectionLabel}>SUGGESTED REPLY</Text>
          {comment.reply_source ? (
            <View style={styles.groundedPill}>
              <Ionicons name="shield-checkmark" size={13} color={colors.success} />
              <Text style={styles.groundedPillText}>Grounded</Text>
            </View>
          ) : (
            <View style={styles.draftPill}>
              <Text style={styles.draftPillText}>AI draft</Text>
            </View>
          )}
        </View>

        <View style={styles.replyCard}>
          <View style={styles.replyGlow} />
          <View style={styles.replyIcon}>
            <Ionicons name="return-up-forward-outline" size={19} color={colors.textInverse} />
          </View>
          <Text style={styles.replyText}>{comment.suggested_reply}</Text>
          {comment.reply_source ? (
            <View style={styles.sourceSummary}>
              <Ionicons name="book-outline" size={14} color={colors.cyan} />
              <Text style={styles.sourceSummaryText}>Grounded in {comment.reply_source}</Text>
            </View>
          ) : null}
        </View>

        {sources.length > 0 ? (
          <View>
            <View style={styles.sourcesHeader}>
              <Text style={styles.sectionLabel}>RETRIEVED SOURCES</Text>
              <Text style={styles.sourcesCount}>{sources.length} matches</Text>
            </View>
            {sources.map((source) => (
              <SectionCard key={source.id} style={styles.sourceCard}>
                <View style={styles.sourceTopRow}>
                  <View style={styles.sourceIcon}>
                    <Ionicons name="document-text-outline" size={17} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceTitle}>{source.title}</Text>
                    <Text style={styles.sourceSimilarity}>{Math.round(source.similarity * 100)}% semantic match</Text>
                  </View>
                </View>
                <Text style={styles.sourceContent} numberOfLines={4}>{source.content}</Text>
              </SectionCard>
            ))}
          </View>
        ) : null}

        {error ? <Notice message={error} /> : null}

        <View style={styles.actions}>
          <AppButton
            label={comment.reply_source ? "Regenerate grounded reply" : "Generate grounded reply"}
            icon="shield-checkmark-outline"
            onPress={handleGenerateReply}
            loading={generating}
          />
          <AppButton
            label={copied ? "Reply copied" : "Copy reply"}
            icon={copied ? "checkmark" : "copy-outline"}
            onPress={handleCopy}
            variant={copied ? "soft" : "secondary"}
            style={{ marginTop: 10 }}
          />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background },
  loadingText: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 12, marginTop: 10 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  topBarCopy: { flex: 1 },
  topBarTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.textPrimary },
  topBarSubtitle: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textTertiary, marginTop: 2 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  aiBadgeText: { fontFamily: fonts.mono, fontSize: 9, color: colors.primary },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  classificationCard: { flexDirection: "row", alignItems: "center", gap: 13, padding: 16, borderRadius: radii.xl, backgroundColor: colors.ink, overflow: "hidden", ...shadows.card },
  sentimentHeroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  classificationEyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 1.1, color: colors.cyan },
  classificationTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.textInverse, textTransform: "capitalize", marginTop: 4 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, letterSpacing: 1.1, color: colors.textSecondary, marginTop: 22, marginBottom: 8 },
  quoteCard: { padding: 16, flexDirection: "row", gap: 12 },
  quoteMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  commentText: { flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 14.5, lineHeight: 21, color: colors.textPrimary },
  summaryCard: { padding: 15, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  summaryIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.cyanSoft, alignItems: "center", justifyContent: "center" },
  summaryText: { flex: 1, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 19, color: colors.textSecondary },
  replyHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  groundedPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.successSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.pill, marginTop: 14 },
  groundedPillText: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, color: colors.success },
  draftPill: { backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.pill, marginTop: 14 },
  draftPillText: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, color: colors.primary },
  replyCard: { position: "relative", backgroundColor: colors.ink, borderRadius: radii.xl, padding: 18, overflow: "hidden" },
  replyGlow: { position: "absolute", width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(107,92,246,0.28)", top: -85, right: -45 },
  replyIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.white10, alignItems: "center", justifyContent: "center", marginBottom: 13 },
  replyText: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 20, color: colors.textInverse },
  sourceSummary: { flexDirection: "row", alignItems: "center", gap: 7, borderTopWidth: 1, borderTopColor: colors.white16, marginTop: 15, paddingTop: 12 },
  sourceSummaryText: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.cyan },
  sourcesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sourcesCount: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary, marginTop: 14 },
  sourceCard: { padding: 14, marginBottom: 9 },
  sourceTopRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  sourceIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  sourceTitle: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.textPrimary },
  sourceSimilarity: { fontFamily: fonts.body, fontSize: 9.5, color: colors.success, marginTop: 2 },
  sourceContent: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, color: colors.textSecondary, marginTop: 10 },
  actions: { marginTop: 23 },
});
