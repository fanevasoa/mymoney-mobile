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

import { AuthProvider } from "./src/contexts/AuthContext";
import { AppProvider } from "./src/contexts/AppContext";
import { RootNavigator } from "./src/navigation";
import { theme } from "./src/theme";

export default function App(): React.JSX.Element {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
