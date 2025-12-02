/**
 * Main Navigator
 *
 * Main app navigation with bottom tabs and nested stacks:
 * - Dashboard (home)
 * - Accounts
 * - Add (quick action)
 * - Reports
 * - Profile
 */

import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors, spacing } from "../theme";

// Screens
import DashboardScreen from "../screens/main/DashboardScreen";
import AccountsScreen from "../screens/main/AccountsScreen";
import AccountDetailScreen from "../screens/main/AccountDetailScreen";
import AddAccountScreen from "../screens/main/AddAccountScreen";
import AddTransactionScreen from "../screens/main/AddTransactionScreen";
import TransferScreen from "../screens/main/TransferScreen";
import TransactionsScreen from "../screens/main/TransactionsScreen";
import ReportsScreen from "../screens/main/ReportsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Default screen options for stacks
const screenOptions = {
  headerStyle: {
    backgroundColor: colors.primary,
  },
  headerTintColor: colors.textInverse,
  headerTitleStyle: {
    fontWeight: "600",
  },
};

/**
 * Dashboard Stack Navigator
 */
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: "Transactions" }}
      />
      <Stack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: "Account Details" }}
      />
    </Stack.Navigator>
  );
}

/**
 * Accounts Stack Navigator
 */
function AccountsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="AccountsMain"
        component={AccountsScreen}
        options={{ title: "Accounts" }}
      />
      <Stack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: "Account Details" }}
      />
      <Stack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ title: "Add Account" }}
      />
    </Stack.Navigator>
  );
}

/**
 * Add Stack Navigator (for transactions and transfers)
 */
function AddStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: "Add Transaction" }}
      />
      <Stack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{ title: "Transfer Money" }}
      />
    </Stack.Navigator>
  );
}

/**
 * Reports Stack Navigator
 */
function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ReportsMain"
        component={ReportsScreen}
        options={{ title: "Reports" }}
      />
    </Stack.Navigator>
  );
}

/**
 * Profile Stack Navigator
 */
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Stack.Navigator>
  );
}

/**
 * Custom Add Button for center tab
 */
function AddButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <View style={styles.addButtonInner}>
        <MaterialCommunityIcons
          name="plus"
          size={28}
          color={colors.textInverse}
        />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Main Tab Navigator
 */
export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "view-dashboard" : "view-dashboard-outline";
              break;
            case "Accounts":
              iconName = focused ? "wallet" : "wallet-outline";
              break;
            case "Add":
              iconName = "plus-circle";
              break;
            case "Reports":
              iconName = focused ? "chart-bar" : "chart-bar";
              break;
            case "Profile":
              iconName = focused ? "account-circle" : "account-circle-outline";
              break;
            default:
              iconName = "circle";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Accounts" component={AccountsStack} />
      <Tab.Screen
        name="Add"
        component={AddStack}
        options={{
          tabBarButton: (props) => <AddButton {...props} />,
        }}
      />
      <Tab.Screen name="Reports" component={ReportsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  addButton: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
