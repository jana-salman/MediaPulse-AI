import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { business, clearBusiness } = useBusiness();

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleSwitchBusiness = () => {
    Alert.alert(
      "Switch business",
      "This clears the business connected on this device. You'll be asked to create or connect to one again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Switch", style: "destructive", onPress: clearBusiness },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarCircle}>
        <Ionicons name="person" size={30} color={colors.primary} />
      </View>
      <Text style={styles.email}>{session?.user?.email ?? "Signed in"}</Text>

      <Text style={styles.sectionLabel}>Business</Text>
      <View style={styles.card}>
        {business ? (
          <>
            <Row label="Name" value={business.name} />
            <Row label="Industry" value={business.industry} />
            <Row label="Brand tone" value={business.brand_tone} />
            <Row label="Location" value={business.location} />
            <Row label="Business ID" value={business.id} />
          </>
        ) : (
          <Text style={styles.rowValue}>No business connected.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleSwitchBusiness} activeOpacity={0.8}>
        <Ionicons name="swap-horizontal-outline" size={17} color={colors.primary} />
        <Text style={styles.secondaryButtonText}>Switch business</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={17} color={colors.danger} />
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, alignItems: "center" },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  email: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textPrimary, flexShrink: 1, textAlign: "right" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  secondaryButtonText: { fontFamily: fonts.bodySemiBold, color: colors.primary, fontSize: 14 },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
  },
  signOutText: { fontFamily: fonts.bodySemiBold, color: colors.danger, fontSize: 14 },
});