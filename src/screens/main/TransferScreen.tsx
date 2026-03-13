/**
 * Transfer Screen
 *
 * Form to transfer money between accounts.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button, Card, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { transferService, sharedAccountService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type { AddStackParamList, Account } from "../../types";

type Props = NativeStackScreenProps<AddStackParamList, "Transfer">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const getIconName = (icon: string | undefined): IconName => {
  switch (icon) {
    case "bank":
      return "bank";
    case "phone":
      return "cellphone";
    case "cash":
      return "cash";
    default:
      return "wallet";
  }
};

export default function TransferScreen({
  navigation,
}: Props): React.JSX.Element {
  const { accounts, fetchAccounts, refreshData } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getAccount = (id: string | null): Account | undefined =>
    accounts.find((acc) => acc.id === id);

  const selectedToAccount = getAccount(toAccountId);
  const isToSharedAccount = !!selectedToAccount?.sharedAccountId;

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (accounts.length >= 2) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
      if (!toAccountId) setToAccountId(accounts[1].id);
    } else if (accounts.length === 1) {
      if (!fromAccountId) setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId, toAccountId]);

  const handleSwapAccounts = (): void => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const totalDeduction = (parseFloat(amount) || 0) + (parseFloat(fee) || 0);

  const validateForm = (): boolean => {
    if (!fromAccountId) {
      setError(t("transfer.fromAccount"));
      return false;
    }
    if (!toAccountId) {
      setError(t("transfer.toAccount"));
      return false;
    }
    if (fromAccountId === toAccountId) {
      setError(t("transfer.sameAccountError"));
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError(t("transfer.validAmountError"));
      return false;
    }
    if (fee && parseFloat(fee) < 0) {
      setError(t("transfer.validAmountError"));
      return false;
    }

    const fromAccount = getAccount(fromAccountId);
    const deduction = isToSharedAccount
      ? parseFloat(amount) || 0
      : totalDeduction;
    if (fromAccount && deduction > parseFloat(String(fromAccount.balance))) {
      setError(
        t("transfer.insufficientBalance", {
          amount: formatCurrency(fromAccount.balance),
        }),
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      if (isToSharedAccount && selectedToAccount?.sharedAccountId) {
        // Transfer to shared account → creates pending shared account transaction
        const response =
          await sharedAccountService.createSharedAccountTransaction(
            selectedToAccount.sharedAccountId,
            {
              type: "income",
              amount: parseFloat(amount),
              description:
                description.trim() ||
                `Transfer from ${getAccount(fromAccountId)?.name || "account"}`,
              sourceAccountId: fromAccountId,
            },
          );

        if (response.success) {
          await refreshData();
          showToast(t("transfer.sharedAccountPending"));
          setTimeout(() => navigation.goBack(), 300);
        }
      } else {
        // Regular transfer between personal accounts
        const transferData = {
          fromAccountId: fromAccountId!,
          toAccountId: toAccountId!,
          amount: parseFloat(amount),
          fee: fee ? parseFloat(fee) : 0,
          description: description.trim() || null,
        };

        const response = await transferService.createTransfer(transferData);

        if (response.success) {
          await refreshData();
          showToast(t("transfer.successMessage"));
          setTimeout(() => navigation.goBack(), 300);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("transfer.failedTransfer");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountSelector = (
    title: string,
    selectedId: string | null,
    onSelect: (id: string) => void,
    excludeId: string | null,
    filterShared?: boolean,
  ): React.JSX.Element => {
    const filteredAccounts = accounts.filter((acc) => {
      if (acc.id === excludeId) return false;
      // "From" picker: only personal accounts
      if (filterShared === false && acc.sharedAccountId) return false;
      return true;
    });

    return (
      <View style={styles.accountSection}>
        <Text
          style={[styles.sectionTitle, { color: themeColors.textSecondary }]}
        >
          {title}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredAccounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => onSelect(account.id)}
            >
              <Card
                style={[
                  styles.accountCard,
                  selectedId === account.id && styles.accountCardSelected,
                ]}
              >
                <Card.Content style={styles.accountContent}>
                  <View
                    style={[
                      styles.accountIcon,
                      {
                        backgroundColor: account.sharedAccountId
                          ? colors.primary + "20"
                          : (account.accountType?.color || colors.primary) +
                            "20",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        account.sharedAccountId
                          ? "account-group"
                          : getIconName(account.accountType?.icon)
                      }
                      size={20}
                      color={
                        account.sharedAccountId
                          ? colors.primary
                          : account.accountType?.color || colors.primary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.accountName,
                      { color: themeColors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {account.name}
                  </Text>
                  <Text
                    style={[
                      styles.accountBalance,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {formatCurrency(account.balance)}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (accounts.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="swap-horizontal"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>{t("transfer.notEnoughAccounts")}</Text>
        <Text style={styles.emptyText}>{t("transfer.needTwoAccounts")}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.emptyButton}
        >
          {t("common.goBack")}
        </Button>
      </View>
    );
  }

  const fromAccount = getAccount(fromAccountId);
  const toAccount = getAccount(toAccountId); // used in summary card

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

        {renderAccountSelector(
          t("transfer.fromAccount"),
          fromAccountId,
          setFromAccountId,
          toAccountId,
          false,
        )}

        <View style={styles.swapContainer}>
          <TouchableOpacity
            style={styles.swapButton}
            onPress={handleSwapAccounts}
            disabled={isToSharedAccount}
          >
            <MaterialCommunityIcons
              name="swap-vertical"
              size={24}
              color={isToSharedAccount ? colors.textDisabled : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {renderAccountSelector(
          t("transfer.toAccount"),
          toAccountId,
          setToAccountId,
          fromAccountId,
        )}

        {isToSharedAccount && (
          <View
            style={[
              styles.sharedAccountWarning,
              { backgroundColor: colors.warning + "10" },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-outline"
              size={16}
              color={colors.warning}
            />
            <Text
              style={[
                styles.sharedAccountWarningText,
                { color: themeColors.textSecondary },
              ]}
            >
              {t("transfer.sharedAccountNote")}
            </Text>
          </View>
        )}

        <Divider style={styles.divider} />

        <Text
          style={[styles.sectionTitle, { color: themeColors.textSecondary }]}
        >
          {t("transfer.transferAmount")}
        </Text>
        <TextInput
          mode="outlined"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          left={<TextInput.Affix text="Ar" />}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        {!isToSharedAccount && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: themeColors.textSecondary },
              ]}
            >
              {t("transfer.transferFee")}
            </Text>
            <TextInput
              mode="outlined"
              placeholder="0.00"
              value={fee}
              onChangeText={setFee}
              keyboardType="decimal-pad"
              left={<TextInput.Affix text="Ar" />}
              style={[styles.input, { backgroundColor: themeColors.surface }]}
              outlineColor={themeColors.border}
              activeOutlineColor={themeColors.primary}
              textColor={themeColors.textPrimary}
            />
          </>
        )}

        <Text
          style={[styles.sectionTitle, { color: themeColors.textSecondary }]}
        >
          {t("transfer.descriptionOptional")}
        </Text>
        <TextInput
          mode="outlined"
          placeholder={t("transfer.descriptionPlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
          style={[styles.input, { backgroundColor: themeColors.surface }]}
          outlineColor={themeColors.border}
          activeOutlineColor={themeColors.primary}
          textColor={themeColors.textPrimary}
        />

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>
              {t("transfer.transferSummary")}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("common.from")}</Text>
              <Text style={styles.summaryValue}>
                {fromAccount?.name || "-"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("common.to")}</Text>
              <Text style={styles.summaryValue}>{toAccount?.name || "-"}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("common.amount")}:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(parseFloat(amount) || 0)}
              </Text>
            </View>
            {parseFloat(fee) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("common.fee")}</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(parseFloat(fee))}
                </Text>
              </View>
            )}
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>
                {t("transfer.totalDeduction")}
              </Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(totalDeduction)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          icon="swap-horizontal"
        >
          {isLoading
            ? t("transfer.processing")
            : isToSharedAccount
              ? t("transfer.submitToSharedAccount")
              : t("transfer.transferMoney")}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    borderRadius: borderRadius.md,
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
  accountSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  accountCard: {
    width: 140,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountCardSelected: {
    borderColor: colors.primary,
  },
  accountContent: {
    alignItems: "center",
    padding: spacing.sm,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  accountName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
  swapContainer: {
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    marginVertical: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  summaryCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceVariant,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  summaryDivider: {
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  sharedAccountWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sharedAccountWarningText: {
    fontSize: 12,
    flex: 1,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.transfer,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
});
