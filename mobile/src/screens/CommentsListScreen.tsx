import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CommentCard } from "../components/CommentCard";
import { getComments } from "../config/api";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { Comment } from "../types";
import { MainStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<MainStackParamList, "CommentsList">;

export default function CommentsListScreen({ navigation }: Props) {
  const { business } = useBusiness();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!business) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const { comments: c } = await getComments(business.id);
        setComments(c);
      } catch (err: any) {
        setError(err.message ?? "Could not load comments.");
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                No comments yet. Add some from the "Add" tab.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <CommentCard
              comment={item}
              onPress={() => navigation.navigate("CommentDetail", { commentId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, flexGrow: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  error: { color: colors.danger, textAlign: "center" },
  emptyText: { color: colors.textSecondary, textAlign: "center" },
});
