import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii, shadows } from "../theme/tokens";

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}> 
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { business, clearBusiness } = useBusiness();
  const [copied, setCopied] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out of MediaPulse AI?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleSwitchBusiness = () => {
    Alert.alert(
      "Switch business",
      "This removes the connected business from this device. Your data remains safely stored in Supabase.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Switch", style: "destructive", onPress: clearBusiness },
      ]
    );
  };

  const copyBusinessId = async () => {
    if (!business) return;
    await Clipboard.setStringAsync(business.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const initial = (session?.user?.email ?? "M").slice(0, 1).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader
          eyebrow="ACCOUNT & WORKSPACE"
          title="Profile"
          subtitle="Manage your signed-in account and the business connected to this device."
          icon="settings-outline"
        />

        <View style={styles.profileHero}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.email} numberOfLines={1}>{session?.user?.email ?? "Signed in"}</Text>
            <View style={styles.accountStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.accountStatusText}>Authenticated with Supabase</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>CONNECTED BUSINESS</Text>
            <Text style={styles.sectionHint}>Workspace stored on this device</Text>
          </View>
          <View style={styles.connectedPill}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        </View>

        {business ? (
          <>
            <SectionCard style={styles.businessCard}>
              <View style={styles.businessHeader}>
                <View style={styles.businessIcon}>
                  <Ionicons name="storefront" size={22} color={colors.textInverse} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.businessName}>{business.name}</Text>
                  <Text style={styles.businessMeta}>{business.industry} · {business.location}</Text>
                </View>
              </View>

              <View style={styles.idBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.idLabel}>BUSINESS ID</Text>
                  <Text style={styles.idValue} numberOfLines={1}>{business.id}</Text>
                </View>
                <Pressable onPress={copyBusinessId} style={[styles.copyButton, copied && styles.copyButtonSuccess]}>
                  <Ionicons name={copied ? "checkmark" : "copy-outline"} size={17} color={copied ? colors.success : colors.primary} />
                </Pressable>
              </View>
            </SectionCard>

            <SectionCard style={styles.detailsCard}>
              <DetailRow icon="briefcase-outline" label="Industry" value={business.industry} />
              <DetailRow icon="chatbubble-ellipses-outline" label="Brand tone" value={business.brand_tone} />
              <DetailRow icon="location-outline" label="Location" value={business.location} last />
            </SectionCard>
          </>
        ) : (
          <SectionCard>
            <Text style={styles.emptyText}>No business is connected.</Text>
          </SectionCard>
        )}

        <View style={styles.sectionHeaderSecondary}>
          <Text style={styles.sectionLabel}>WORKSPACE ACTIONS</Text>
        </View>
        <AppButton label="Switch business" icon="swap-horizontal-outline" onPress={handleSwitchBusiness} variant="secondary" />
        <AppButton label="Sign out" icon="log-out-outline" onPress={handleSignOut} variant="danger" style={{ marginTop: 10 }} />

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark-outline" size={17} color={colors.textTertiary} />
          <Text style={styles.securityText}>Your business data is stored in Supabase. Switching only clears the local business selection.</Text>
        </View>

        <View style={{ height: 108 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.ink,
    borderRadius: radii.xxl,
    padding: 18,
    marginTop: 20,
    overflow: "hidden",
    ...shadows.card,
  },
  heroGlowOne: { position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(107,92,246,0.30)", top: -72, right: -36 },
  heroGlowTwo: { position: "absolute", width: 95, height: 95, borderRadius: 48, backgroundColor: "rgba(44,201,188,0.15)", bottom: -54, left: -20 },
  avatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.white16 },
  avatarText: { fontFamily: fonts.display, fontSize: 24, color: colors.textInverse },
  email: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.textInverse },
  accountStatus: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cyan },
  accountStatusText: { fontFamily: fonts.body, fontSize: 10.5, color: colors.white72 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 25, marginBottom: 10 },
  sectionHeaderSecondary: { marginTop: 25, marginBottom: 10 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10.5, letterSpacing: 1.1, color: colors.textSecondary },
  sectionHint: { fontFamily: fonts.body, fontSize: 10, color: colors.textTertiary, marginTop: 3 },
  connectedPill: { flexDirection: "row", alignItems: "center", gap: 5 },
  connectedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cyan },
  connectedText: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary },
  businessCard: { padding: 16 },
  businessHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  businessIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  businessName: { fontFamily: fonts.displayMedium, fontSize: 16, color: colors.textPrimary },
  businessMeta: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary, marginTop: 3 },
  idBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 12, marginTop: 15 },
  idLabel: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 1, color: colors.textTertiary },
  idValue: { fontFamily: fonts.mono, fontSize: 10.5, color: colors.textSecondary, marginTop: 3 },
  copyButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  copyButtonSuccess: { backgroundColor: colors.successSoft },
  detailsCard: { paddingHorizontal: 15, paddingVertical: 2, marginTop: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  detailLabel: { fontFamily: fonts.body, fontSize: 10.5, color: colors.textTertiary },
  detailValue: { fontFamily: fonts.bodySemiBold, fontSize: 12.5, color: colors.textPrimary, marginTop: 2 },
  emptyText: { fontFamily: fonts.body, color: colors.textSecondary },
  securityNote: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 18, paddingHorizontal: 8 },
  securityText: { flex: 1, fontFamily: fonts.body, fontSize: 10.5, lineHeight: 16, color: colors.textTertiary },
});
