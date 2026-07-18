import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createDocument, getDocuments } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { PolicyDocument } from "../types";

export default function BusinessKnowledgeScreen() {
  const { business } = useBusiness();
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    try {
      const { documents: docs } = await getDocuments(business.id);
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message ?? "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }, [business]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSubmit = async () => {
    if (!business || !title.trim() || !content.trim()) {
      setError("Add both a title and the policy content.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createDocument({
        business_id: business.id,
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      await load();
    } catch (err: any) {
      setError(err.message ?? "Could not save this document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Business knowledge</Text>
          <Text style={styles.subtitle}>
            Add policy documents (delivery, returns, allergy info, FAQ). The AI
            uses these to ground suggested replies in real business policy.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Title (e.g. Delivery Policy)"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.textarea}
            placeholder="Policy content..."
            multiline
            value={content}
            onChangeText={setContent}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save document</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.listLabel}>
            {loading ? "Loading..." : `${documents.length} document(s)`}
          </Text>
        </View>
      }
      data={documents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.docCard}>
          <Text style={styles.docTitle}>{item.title}</Text>
          <Text style={styles.docContent} numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  textarea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 10 },
  listLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
  },
  docCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  docTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  docContent: { fontSize: 13, color: colors.textSecondary },
});
