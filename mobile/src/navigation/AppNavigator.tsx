import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { BottomTabBarButtonProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { radii, shadows } from "../theme/tokens";

import LoginScreen from "../screens/LoginScreen";
import BusinessSetupScreen from "../screens/BusinessSetupScreen";
import AddCommentScreen from "../screens/AddCommentScreen";
import CommentsListScreen from "../screens/CommentsListScreen";
import CommentDetailScreen from "../screens/CommentDetailScreen";
import BusinessKnowledgeScreen from "../screens/BusinessKnowledgeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type MainStackParamList = {
  CommentsList: undefined;
  CommentDetail: { commentId: string };
};

const RootStack = createNativeStackNavigator();
const CommentsStackNavigator = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary,
  },
};

function CommentsStack() {
  return (
    <CommentsStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <CommentsStackNavigator.Screen name="CommentsList" component={CommentsListScreen} />
      <CommentsStackNavigator.Screen name="CommentDetail" component={CommentDetailScreen} />
    </CommentsStackNavigator.Navigator>
  );
}

const tabIcons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Comments: { active: "chatbubble-ellipses", inactive: "chatbubble-ellipses-outline" },
  Add: { active: "add", inactive: "add" },
  Knowledge: { active: "library", inactive: "library-outline" },
  Dashboard: { active: "grid", inactive: "grid-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

function AddTabButton({ children, onPress, accessibilityState }: BottomTabBarButtonProps) {
  const selected = Boolean(accessibilityState?.selected);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [styles.addButtonSlot, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.addButton, selected && styles.addButtonSelected]}>{children}</View>
    </Pressable>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color }) => {
          const icon = tabIcons[route.name];
          const isAdd = route.name === "Add";
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={isAdd ? 28 : 21}
              color={isAdd ? colors.textInverse : color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="Comments" component={CommentsStack} />
      <Tabs.Screen
        name="Knowledge"
        component={BusinessKnowledgeScreen}
        options={{ title: "Knowledge" }}
      />
      <Tabs.Screen
        name="Add"
        component={AddCommentScreen}
        options={{
          title: "Add",
          tabBarButton: (props) => <AddTabButton {...props} />,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Overview" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <View style={styles.loadingMark}>
        <Ionicons name="pulse" size={26} color={colors.textInverse} />
      </View>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 18 }} />
    </View>
  );
}

export default function AppNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  if (authLoading) return <LoadingScreen />;

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {!session ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : businessLoading ? (
          <RootStack.Screen name="Loading" component={LoadingScreen} />
        ) : !business ? (
          <RootStack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 8,
    height: 72,
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderRadius: radii.xl,
    ...shadows.floating,
  },
  tabItem: { paddingVertical: 2 },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  addButtonSlot: { flex: 1, alignItems: "center", justifyContent: "center" },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 4,
    borderColor: colors.background,
    ...shadows.floating,
  },
  addButtonSelected: { backgroundColor: colors.primary },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loadingMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
});
