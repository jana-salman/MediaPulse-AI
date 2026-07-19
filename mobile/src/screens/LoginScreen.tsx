import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
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
import { PulseWaveform } from "../components/PulseWaveform";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" | "info" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage({ text: "Enter your email and password to continue.", type: "error" });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: "Your password must contain at least 6 characters.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        setMode("signin");
        setMessage({
          text: "Account created. Confirm your email if requested, then sign in.",
          type: "success",
        });
      }
    } catch (err: any) {
      setMessage({ text: err.message ?? "We could not complete that request.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMessage(null);
    setMode((current) => (current === "signin" ? "signup" : "signin"));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <View style={styles.brandOnDark}>
                <View style={styles.brandMarkWrap}>
                  <BrandMark compact />
                </View>
                <Text style={styles.brandName}>MediaPulse AI</Text>
              </View>

              <Text style={styles.heroTitle}>Turn customer feedback into clear action.</Text>
              <Text style={styles.heroSubtitle}>
                Analyze sentiment, spot urgent issues and answer customers using your real business policies.
              </Text>

              <View style={styles.heroSignal}>
                <PulseWaveform color={colors.cyan} width={126} height={24} />
                <Text style={styles.signalLabel}>LIVE CUSTOMER PULSE</Text>
              </View>
            </View>

            <View style={styles.authCard}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardEyebrow}>{mode === "signin" ? "WELCOME BACK" : "GET STARTED"}</Text>
                  <Text style={styles.cardTitle}>{mode === "signin" ? "Sign in" : "Create your account"}</Text>
                </View>
                <View style={styles.securePill}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
                  <Text style={styles.secureText}>Secure</Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Email address</Text>
              <View style={styles.inputShell}>
                <Ionicons name="mail-outline" size={19} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="you@business.com"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputShell}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onSubmitEditing={submit}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              {message ? (
                <View style={{ marginBottom: 14 }}>
                  <Notice message={message.text} type={message.type} />
                </View>
              ) : null}

              <AppButton
                label={mode === "signin" ? "Continue to workspace" : "Create account"}
                icon={mode === "signin" ? "arrow-forward" : "person-add-outline"}
                onPress={submit}
                loading={loading}
              />

              <Pressable style={styles.switchMode} onPress={switchMode} disabled={loading}>
                <Text style={styles.switchMuted}>
                  {mode === "signin" ? "New to MediaPulse?" : "Already have an account?"}
                </Text>
                <Text style={styles.switchLink}>{mode === "signin" ? " Create account" : " Sign in"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, overflow: "hidden" },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  heroGlowOne: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "rgba(107,92,246,0.28)",
    top: -120,
    right: -110,
  },
  heroGlowTwo: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(44,201,188,0.13)",
    top: 120,
    left: -150,
  },
  hero: { paddingTop: 22, paddingBottom: 30 },
  brandOnDark: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 30 },
  brandMarkWrap: {
    backgroundColor: colors.white10,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.white16,
  },
  brandName: { fontFamily: fonts.display, fontSize: 17, color: colors.textInverse, letterSpacing: -0.3 },
  heroTitle: {
    fontFamily: fonts.display,
    color: colors.textInverse,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.2,
    maxWidth: 350,
  },
  heroSubtitle: {
    fontFamily: fonts.body,
    color: colors.white72,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 350,
  },
  heroSignal: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22 },
  signalLabel: { fontFamily: fonts.mono, color: colors.cyan, fontSize: 9, letterSpacing: 1.4 },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.white16,
    marginTop: "auto",
    ...shadows.floating,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  cardEyebrow: { fontFamily: fonts.bodySemiBold, color: colors.primary, fontSize: 10, letterSpacing: 1.3 },
  cardTitle: { fontFamily: fonts.display, color: colors.textPrimary, fontSize: 25, letterSpacing: -0.7, marginTop: 4 },
  securePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  secureText: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, color: colors.success },
  fieldLabel: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.textSecondary, marginBottom: 7 },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textPrimary, paddingVertical: 12 },
  switchMode: { flexDirection: "row", justifyContent: "center", paddingTop: 18, paddingBottom: 2 },
  switchMuted: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 12.5 },
  switchLink: { fontFamily: fonts.bodySemiBold, color: colors.primary, fontSize: 12.5 },
});
