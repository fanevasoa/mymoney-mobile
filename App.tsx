/**
 * MyMoney App
 *
 * A personal finance management mobile application.
 * Built with React Native, Expo, and TypeScript.
 */

import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initI18n } from "./src/i18n";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { AuthProvider } from "./src/contexts/AuthContext";
import { AppProvider } from "./src/contexts/AppContext";
import { ToastProvider } from "./src/contexts/ToastContext";
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
      <ToastProvider>
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
      </ToastProvider>
    </PaperProvider>
  );
}

export default function App(): React.JSX.Element {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
