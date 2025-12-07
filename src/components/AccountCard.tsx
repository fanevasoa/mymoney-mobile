/**
 * Account Card Component
 *
 * Reusable card component for displaying account information.
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../theme";
import { formatCurrency } from "../utils/helpers";
import type { AccountCardProps } from "../types";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * Get icon name based on account type icon
 */
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

export default function AccountCard({
  account,
  onPress,
  compact = false,
  selected = false,
}: AccountCardProps): React.JSX.Element {
  const iconName = getIconName(account.accountType?.icon);
  const accountColor = account.accountType?.color || colors.primary;

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <Card style={[styles.compactCard, selected && styles.cardSelected]}>
          <Card.Content style={styles.compactContent}>
            <View
              style={[
                styles.compactIcon,
                { backgroundColor: accountColor + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={20}
                color={accountColor}
              />
            </View>
            <Text style={styles.compactName} numberOfLines={1}>
              {account.name}
            </Text>
            <Text style={styles.compactBalance}>
              {formatCurrency(account.balance)}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={[styles.card, selected && styles.cardSelected]}>
        <Card.Content style={styles.content}>
          <View style={styles.left}>
            <View
              style={[styles.icon, { backgroundColor: accountColor + "20" }]}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={accountColor}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{account.name}</Text>
              <Text style={styles.type}>{account.accountType?.name}</Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={styles.balance}>
              {formatCurrency(account.balance)}
            </Text>
            {!account.isActive && <Text style={styles.inactive}>Inactive</Text>}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: colors.primary,
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
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  type: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  balance: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  inactive: {
    fontSize: 10,
    color: colors.warning,
    marginTop: 2,
  },
  // Compact styles
  compactCard: {
    width: 140,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  compactContent: {
    alignItems: "center",
    padding: spacing.sm,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  compactName: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
  },
  compactBalance: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2,
  },
});
