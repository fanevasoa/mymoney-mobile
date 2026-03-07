/**
 * MyMoney App
 *
 * A personal finance management mobile application.
 * Built with React Native, Expo, and TypeScript.
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { AppProvider } from "./src/contexts/AppContext";
import { RootNavigator } from "./src/navigation";
import {
  theme,
  darkTheme,
  navigationLightTheme,
  navigationDarkTheme,
} from "./src/theme";

function AppContent(): React.JSX.Element {
  const { isDark } = useTheme();

  return (
    <PaperProvider theme={isDark ? darkTheme : theme}>
      <AuthProvider>
        <AppProvider>
          <NavigationContainer
            theme={isDark ? navigationDarkTheme : navigationLightTheme}
          >
            <StatusBar style={isDark ? "light" : "dark"} />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
