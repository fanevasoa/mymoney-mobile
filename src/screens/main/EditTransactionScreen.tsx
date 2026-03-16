/**
 * Edit Transaction Screen
 *
 * Form to update or delete an existing transaction.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { transactionService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  AddStackParamList,
  TransactionType,
  Transaction,
} from "../../types";

type Props = NativeStackScreenProps<AddStackParamList, "EditTransaction">;

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Refund",
  "Other",
];

export default function EditTransactionScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { refreshData } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { transactionId } = route.params;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const categories = type === "earning" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const loadTransaction = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await transactionService.getTransactionById(transactionId);
      if (response.success) {
        const tx = response.data.transaction;
        setTransaction(tx);
        setType(tx.type);
        setAmount(String(tx.amount));
        setDescription(tx.description || "");
        setCategory(tx.category || "");
        // Format date as YYYY-MM-DD
        const d = new Date(tx.createdAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setDate(`${yyyy}-${mm}-${dd}`);
      }
    } catch (err) {
      setError(t("editTransaction.failedLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [transactionId, t]);

  useEffect(() => {
    loadTransaction();
  }, [loadTransaction]);

  useEffect(() => {
    navigation.setOptions({
      title: t("editTransaction.title"),
    });
  }, [navigation, t]);

  const handleSave = async (): Promise<void> => {
    if (isSaving) return;
    setError("");

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t("addTransaction.validAmount"));
      return;
    }

    // Validate date format
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError(t("editTransaction.invalidDate"));
      return;
    }

    try {
      setIsSaving(true);

      const updateData: Record<string, unknown> = {};

      // Only send changed fields
      if (parsedAmount !== transaction?.amount) {
        updateData.amount = parsedAmount;
      }
      if (type !== transaction?.type) {
        updateData.type = type;
      }
      if ((description || null) !== (transaction?.description || null)) {
        updateData.description = description.trim() || null;
      }
      if ((category || null) !== (transaction?.category || null)) {
        updateData.category = category || null;
      }
      if (date) {
        const origDate = new Date(transaction?.createdAt || "");
        const origFormatted = `${origDate.getFullYear()}-${String(origDate.getMonth() + 1).padStart(2, "0")}-${String(origDate.getDate()).padStart(2, "0")}`;
        if (date !== origFormatted) {
          updateData.date = new Date(date).toISOString();
        }
      }

      if (Object.keys(updateData).length === 0) {
        navigation.goBack();
        return;
      }

      const response = await transactionService.updateTransaction(
        transactionId,
        updateData as any,
      );

      if (response.success) {
        showToast(t("editTransaction.updateSuccess"));
        await refreshData();
        navigation.goBack();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("editTransaction.failedUpdate");
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert(
      t("editTransaction.deleteTitle"),
      t("editTransaction.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              const response = await transactionService.deleteTransaction(
                transactionId,
              );
              if (response.success) {
                showToast(t("editTransaction.deleteSuccess"));
                await refreshData();
                navigation.goBack();
              }
            } catch (err) {
              const message =
                err instanceof Error
                  ? err.message
                  : t("editTransaction.failedDelete");
              setError(message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <Text style={{ color: themeColors.textSecondary }}>
          {t("editTransaction.notFound")}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {/* Account info */}
        {transaction.account && (
          <View
            style={[
              styles.accountInfo,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <MaterialCommunityIcons
              name="bank"
              size={20}
              color={themeColors.textSecondary}
            />
            <Text
              style={[styles.accountInfoText, { color: themeColors.textPrimary }]}
            >
              {transaction.account.name}
            </Text>
          </View>
        )}

        {/* Type selector */}
        <SegmentedButtons
          value={type}
          onValueChange={(v) => setType(v as TransactionType)}
          buttons={[
            {
              value: "earning",
              label: t("common.income"),
              icon: "arrow-down",
            },
            {
              value: "expense",
              label: t("common.expense"),
              icon: "arrow-up",
            },
          ]}
          style={styles.segmentedButtons}
        />

        {/* Amount */}
        <View
          style={[
            styles.amountCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: type === "earning" ? colors.earning : colors.expense,
            },
          ]}
        >
          <Text
            style={[
              styles.amountLabel,
              { color: type === "earning" ? colors.earning : colors.expense },
            ]}
          >
            {type === "earning"
              ? t("addTransaction.incomeAmount")
              : t("addTransaction.expenseAmount")}
          </Text>
          <View style={styles.amountInputContainer}>
            <Text
              style={[
                styles.currencySymbol,
                {
                  color: type === "earning" ? colors.earning : colors.expense,
                },
              ]}
            >
              Ar
            </Text>
            <TextInput
              mode="flat"
              placeholder="0.00"
              placeholderTextColor={themeColors.textDisabled}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: themeColors.textPrimary }]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor={themeColors.textPrimary}
            />
          </View>
        </View>

        {/* Date */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("editTransaction.date")}
        </Text>
        <TextInput
          mode="outlined"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          style={[
            styles.dateInput,
            { backgroundColor: themeColors.surface },
          ]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          placeholderTextColor={themeColors.textDisabled}
          textColor={themeColors.textPrimary}
          left={<TextInput.Icon icon="calendar" />}
        />

        {/* Category */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("addTransaction.categoryOptional")}
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(category === cat ? "" : cat)}
            >
              <Card
                style={[
                  styles.categoryCard,
                  category === cat && styles.categoryCardSelected,
                ]}
              >
                <Card.Content style={styles.categoryContent}>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("addTransaction.descriptionOptional")}
        </Text>
        <TextInput
          mode="outlined"
          placeholder={t("addTransaction.descriptionPlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[
            styles.descriptionInput,
            { backgroundColor: themeColors.surface },
          ]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          placeholderTextColor={themeColors.textDisabled}
          textColor={themeColors.textPrimary}
        />

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving || isDeleting}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                type === "earning" ? colors.earning : colors.expense,
            },
          ]}
          contentStyle={styles.buttonContent}
        >
          {isSaving
            ? t("editTransaction.saving")
            : t("editTransaction.save")}
        </Button>

        {/* Delete Button */}
        <Button
          mode="outlined"
          onPress={handleDelete}
          loading={isDeleting}
          disabled={isSaving || isDeleting}
          style={styles.deleteButton}
          contentStyle={styles.buttonContent}
          textColor={colors.error}
          icon="delete"
        >
          {isDeleting
            ? t("editTransaction.deleting")
            : t("editTransaction.delete")}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  accountInfoText: {
    fontSize: 15,
    fontWeight: "600",
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  amountCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "800",
    marginRight: spacing.sm,
  },
  amountInput: {
    backgroundColor: "transparent",
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 150,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  dateInput: {
    marginBottom: spacing.lg,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.textInverse,
    fontWeight: "500",
  },
  descriptionInput: {
    marginBottom: spacing.lg,
  },
  saveButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  deleteButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.error,
    marginBottom: spacing.lg,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
});
