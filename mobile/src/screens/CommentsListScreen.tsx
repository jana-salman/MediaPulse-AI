import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommentCard } from "../components/CommentCard";
import { EmptyState } from "../components/EmptyState";
import { Notice } from "../components/Notice";
import { PageHeader } from "../components/PageHeader";
import { getComments } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { MainStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { radii } from "../theme/tokens";
import { Comment } from "../types";

type Props = NativeStackScreenProps<MainStackParamList, "CommentsList">;
type Filter = "all" | "high" | "negative" | "positive";

const filters: { key: Filter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "All", icon: "layers-outline" },
  { key: "high", label: "Urgent", icon: "flash-outline" },
  { key: "negative", label: "Negative", icon: "sad-outline" },
  { key: "positive", label: "Positive", icon: "happy-outline" },
];

export default function CommentsListScreen({ navigation }: Props) {
  const { business } = useBusiness();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(
    async (isRefresh = false) => {
      if (!business) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const { comments: result } = await getComments(business.id);
        setComments(result);
      } catch (err: any) {
        setError(err.message ?? "Could not load customer feedback.");
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

  const visibleComments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return comments.filter((comment) => {
      const matchesQuery =
        !normalizedQuery ||
        comment.text.toLowerCase().includes(normalizedQuery) ||
        comment.summary.toLowerCase().includes(normalizedQuery) ||
        comment.category.replace(/_/g, " ").includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "high" && comment.urgency === "high") ||
        (filter === "negative" && comment.sentiment === "negative") ||
        (filter === "positive" && comment.sentiment === "positive");

      return matchesQuery && matchesFilter;
    });
  }, [comments, filter, query]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loading} edges={["top", "left", "right"]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading customer pulse…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <FlatList
        data={visibleComments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <PageHeader
              eyebrow={business?.name ?? "CUSTOMER FEEDBACK"}
              title="Inbox"
              subtitle={`${comments.length} analyzed ${comments.length === 1 ? "comment" : "comments"} across your customer channels.`}
              icon="notifications-outline"
            />

            <View style={styles.searchShell}>
              <Ionicons name="search-outline" size={19} color={colors.textTertiary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search comments, summaries or categories"
                placeholderTextColor={colors.textTertiary}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              horizontal
              data={filters}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item }) => {
                const active = filter === item.key;
                return (
                  <Pressable
                    onPress={() => setFilter(item.key)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={15}
                      color={active ? colors.textInverse : colors.textSecondary}
                    />
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              }}
            />

            {error ? <Notice message={error} /> : null}

            <View style={styles.resultRow}>
              <Text style={styles.resultCount}>{visibleComments.length} results</Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Synced</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={comments.length === 0 ? "chatbubble-ellipses-outline" : "search-outline"}
            title={comments.length === 0 ? "No customer feedback yet" : "No matching comments"}
            subtitle={
              comments.length === 0
                ? "Tap the centered + button to add comments or upload a CSV."
                : "Try a different search phrase or filter."
            }
          />
        }
        renderItem={({ item }) => (
          <CommentCard
            comment={item}
            onPress={() => navigation.navigate("CommentDetail", { commentId: item.id })}
          />
        )}
        ListFooterComponent={<View style={{ height: 104 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loadingText: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 12, marginTop: 10 },
  listContent: {
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
    paddingHorizontal: 18,
    flexGrow: 1,
  },
  headerContent: { paddingTop: 16, paddingBottom: 12 },
  searchShell: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    marginTop: 20,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary, paddingVertical: 12 },
  filterRow: { gap: 8, paddingTop: 12, paddingBottom: 4 },
  filterChip: {
    minHeight: 37,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, color: colors.textSecondary },
  filterTextActive: { color: colors.textInverse },
  resultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 17, marginBottom: 10 },
  resultCount: { fontFamily: fonts.bodySemiBold, fontSize: 11.5, color: colors.textSecondary },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cyan },
  liveText: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: colors.textTertiary },
});
