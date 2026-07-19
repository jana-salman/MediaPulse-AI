import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { createDocument, getDocuments } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";
import { PolicyDocument } from "../types";

const templates = [
  { label: "Delivery", icon: "bicycle-outline" as const, title: "Delivery Policy" },
  { label: "Returns", icon: "return-down-back-outline" as const, title: "Return & Refund Policy" },
  { label: "Allergies", icon: "medical-outline" as const, title: "Allergy Information" },
  { label: "FAQ", icon: "help-circle-outline" as const, title: "Frequently Asked Questions" },
];

function documentIcon(title: string): keyof typeof Ionicons.glyphMap {
  const normalized = title.toLowerCase();
  if (normalized.includes("deliver")) return "bicycle-outline";
  if (normalized.includes("refund") || normalized.includes("return")) return "return-down-back-outline";
  if (normalized.includes("allerg")) return "medical-outline";
  if (normalized.includes("faq") || normalized.includes("question")) return "help-circle-outline";
  return "document-text-outline";
}

export default function BusinessKnowledgeScreen() {
  const { business } = useBusiness();
  const [documents, setDocuments] = useState<PolicyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!business) return;
    setLoading(true);
    setError(null);
    try {
      const { documents: result } = await getDocuments(business.id);
      setDocuments(result);
    } catch (err: any) {
      setError(err.message ?? "Could not load your business knowledge.");
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
      setError("Add a title and the full policy text before saving.");
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const result = await createDocument({
        business_id: business.id,
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      setSuccess(`Saved and indexed in ${result.chunks_created} ${result.chunks_created === 1 ? "chunk" : "chunks"}.`);
      await load();
    } catch (err: any) {
      setError(err.message ?? "Could not save this document.");
    } finally {
      setSubmitting(false);
    }
  };

  const chooseTemplate = (templateTitle: string) => {
    setTitle(templateTitle);
    setSuccess(null);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <PageHeader
                eyebrow={business?.name ?? "BUSINESS KNOWLEDGE"}
                title="Knowledge base"
                subtitle="Give the AI verified policies so every suggested reply stays accurate and on-brand."
                icon="shield-checkmark-outline"
              />

              <View style={styles.trustBanner}>
                <View style={styles.trustIcon}>
                  <Ionicons name="shield-checkmark" size={21} color={colors.cyan} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trustTitle}>Grounded replies</Text>
                  <Text style={styles.trustSubtitle}>MediaPulse retrieves only the most relevant policy chunks before Gemini writes a response.</Text>
                </View>
              </View>

              <View style={styles.templateHeader}>
                <Text style={styles.sectionLabel}>POLICY TEMPLATES</Text>
                <Text style={styles.sectionHint}>Tap to start</Text>
              </View>
              <FlatList
                horizontal
                data={templates}
                keyExtractor={(item) => item.label}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templateRow}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => chooseTemplate(item.title)}
                    style={[styles.templateChip, title === item.title && styles.templateChipActive]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={title === item.title ? colors.textInverse : colors.primary}
                    />
                    <Text style={[styles.templateText, title === item.title && styles.templateTextActive]}>{item.label}</Text>
                  </Pressable>
                )}
              />

              <SectionCard style={styles.editorCard}>
                <View style={styles.editorHeading}>
                  <View style={styles.editorIcon}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.editorTitle}>Add policy document</Text>
                    <Text style={styles.editorSubtitle}>Use plain, specific language. Include limits and exceptions.</Text>
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Document title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delivery Policy"
                  placeholderTextColor={colors.textTertiary}
                  value={title}
                  onChangeText={setTitle}
                  editable={!submitting}
                />

                <View style={styles.contentLabelRow}>
                  <Text style={styles.fieldLabel}>Policy content</Text>
                  <Text style={styles.characterCount}>{content.length} characters</Text>
                </View>
                <TextInput
                  style={styles.textarea}
                  placeholder="Write the exact policy customers should receive..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  value={content}
                  onChangeText={setContent}
                  editable={!submitting}
                  textAlignVertical="top"
                />

                {error ? <Notice message={error} /> : null}
                {success ? <Notice message={success} type="success" /> : null}

                <AppButton
                  label="Save & index policy"
                  icon="cloud-done-outline"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={!title.trim() || !content.trim()}
                  style={{ marginTop: 14 }}
                />
              </SectionCard>

              <View style={styles.libraryHeader}>
                <View>
                  <Text style={styles.sectionLabel}>POLICY LIBRARY</Text>
                  <Text style={styles.librarySubtitle}>{loading ? "Refreshing…" : `${documents.length} indexed ${documents.length === 1 ? "document" : "documents"}`}</Text>
                </View>
                <View style={styles.indexedPill}>
                  <View style={styles.indexedDot} />
                  <Text style={styles.indexedText}>Vector ready</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon="library-outline"
                title="Your knowledge base is empty"
                subtitle="Add delivery, return, allergy or FAQ policies to unlock grounded replies."
                compact
              />
            ) : null
          }
          renderItem={({ item }) => (
            <SectionCard style={styles.documentCard}>
              <View style={styles.documentTopRow}>
                <View style={styles.documentIcon}>
                  <Ionicons name={documentIcon(item.title)} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.documentTitle}>{item.title}</Text>
                  <Text style={styles.documentMeta}>
                    Indexed {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </Text>
                </View>
                <View style={styles.readyIcon}>
                  <Ionicons name="checkmark" size={13} color={colors.success} />
                </View>
              </View>
              <Text style={styles.documentContent} numberOfLines={3}>{item.content}</Text>
            </SectionCard>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListFooterComponent={<View style={{ height: 108 }} />}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    padding: 16,
    marginTop: 20,
  },
  trustIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.white10, alignItems: "center", justifyContent: "center" },
  trustTitle: { fontFamily: fonts.displayMedium, fontSize: 14.5, color: colors.textInverse },
  trustSubtitle: { fontFamily: fonts.body, fontSize: 10.5, lineHeight: 15, color: colors.white72, marginTop: 3 },
  templateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22, marginBottom: 9 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, letterSpacing: 1.1, color: colors.textSecondary },
  sectionHint: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary },
  templateRow: { gap: 8, paddingRight: 16 },
  templateChip: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 38, paddingHorizontal: 13, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  templateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  templateText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, color: colors.textSecondary },
  templateTextActive: { color: colors.textInverse },
  editorCard: { marginTop: 14, padding: 18 },
  editorHeading: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 18 },
  editorIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  editorTitle: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.textPrimary },
  editorSubtitle: { fontFamily: fonts.body, fontSize: 10.5, lineHeight: 15, color: colors.textTertiary, marginTop: 2 },
  fieldLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, color: colors.textSecondary, marginBottom: 7 },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, backgroundColor: colors.surfaceAlt, paddingHorizontal: 13, fontFamily: fonts.body, fontSize: 13.5, color: colors.textPrimary, marginBottom: 14 },
  contentLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  characterCount: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textTertiary, marginBottom: 7 },
  textarea: { minHeight: 130, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, backgroundColor: colors.surfaceAlt, padding: 13, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textPrimary, marginBottom: 12 },
  libraryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 25, marginBottom: 10 },
  librarySubtitle: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, marginTop: 3 },
  indexedPill: { flexDirection: "row", alignItems: "center", gap: 5 },
  indexedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cyan },
  indexedText: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary },
  documentCard: { padding: 16 },
  documentTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  documentIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  documentTitle: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.textPrimary },
  documentMeta: { fontFamily: fonts.body, fontSize: 9.5, color: colors.textTertiary, marginTop: 2 },
  readyIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  documentContent: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, color: colors.textSecondary, marginTop: 11 },
});
