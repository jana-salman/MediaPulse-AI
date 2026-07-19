import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { PulseWaveform } from "../components/PulseWaveform";
import { SectionCard } from "../components/SectionCard";
import { generateInsight, getComments, getInsights } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";
import { Comment, Insight } from "../types";

function MetricCard({
  label,
  value,
  icon,
  color,
  background,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
}) {
  return (
    <SectionCard style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: background }]}> 
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </SectionCard>
  );
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  return (
    <SectionCard style={styles.insightCard}>
      <View style={styles.insightTopRow}>
        <View style={styles.insightIcon}>
          <Ionicons name="sparkles" size={17} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>AI pulse report {index === 0 ? "· latest" : ""}</Text>
          <Text style={styles.insightDate}>
            {new Date(insight.created_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
      <Text style={styles.insightText}>{insight.summary}</Text>
    </SectionCard>
  );
}

export default function DashboardScreen() {
  const { business } = useBusiness();
  const [comments, setComments] = useState<Comment[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!business) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const [commentsResponse, insightsResponse] = await Promise.all([
          getComments(business.id),
          getInsights(business.id),
        ]);
        setComments(commentsResponse.comments);
        setInsights(insightsResponse.insights);
      } catch (err: any) {
        setError(err.message ?? "Could not load your dashboard.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [business]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleGenerateInsight = async () => {
    if (!business) return;
    setGenerating(true);
    setError(null);
    try {
      await generateInsight(business.id);
      const { insights: refreshed } = await getInsights(business.id);
      setInsights(refreshed);
    } catch (err: any) {
      setError(err.message ?? "Could not generate a new insight.");
    } finally {
      setGenerating(false);
    }
  };

  const metrics = useMemo(() => {
    const positive = comments.filter((comment) => comment.sentiment === "positive").length;
    const neutral = comments.filter((comment) => comment.sentiment === "neutral").length;
    const negative = comments.filter((comment) => comment.sentiment === "negative").length;
    const highUrgency = comments.filter((comment) => comment.urgency === "high").length;
    const unanswered = comments.filter((comment) => comment.status === "unanswered").length;
    const total = comments.length;
    return {
      positive,
      neutral,
      negative,
      highUrgency,
      unanswered,
      total,
      positiveRate: total ? Math.round((positive / total) * 100) : 0,
      negativeRate: total ? Math.round((negative / total) * 100) : 0,
      neutralRate: total ? Math.max(0, 100 - Math.round((positive / total) * 100) - Math.round((negative / total) * 100)) : 0,
    };
  }, [comments]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loading} edges={["top", "left", "right"]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Building your overview…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
      >
        <PageHeader
          eyebrow="CUSTOMER INTELLIGENCE"
          title="Overview"
          subtitle="A clear view of customer mood, urgency and the next actions worth taking."
          icon="calendar-outline"
        />

        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>CURRENT WORKSPACE</Text>
              <Text style={styles.heroName}>{business?.name ?? "MediaPulse AI"}</Text>
              <Text style={styles.heroMeta}>{business?.industry} · {business?.location}</Text>
            </View>
            <View style={styles.healthBadge}>
              <View style={styles.healthDot} />
              <Text style={styles.healthText}>Live</Text>
            </View>
          </View>
          <View style={styles.heroBottomRow}>
            <View>
              <Text style={styles.heroNumber}>{metrics.total}</Text>
              <Text style={styles.heroNumberLabel}>comments analyzed</Text>
            </View>
            <View style={styles.heroWave}>
              <PulseWaveform color={colors.cyan} width={128} height={28} />
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard label="Positive" value={metrics.positive} icon="happy-outline" color={colors.positive} background={colors.positiveBg} />
          <MetricCard label="Negative" value={metrics.negative} icon="sad-outline" color={colors.negative} background={colors.negativeBg} />
          <MetricCard label="High urgency" value={metrics.highUrgency} icon="flash-outline" color={colors.urgencyHigh} background={colors.urgencyHighBg} />
          <MetricCard label="Unanswered" value={metrics.unanswered} icon="chatbubble-outline" color={colors.primary} background={colors.primarySoft} />
        </View>

        <SectionCard style={styles.sentimentCard}>
          <View style={styles.sectionTopRow}>
            <View>
              <Text style={styles.cardTitle}>Sentiment mix</Text>
              <Text style={styles.cardSubtitle}>Distribution across all analyzed comments</Text>
            </View>
            <Text style={styles.sentimentScore}>{metrics.positiveRate}% positive</Text>
          </View>

          <View style={styles.sentimentBar}>
            <View style={[styles.sentimentSegment, { width: `${metrics.positiveRate}%`, backgroundColor: colors.positive }]} />
            <View style={[styles.sentimentSegment, { width: `${metrics.neutralRate}%`, backgroundColor: colors.neutral }]} />
            <View style={[styles.sentimentSegment, { width: `${metrics.negativeRate}%`, backgroundColor: colors.negative }]} />
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.positive }]} /><Text style={styles.legendText}>Positive {metrics.positiveRate}%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.neutral }]} /><Text style={styles.legendText}>Neutral {metrics.neutralRate}%</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.negative }]} /><Text style={styles.legendText}>Negative {metrics.negativeRate}%</Text></View>
          </View>
        </SectionCard>

        {error ? <Notice message={error} /> : null}

        <View style={styles.aiSection}>
          <View style={styles.sectionTopRow}>
            <View>
              <Text style={styles.sectionLabel}>AI PULSE REPORTS</Text>
              <Text style={styles.librarySubtitle}>{insights.length} saved insights</Text>
            </View>
            <View style={styles.geminiPill}>
              <View style={styles.geminiDot} />
              <Text style={styles.geminiText}>Gemini</Text>
            </View>
          </View>

          <AppButton
            label="Generate new business insight"
            icon="sparkles"
            onPress={handleGenerateInsight}
            loading={generating}
            disabled={comments.length === 0}
            style={{ marginTop: 12 }}
          />
          {comments.length === 0 ? (
            <Text style={styles.emptyHint}>Add a few comments before generating an insight.</Text>
          ) : null}
        </View>

        {insights.length === 0 ? (
          <EmptyState
            icon="analytics-outline"
            title="No AI insights yet"
            subtitle="Generate your first report once customer comments are available."
            compact
          />
        ) : (
          <View style={styles.insightsList}>
            {insights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </View>
        )}

        <View style={{ height: 108 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loadingText: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 12, marginTop: 10 },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  heroCard: {
    marginTop: 20,
    minHeight: 190,
    backgroundColor: colors.ink,
    borderRadius: radii.xxl,
    padding: 20,
    overflow: "hidden",
    ...shadows.card,
  },
  heroGlowOne: { position: "absolute", width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(107,92,246,0.34)", top: -92, right: -62 },
  heroGlowTwo: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(44,201,188,0.17)", bottom: -95, left: -60 },
  heroTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  heroEyebrow: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, letterSpacing: 1.2, color: colors.cyan },
  heroName: { fontFamily: fonts.display, fontSize: 23, color: colors.textInverse, letterSpacing: -0.6, marginTop: 6 },
  heroMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.white72, marginTop: 4 },
  healthBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.white10, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.white16 },
  healthDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cyan },
  healthText: { fontFamily: fonts.bodySemiBold, color: colors.textInverse, fontSize: 10 },
  heroBottomRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" },
  heroNumber: { fontFamily: fonts.mono, fontSize: 34, color: colors.textInverse },
  heroNumberLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.white72, marginTop: 2 },
  heroWave: { opacity: 0.9, marginBottom: 6 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 14 },
  metricCard: { width: "48.5%", minHeight: 126, marginBottom: 10, padding: 14 },
  metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  metricValue: { fontFamily: fonts.mono, fontSize: 25, color: colors.textPrimary, marginTop: 13 },
  metricLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textSecondary, marginTop: 3 },
  sentimentCard: { padding: 16, marginTop: 4 },
  sectionTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.textPrimary },
  cardSubtitle: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, marginTop: 3 },
  sentimentScore: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.positive, backgroundColor: colors.positiveBg, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill },
  sentimentBar: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: colors.surfaceMuted, marginTop: 18 },
  sentimentSegment: { height: "100%" },
  legendRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontFamily: fonts.bodyMedium, fontSize: 9.5, color: colors.textSecondary },
  aiSection: { marginTop: 24, marginBottom: 12 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, letterSpacing: 1.1, color: colors.textSecondary },
  librarySubtitle: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, marginTop: 3 },
  geminiPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.cyanSoft, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill },
  geminiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyan },
  geminiText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.success },
  emptyHint: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, textAlign: "center", marginTop: 8 },
  insightsList: { gap: 10 },
  insightCard: { padding: 15 },
  insightTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  insightIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  insightTitle: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.textPrimary },
  insightDate: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textTertiary, marginTop: 2 },
  insightText: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19, color: colors.textSecondary, marginTop: 13 },
});
