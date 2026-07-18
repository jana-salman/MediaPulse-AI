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
import { createBusiness, getBusiness } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

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
    if (!name || !industry || !brandTone || !location) {
      setError("Fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { business } = await createBusiness({
        name,
        industry,
        brand_tone: brandTone,
        location,
      });
      await setBusiness(business);
    } catch (err: any) {
      setError(err.message ?? "Could not create the business.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!businessId.trim()) {
      setError("Enter a business ID.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { business } = await getBusiness(businessId.trim());
      await setBusiness(business);
    } catch (err: any) {
      setError(err.message ?? "Business not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set up your business</Text>
      <Text style={styles.subtitle}>
        Create a new business profile, or connect to one a teammate already
        created (share the business ID from the app or Supabase table).
      </Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === "create" && styles.tabActive]}
          onPress={() => setMode("create")}
        >
          <Text style={mode === "create" ? styles.tabTextActive : styles.tabText}>
            Create new
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === "join" && styles.tabActive]}
          onPress={() => setMode("join")}
        >
          <Text style={mode === "join" ? styles.tabTextActive : styles.tabText}>
            Use existing
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "create" ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Business name (e.g. Sweet Corner Bakery)"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Industry (e.g. Bakery)"
            value={industry}
            onChangeText={setIndustry}
          />
          <TextInput
            style={styles.input}
            placeholder="Brand tone (e.g. Friendly and warm)"
            value={brandTone}
            onChangeText={setBrandTone}
          />
          <TextInput
            style={styles.input}
            placeholder="Location (e.g. Beirut, Lebanon)"
            value={location}
            onChangeText={setLocation}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create business</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Business ID"
            autoCapitalize="none"
            value={businessId}
            onChangeText={setBusinessId}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Connect</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={signOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 19,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: fonts.bodySemiBold, color: colors.textSecondary, fontSize: 13 },
  tabTextActive: { fontFamily: fonts.bodySemiBold, color: "#fff", fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontFamily: fonts.bodySemiBold, fontSize: 15 },
  error: { fontFamily: fonts.body, color: colors.danger, fontSize: 13, marginBottom: 10 },
  signOut: { marginTop: 28, alignItems: "center" },
  signOutText: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 13 },
});
