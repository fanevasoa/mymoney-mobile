/**
 * Budget Campaign Detail Screen
 *
 * Shows campaign details, items, and approval actions.
 * Managers can approve/reject items and the whole campaign.
 * Managers can apply an approved campaign as expenses.
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
import { Text, Card, Chip, Button, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { sharedAccountService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  SharedAccountScreensParamList,
  BudgetCampaign,
  BudgetItem,
  SharedAccount,
} from "../../types";

type Props = NativeStackScreenProps<
  SharedAccountScreensParamList,
  "BudgetCampaignDetail"
>;

export default function BudgetCampaignDetailScreen({
  route,
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { sharedAccountId, campaignId } = route.params;

  const [campaign, setCampaign] = useState<BudgetCampaign | null>(null);
  const [account, setAccount] = useState<SharedAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [campaignRes, accountRes] = await Promise.all([
        sharedAccountService.getBudgetCampaignById(sharedAccountId, campaignId),
        sharedAccountService.getSharedAccountById(sharedAccountId),
      ]);
      if (campaignRes.success) {
        setCampaign(campaignRes.data.campaign);
      }
      if (accountRes.success) {
        setAccount(accountRes.data.sharedAccount);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [sharedAccountId, campaignId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const isManager = account?.myRole === "manager";

  const handleApproveItem = async (
    itemId: string,
    status: "pending" | "approved" | "rejected",
  ) => {
    try {
      setActionLoading(true);
      await sharedAccountService.approveBudgetItem(
        sharedAccountId,
        campaignId,
        itemId,
        status,
      );
      await fetchData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("sharedAccount.actionFailed"),
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert(
      t("sharedAccount.deleteItem"),
      t("sharedAccount.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await sharedAccountService.deleteBudgetItem(
                sharedAccountId,
                campaignId,
                itemId,
              );
              await fetchData();
            } catch (err) {
              showToast(
                err instanceof Error
                  ? err.message
                  : t("sharedAccount.deleteFailed"),
                "error",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleApproveCampaign = async (status: "approved" | "rejected") => {
    Alert.alert(
      status === "approved"
        ? t("sharedAccount.approveCampaign")
        : t("sharedAccount.rejectCampaign"),
      status === "approved"
        ? t("sharedAccount.confirmApprove")
        : t("sharedAccount.confirmReject"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text:
            status === "approved"
              ? t("sharedAccount.approve")
              : t("sharedAccount.reject"),
          style: status === "rejected" ? "destructive" : "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              await sharedAccountService.approveBudgetCampaign(
                sharedAccountId,
                campaignId,
                status,
              );
              await fetchData();
            } catch (err) {
              showToast(
                err instanceof Error
                  ? err.message
                  : t("sharedAccount.actionFailed"),
                "error",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleApplyCampaign = async () => {
    Alert.alert(
      t("sharedAccount.applyCampaign"),
      t("sharedAccount.applyConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("sharedAccount.apply"),
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await sharedAccountService.applyBudgetCampaign(
                sharedAccountId,
                campaignId,
              );
              if (response.success) {
                showToast(
                  t("sharedAccount.campaignApplied", {
                    expense: formatCurrency(response.data.totalExpense),
                    balance: formatCurrency(response.data.newBalance),
                  }),
                );
                await fetchData();
              }
            } catch (err) {
              showToast(
                err instanceof Error
                  ? err.message
                  : t("sharedAccount.applyFailed"),
                "error",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteCampaign = async () => {
    Alert.alert(
      t("sharedAccount.deleteCampaign"),
      t("sharedAccount.deleteCampaignConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              await sharedAccountService.deleteBudgetCampaign(
                sharedAccountId,
                campaignId,
              );
              showToast(t("sharedAccount.campaignDeleted"));
              navigation.goBack();
            } catch (err) {
              showToast(
                err instanceof Error
                  ? err.message
                  : t("sharedAccount.failedDeleteCampaign"),
                "error",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const getItemStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return colors.earning;
      case "rejected":
        return colors.expense;
      default:
        return "#F59E0B";
    }
  };

  const getItemStatusLabel = (status: string): string => {
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

  if (!campaign) {
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

  const approvedTotal =
    campaign.items
      ?.filter((i) => i.status === "approved")
      .reduce((s, i) => s + i.amount, 0) || 0;

  const unapprovedTotal =
    campaign.items
      ?.filter((i) => i.status !== "approved")
      .reduce((s, i) => s + i.amount, 0) || 0;

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
        }
      >
        {/* Header */}
        <Card
          style={[styles.headerCard, { backgroundColor: themeColors.surface }]}
        >
          <Card.Content>
            <Text
              style={[styles.campaignName, { color: themeColors.textPrimary }]}
            >
              {campaign.name}
            </Text>

            {campaign.status !== "applied" && (
              <View style={styles.campaignActions}>
                <TouchableOpacity
                  style={styles.editCampaignLink}
                  onPress={() =>
                    navigation.navigate("EditBudgetCampaign", {
                      sharedAccountId,
                      campaignId,
                      name: campaign.name,
                      description: campaign.description,
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    {t("sharedAccount.edit")}
                  </Text>
                </TouchableOpacity>
                {(campaign.createdBy === user?.id || isManager) && (
                  <TouchableOpacity
                    style={styles.deleteCampaignLink}
                    onPress={handleDeleteCampaign}
                    disabled={actionLoading}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={16}
                      color={colors.expense}
                    />
                    <Text
                      style={{
                        color: colors.expense,
                        fontSize: 12,
                        marginLeft: 4,
                      }}
                    >
                      {t("common.delete")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {campaign.description ? (
              <Text
                style={[
                  styles.description,
                  { color: themeColors.textSecondary },
                ]}
              >
                {campaign.description}
              </Text>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("sharedAccount.items")}
                </Text>
                <Text
                  style={[styles.statValue, { color: themeColors.textPrimary }]}
                >
                  {campaign.items?.length || 0}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("sharedAccount.approvedTotal")}
                </Text>
                <Text style={[styles.statValue, { color: colors.earning }]}>
                  {formatCurrency(approvedTotal)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("sharedAccount.unapprovedTotal")}
                </Text>
                <Text style={[styles.statValue, { color: colors.expense }]}>
                  {formatCurrency(unapprovedTotal)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Manager Actions */}
        {isManager && campaign.status !== "applied" && (
          <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
            <Card.Content>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                {t("sharedAccount.managerActions")}
              </Text>
              <View style={styles.actionsRow}>
                {(campaign.status === "draft" ||
                  campaign.status === "pending_approval") && (
                  <>
                    <Button
                      mode="contained"
                      onPress={() => handleApproveCampaign("approved")}
                      disabled={actionLoading}
                      style={[
                        styles.actionButton,
                        { backgroundColor: colors.earning },
                      ]}
                      compact
                    >
                      {t("sharedAccount.approveAll")}
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleApproveCampaign("rejected")}
                      disabled={actionLoading}
                      style={[
                        styles.actionButton,
                        { backgroundColor: colors.expense },
                      ]}
                      compact
                    >
                      {t("sharedAccount.rejectAll")}
                    </Button>
                  </>
                )}
                {campaign.status === "approved" && (
                  <Button
                    mode="contained"
                    onPress={handleApplyCampaign}
                    disabled={actionLoading}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                    icon="check-all"
                    compact
                  >
                    {t("sharedAccount.applyAsExpenses")}
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Items */}
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.textPrimary },
                ]}
              >
                {t("sharedAccount.items")} ({campaign.items?.length || 0})
              </Text>
              {campaign.status !== "applied" && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("AddBudgetItem", {
                      sharedAccountId,
                      campaignId,
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {!campaign.items || campaign.items.length === 0 ? (
              <Text
                style={[styles.emptyText, { color: themeColors.textSecondary }]}
              >
                {t("sharedAccount.noItems")}
              </Text>
            ) : (
              campaign.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemRow,
                    { borderBottomColor: themeColors.border },
                  ]}
                  onPress={() => {
                    if (campaign.status !== "applied") {
                      navigation.navigate("EditBudgetItem", {
                        sharedAccountId,
                        campaignId,
                        itemId: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: item.amount,
                      });
                    }
                  }}
                  activeOpacity={campaign.status !== "applied" ? 0.7 : 1}
                >
                  <View style={styles.itemLeft}>
                    <Text
                      style={[
                        styles.itemName,
                        { color: themeColors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.itemMeta}>
                      {item.quantity != null && item.unitPrice != null && (
                        <Text
                          style={[
                            styles.itemCalc,
                            { color: themeColors.textSecondary },
                          ]}
                        >
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.itemCreator,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {t("sharedAccount.byName", {
                          name: item.creator?.name || "—",
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <Text
                      style={[
                        styles.itemAmount,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      {formatCurrency(item.amount)}
                    </Text>
                    <View style={styles.itemActions}>
                      <Chip
                        textStyle={{
                          fontSize: 9,
                          color: getItemStatusColor(item.status),
                          lineHeight: 14,
                        }}
                        style={{
                          backgroundColor:
                            getItemStatusColor(item.status) + "15",
                          paddingVertical: 0,
                          paddingHorizontal: 2,
                        }}
                        compact
                      >
                        {getItemStatusLabel(item.status)}
                      </Chip>

                      {isManager && campaign.status !== "applied" && (
                        <View style={styles.approveButtons}>
                          {item.status !== "approved" && (
                            <IconButton
                              icon="check"
                              size={16}
                              iconColor={colors.earning}
                              onPress={() =>
                                handleApproveItem(item.id, "approved")
                              }
                              disabled={actionLoading}
                              style={styles.miniButton}
                            />
                          )}
                          {item.status !== "rejected" && (
                            <IconButton
                              icon="close"
                              size={16}
                              iconColor={colors.expense}
                              onPress={() =>
                                handleApproveItem(item.id, "rejected")
                              }
                              disabled={actionLoading}
                              style={styles.miniButton}
                            />
                          )}
                          {item.status !== "pending" && (
                            <IconButton
                              icon="undo"
                              size={16}
                              iconColor={themeColors.textSecondary}
                              onPress={() =>
                                handleApproveItem(item.id, "pending")
                              }
                              disabled={actionLoading}
                              style={styles.miniButton}
                            />
                          )}
                        </View>
                      )}

                      {campaign.status !== "applied" &&
                        (item.createdBy === user?.id || isManager) && (
                          <>
                            <IconButton
                              icon="pencil-outline"
                              size={16}
                              iconColor={colors.primary}
                              onPress={() =>
                                navigation.navigate("EditBudgetItem", {
                                  sharedAccountId,
                                  campaignId,
                                  itemId: item.id,
                                  name: item.name,
                                  quantity: item.quantity,
                                  unitPrice: item.unitPrice,
                                  amount: item.amount,
                                })
                              }
                              disabled={actionLoading}
                              style={styles.miniButton}
                            />
                            <IconButton
                              icon="delete-outline"
                              size={16}
                              iconColor={colors.expense}
                              onPress={() => handleDeleteItem(item.id)}
                              disabled={actionLoading}
                              style={styles.miniButton}
                            />
                          </>
                        )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {campaign.status !== "applied" && (
              <Button
                mode="contained"
                icon="plus"
                onPress={() =>
                  navigation.navigate("AddBudgetItem", {
                    sharedAccountId,
                    campaignId,
                  })
                }
                style={styles.addItemButton}
                contentStyle={styles.addItemButtonContent}
              >
                {t("sharedAccount.addBudgetItem")}
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 32,
  },
  loadingText: {
    textAlign: "center",
    marginTop: spacing.lg,
    fontSize: 14,
  },
  headerCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  campaignName: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  description: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemMeta: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 2,
  },
  itemCalc: {
    fontSize: 11,
  },
  itemCreator: {
    fontSize: 11,
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  approveButtons: {
    flexDirection: "row",
  },
  campaignActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  editCampaignLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteCampaignLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniButton: {
    margin: 0,
    width: 28,
    height: 28,
  },
  addItemButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  addItemButtonContent: {
    paddingVertical: spacing.xs,
  },
});
