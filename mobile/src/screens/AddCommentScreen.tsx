import * as DocumentPicker from "expo-document-picker";
import Papa from "papaparse";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { analyzeComment } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

interface LineResult {
  text: string;
  status: "pending" | "done" | "error";
  sentiment?: string;
  errorMessage?: string;
}

export default function AddCommentScreen() {
  const { business } = useBusiness();
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<LineResult[]>([]);

  const runAnalysis = async (lines: string[]) => {
    if (!business) return;
    const cleaned = lines.map((l) => l.trim()).filter(Boolean);
    if (cleaned.length === 0) return;

    setSubmitting(true);
    setResults(cleaned.map((text) => ({ text, status: "pending" })));

    // Sent one at a time (not Promise.all) so a single failed comment doesn't
    // abort the rest, and so the list updates progressively.
    for (let i = 0; i < cleaned.length; i++) {
      try {
        const { comment } = await analyzeComment({
          business_id: business.id,
          text: cleaned[i],
        });
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "done", sentiment: comment.sentiment } : r
          )
        );
      } catch (err: any) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: "error", errorMessage: err.message ?? "Failed" }
              : r
          )
        );
      }
    }

    setSubmitting(false);
    setInput("");
  };

  const handleSubmitPasted = () => {
    runAnalysis(input.split("\n"));
  };

  const handleCsvUpload = async () => {
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
      // Take the first column of every row as the comment text.
      const lines = parsed.data.map((row) => (Array.isArray(row) ? row[0] : String(row)));
      await runAnalysis(lines);
    } catch (err) {
      // If parsing fails, fall back to treating the raw file as one comment per line.
      const response = await fetch(asset.uri);
      const text = await response.text();
      await runAnalysis(text.split("\n"));
    }
  };

  if (!business) {
    return (
      <View style={styles.centered}>
        <Text>No business selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add comments</Text>
      <Text style={styles.subtitle}>
        Paste one customer comment per line. Each line is sent to Gemini for
        sentiment, category and urgency analysis.
      </Text>

      <TextInput
        style={styles.textarea}
        multiline
        placeholder={"My cake arrived two hours late.\nGreat service, will order again!"}
        value={input}
        onChangeText={setInput}
        editable={!submitting}
      />

      <TouchableOpacity
        style={[styles.button, (submitting || !input.trim()) && styles.buttonDisabled]}
        onPress={handleSubmitPasted}
        disabled={submitting || !input.trim()}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Analyze comments</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleCsvUpload}
        disabled={submitting}
      >
        <Text style={styles.secondaryButtonText}>Upload CSV instead (optional)</Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultsTitle}>
            {results.filter((r) => r.status === "done").length} / {results.length} analyzed
          </Text>
          {results.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={styles.resultText} numberOfLines={1}>
                {r.text}
              </Text>
              <Text
                style={[
                  styles.resultStatus,
                  r.status === "error" && { color: colors.danger },
                  r.status === "done" && { color: colors.positive },
                ]}
              >
                {r.status === "pending"
                  ? "…"
                  : r.status === "done"
                  ? r.sentiment
                  : "failed"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 19,
  },
  textarea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 140,
    textAlignVertical: "top",
    marginBottom: 14,
  },
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
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: "#fff", fontFamily: fonts.bodySemiBold, fontSize: 15 },
  secondaryButton: { alignItems: "center", marginTop: 14 },
  secondaryButtonText: { fontFamily: fonts.bodySemiBold, color: colors.primary, fontSize: 13 },
  resultsBox: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  resultsTitle: { fontFamily: fonts.bodySemiBold, marginBottom: 10, color: colors.textPrimary },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultText: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary, marginRight: 8 },
  resultStatus: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.textSecondary, textTransform: "capitalize" },
});
