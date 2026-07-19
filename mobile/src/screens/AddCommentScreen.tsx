import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Papa from "papaparse";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { analyzeComment } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";

interface LineResult {
  text: string;
  status: "pending" | "done" | "error";
  sentiment?: string;
  errorMessage?: string;
}

const examples = [
  "The cake was beautiful and tasted amazing!",
  "My order arrived two hours late.",
  "Does this contain peanuts?",
];

export default function AddCommentScreen() {
  const { business } = useBusiness();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<LineResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (lines: string[]) => {
    if (!business) return;
    const cleaned = lines.map((line) => line.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setError("Add at least one customer comment before analyzing.");
      return;
    }

    setError(null);
    setSubmitting(true);
    setResults(cleaned.map((text) => ({ text, status: "pending" })));

    for (let i = 0; i < cleaned.length; i += 1) {
      try {
        const { comment } = await analyzeComment({ business_id: business.id, text: cleaned[i] });
        setResults((previous) =>
          previous.map((result, index) =>
            index === i ? { ...result, status: "done", sentiment: comment.sentiment } : result
          )
        );
      } catch (err: any) {
        setResults((previous) =>
          previous.map((result, index) =>
            index === i
              ? { ...result, status: "error", errorMessage: err.message ?? "Failed" }
              : result
          )
        );
      }
    }

    setSubmitting(false);
    setInput("");
  };

  const handleCsvUpload = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "text/comma-separated-values", "*/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    try {
      const response = await fetch(asset.uri);
      const text = await response.text();
      const parsed = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
      const lines = parsed.data.map((row) => (Array.isArray(row) ? row[0] : String(row)));
      await runAnalysis(lines);
    } catch {
      try {
        const response = await fetch(asset.uri);
        const text = await response.text();
        await runAnalysis(text.split("\n"));
      } catch (err: any) {
        setError(err.message ?? "We could not read that CSV file.");
      }
    }
  };

  const completed = results.filter((result) => result.status === "done").length;
  const failed = results.filter((result) => result.status === "error").length;
  const progress = results.length > 0 ? (completed + failed) / results.length : 0;

  if (!business) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.muted}>No business is selected.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            eyebrow={business.name}
            title="Add feedback"
            subtitle="Paste customer comments or upload a CSV. MediaPulse analyzes every line separately."
            icon="sparkles-outline"
          />

          <SectionCard style={styles.composerCard}>
            <View style={styles.composerTopRow}>
              <View style={styles.composerIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={21} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.composerTitle}>Customer comments</Text>
                <Text style={styles.composerSubtitle}>One comment per line · plain text works best</Text>
              </View>
              <View style={styles.aiPill}>
                <View style={styles.aiDot} />
                <Text style={styles.aiText}>Gemini</Text>
              </View>
            </View>

            <TextInput
              style={styles.textarea}
              multiline
              placeholder={"The cake tasted amazing!\nMy delivery arrived late."}
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              editable={!submitting}
              textAlignVertical="top"
            />

            <View style={styles.inputFooter}>
              <Text style={styles.lineCount}>{input.split("\n").filter((line) => line.trim()).length} lines ready</Text>
              {input ? (
                <Pressable onPress={() => setInput("")} disabled={submitting}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              ) : null}
            </View>

            {error ? <Notice message={error} /> : null}

            <AppButton
              label="Analyze feedback"
              icon="sparkles"
              onPress={() => runAnalysis(input.split("\n"))}
              loading={submitting}
              disabled={!input.trim()}
              style={{ marginTop: 14 }}
            />
            <AppButton
              label="Upload CSV"
              icon="cloud-upload-outline"
              onPress={handleCsvUpload}
              disabled={submitting}
              variant="secondary"
              style={{ marginTop: 10 }}
            />
          </SectionCard>

          <View style={styles.examplesHeader}>
            <Text style={styles.sectionLabel}>QUICK EXAMPLES</Text>
            <Text style={styles.sectionHint}>Tap to add</Text>
          </View>
          <FlatList
            horizontal
            data={examples}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.examplesRow}
            renderItem={({ item }) => (
              <Pressable
                style={styles.exampleCard}
                onPress={() => setInput((current) => (current ? `${current}\n${item}` : item))}
                disabled={submitting}
              >
                <Ionicons name="add-circle-outline" size={17} color={colors.primary} />
                <Text style={styles.exampleText} numberOfLines={3}>{item}</Text>
              </Pressable>
            )}
          />

          {results.length > 0 ? (
            <SectionCard style={styles.resultsCard}>
              <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.resultsTitle}>Analysis progress</Text>
                  <Text style={styles.resultsSubtitle}>{completed} complete · {failed} failed · {results.length} total</Text>
                </View>
                <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>

              {results.map((result, index) => {
                const palette =
                  result.status === "done"
                    ? { fg: colors.success, bg: colors.successSoft, icon: "checkmark" as const }
                    : result.status === "error"
                    ? { fg: colors.danger, bg: colors.dangerSoft, icon: "close" as const }
                    : { fg: colors.primary, bg: colors.primarySoft, icon: "ellipsis-horizontal" as const };
                return (
                  <View key={`${result.text}-${index}`} style={styles.resultRow}>
                    <View style={[styles.resultIcon, { backgroundColor: palette.bg }]}> 
                      <Ionicons name={palette.icon} size={15} color={palette.fg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultText} numberOfLines={1}>{result.text}</Text>
                      {result.errorMessage ? <Text style={styles.resultError}>{result.errorMessage}</Text> : null}
                    </View>
                    <Text style={[styles.resultStatus, { color: palette.fg }]}>
                      {result.status === "done" ? result.sentiment : result.status}
                    </Text>
                  </View>
                );
              })}
            </SectionCard>
          ) : null}

          <View style={{ height: 104 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  muted: { fontFamily: fonts.body, color: colors.textSecondary },
  composerCard: { marginTop: 20, padding: 16 },
  composerTopRow: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 14 },
  composerIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  composerTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.textPrimary },
  composerSubtitle: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, marginTop: 2 },
  aiPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.cyanSoft, paddingHorizontal: 8, paddingVertical: 6, borderRadius: radii.pill },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyan },
  aiText: { fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.success },
  textarea: {
    minHeight: 160,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    padding: 14,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  inputFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 2 },
  lineCount: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary },
  clearText: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.primary },
  examplesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 9 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, letterSpacing: 1.1, color: colors.textSecondary },
  sectionHint: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary },
  examplesRow: { gap: 9, paddingRight: 16 },
  exampleCard: {
    width: 178,
    minHeight: 90,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    gap: 8,
  },
  exampleText: { fontFamily: fonts.bodyMedium, fontSize: 11.5, lineHeight: 16, color: colors.textSecondary },
  resultsCard: { marginTop: 22, padding: 16 },
  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultsTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.textPrimary },
  resultsSubtitle: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, marginTop: 3 },
  percentText: { fontFamily: fonts.mono, fontSize: 18, color: colors.primary },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: colors.surfaceMuted, overflow: "hidden", marginTop: 13, marginBottom: 10 },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: colors.primary },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  resultIcon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  resultText: { fontFamily: fonts.bodyMedium, fontSize: 11.5, color: colors.textPrimary },
  resultError: { fontFamily: fonts.body, fontSize: 9.5, color: colors.danger, marginTop: 2 },
  resultStatus: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, textTransform: "capitalize" },
});
