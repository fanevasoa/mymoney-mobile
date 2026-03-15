/**
 * Account Detail Screen
 *
 * Shows detailed information about a specific account.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Menu,
  Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { useTranslation } from "react-i18next";

import { accountService, transactionService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { useBalanceVisibility } from "../../contexts/BalanceVisibilityContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/helpers";
import type {
  AccountsStackParamList,
  MainTabParamList,
  Account,
  Transaction,
  TransactionType,
} from "../../types";

type Props = CompositeScreenProps<
  NativeStackScreenProps<AccountsStackParamList, "AccountDetail">,
  BottomTabScreenProps<MainTabParamList>
>;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AccountDetailScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { accountId } = route.params;
  const { removeAccount, updateAccount: updateAccountInState } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isVisible, toggle, maskedBalance } = useBalanceVisibility();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [accountRes, transactionsRes] = await Promise.all([
        accountService.getAccountById(accountId),
        transactionService.getTransactions({ accountId, limit: 20 }),
      ]);

      if (accountRes.success) {
        setAccount(accountRes.data.account);
      }
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions);
      }
    } catch (error) {
      console.error("Error loading account:", error);
      showToast(t("account.failedLoad"), "error");
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleDelete = (): void => {
    Alert.alert(t("account.deleteAccount"), t("account.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await accountService.deleteAccount(accountId);
            removeAccount(accountId);
            navigation.goBack();
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : t("account.failedDelete");
            showToast(message, "error");
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (): Promise<void> => {
    if (!account) return;
    try {
      const response = await accountService.updateAccount(accountId, {
        isActive: !account.isActive,
      });
      if (response.success) {
        setAccount(response.data.account);
        updateAccountInState(response.data.account);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("account.failedUpdate");
      showToast(message, "error");
    }
    setMenuVisible(false);
  };

  const getTransactionIcon = (
    type: TransactionType,
  ): { name: IconName; color: string } => {
    switch (type) {
      case "earning":
        return { name: "arrow-down-circle", color: colors.earning };
      case "expense":
        return { name: "arrow-up-circle", color: colors.expense };
      case "transfer_fee":
        return { name: "swap-horizontal-circle", color: colors.transfer };
      default:
        return { name: "circle", color: colors.textSecondary };
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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor={colors.textInverse}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleToggleActive}
            title={
              account?.isActive
                ? t("account.markInactive")
                : t("account.markActive")
            }
            leadingIcon={account?.isActive ? "eye-off" : "eye"}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleDelete();
            }}
            title={t("account.deleteAccount")}
            leadingIcon="delete"
            titleStyle={{ color: colors.error }}
          />
        </Menu>
      ),
    });
  }, [navigation, menuVisible, account?.isActive]);

  if (isLoading || !account) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Account Header Card */}
      <Card
        style={[
          styles.headerCard,
          { backgroundColor: account.accountType?.color || colors.primary },
        ]}
      >
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name={getIconName(account.accountType?.icon)}
              size={40}
              color={colors.textInverse}
            />
          </View>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>{account.accountType?.name}</Text>
          <TouchableOpacity
            onPress={() => toggle("account_detail_balance")}
            style={styles.balanceRow}
            activeOpacity={0.7}
          >
            <Text style={styles.balance}>
              {isVisible("account_detail_balance")
                ? formatCurrency(account.balance)
                : maskedBalance}
            </Text>
            <MaterialCommunityIcons
              name={isVisible("account_detail_balance") ? "eye" : "eye-off"}
              size={20}
              color={colors.textInverse}
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
          {!account.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>
                {t("common.inactive")}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            navigation.navigate("Add", {
              screen: "AddTransaction",
              params: {
                accountId: account.id,
                type: "earning",
                returnToAccount: true,
              },
            });
          }}
          style={[styles.actionButton, { backgroundColor: colors.earning }]}
        >
          {t("common.income")}
        </Button>
        <Button
          mode="contained"
          icon="minus"
          onPress={() => {
            navigation.navigate("Add", {
              screen: "AddTransaction",
              params: {
                accountId: account.id,
                type: "expense",
                returnToAccount: true,
              },
            });
          }}
          style={[styles.actionButton, { backgroundColor: colors.expense }]}
        >
          {t("common.expense")}
        </Button>
      </View>

      {/* Account Info */}
      {account.description && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text
              style={[styles.infoLabel, { color: themeColors.textSecondary }]}
            >
              {t("common.description")}
            </Text>
            <Text
              style={[styles.infoValue, { color: themeColors.textPrimary }]}
            >
              {account.description}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            {t("dashboard.recentTransactions")}
          </Text>
          <TouchableOpacity
            onPress={() => toggle("account_detail_transactions")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name={
                isVisible("account_detail_transactions") ? "eye" : "eye-off"
              }
              size={18}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text
                style={[styles.emptyText, { color: themeColors.textSecondary }]}
              >
                {t("dashboard.noTransactions")}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          transactions.map((transaction) => {
            const icon = getTransactionIcon(transaction.type);
            return (
              <Card key={transaction.id} style={styles.transactionCard}>
                <Card.Content style={styles.transactionContent}>
                  <View style={styles.transactionLeft}>
                    <MaterialCommunityIcons
                      name={icon.name}
                      size={32}
                      color={icon.color}
                    />
                    <View style={styles.transactionInfo}>
                      <Text
                        style={[
                          styles.transactionDescription,
                          { color: themeColors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {transaction.description ||
                          (transaction.type === "earning"
                            ? t("common.income")
                            : t("common.expense"))}
                      </Text>
                      <Text
                        style={[
                          styles.transactionMeta,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {formatDate(transaction.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "earning"
                            ? colors.earning
                            : colors.expense,
                      },
                    ]}
                  >
                    {isVisible("account_detail_transactions")
                      ? `${transaction.type === "earning" ? "+" : "-"}${formatCurrency(transaction.amount)}`
                      : maskedBalance}
                  </Text>
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  accountName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textInverse,
    marginTop: spacing.sm,
  },
  accountType: {
    fontSize: 14,
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  balance: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.textInverse,
  },
  inactiveBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  inactiveBadgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  infoCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  transactionCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  transactionMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: borderRadius.md,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    paddingVertical: spacing.md,
  },
});
