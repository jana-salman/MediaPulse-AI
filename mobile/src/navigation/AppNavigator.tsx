import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { colors } from "../theme/colors";

import LoginScreen from "../screens/LoginScreen";
import BusinessSetupScreen from "../screens/BusinessSetupScreen";
import AddCommentScreen from "../screens/AddCommentScreen";
import CommentsListScreen from "../screens/CommentsListScreen";
import CommentDetailScreen from "../screens/CommentDetailScreen";
import BusinessKnowledgeScreen from "../screens/BusinessKnowledgeScreen";
import DashboardScreen from "../screens/DashboardScreen";

export type MainStackParamList = {
  Tabs: undefined;
  CommentDetail: { commentId: string };
  CommentsList: undefined;
};

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tabs = createBottomTabNavigator();

function CommentsStack() {
  return (
    <MainStack.Navigator>
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

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name !== "Comments",
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Comments: "chatbubbles-outline",
            Add: "add-circle-outline",
            Knowledge: "document-text-outline",
            Dashboard: "bar-chart-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
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
