import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { BrandMark } from "../components/BrandMark";
import { Notice } from "../components/Notice";
import { SectionCard } from "../components/SectionCard";
import { createBusiness, getBusiness } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  autoCapitalize,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons name={icon} size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

export default function BusinessSetupScreen() {
  const { setBusiness } = useBusiness();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<"create" | "join">("create");

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [location, setLocation] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !industry.trim() || !brandTone.trim() || !location.trim()) {
      setError("Complete all four business details before continuing.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { business } = await createBusiness({
        name: name.trim(),
        industry: industry.trim(),
        brand_tone: brandTone.trim(),
        location: location.trim(),
      });
      await setBusiness(business);
    } catch (err: any) {
      setError(err.message ?? "We could not create this business.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!businessId.trim()) {
      setError("Paste the business ID shared by your teammate.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { business } = await getBusiness(businessId.trim());
      await setBusiness(business);
    } catch (err: any) {
      setError(err.message ?? "We could not find that business.");
    } finally {
      setLoading(false);
    }
  };

  const selectMode = (next: "create" | "join") => {
    setError(null);
    setMode(next);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <BrandMark compact />
            <Pressable onPress={signOut} style={styles.signOutTop}>
              <Ionicons name="log-out-outline" size={17} color={colors.textSecondary} />
              <Text style={styles.signOutTopText}>Sign out</Text>
            </Pressable>
          </View>

          <Text style={styles.eyebrow}>WORKSPACE SETUP</Text>
          <Text style={styles.title}>Connect your customer pulse.</Text>
          <Text style={styles.subtitle}>
            Create a workspace for a new business, or join an existing one using its secure ID.
          </Text>

          <View style={styles.segmentedControl}>
            <Pressable
              style={[styles.segment, mode === "create" && styles.segmentActive]}
              onPress={() => selectMode("create")}
            >
              <Ionicons
                name="sparkles-outline"
                size={16}
                color={mode === "create" ? colors.textInverse : colors.textSecondary}
              />
              <Text style={[styles.segmentText, mode === "create" && styles.segmentTextActive]}>Create new</Text>
            </Pressable>
            <Pressable
              style={[styles.segment, mode === "join" && styles.segmentActive]}
              onPress={() => selectMode("join")}
            >
              <Ionicons
                name="link-outline"
                size={16}
                color={mode === "join" ? colors.textInverse : colors.textSecondary}
              />
              <Text style={[styles.segmentText, mode === "join" && styles.segmentTextActive]}>Use existing</Text>
            </Pressable>
          </View>

          <SectionCard style={styles.formCard}>
            {mode === "create" ? (
              <>
                <View style={styles.cardHeadingRow}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="storefront-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Business profile</Text>
                    <Text style={styles.cardSubtitle}>This context helps Gemini match your brand and industry.</Text>
                  </View>
                </View>

                <Field label="Business name" icon="business-outline" placeholder="Sweet Corner Bakery" value={name} onChangeText={setName} />
                <Field label="Industry" icon="briefcase-outline" placeholder="Bakery" value={industry} onChangeText={setIndustry} />
                <Field label="Brand tone" icon="chatbubble-ellipses-outline" placeholder="Friendly, warm and helpful" value={brandTone} onChangeText={setBrandTone} />
                <Field label="Location" icon="location-outline" placeholder="Beirut, Lebanon" value={location} onChangeText={setLocation} />

                {error ? <Notice message={error} /> : null}

                <AppButton
                  label="Create workspace"
                  icon="arrow-forward"
                  onPress={handleCreate}
                  loading={loading}
                  style={{ marginTop: 16 }}
                />
              </>
            ) : (
              <>
                <View style={styles.cardHeadingRow}>
                  <View style={[styles.cardIcon, { backgroundColor: colors.cyanSoft }]}> 
                    <Ionicons name="people-outline" size={20} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Join your team</Text>
                    <Text style={styles.cardSubtitle}>Use the exact business ID shown in your teammate's Profile tab.</Text>
                  </View>
                </View>

                <Field
                  label="Business ID"
                  icon="key-outline"
                  placeholder="Paste UUID here"
                  value={businessId}
                  onChangeText={setBusinessId}
                  autoCapitalize="none"
                />

                <View style={styles.tipBox}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.tipText}>Your phone must be able to reach the FastAPI backend before connecting.</Text>
                </View>

                {error ? <Notice message={error} /> : null}

                <AppButton
                  label="Connect to business"
                  icon="link-outline"
                  onPress={handleJoin}
                  loading={loading}
                  style={{ marginTop: 16 }}
                />
              </>
            )}
          </SectionCard>

          <Text style={styles.footerText}>Built for fast, policy-aware customer support.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 34 },
  signOutTop: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, paddingLeft: 10 },
  signOutTopText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.textSecondary },
  eyebrow: { fontFamily: fonts.bodySemiBold, color: colors.primary, fontSize: 10.5, letterSpacing: 1.4 },
  title: { fontFamily: fonts.display, color: colors.textPrimary, fontSize: 31, lineHeight: 37, letterSpacing: -1, marginTop: 7 },
  subtitle: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, marginTop: 9 },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: 5,
    marginTop: 24,
    marginBottom: 14,
  },
  segment: { flex: 1, minHeight: 44, borderRadius: radii.md, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: colors.ink },
  segmentText: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.textSecondary },
  segmentTextActive: { color: colors.textInverse },
  formCard: { padding: 18 },
  cardHeadingRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  cardIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.textPrimary },
  cardSubtitle: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, color: colors.textSecondary, marginTop: 3 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontFamily: fonts.bodySemiBold, color: colors.textSecondary, fontSize: 11.5, marginBottom: 7 },
  inputShell: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 13,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, color: colors.textPrimary, paddingVertical: 12 },
  tipBox: { flexDirection: "row", gap: 8, backgroundColor: colors.primaryFaint, borderRadius: radii.md, padding: 12, marginBottom: 14 },
  tipText: { flex: 1, fontFamily: fonts.body, fontSize: 11.5, lineHeight: 17, color: colors.textSecondary },
  footerText: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary, textAlign: "center", marginTop: 22 },
});
