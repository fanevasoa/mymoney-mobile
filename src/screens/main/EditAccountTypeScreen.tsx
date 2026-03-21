/**
 * Edit Account Type Screen
 *
 * Form to edit an existing account type.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { accountService } from "../../api";
import { colors, spacing, borderRadius } from "../../theme";
import type { AccountsStackParamList } from "../../types";

type Props = NativeStackScreenProps<AccountsStackParamList, "EditAccountType">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconOption {
  value: string;
  icon: IconName;
  label: string;
}

const ICON_OPTIONS: IconOption[] = [
  { value: "bank", icon: "bank", label: "Bank" },
  { value: "phone", icon: "cellphone", label: "Mobile" },
  { value: "cash", icon: "cash", label: "Cash" },
];

const COLOR_OPTIONS = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
  "#00BCD4",
  "#795548",
  "#607D8B",
];

export default function EditAccountTypeScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { accountTypeId } = route.params;
  const { accountTypes, fetchAccountTypes, fetchDashboard } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const accountType = accountTypes.find((at) => at.id === accountTypeId);

  const [name, setName] = useState<string>(accountType?.name || "");
  const [selectedIcon, setSelectedIcon] = useState<string>(
    accountType?.icon || "bank",
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    accountType?.color || COLOR_OPTIONS[0],
  );
  const [description, setDescription] = useState<string>(
    accountType?.description || "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (accountType) {
      setName(accountType.name);
      setSelectedIcon(accountType.icon);
      setSelectedColor(accountType.color);
      setDescription(accountType.description || "");
    }
  }, [accountType]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError(t("accountType.nameRequired"));
      return false;
    }
    if (name.trim().length < 2) {
      setError(t("accountType.nameTooShort"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const response = await accountService.updateAccountType(accountTypeId, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        description: description.trim() || undefined,
      });

      if (response.success) {
        await fetchAccountTypes();
        await fetchDashboard();
        showToast(t("accountType.updated"));
        setTimeout(() => navigation.goBack(), 300);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("accountType.failedUpdate");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert(
      t("accountType.deleteTitle"),
      t("accountType.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              const response =
                await accountService.deleteAccountType(accountTypeId);
              if (response.success) {
                await fetchAccountTypes();
                await fetchDashboard();
                showToast(t("accountType.deleted"));
                setTimeout(() => navigation.goBack(), 300);
              }
            } catch (err) {
              const message =
                err instanceof Error
                  ? err.message
                  : t("accountType.failedDelete");
              setError(message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (!accountType) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <Text style={{ color: themeColors.textPrimary, padding: spacing.md }}>
          {t("accountType.notFound")}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
          label={t("accountType.name")}
          placeholder={t("accountType.namePlaceholder")}
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("accountType.icon")}
        </Text>
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.iconOption,
                {
                  borderColor:
                    selectedIcon === option.value
                      ? selectedColor
                      : themeColors.border,
                  backgroundColor:
                    selectedIcon === option.value
                      ? selectedColor + "15"
                      : themeColors.surface,
                },
              ]}
              onPress={() => setSelectedIcon(option.value)}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={28}
                color={
                  selectedIcon === option.value
                    ? selectedColor
                    : themeColors.textSecondary
                }
              />
              <Text
                style={[
                  styles.iconLabel,
                  {
                    color:
                      selectedIcon === option.value
                        ? selectedColor
                        : themeColors.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("accountType.color")}
        </Text>
        <View style={styles.colorGrid}>
          {COLOR_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.colorOptionSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={colors.textInverse}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          mode="outlined"
          label={t("accountType.descriptionOptional")}
          placeholder={t("accountType.descriptionPlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading || isDeleting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading
            ? t("accountType.saving")
            : t("accountType.saveChanges")}
        </Button>

        <Button
          mode="outlined"
          onPress={handleDelete}
          loading={isDeleting}
          disabled={isLoading || isDeleting}
          style={styles.deleteButton}
          contentStyle={styles.submitButtonContent}
          textColor={colors.error}
        >
          {isDeleting
            ? t("accountType.deleting")
            : t("accountType.deleteAccountType")}
        </Button>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  iconGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  iconLabel: {
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.textInverse,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  submitButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  deleteButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderColor: colors.error,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
