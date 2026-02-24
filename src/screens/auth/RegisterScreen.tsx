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

import { useAuth } from "../../contexts/AuthContext";
import { useGoogleAuth } from "../../hooks";
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
  const { promptGoogleSignIn, isLoading: isGoogleLoading, isReady: isGoogleReady } = useGoogleAuth();

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
      style={styles.container}
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start managing your finances today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            label="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          {/* Email input */}
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          {/* Password input */}
          <TextInput
            mode="outlined"
            label="Password"
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
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          {/* Confirm Password input */}
          <TextInput
            mode="outlined"
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock-check" />}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
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
            {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
          </Button>

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}> Sign In</Text>
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
