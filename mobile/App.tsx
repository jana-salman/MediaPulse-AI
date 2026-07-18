import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import { AuthProvider } from "./src/context/AuthContext";
import { BusinessProvider } from "./src/context/BusinessContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme/colors";
import { PulseWaveform } from "./src/components/PulseWaveform";

// Apply Inter as the default body font everywhere, so individual screens
// only need to opt IN to the display/mono fonts for headlines and stats.
// @ts-ignore -- Text.defaultProps is deprecated in the RN types but still works.
Text.defaultProps = Text.defaultProps || {};
// @ts-ignore
Text.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, Text.defaultProps.style];

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    SpaceMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <PulseWaveform color={colors.primary} width={140} height={26} />
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <BusinessProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </BusinessProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
