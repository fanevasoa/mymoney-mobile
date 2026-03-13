/**
 * Add Transaction Screen
 *
 * Form to create a new transaction (earning or expense).
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  RadioButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { useTranslation } from "react-i18next";

import {
  transactionService,
  borrowingService,
  sharedAccountService,
} from "../../api";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  AddStackParamList,
  TransactionType,
  Account,
  Borrowing,
  SharedAccount,
  ApprovedBudgetItemForSelection,
} from "../../types";

type Props = NativeStackScreenProps<AddStackParamList, "AddTransaction">;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

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

export default function AddTransactionScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { accounts, fetchAccounts, refreshData } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const initialType = route.params?.type || "expense";
  const preselectedAccountId = route.params?.accountId;

  const [type, setType] = useState<TransactionType>(
    initialType as TransactionType,
  );
  const [amount, setAmount] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    preselectedAccountId || null,
  );
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const amountInputRef = useRef<any>(null);

  // Borrowing states (for earning)
  const [isBorrowed, setIsBorrowed] = useState<boolean>(false);
  const [borrowerName, setBorrowerName] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  // Borrowing resolution states (for expense)
  const [isBorrowingResolution, setIsBorrowingResolution] =
    useState<boolean>(false);
  const [unresolvedBorrowings, setUnresolvedBorrowings] = useState<Borrowing[]>(
    [],
  );
  const [selectedBorrowingId, setSelectedBorrowingId] = useState<string | null>(
    null,
  );
  const [resolutionAmount, setResolutionAmount] = useState<string>("");

  // Shared account states
  const [sharedAccountData, setSharedAccountData] =
    useState<SharedAccount | null>(null);
  const [budgetItems, setBudgetItems] = useState<
    ApprovedBudgetItemForSelection[]
  >([]);
  const [selectedBudgetItem, setSelectedBudgetItem] =
    useState<ApprovedBudgetItemForSelection | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }, []),
  );

  const activeAccounts = accounts.filter((acc) => acc.isActive);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (activeAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts, selectedAccountId]);

  useEffect(() => {
    navigation.setOptions({
      title: type === "earning" ? "Add Income" : "Add Expense",
    });
  }, [type, navigation]);

  // Fetch unresolved borrowings when switching to expense and toggle is on
  useEffect(() => {
    if (type === "expense" && isBorrowingResolution) {
      borrowingService
        .getUnresolvedBorrowings({ limit: 50 })
        .then((res) => {
          if (res.success) {
            setUnresolvedBorrowings(res.data.borrowings);
          }
        })
        .catch(() => {});
    }
  }, [type, isBorrowingResolution]);

  // Reset borrowing fields when type changes
  useEffect(() => {
    if (type === "earning") {
      setIsBorrowingResolution(false);
      setSelectedBorrowingId(null);
      setResolutionAmount("");
    } else {
      setIsBorrowed(false);
      setBorrowerName("");
      setDueDate("");
    }
  }, [type]);

  const categories =
    type === "earning" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedAccount = activeAccounts.find(
    (acc) => acc.id === selectedAccountId,
  );
  const isSharedAccount = !!selectedAccount?.sharedAccountId;

  // Fetch shared account details + budget items when a shared account is selected
  useEffect(() => {
    if (isSharedAccount && selectedAccount?.sharedAccountId) {
      sharedAccountService
        .getSharedAccountById(selectedAccount.sharedAccountId)
        .then((res) => {
          if (res.success) setSharedAccountData(res.data.sharedAccount);
        })
        .catch(() => {});

      if (type === "expense") {
        setIsLoadingItems(true);
        sharedAccountService
          .getApprovedBudgetItems(selectedAccount.sharedAccountId)
          .then((res) => {
            if (res.success) setBudgetItems(res.data.budgetItems);
          })
          .catch(() => {})
          .finally(() => setIsLoadingItems(false));
      } else {
        setBudgetItems([]);
        setSelectedBudgetItem(null);
      }
    } else {
      setSharedAccountData(null);
      setBudgetItems([]);
      setSelectedBudgetItem(null);
    }
  }, [isSharedAccount, selectedAccount?.sharedAccountId, type]);

  const handleSelectBudgetItem = (item: ApprovedBudgetItemForSelection) => {
    if (selectedBudgetItem?.id === item.id) {
      setSelectedBudgetItem(null);
      return;
    }
    setSelectedBudgetItem(item);
    setAmount(String(item.amount));
    if (!description) {
      setDescription(item.name);
    }
  };

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      setError(t("addTransaction.validAmount"));
      return false;
    }
    if (!selectedAccountId) {
      setError(t("addTransaction.selectAccountError"));
      return false;
    }
    if (type === "expense" && selectedAccount && !isSharedAccount) {
      if (parseFloat(amount) > parseFloat(String(selectedAccount.balance))) {
        setError(
          t("addTransaction.insufficientBalance", {
            amount: formatCurrency(selectedAccount.balance),
          }),
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (isLoading) return; // Prevent double-tap race condition
    setError("");

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      if (isSharedAccount && selectedAccount?.sharedAccountId) {
        // Shared account transaction
        const response =
          await sharedAccountService.createSharedAccountTransaction(
            selectedAccount.sharedAccountId,
            {
              type: type === "earning" ? "income" : "expense",
              amount: parseFloat(amount),
              description: description.trim() || null,
              budgetItemId: selectedBudgetItem?.id || null,
            },
          );

        if (response.success) {
          await refreshData();
          showToast(t("sharedAccount.txCreated"));
          setTimeout(() => navigation.goBack(), 300);
        }
      } else {
        // Regular transaction
        const transactionData: any = {
          type,
          amount: parseFloat(amount),
          accountId: selectedAccountId!,
          description: description.trim() || null,
          category: category || null,
        };

        // Add borrowing fields for earning
        if (type === "earning" && isBorrowed) {
          transactionData.isBorrowed = true;
          transactionData.borrowerName = borrowerName.trim() || null;
          transactionData.dueDate = dueDate.trim() || null;
        }

        // Add borrowing resolution fields for expense
        if (
          type === "expense" &&
          isBorrowingResolution &&
          selectedBorrowingId
        ) {
          transactionData.isBorrowingResolution = true;
          transactionData.borrowingId = selectedBorrowingId;
          transactionData.resolutionAmount = resolutionAmount
            ? parseFloat(resolutionAmount)
            : parseFloat(amount);
        }

        const response =
          await transactionService.createTransaction(transactionData);

        if (response.success) {
          await refreshData();
          showToast(
            t("addTransaction.addedSuccess", {
              type:
                type === "earning" ? t("common.income") : t("common.expense"),
            }),
          );
          setTimeout(() => navigation.goBack(), 300);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("addTransaction.failedCreate");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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

        <SegmentedButtons
          value={type}
          onValueChange={(value) => setType(value as TransactionType)}
          buttons={[
            {
              value: "earning",
              label: "Income",
              icon: "arrow-down",
              checkedColor: colors.earning,
            },
            {
              value: "expense",
              label: "Expense",
              icon: "arrow-up",
              checkedColor: colors.expense,
            },
          ]}
          style={styles.segmentedButtons}
        />

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("addTransaction.selectAccount")}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsScroll}
        >
          {activeAccounts.map((account: Account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() => setSelectedAccountId(account.id)}
            >
              <Card
                style={[
                  styles.accountCard,
                  selectedAccountId === account.id &&
                    styles.accountCardSelected,
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

        {/* Shared Account Info Card */}
        {isSharedAccount && sharedAccountData && (
          <View
            style={[
              styles.sharedAccountCard,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <View style={styles.sharedAccountHeader}>
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color={colors.primary}
              />
              <View style={styles.sharedAccountHeaderInfo}>
                <Text
                  style={[
                    styles.sharedAccountName,
                    { color: themeColors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {sharedAccountData.name}
                </Text>
                {sharedAccountData.myRole && (
                  <Text
                    style={[
                      styles.sharedAccountRole,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {sharedAccountData.myRole === "manager"
                      ? t("sharedAccount.manager")
                      : t("sharedAccount.member")}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.sharedAccountBalance,
                  { color: themeColors.textPrimary },
                ]}
              >
                {formatCurrency(sharedAccountData.balance)}
              </Text>
            </View>
            <View
              style={[
                styles.sharedAccountNote,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={14}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.sharedAccountNoteText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {t("sharedAccount.approvalNote")}
              </Text>
            </View>
          </View>
        )}

        {/* Budget Item Selection (shared account expenses only) */}
        {isSharedAccount && type === "expense" && (
          <View style={styles.budgetItemSection}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
            >
              {t("sharedAccount.selectBudgetItem")} (
              {t("sharedAccount.optional")})
            </Text>
            {isLoadingItems ? (
              <Text
                style={[
                  styles.budgetItemLoadingText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {t("sharedAccount.loadingBudgetItems")}
              </Text>
            ) : budgetItems.length === 0 ? (
              <View
                style={[
                  styles.budgetItemEmpty,
                  { backgroundColor: themeColors.surface },
                ]}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color={themeColors.textSecondary}
                />
                <Text
                  style={[
                    styles.budgetItemEmptyText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("sharedAccount.noBudgetItems")}
                </Text>
              </View>
            ) : (
              budgetItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelectBudgetItem(item)}
                  style={[
                    styles.budgetItemCard,
                    {
                      backgroundColor: themeColors.surface,
                      borderColor:
                        selectedBudgetItem?.id === item.id
                          ? colors.primary
                          : themeColors.border,
                      borderWidth: selectedBudgetItem?.id === item.id ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.budgetItemRow}>
                    <RadioButton
                      value={item.id}
                      status={
                        selectedBudgetItem?.id === item.id
                          ? "checked"
                          : "unchecked"
                      }
                      onPress={() => handleSelectBudgetItem(item)}
                    />
                    <View style={styles.budgetItemInfo}>
                      <Text
                        style={[
                          styles.budgetItemName,
                          { color: themeColors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          styles.budgetItemCampaign,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {item.campaignName}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.budgetItemAmount,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

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
              ref={amountInputRef}
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

        {!isSharedAccount && (
          <>
            <Text
              style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
            >
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
          </>
        )}

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

        {/* Borrowing toggle for earnings */}
        {type === "earning" && !isSharedAccount && (
          <View
            style={[
              styles.toggleSection,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <MaterialCommunityIcons
                  name="hand-coin-outline"
                  size={20}
                  color={colors.warning || "#F59E0B"}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  Borrowed Money
                </Text>
              </View>
              <Switch
                value={isBorrowed}
                onValueChange={setIsBorrowed}
                trackColor={{ true: colors.primary }}
              />
            </View>
            {isBorrowed && (
              <View style={styles.borrowingFields}>
                <TextInput
                  mode="outlined"
                  label="Borrower Name (optional)"
                  placeholder="Who borrowed / lent?"
                  value={borrowerName}
                  onChangeText={setBorrowerName}
                  style={[
                    styles.borrowingInput,
                    { backgroundColor: themeColors.surface },
                  ]}
                  outlineColor={themeColors.border}
                  activeOutlineColor={themeColors.primary}
                  textColor={themeColors.textPrimary}
                />
                <TextInput
                  mode="outlined"
                  label="Due Date (optional)"
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChangeText={setDueDate}
                  style={[
                    styles.borrowingInput,
                    { backgroundColor: themeColors.surface },
                  ]}
                  outlineColor={themeColors.border}
                  activeOutlineColor={themeColors.primary}
                  textColor={themeColors.textPrimary}
                />
              </View>
            )}
          </View>
        )}

        {/* Borrowing resolution toggle for expenses */}
        {type === "expense" && !isSharedAccount && (
          <View
            style={[
              styles.toggleSection,
              { backgroundColor: themeColors.surface },
            ]}
          >
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <MaterialCommunityIcons
                  name="cash-refund"
                  size={20}
                  color={colors.earning}
                />
                <Text
                  style={[
                    styles.toggleText,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  Borrowing Resolution
                </Text>
              </View>
              <Switch
                value={isBorrowingResolution}
                onValueChange={setIsBorrowingResolution}
                trackColor={{ true: colors.primary }}
              />
            </View>
            {isBorrowingResolution && (
              <View style={styles.borrowingFields}>
                {unresolvedBorrowings.length === 0 ? (
                  <Text
                    style={[
                      styles.noBorrowingsText,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    No unresolved borrowings found
                  </Text>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.borrowingSelectLabel,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      Select borrowing to resolve:
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.borrowingsScroll}
                    >
                      {unresolvedBorrowings.map((b) => (
                        <TouchableOpacity
                          key={b.id}
                          onPress={() => setSelectedBorrowingId(b.id)}
                        >
                          <Card
                            style={[
                              styles.borrowingCard,
                              selectedBorrowingId === b.id &&
                                styles.borrowingCardSelected,
                            ]}
                          >
                            <Card.Content style={styles.borrowingContent}>
                              <Text
                                style={[
                                  styles.borrowingAmount,
                                  { color: themeColors.textPrimary },
                                ]}
                              >
                                {formatCurrency(b.remainingAmount)}
                              </Text>
                              <Text
                                style={[
                                  styles.borrowingDesc,
                                  { color: themeColors.textSecondary },
                                ]}
                                numberOfLines={1}
                              >
                                {b.borrowerName || b.description || "Borrowed"}
                              </Text>
                              {b.dueDate && (
                                <Text
                                  style={[
                                    styles.borrowingDue,
                                    { color: themeColors.textSecondary },
                                  ]}
                                >
                                  Due: {b.dueDate}
                                </Text>
                              )}
                            </Card.Content>
                          </Card>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {selectedBorrowingId && (
                      <TextInput
                        mode="outlined"
                        label="Resolution Amount (optional, defaults to expense amount)"
                        placeholder="0.00"
                        value={resolutionAmount}
                        onChangeText={setResolutionAmount}
                        keyboardType="decimal-pad"
                        style={[
                          styles.borrowingInput,
                          { backgroundColor: themeColors.surface },
                        ]}
                        outlineColor={themeColors.border}
                        activeOutlineColor={themeColors.primary}
                        textColor={themeColors.textPrimary}
                      />
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={[
            styles.submitButton,
            {
              backgroundColor:
                type === "earning" ? colors.earning : colors.expense,
            },
          ]}
          contentStyle={styles.submitButtonContent}
        >
          {isLoading
            ? t("addTransaction.adding")
            : isSharedAccount
              ? t("sharedAccount.submitForApproval")
              : type === "earning"
                ? t("addTransaction.addIncome")
                : t("addTransaction.addExpense")}
        </Button>

        <View style={styles.bottomLinks}>
          <TouchableOpacity
            style={styles.transferLink}
            onPress={() => navigation.navigate("Transfer")}
          >
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.transferLinkText}>
              {t("addTransaction.transferBetween")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.transferLink}
            onPress={() => navigation.navigate("Borrowings")}
          >
            <MaterialCommunityIcons
              name="hand-coin-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.transferLinkText}>View Borrowings</Text>
          </TouchableOpacity>
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
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  sharedAccountCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  sharedAccountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sharedAccountHeaderInfo: {
    flex: 1,
  },
  sharedAccountName: {
    fontSize: 15,
    fontWeight: "700",
  },
  sharedAccountRole: {
    fontSize: 11,
    marginTop: 2,
  },
  sharedAccountBalance: {
    fontSize: 16,
    fontWeight: "700",
  },
  sharedAccountNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  sharedAccountNoteText: {
    fontSize: 11,
    flex: 1,
  },
  budgetItemSection: {
    marginBottom: spacing.md,
  },
  budgetItemLoadingText: {
    fontSize: 13,
    padding: spacing.md,
  },
  budgetItemEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  budgetItemEmptyText: {
    fontSize: 13,
    flex: 1,
  },
  budgetItemCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    padding: spacing.sm,
  },
  budgetItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetItemInfo: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  budgetItemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  budgetItemCampaign: {
    fontSize: 11,
    marginTop: 2,
  },
  budgetItemAmount: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: spacing.sm,
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
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  accountsScroll: {
    marginBottom: spacing.lg,
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
    backgroundColor: colors.surface,
  },
  submitButton: {
    borderRadius: borderRadius.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.xs,
  },
  bottomLinks: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  transferLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm,
  },
  transferLinkText: {
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  toggleSection: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  borrowingFields: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  borrowingInput: {
    fontSize: 14,
  },
  noBorrowingsText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  borrowingSelectLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  borrowingsScroll: {
    marginBottom: spacing.sm,
  },
  borrowingCard: {
    width: 160,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  borrowingCardSelected: {
    borderColor: colors.primary,
  },
  borrowingContent: {
    padding: spacing.sm,
  },
  borrowingAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  borrowingDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  borrowingDue: {
    fontSize: 10,
    marginTop: 2,
  },
});
