/**
 * Loading Spinner Component
 *
 * Displays a centered loading indicator with optional message.
 */

import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { colors, spacing } from "../theme";
import type { LoadingSpinnerProps } from "../types";

export default function LoadingSpinner({
  size = "large",
  color = colors.primary,
  message = "",
  fullScreen = true,
}: LoadingSpinnerProps): JSX.Element {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreenContainer}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
