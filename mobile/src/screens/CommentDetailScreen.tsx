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
import {
  generateReply,
  getComment,
  updateCommentStatus,
} from "../config/api";
import { MainStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";
import {
  Comment,
  CommentStatus,
  ReplySource,
} from "../types";

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
const statusPalette: Record<
  CommentStatus,
  {
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
  }
> = {
  unanswered: {
    label: "New",
    description: "Generate a grounded reply to begin handling this comment.",
    icon: "mail-unread-outline",
    color: colors.primary,
    background: colors.primarySoft,
  },
  reply_ready: {
    label: "Reply ready",
    description: "The reply is ready to be sent to the customer.",
    icon: "checkmark-circle-outline",
    color: colors.warning,
    background: colors.warningSoft,
  },
  sent: {
    label: "Reply sent",
    description: "The customer has received a response.",
    icon: "paper-plane-outline",
    color: colors.cyan,
    background: colors.cyanSoft,
  },
  resolved: {
    label: "Resolved",
    description: "This customer issue has been completed.",
    icon: "shield-checkmark-outline",
    color: colors.success,
    background: colors.successSoft,
  },
};
const workflowSteps: {
  status: CommentStatus;
  label: string;
}[] = [
  { status: "unanswered", label: "New" },
  { status: "reply_ready", label: "Ready" },
  { status: "sent", label: "Sent" },
  { status: "resolved", label: "Resolved" },
];

export default function CommentDetailScreen({ route, navigation }: Props) {
  const { commentId } = route.params;
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
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
              status: response.comment.status ?? "reply_ready",
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

  const handleStatusUpdate = async (status: CommentStatus) => {
  setUpdatingStatus(true);
  setError(null);

  try {
    const response = await updateCommentStatus(commentId, status);
    setComment(response.comment);
  } catch (err: any) {
    setError(err.message ?? "Could not update the comment status.");
  } finally {
    setUpdatingStatus(false);
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
  const workflowStatus = statusPalette[comment.status];
  const workflowStepIndex = workflowSteps.findIndex(
  (step) => step.status === comment.status
);
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

        <Text style={styles.sectionLabel}>WORKFLOW STATUS</Text>

        <SectionCard style={styles.workflowCard}>
          <View style={styles.workflowStatusRow}>
            <View
              style={[
                styles.workflowStatusIcon,
                { backgroundColor: workflowStatus.background },
              ]}
            >
              <Ionicons
                name={workflowStatus.icon}
                size={21}
                color={workflowStatus.color}
              />
            </View>

            <View style={styles.workflowStatusCopy}>
              <Text style={styles.workflowStatusEyebrow}>CURRENT STATUS</Text>

              <Text
                style={[
                  styles.workflowStatusTitle,
                  { color: workflowStatus.color },
                ]}
              >
                {workflowStatus.label}
              </Text>

              <Text style={styles.workflowStatusDescription}>
                {workflowStatus.description}
              </Text>
            </View>
          </View>

          <View style={styles.workflowSteps}>
            {workflowSteps.map((step, index) => {
              const completed = index < workflowStepIndex;
              const active = index === workflowStepIndex;

              return (
                <React.Fragment key={step.status}>
                  <View style={styles.workflowStep}>
                    <View
                      style={[
                        styles.workflowDot,
                        (completed || active) && styles.workflowDotActive,
                        active && {
                          backgroundColor: workflowStatus.color,
                          borderColor: workflowStatus.color,
                        },
                      ]}
                    >
                      {completed ? (
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={colors.textInverse}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.workflowDotText,
                            active && styles.workflowDotTextActive,
                          ]}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.workflowStepLabel,
                        active && styles.workflowStepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>

                  {index < workflowSteps.length - 1 ? (
                    <View
                      style={[
                        styles.workflowLine,
                        completed && styles.workflowLineComplete,
                      ]}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>

          {comment.status === "reply_ready" ? (
            <AppButton
              label="Mark reply as sent"
              icon="paper-plane-outline"
              onPress={() => handleStatusUpdate("sent")}
              loading={updatingStatus}
              style={styles.workflowAction}
            />
          ) : null}

          {comment.status === "sent" ? (
            <AppButton
              label="Mark issue as resolved"
              icon="shield-checkmark-outline"
              onPress={() => handleStatusUpdate("resolved")}
              loading={updatingStatus}
              style={styles.workflowAction}
            />
          ) : null}

          {comment.status === "resolved" ? (
            <AppButton
              label="Reopen issue"
              icon="refresh-outline"
              onPress={() => handleStatusUpdate("sent")}
              loading={updatingStatus}
              variant="secondary"
              style={styles.workflowAction}
            />
          ) : null}
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
  topBar: {
    width: "100%",
    maxWidth: 780,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  topBarCopy: { flex: 1 },
  topBarTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.textPrimary },
  topBarSubtitle: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textTertiary, marginTop: 2 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.primarySoft },
  aiBadgeText: { fontFamily: fonts.mono, fontSize: 9, color: colors.primary },
  content: {
    width: "100%",
    maxWidth: 780,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  classificationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: radii.xl,
    backgroundColor: colors.ink,
    overflow: "hidden",
    ...shadows.card,
  },
  sentimentHeroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  classificationEyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 1.1, color: colors.cyan },
  classificationTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.textInverse, textTransform: "capitalize", marginTop: 4 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 9 },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10.25,
    letterSpacing: 1.15,
    color: colors.textSecondary,
    marginTop: 24,
    marginBottom: 9,
  },
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
    workflowCard: {
    padding: 16,
  },

  workflowStatusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  workflowStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  workflowStatusCopy: {
    flex: 1,
  },

  workflowStatusEyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textTertiary,
  },

  workflowStatusTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    marginTop: 3,
  },

  workflowStatusDescription: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 4,
  },

  workflowSteps: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
  },

  workflowStep: {
    width: 52,
    alignItems: "center",
  },

  workflowDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },

  workflowDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  workflowDotText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.textTertiary,
  },

  workflowDotTextActive: {
    color: colors.textInverse,
  },

  workflowStepLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8.5,
    color: colors.textTertiary,
    marginTop: 6,
    textAlign: "center",
  },

  workflowStepLabelActive: {
    color: colors.textPrimary,
    fontFamily: fonts.bodySemiBold,
  },

  workflowLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginTop: 13,
    marginHorizontal: -4,
  },

  workflowLineComplete: {
    backgroundColor: colors.success,
  },

  workflowAction: {
    marginTop: 18,
  },
});
