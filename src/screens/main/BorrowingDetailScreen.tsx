/**
 * Borrowing Detail Screen
 *
 * Shows full details of a borrowing including resolution history.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { borrowingService } from "../../api";
import { useTheme } from "../../contexts/ThemeContext";
import { colors, spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/helpers";
import type { AddStackParamList, Borrowing } from "../../types";

type Props = NativeStackScreenProps<AddStackParamList, "BorrowingDetail">;

export default function BorrowingDetailScreen({
  route,
}: Props): React.JSX.Element {
  const { colors: themeColors } = useTheme();
  const { borrowingId } = route.params;

  const [borrowing, setBorrowing] = useState<Borrowing | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBorrowing = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await borrowingService.getBorrowingById(borrowingId);
      if (response.success) {
        setBorrowing(response.data.borrowing);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [borrowingId]);

  useFocusEffect(
    useCallback(() => {
      fetchBorrowing();
    }, [fetchBorrowing]),
  );

  if (!borrowing) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const progress =
    borrowing.amount > 0
      ? Math.round(
          ((borrowing.amount - borrowing.remainingAmount) / borrowing.amount) *
            100,
        )
      : 0;

  const statusColor =
    borrowing.status === "resolved"
      ? colors.earning
      : borrowing.status === "partially_resolved"
        ? "#F59E0B"
        : colors.expense;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchBorrowing} />
      }
    >
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: themeColors.surface }]}>
        <Card.Content>
          <View style={styles.headerRow}>
            <MaterialCommunityIcons
              name="hand-coin-outline"
              size={32}
              color={statusColor}
            />
            <Chip
              textStyle={{ fontSize: 11, color: statusColor }}
              style={{ backgroundColor: statusColor + "15" }}
              compact
            >
              {borrowing.status.replace("_", " ").toUpperCase()}
            </Chip>
          </View>

          <Text
            style={[styles.mainAmount, { color: themeColors.textPrimary }]}
          >
            {formatCurrency(borrowing.amount)}
          </Text>

          {borrowing.borrowerName && (
            <Text
              style={[styles.borrowerText, { color: themeColors.textSecondary }]}
            >
              {borrowing.borrowerName}
            </Text>
          )}

          {borrowing.description && (
            <Text
              style={[styles.descriptionText, { color: themeColors.textSecondary }]}
            >
              {borrowing.description}
            </Text>
          )}

          {borrowing.dueDate && (
            <View style={styles.dueDateRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color={themeColors.textSecondary}
              />
              <Text
                style={[styles.dueDateText, { color: themeColors.textSecondary }]}
              >
                Due: {borrowing.dueDate}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Progress Card */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            Resolution Progress
          </Text>

          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text
                style={[styles.statLabel, { color: themeColors.textSecondary }]}
              >
                Resolved
              </Text>
              <Text style={[styles.statValue, { color: colors.earning }]}>
                {formatCurrency(borrowing.amount - borrowing.remainingAmount)}
              </Text>
            </View>
            <View style={styles.progressStat}>
              <Text
                style={[styles.statLabel, { color: themeColors.textSecondary }]}
              >
                Remaining
              </Text>
              <Text style={[styles.statValue, { color: colors.expense }]}>
                {formatCurrency(borrowing.remainingAmount)}
              </Text>
            </View>
            <View style={styles.progressStat}>
              <Text
                style={[styles.statLabel, { color: themeColors.textSecondary }]}
              >
                Progress
              </Text>
              <Text
                style={[styles.statValue, { color: themeColors.textPrimary }]}
              >
                {progress}%
              </Text>
            </View>
          </View>

          <View
            style={[styles.progressBar, { backgroundColor: themeColors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: statusColor },
              ]}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Resolutions History */}
      <Card style={[styles.card, { backgroundColor: themeColors.surface }]}>
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            Resolution History
          </Text>

          {(!borrowing.resolutions || borrowing.resolutions.length === 0) ? (
            <Text
              style={[styles.emptyText, { color: themeColors.textSecondary }]}
            >
              No resolutions yet
            </Text>
          ) : (
            borrowing.resolutions.map((r) => (
              <View
                key={r.id}
                style={[
                  styles.resolutionItem,
                  { borderBottomColor: themeColors.border },
                ]}
              >
                <View style={styles.resolutionLeft}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={colors.earning}
                  />
                  <View style={styles.resolutionInfo}>
                    <Text
                      style={[
                        styles.resolutionAmount,
                        { color: themeColors.textPrimary },
                      ]}
                    >
                      {formatCurrency(r.amount)}
                    </Text>
                    <Text
                      style={[
                        styles.resolutionDate,
                        { color: themeColors.textSecondary },
                      ]}
                    >
                      {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
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
    marginBottom: spacing.sm,
  },
  mainAmount: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  borrowerText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    marginBottom: 4,
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  dueDateText: {
    fontSize: 12,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  progressStat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  resolutionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  resolutionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  resolutionInfo: {
    marginLeft: spacing.sm,
  },
  resolutionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  resolutionDate: {
    fontSize: 11,
    marginTop: 2,
  },
});
