/**
 * Register Screen
 *
 * Handles new user registration with name, email, and password.
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useGoogleAuth } from "../../hooks";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import type { AuthStackParamList } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({
  navigation,
}: Props): React.JSX.Element {
  // Form state
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { register } = useAuth();
  const {
    promptGoogleSignIn,
    isLoading: isGoogleLoading,
    isReady: isGoogleReady,
  } = useGoogleAuth();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  /**
   * Handle registration submission
   */
  const handleRegister = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="wallet"
            size={48}
            color={colors.primary}
          />
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            {t("auth.registerButton")}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {t("auth.loginSubtitle")}
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: themeColors.surface }]}>
          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name input */}
          <TextInput
            mode="outlined"
            label={t("auth.fullName")}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            left={<TextInput.Icon icon="account" />}
            style={[styles.input, { backgroundColor: themeColors.surface }]}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primary}
            textColor={themeColors.textPrimary}
          />

          {/* Email input */}
          <TextInput
            mode="outlined"
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
            style={[styles.input, { backgroundColor: themeColors.surface }]}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primary}
            textColor={themeColors.textPrimary}
          />

          {/* Password input */}
          <TextInput
            mode="outlined"
            label={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={[styles.input, { backgroundColor: themeColors.surface }]}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primary}
            textColor={themeColors.textPrimary}
          />

          {/* Confirm Password input */}
          <TextInput
            mode="outlined"
            label={t("auth.confirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock-check" />}
            style={[styles.input, { backgroundColor: themeColors.surface }]}
            outlineColor={themeColors.border}
            activeOutlineColor={themeColors.primary}
            textColor={themeColors.textPrimary}
          />

          {/* Register button */}
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {isLoading ? t("auth.creatingAccount") : t("auth.registerButton")}
          </Button>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("common.or")}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google sign-up button */}
          <Button
            mode="outlined"
            onPress={promptGoogleSignIn}
            loading={isGoogleLoading}
            disabled={!isGoogleReady || isGoogleLoading}
            icon="google"
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
          >
            {isGoogleLoading
              ? t("auth.creatingAccount")
              : "Sign up with Google"}
          </Button>

          {/* Login link */}
          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: themeColors.textSecondary }]}
            >
              {t("auth.hasAccount")}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}> {t("auth.signIn")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    marginLeft: spacing.xs,
    flex: 1,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
  googleButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
