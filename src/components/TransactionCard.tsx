/**
 * Transaction Card Component
 *
 * Reusable card component for displaying transaction information.
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../theme";
import { formatCurrency, formatDate } from "../utils/helpers";
import type { TransactionCardProps, TransactionType } from "../types";

interface TransactionIcon {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

/**
 * Get icon configuration based on transaction type
 */
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

export default function TransactionCard({
  transaction,
  onPress,
  showAccount = true,
}: TransactionCardProps): React.JSX.Element {
  const icon = getTransactionIcon(transaction.type);
  const isIncome = transaction.type === "earning";
  const isTransfer =
    transaction.type === "transfer_fee" || !!transaction.transferId;

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.left}>
            <MaterialCommunityIcons
              name={icon.name}
              size={36}
              color={icon.color}
            />
            <View style={styles.info}>
              <View style={styles.descriptionRow}>
                <Text style={styles.description} numberOfLines={1}>
                  {transaction.description || transaction.type}
                </Text>
                {isTransfer && (
                  <View style={styles.transferBadge}>
                    <Text style={styles.transferBadgeText}>Transfer</Text>
                  </View>
                )}
              </View>
              <Text style={styles.meta}>
                {showAccount && transaction.account?.name}
                {showAccount && transaction.category && " • "}
                {transaction.category}
              </Text>
              <Text style={styles.date}>
                {formatDate(transaction.createdAt, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.amount,
              {
                color: isTransfer
                  ? colors.transfer
                  : isIncome
                    ? colors.earning
                    : colors.expense,
              },
            ]}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  info: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    flexShrink: 1,
  },
  transferBadge: {
    backgroundColor: colors.transfer + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  transferBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.transfer,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
});
