/**
 * Borrowings Screen
 *
 * Lists all unresolved borrowed money records.
 * Shows remaining amount, borrower name, due date, and resolution progress.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Card, SegmentedButtons } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { borrowingService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type {
  AddStackParamList,
  AccountsStackParamList,
  Borrowing,
  BorrowingDirection,
  BorrowingStatus,
} from "../../types";
import { useTranslation } from "react-i18next";

type Props = NativeStackScreenProps<
  AddStackParamList | AccountsStackParamList,
  "Borrowings"
>;

export default function BorrowingsScreen({
  navigation,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();

  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>("unresolved");
  const [direction, setDirection] = useState<BorrowingDirection>("borrowed");

  const fetchBorrowings = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;
      if (filter === "unresolved") {
        response = await borrowingService.getUnresolvedBorrowings({
          limit: 50,
          direction,
        });
      } else {
        response = await borrowingService.getBorrowings({
          status: filter as BorrowingStatus,
          direction,
          limit: 50,
        });
      }
      if (response.success) {
        setBorrowings(response.data.borrowings);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [filter, direction]);

  useFocusEffect(
    useCallback(() => {
      fetchBorrowings();
    }, [fetchBorrowings]),
  );

  const getStatusColor = (status: BorrowingStatus): string => {
    switch (status) {
      case "resolved":
        return colors.earning;
      case "partially_resolved":
        return "#F59E0B";
      default:
        return colors.expense;
    }
  };

  const getStatusLabel = (status: BorrowingStatus): string => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "partially_resolved":
        return "Partial";
      default:
        return "Unresolved";
    }
  };

  const getProgressPercent = (b: Borrowing): number => {
    if (b.amount <= 0) return 0;
    return Math.round(((b.amount - b.remainingAmount) / b.amount) * 100);
  };

  const renderBorrowing = ({ item }: { item: Borrowing }) => {
    const progress = getProgressPercent(item);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("BorrowingDetail", { borrowingId: item.id })
        }
      >
        <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <MaterialCommunityIcons
                  name="hand-coin-outline"
                  size={24}
                  color={getStatusColor(item.status)}
                />
                <View style={styles.cardInfo}>
                  <Text
                    style={[
                      styles.borrowerName,
                      { color: themeColors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.borrowerName ||
                      item.description ||
                      (direction === "lent"
                        ? t("lending.lentMoney")
                        : t("lending.borrowedMoney"))}
                  </Text>
                  {item.dueDate && (
                    <Text
                      style={[
                        styles.dueDate,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      Due: {item.dueDate}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(item.status) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.amountsRow}>
              <View>
                <Text
                  style={[
                    styles.amountLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Original
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    { color: themeColors.textPrimary },
                  ]}
                >
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.amountLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Remaining
                </Text>
                <Text style={[styles.amountValue, { color: colors.expense }]}>
                  {formatCurrency(item.remainingAmount)}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.amountLabel,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Progress
                </Text>
                <Text style={[styles.amountValue, { color: colors.earning }]}>
                  {progress}%
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View
              style={[
                styles.progressBar,
                { backgroundColor: themeColors.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: getStatusColor(item.status),
                  },
                ]}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <SegmentedButtons
        value={direction}
        onValueChange={(val) => setDirection(val as BorrowingDirection)}
        buttons={[
          { value: "borrowed", label: t("lending.borrowed") },
          { value: "lent", label: t("lending.lent") },
        ]}
        style={styles.directionButtons}
      />

      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          { value: "unresolved", label: t("lending.active") },
          { value: "partially_resolved", label: t("lending.partial") },
          { value: "resolved", label: t("lending.resolved") },
        ]}
        style={styles.filterButtons}
      />

      <FlatList
        data={borrowings}
        keyExtractor={(item) => item.id}
        renderItem={renderBorrowing}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchBorrowings} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="hand-coin-outline"
              size={48}
              color={themeColors.textDisabled}
            />
            <Text
              style={[styles.emptyText, { color: themeColors.textSecondary }]}
            >
              {direction === "lent"
                ? t("lending.noLendings")
                : t("lending.noBorrowings")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  directionButtons: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  filterButtons: {
    margin: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  borrowerName: {
    fontSize: 15,
    fontWeight: "600",
  },
  dueDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  amountLabel: {
    fontSize: 11,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl || 32,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
});
