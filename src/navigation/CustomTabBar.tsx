/**
 * Custom Tab Bar
 *
 * Xender-inspired bottom tab bar with pill-shaped active indicator,
 * elevated center "Add" button, and proper safe area handling.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTranslation } from "react-i18next";

import { colors as lightColors, spacing, borderRadius } from "../theme";
import { useTheme } from "../contexts/ThemeContext";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TAB_BAR_HEIGHT = 64;
const CENTER_BUTTON_SIZE = 56;

function getIcon(routeName: string, focused: boolean): IconName {
  switch (routeName) {
    case "Dashboard":
      return focused ? "view-dashboard" : "view-dashboard-outline";
    case "Accounts":
      return focused ? "wallet" : "wallet-outline";
    case "Add":
      return "plus";
    case "Reports":
      return focused ? "chart-bar" : "chart-bar";
    case "Profile":
      return focused ? "account-circle" : "account-circle-outline";
    default:
      return "circle";
  }
}

function getLabel(routeName: string, t: (key: string) => string): string {
  switch (routeName) {
    case "Dashboard":
      return t("nav.dashboard");
    case "Accounts":
      return t("nav.accounts");
    case "Add":
      return "";
    case "Reports":
      return t("nav.reports");
    case "Profile":
      return t("nav.profile");
    default:
      return routeName;
  }
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const bottomPadding = Math.max(insets.bottom, spacing.sm);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = route.name === "Add";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.centerButton}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={28}
                    color={lightColors.textInverse}
                  />
                </TouchableOpacity>
              </View>
            );
          }

          const iconName = getIcon(route.name, isFocused);
          const label = getLabel(route.name, t);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerActive,
                ]}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={24}
                  color={isFocused ? lightColors.primary : colors.textSecondary}
                />
              </View>
              {label ? (
                <LabelText focused={isFocused} colors={colors}>
                  {label}
                </LabelText>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function LabelText({
  children,
  focused,
  colors,
}: {
  children: string;
  focused: boolean;
  colors: { primary: string; textSecondary: string };
}): React.JSX.Element {
  return (
    <Text
      style={[
        styles.label,
        { color: focused ? lightColors.primary : colors.textSecondary },
      ]}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      android: {
        elevation: 12,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    width: 48,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: lightColors.primaryLight + "20",
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: lightColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    ...Platform.select({
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: lightColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
    }),
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
