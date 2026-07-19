import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { BottomTabBarButtonProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
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
const tabBarWidth = Math.min(Dimensions.get("window").width - 24, 720);

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
      accessibilityLabel="Add customer comments"
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [styles.addButtonSlot, pressed && styles.addButtonPressed]}
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
        tabBarStyle: [styles.tabBar, { width: tabBarWidth, marginLeft: -(tabBarWidth / 2) }],
        tabBarIcon: ({ focused, color }) => {
          const icon = tabIcons[route.name];
          const isAdd = route.name === "Add";
          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={isAdd ? 27 : 21}
              color={isAdd ? colors.textInverse : color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="Comments" component={CommentsStack} />
      <Tabs.Screen name="Knowledge" component={BusinessKnowledgeScreen} options={{ title: "Knowledge" }} />
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
      <BrandMark compact />
      <Text style={styles.loadingTitle}>MediaPulse AI</Text>
      <Text style={styles.loadingSubtitle}>Preparing your workspace</Text>
      <ActivityIndicator color={colors.primary} style={styles.loader} />
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
    left: "50%",
    bottom: 10,
    height: 74,
    paddingTop: 8,
    paddingBottom: 9,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    ...shadows.floating,
  },
  tabItem: { paddingVertical: 2 },
  tabLabel: { fontFamily: fonts.bodySemiBold, fontSize: 9.5, marginTop: 2 },
  addButtonSlot: { flex: 1, alignItems: "center", justifyContent: "center" },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -21,
    borderWidth: 4,
    borderColor: colors.background,
    ...shadows.floating,
  },
  addButtonSelected: { backgroundColor: colors.primary },
  addButtonPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  loadingTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 14,
  },
  loadingSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  loader: { marginTop: 18 },
});
