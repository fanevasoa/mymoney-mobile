/**
 * Dashboard Screen
 *
 * The main home screen of the MyMoney application.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { dashboardService } from "../../api";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/helpers";
import type {
  MainTabParamList,
  DashboardStackParamList,
  Transaction,
  TransactionType,
  ApiError,
} from "../../types";

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, "DashboardMain">,
  BottomTabScreenProps<MainTabParamList>
>;

interface TransactionIcon {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

export default function DashboardScreen({
  navigation,
}: Props): React.JSX.Element {
  const { user } = useAuth();
  const { fetchAccountTypes, fetchAccounts, fetchDashboard, dashboardData } =
    useApp();
  const { colors: themeColors } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        fetchAccountTypes(),
        fetchAccounts(),
        fetchDashboard(),
      ]);

      const response = await dashboardService.getRecentTransactions(5);
      if (response.success) {
        setRecentTransactions(response.data.transactions);
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.isAuthError) {
        showToast(apiError.message, "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccountTypes, fetchAccounts, fetchDashboard, showToast]);

  // Only use useFocusEffect to avoid double-loading on mount
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

  const getTransactionIcon = (type: TransactionType): TransactionIcon => {
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

  const getAccountIcon = (
    icon: string | undefined,
  ): keyof typeof MaterialCommunityIcons.glyphMap => {
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
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text
            style={[styles.welcomeText, { color: themeColors.textPrimary }]}
          >
            {t("dashboard.welcomeBack", {
              name: user?.name?.split(" ")[0] || t("profile.user"),
            })}
          </Text>
          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Total Balance Card */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text style={styles.balanceLabel}>
              {t("dashboard.totalBalance")}
            </Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(dashboardData?.totalBalance)}
            </Text>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <MaterialCommunityIcons
                  name="arrow-down-circle"
                  size={20}
                  color={colors.earning}
                />
                <Text style={styles.todayStatLabel}>{t("common.today")}</Text>
                <Text
                  style={[styles.todayStatAmount, { color: colors.earning }]}
                >
                  +{formatCurrency(dashboardData?.today?.earnings)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.todayStat}>
                <MaterialCommunityIcons
                  name="arrow-up-circle"
                  size={20}
                  color={colors.expense}
                />
                <Text style={styles.todayStatLabel}>{t("common.today")}</Text>
                <Text
                  style={[styles.todayStatAmount, { color: colors.expense }]}
                >
                  -{formatCurrency(dashboardData?.today?.expenses)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate("Add", {
                screen: "AddTransaction",
                params: { type: "earning" },
              })
            }
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.earning + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={colors.earning}
              />
            </View>
            <Text
              style={[
                styles.quickActionText,
                { color: themeColors.textSecondary },
              ]}
            >
              {t("common.income")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              navigation.navigate("Add", {
                screen: "AddTransaction",
                params: { type: "expense" },
              })
            }
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.expense + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="minus"
                size={24}
                color={colors.expense}
              />
            </View>
            <Text
              style={[
                styles.quickActionText,
                { color: themeColors.textSecondary },
              ]}
            >
              {t("common.expense")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate("Add", { screen: "Transfer" })}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.transfer + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="swap-horizontal"
                size={24}
                color={colors.transfer}
              />
            </View>
            <Text
              style={[
                styles.quickActionText,
                { color: themeColors.textSecondary },
              ]}
            >
              {t("common.transfer")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Types Summary */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            {t("dashboard.byAccountType")}
          </Text>
          <View style={styles.accountTypesGrid}>
            {dashboardData?.accountTypesSummary?.map((type) => (
              <Card key={type.id} style={styles.accountTypeCard}>
                <Card.Content style={styles.accountTypeContent}>
                  <View
                    style={[
                      styles.accountTypeIcon,
                      { backgroundColor: type.color + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={getAccountIcon(type.icon)}
                      size={24}
                      color={type.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.accountTypeName,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {type.name}
                  </Text>
                  <Text
                    style={[
                      styles.accountTypeBalance,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {formatCurrency(type.balance)}
                  </Text>
                  <Text
                    style={[
                      styles.accountTypeCount,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("dashboard.accountCount", { count: type.accountCount })}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Accounts List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
            >
              {t("common.accounts")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Accounts", { screen: "AccountsMain" })
              }
            >
              <Text style={styles.seeAllText}>{t("common.seeAll")}</Text>
            </TouchableOpacity>
          </View>
          {dashboardData?.accountsSummary?.slice(0, 3).map((account) => (
            <TouchableOpacity
              key={account.id}
              onPress={() =>
                navigation.navigate("AccountDetail", { accountId: account.id })
              }
            >
              <Card style={styles.accountCard}>
                <Card.Content style={styles.accountCardContent}>
                  <View style={styles.accountInfo}>
                    <View
                      style={[
                        styles.accountIcon,
                        { backgroundColor: account.accountType?.color + "20" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getAccountIcon(account.accountType?.icon)}
                        size={20}
                        color={account.accountType?.color || colors.primary}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.accountName,
                          { color: themeColors.textPrimary },
                        ]}
                      >
                        {account.name}
                      </Text>
                      <Text
                        style={[
                          styles.accountType,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {account.accountType?.name}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.accountBalance,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {formatCurrency(account.balance)}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shared Accounts */}
        {dashboardData?.sharedAccountsSummary &&
          dashboardData.sharedAccountsSummary.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                {t("dashboard.sharedAccounts")}
              </Text>
              {dashboardData.sharedAccountsSummary.map((sa) => (
                <TouchableOpacity
                  key={sa.id}
                  onPress={() =>
                    navigation.navigate("Accounts", {
                      screen: "SharedAccountDetail",
                      params: { sharedAccountId: sa.id },
                    })
                  }
                >
                  <Card style={styles.accountCard}>
                    <Card.Content style={styles.accountCardContent}>
                      <View style={styles.accountInfo}>
                        <View
                          style={[
                            styles.accountIcon,
                            { backgroundColor: colors.primary + "20" },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="account-group"
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        <View style={{ flex: 1, overflow: "hidden" }}>
                          <View style={styles.sharedAccountName}>
                            <Text
                              style={[
                                styles.accountName,
                                { color: themeColors.textPrimary },
                              ]}
                              numberOfLines={1}
                            >
                              {sa.name}
                            </Text>
                            <Chip
                              textStyle={{
                                fontSize: 8,
                                color:
                                  sa.myRole === "manager"
                                    ? colors.primary
                                    : themeColors.textSecondary,
                                lineHeight: 10,
                              }}
                              style={{
                                backgroundColor:
                                  sa.myRole === "manager"
                                    ? colors.primary + "15"
                                    : themeColors.border + "50",
                                paddingVertical: 0,
                                paddingHorizontal: 2,
                              }}
                              compact
                            >
                              {sa.myRole === "manager"
                                ? t("sharedAccount.manager")
                                : t("sharedAccount.member")}
                            </Chip>
                          </View>

                          <View style={styles.sharedAccountMeta}>
                            <Text
                              style={[
                                styles.sharedAccountMembers,
                                { color: themeColors.textSecondary },
                              ]}
                            >
                              {t("sharedAccount.membersCount", {
                                count: sa.membersCount,
                              })}
                            </Text>
                            <Text
                              style={[
                                styles.accountBalance,
                                { color: themeColors.textPrimary },
                              ]}
                            >
                              {formatCurrency(sa.balance)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
            >
              {t("dashboard.recentTransactions")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions", {})}
            >
              <Text style={styles.seeAllText}>{t("common.seeAll")}</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text
                  style={[
                    styles.emptyText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("dashboard.noTransactions")}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            recentTransactions.map((transaction) => {
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
                          {transaction.description || transaction.type}
                        </Text>
                        <Text
                          style={[
                            styles.transactionMeta,
                            { color: themeColors.textSecondary },
                          ]}
                        >
                          {transaction.account?.name} •{" "}
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
                      {transaction.type === "earning" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
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
  welcomeHeader: {
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textInverse,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.textInverse,
    marginTop: spacing.xs,
  },
  todayStats: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  todayStat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  todayStatLabel: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  todayStatAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textInverse,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
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
    marginBottom: spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  accountTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  accountTypeCard: {
    flex: 1,
    minWidth: "30%",
    borderRadius: borderRadius.md,
  },
  accountTypeContent: {
    alignItems: "center",
    padding: spacing.sm,
  },
  accountTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  accountTypeName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  accountTypeBalance: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  accountTypeCount: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  accountCard: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  accountCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  accountType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flexShrink: 0,
    minWidth: 60,
    textAlign: "right",
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
  sharedAccountName: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  sharedAccountMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
    marginTop: 2,
  },
  sharedAccountMembers: {
    fontSize: 11,
  },
});
