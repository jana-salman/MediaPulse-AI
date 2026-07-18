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
import { generateInsight, getComments, getInsights } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { Comment, Insight } from "../types";

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statBox}>
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
      <Text style={styles.subtitle}>{comments.length} comments analyzed so far</Text>

      <View style={styles.statsGrid}>
        <StatBox label="Positive" value={positive} />
        <StatBox label="Negative" value={negative} />
        <StatBox label="High urgency" value={highUrgency} />
        <StatBox label="Unanswered" value={unanswered} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, generating && styles.buttonDisabled]}
        onPress={handleGenerateInsight}
        disabled={generating || comments.length === 0}
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
        <Text style={styles.hint}>No insights generated yet.</Text>
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
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statBox: {
    width: "47%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  statValue: { fontSize: 26, fontWeight: "700", color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  hint: { fontSize: 12, color: colors.textSecondary, marginTop: 8, textAlign: "center" },
  error: { color: colors.danger, fontSize: 13, marginBottom: 10, textAlign: "center" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  insightText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  insightDate: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
});
