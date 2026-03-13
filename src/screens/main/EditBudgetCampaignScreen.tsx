/**
 * Edit Budget Campaign Screen
 *
 * Form to update name and description of a budget campaign.
 */

import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { sharedAccountService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import type { SharedAccountScreensParamList } from "../../types";

type Props = NativeStackScreenProps<
  SharedAccountScreensParamList,
  "EditBudgetCampaign"
>;

export default function EditBudgetCampaignScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    sharedAccountId,
    campaignId,
    name: initialName,
    description: initialDesc,
  } = route.params;

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDesc || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("sharedAccount.campaignNameRequired"));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await sharedAccountService.updateBudgetCampaign(
        sharedAccountId,
        campaignId,
        {
          name: name.trim(),
          description: description.trim() || null,
        },
      );

      if (response.success) {
        showToast(t("sharedAccount.campaignUpdated"));
        setTimeout(() => navigation.goBack(), 300);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("sharedAccount.failedUpdateCampaign"),
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
          label={t("sharedAccount.campaignNameLabel")}
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={colors.primary}
          textColor={themeColors.textPrimary}
        />

        <TextInput
          mode="outlined"
          label={t("sharedAccount.descriptionOptional")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={colors.primary}
          textColor={themeColors.textPrimary}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading
            ? t("sharedAccount.saving")
            : t("sharedAccount.saveChanges")}
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
  submitButton: {
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
