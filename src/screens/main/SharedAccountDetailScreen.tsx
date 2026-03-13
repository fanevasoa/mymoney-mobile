/**
 * Shared Account Detail Screen
 *
 * Shows shared account details similar to AccountDetailScreen.
 * Displays balance header, quick action buttons (income/expense),
 * recent transactions with approval workflow, members, and budget campaigns.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, Card, Chip, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { sharedAccountService } from "../../api";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/helpers";
import type {
  AccountsStackParamList,
  MainTabParamList,
  SharedAccount,
  SharedAccountTransaction,
  BudgetCampaign,
} from "../../types";

type Props = CompositeScreenProps<
  NativeStackScreenProps<AccountsStackParamList, "SharedAccountDetail">,
  BottomTabScreenProps<MainTabParamList>
>;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function SharedAccountDetailScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { accounts } = useApp();
  const { sharedAccountId } = route.params;

  const linkedAccount = accounts.find(
    (acc) => acc.sharedAccountId === sharedAccountId,
  );

  const [account, setAccount] = useState<SharedAccount | null>(null);
  const [transactions, setTransactions] = useState<SharedAccountTransaction[]>(
    [],
  );
  const [campaigns, setCampaigns] = useState<BudgetCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const accountRes =
        await sharedAccountService.getSharedAccountById(sharedAccountId);
      if (accountRes.success) {
        setAccount(accountRes.data.sharedAccount);
      }
    } catch {
      // account fetch failed
    }
    try {
      const txRes = await sharedAccountService.getSharedAccountTransactions(
        sharedAccountId,
        { limit: 20 },
      );
      if (txRes.success) {
        setTransactions(txRes.data.transactions);
      }
    } catch {
      // transactions fetch failed
    }
    try {
      const campaignsRes = await sharedAccountService.getBudgetCampaigns(
        sharedAccountId,
        { limit: 50 },
      );
      if (campaignsRes.success) {
        setCampaigns(campaignsRes.data.campaigns);
      }
    } catch {
      // campaigns fetch failed
    }
    setIsLoading(false);
  }, [sharedAccountId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const isManager = account?.myRole === "manager";

  const handleApprove = async (
    txId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await sharedAccountService.approveSharedAccountTransaction(
        sharedAccountId,
        txId,
        status,
      );
      fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : t("sharedAccount.failedUpdateTx");
      showToast(msg, "error");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return colors.earning;
      case "rejected":
        return colors.expense;
      case "pending":
        return "#F59E0B";
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "approved":
        return t("sharedAccount.statusApproved");
      case "rejected":
        return t("sharedAccount.statusRejected");
      case "pending":
        return t("sharedAccount.statusPending");
      default:
        return status;
    }
  };

  const getCampaignStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return colors.earning;
      case "applied":
        return colors.primary;
      case "rejected":
        return colors.expense;
      case "pending_approval":
        return "#F59E0B";
      default:
        return themeColors.textSecondary;
    }
  };

  const getCampaignStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return t("sharedAccount.statusDraft");
      case "pending_approval":
        return t("sharedAccount.statusPending");
      case "approved":
        return t("sharedAccount.statusApproved");
      case "rejected":
        return t("sharedAccount.statusRejected");
      case "applied":
        return t("sharedAccount.statusApplied");
      default:
        return status;
    }
  };

  const getTxIcon = (
    tx: SharedAccountTransaction,
  ): { name: IconName; color: string } => {
    if (tx.type === "income") {
      return { name: "arrow-down-circle", color: colors.earning };
    }
    return { name: "arrow-up-circle", color: colors.expense };
  };

  if (!account) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <Text
          style={[styles.loadingText, { color: themeColors.textSecondary }]}
        >
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  const pendingCount = transactions.filter(
    (tx) => tx.status === "pending",
  ).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
      }
    >
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: colors.primary }]}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="account-group"
              size={40}
              color={colors.textInverse}
            />
          </View>
          <Text style={styles.accountName}>{account.name}</Text>
          {account.description ? (
            <Text style={styles.accountDesc}>{account.description}</Text>
          ) : null}
          <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
          <Chip
            textStyle={{ fontSize: 10, color: colors.textInverse }}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              alignSelf: "center",
            }}
            compact
          >
            {isManager ? t("sharedAccount.manager") : t("sharedAccount.member")}{" "}
            ·{" "}
            {t("sharedAccount.membersCount", {
              count: account.members?.length || 0,
            })}
          </Chip>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            if (linkedAccount) {
              navigation.navigate("Add", {
                screen: "AddTransaction",
                params: { accountId: linkedAccount.id, type: "earning" },
              });
            }
          }}
          style={[styles.actionButton, { backgroundColor: colors.earning }]}
        >
          {t("common.income")}
        </Button>
        <Button
          mode="contained"
          icon="minus"
          onPress={() => {
            if (linkedAccount) {
              navigation.navigate("Add", {
                screen: "AddTransaction",
                params: { accountId: linkedAccount.id, type: "expense" },
              });
            }
          }}
          style={[styles.actionButton, { backgroundColor: colors.expense }]}
        >
          {t("common.expense")}
        </Button>
      </View>

      {/* Pending Approvals Banner (managers only) */}
      {isManager && pendingCount > 0 && (
        <View
          style={[styles.pendingBanner, { backgroundColor: "#F59E0B" + "15" }]}
        >
          <MaterialCommunityIcons
            name="clock-alert-outline"
            size={20}
            color="#F59E0B"
          />
          <Text style={[styles.pendingText, { color: "#F59E0B" }]}>
            {t("sharedAccount.pendingApproval", { count: pendingCount })}
          </Text>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t("sharedAccount.recentTransactions")}
        </Text>

        {transactions.length === 0 ? (
          <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
            <Card.Content>
              <Text
                style={[styles.emptyText, { color: themeColors.textSecondary }]}
              >
                {t("sharedAccount.noTransactions")}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          transactions.map((tx) => {
            const icon = getTxIcon(tx);
            return (
              <Card
                key={tx.id}
                style={[
                  styles.txCard,
                  { backgroundColor: themeColors.surface },
                ]}
              >
                <Card.Content>
                  <View style={styles.txRow}>
                    <MaterialCommunityIcons
                      name={icon.name}
                      size={28}
                      color={icon.color}
                    />
                    <View style={styles.txInfo}>
                      <Text
                        style={[
                          styles.txDesc,
                          { color: themeColors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {tx.description || tx.type}
                      </Text>
                      <View style={styles.txMeta}>
                        <Text
                          style={[
                            styles.txCreator,
                            { color: themeColors.textSecondary },
                          ]}
                        >
                          {tx.creator?.name || t("sharedAccount.unknown")}
                        </Text>
                        {tx.budgetItem && (
                          <Text
                            style={[
                              styles.txBudgetItem,
                              { color: themeColors.textSecondary },
                            ]}
                          >
                            · {tx.budgetItem.name}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.txDate,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {formatDate(tx.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          {
                            color:
                              tx.type === "income"
                                ? colors.earning
                                : colors.expense,
                          },
                        ]}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </Text>
                      <Chip
                        textStyle={{
                          fontSize: 9,
                          color: getStatusColor(tx.status),
                          lineHeight: 14,
                        }}
                        style={{
                          backgroundColor: getStatusColor(tx.status) + "15",
                          paddingVertical: 0,
                          paddingHorizontal: 2,
                        }}
                        compact
                      >
                        {getStatusLabel(tx.status)}
                      </Chip>
                    </View>
                  </View>

                  {/* Approve/Reject buttons for managers on pending tx */}
                  {isManager && tx.status === "pending" && (
                    <View style={styles.approvalRow}>
                      <Button
                        mode="contained"
                        compact
                        onPress={() => handleApprove(tx.id, "approved")}
                        style={[
                          styles.approveBtn,
                          { backgroundColor: colors.earning },
                        ]}
                        labelStyle={styles.approvalBtnLabel}
                      >
                        {t("sharedAccount.approve")}
                      </Button>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => handleApprove(tx.id, "rejected")}
                        style={styles.rejectBtn}
                        labelStyle={[
                          styles.approvalBtnLabel,
                          { color: colors.expense },
                        ]}
                      >
                        {t("sharedAccount.reject")}
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </View>

      {/* Members (collapsible) */}
      <TouchableOpacity
        onPress={() => setShowMembers(!showMembers)}
        activeOpacity={0.7}
      >
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.collapsibleHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                {t("sharedAccount.members")} ({account.members?.length || 0})
              </Text>
              <View style={styles.collapsibleRight}>
                {isManager && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AddSharedAccountMember", {
                        sharedAccountId,
                      })
                    }
                  >
                    <MaterialCommunityIcons
                      name="account-plus"
                      size={22}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
                <MaterialCommunityIcons
                  name={showMembers ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={themeColors.textSecondary}
                />
              </View>
            </View>

            {showMembers &&
              account.members?.map((member) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberRow,
                    { borderBottomColor: themeColors.border },
                  ]}
                >
                  <View style={styles.memberLeft}>
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={28}
                      color={themeColors.textSecondary}
                    />
                    <View style={styles.memberInfo}>
                      <Text
                        style={[
                          styles.memberName,
                          { color: themeColors.textPrimary },
                        ]}
                      >
                        {member.user?.name || t("sharedAccount.unknown")}
                      </Text>
                      <Text
                        style={[
                          styles.memberEmail,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {member.user?.email || ""}
                      </Text>
                    </View>
                  </View>
                  <Chip
                    textStyle={{
                      fontSize: 9,
                      color:
                        member.role === "manager"
                          ? colors.primary
                          : themeColors.textSecondary,
                      lineHeight: 14,
                    }}
                    style={{
                      backgroundColor:
                        member.role === "manager"
                          ? colors.primary + "15"
                          : themeColors.border + "50",
                      paddingVertical: 0,
                      paddingHorizontal: 2,
                    }}
                    compact
                  >
                    {member.role === "manager"
                      ? t("sharedAccount.manager")
                      : t("sharedAccount.member")}
                  </Chip>
                </View>
              ))}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Budget Campaigns (collapsible) */}
      <TouchableOpacity
        onPress={() => setShowCampaigns(!showCampaigns)}
        activeOpacity={0.7}
      >
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.collapsibleHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                {t("sharedAccount.budgetCampaigns")} ({campaigns.length})
              </Text>
              <View style={styles.collapsibleRight}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CreateBudgetCampaign", {
                      sharedAccountId,
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="plus-circle-outline"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <MaterialCommunityIcons
                  name={showCampaigns ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={themeColors.textSecondary}
                />
              </View>
            </View>

            {showCampaigns && (
              <>
                {campaigns.length === 0 ? (
                  <Text
                    style={[
                      styles.emptyText,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    {t("sharedAccount.noCampaigns")}
                  </Text>
                ) : (
                  campaigns.map((campaign) => (
                    <TouchableOpacity
                      key={campaign.id}
                      onPress={() =>
                        navigation.navigate("BudgetCampaignDetail", {
                          sharedAccountId,
                          campaignId: campaign.id,
                        })
                      }
                    >
                      <View
                        style={[
                          styles.campaignRow,
                          { borderBottomColor: themeColors.border },
                        ]}
                      >
                        <View style={styles.campaignLeft}>
                          <Text
                            style={[
                              styles.campaignName,
                              { color: themeColors.textPrimary },
                            ]}
                            numberOfLines={1}
                          >
                            {campaign.name}
                          </Text>
                          <Text
                            style={[
                              styles.campaignCreator,
                              { color: themeColors.textSecondary },
                            ]}
                          >
                            {t("sharedAccount.byCreator", {
                              name:
                                campaign.creator?.name ||
                                t("sharedAccount.unknown"),
                              count: campaign.items?.length || 0,
                            })}
                          </Text>
                        </View>
                        <View style={styles.campaignRight}>
                          <Text
                            style={[
                              styles.campaignAmount,
                              { color: themeColors.textPrimary },
                            ]}
                          >
                            {formatCurrency(campaign.totalAmount)}
                          </Text>
                          <Chip
                            textStyle={{
                              fontSize: 9,
                              color: getCampaignStatusColor(campaign.status),
                              lineHeight: 14,
                            }}
                            style={{
                              backgroundColor:
                                getCampaignStatusColor(campaign.status) + "15",
                              paddingVertical: 0,
                              paddingHorizontal: 2,
                            }}
                            compact
                          >
                            {getCampaignStatusLabel(campaign.status)}
                          </Chip>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    textAlign: "center",
    marginTop: spacing.lg,
    fontSize: 14,
  },
  headerCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 4,
  },
  headerContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  accountName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textInverse,
  },
  accountDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  balance: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textInverse,
    marginVertical: spacing.sm,
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
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pendingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  txCard: {
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: "600",
  },
  txMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  txCreator: {
    fontSize: 11,
  },
  txBudgetItem: {
    fontSize: 11,
  },
  txDate: {
    fontSize: 10,
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  approvalRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    justifyContent: "flex-end",
  },
  approveBtn: {
    borderRadius: borderRadius.sm,
  },
  rejectBtn: {
    borderRadius: borderRadius.sm,
    borderColor: colors.expense,
  },
  approvalBtnLabel: {
    fontSize: 12,
  },
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collapsibleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
  },
  memberEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  campaignRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  campaignLeft: {
    flex: 1,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: "600",
  },
  campaignCreator: {
    fontSize: 11,
    marginTop: 2,
  },
  campaignRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  campaignAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
});
