import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EmptyState } from "../components/EmptyState";
import { PulseWaveform } from "../components/PulseWaveform";
import { generateInsight, getComments, getInsights } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { Comment, Insight } from "../types";

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
        const [commentsRes, insightsRes] = await Promise.all([
          getComments(business.id),
          getInsights(business.id),
        ]);
        setComments(commentsRes.comments);
        setInsights(insightsRes.insights);
      } catch (err: any) {
        setError(err.message ?? "Could not load dashboard data.");
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
      setError(err.message ?? "Could not generate insights.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const negative = comments.filter((c) => c.sentiment === "negative").length;
  const positive = comments.filter((c) => c.sentiment === "positive").length;
  const highUrgency = comments.filter((c) => c.urgency === "high").length;
  const unanswered = comments.filter((c) => c.status === "unanswered").length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <Text style={styles.title}>{business?.name ?? "Dashboard"}</Text>
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>{comments.length} comments analyzed so far</Text>
      </View>
      <PulseWaveform color={colors.primarySoft} width={120} height={18} />

      <View style={styles.statsGrid}>
        <StatBox label="Positive" value={positive} accent={colors.positive} />
        <StatBox label="Negative" value={negative} accent={colors.negative} />
        <StatBox label="High urgency" value={highUrgency} accent={colors.urgencyHigh} />
        <StatBox label="Unanswered" value={unanswered} accent={colors.primary} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, generating && styles.buttonDisabled]}
        onPress={handleGenerateInsight}
        disabled={generating || comments.length === 0}
        activeOpacity={0.85}
      >
        {generating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate new insight</Text>
        )}
      </TouchableOpacity>
      {comments.length === 0 && (
        <Text style={styles.hint}>Add some comments first to generate insights.</Text>
      )}

      <Text style={styles.sectionLabel}>Insight history</Text>
      {insights.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="No insights yet"
          subtitle="Generate one once you have a few comments in."
        />
      ) : (
        insights.map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightText}>{insight.summary}</Text>
            <Text style={styles.insightDate}>
              {new Date(insight.created_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary },
  subtitleRow: { marginTop: 4, marginBottom: 10 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20, marginBottom: 20 },
  statBox: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  statAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  statValue: { fontFamily: fonts.mono, fontSize: 26, color: colors.textPrimary, marginTop: 4 },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.6, shadowOpacity: 0 },
  buttonText: { color: "#fff", fontFamily: fonts.bodySemiBold, fontSize: 15 },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 8, textAlign: "center" },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: 13, marginBottom: 10, textAlign: "center" },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  insightText: { fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  insightDate: { fontFamily: fonts.body, fontSize: 11, color: colors.textSecondary, marginTop: 6 },
});
