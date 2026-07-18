import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

import LoginScreen from "../screens/LoginScreen";
import BusinessSetupScreen from "../screens/BusinessSetupScreen";
import AddCommentScreen from "../screens/AddCommentScreen";
import CommentsListScreen from "../screens/CommentsListScreen";
import CommentDetailScreen from "../screens/CommentDetailScreen";
import BusinessKnowledgeScreen from "../screens/BusinessKnowledgeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";

export type MainStackParamList = {
  Tabs: undefined;
  CommentDetail: { commentId: string };
  CommentsList: undefined;
};

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
  headerTitleStyle: { fontFamily: fonts.displayMedium, fontSize: 18, color: colors.textPrimary },
  headerTintColor: colors.primary,
};

function CommentsStack() {
  return (
    <MainStack.Navigator screenOptions={headerOptions}>
      <MainStack.Screen
        name="CommentsList"
        component={CommentsListScreen}
        options={{ title: "Comments" }}
      />
      <MainStack.Screen
        name="CommentDetail"
        component={CommentDetailScreen}
        options={{ title: "Comment" }}
      />
    </MainStack.Navigator>
  );
}

const tabIcons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Comments: { active: "chatbubbles", inactive: "chatbubbles-outline" },
  Add: { active: "add-circle", inactive: "add-circle-outline" },
  Knowledge: { active: "document-text", inactive: "document-text-outline" },
  Dashboard: { active: "bar-chart", inactive: "bar-chart-outline" },
  Profile: { active: "person-circle", inactive: "person-circle-outline" },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name !== "Comments",
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icon = tabIcons[route.name];
          return (
            <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />
          );
        },
      })}
    >
      <Tabs.Screen name="Comments" component={CommentsStack} />
      <Tabs.Screen name="Add" component={AddCommentScreen} options={{ title: "Add" }} />
      <Tabs.Screen
        name="Knowledge"
        component={BusinessKnowledgeScreen}
        options={{ title: "Knowledge" }}
      />
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : businessLoading ? (
          <RootStack.Screen name="Loading">
            {() => (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
          </RootStack.Screen>
        ) : !business ? (
          <RootStack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}