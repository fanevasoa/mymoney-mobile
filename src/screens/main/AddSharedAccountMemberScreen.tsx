/**
 * Add Shared Account Member Screen
 *
 * Form to invite a user to a shared account by email.
 */

import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { sharedAccountService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import type {
  SharedAccountScreensParamList,
  SharedAccountMemberRole,
} from "../../types";

type Props = NativeStackScreenProps<
  SharedAccountScreensParamList,
  "AddSharedAccountMember"
>;

export default function AddSharedAccountMemberScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { sharedAccountId } = route.params;

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SharedAccountMemberRole>("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(t("sharedAccount.emailRequired"));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await sharedAccountService.addMember(sharedAccountId, {
        email: email.trim(),
        role,
      });

      if (response.success) {
        showToast(t("sharedAccount.memberAdded"));
        setTimeout(() => {
          navigation.navigate("SharedAccountDetail", { sharedAccountId });
        }, 300);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("sharedAccount.failedAddMember"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
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

        <TextInput
          mode="outlined"
          label={t("sharedAccount.emailLabel")}
          placeholder={t("sharedAccount.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={colors.primary}
          textColor={themeColors.textPrimary}
        />

        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {t("sharedAccount.role")}
        </Text>
        <SegmentedButtons
          value={role}
          onValueChange={(v) => setRole(v as SharedAccountMemberRole)}
          buttons={[
            { value: "member", label: t("sharedAccount.member") },
            { value: "manager", label: t("sharedAccount.manager") },
          ]}
          style={styles.segmented}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? t("sharedAccount.adding") : t("sharedAccount.addMember")}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
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
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.lg,
  },
  submitButton: {
    borderRadius: borderRadius.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
