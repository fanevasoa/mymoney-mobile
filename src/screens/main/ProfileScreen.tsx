/**
 * Profile Screen
 *
 * User profile and settings.
 */

import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Divider,
  Portal,
  Dialog,
  TextInput,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { authService } from "../../api";
import { colors, spacing, borderRadius } from "../../theme";

export default function ProfileScreen(): React.JSX.Element {
  const { user, logout } = useAuth();
  const { clearData, dashboardData } = useApp();

  const [passwordDialogVisible, setPasswordDialogVisible] =
    useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  const handleLogout = (): void => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          clearData();
          await logout();
        },
      },
    ]);
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({ currentPassword, newPassword });

      Alert.alert("Success", "Password changed successfully");
      setPasswordDialogVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to change password";
      Alert.alert("Error", message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name)}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons
              name={user?.role === "admin" ? "shield-crown" : "account"}
              size={14}
              color={user?.role === "admin" ? colors.warning : colors.primary}
            />
            <Text
              style={[
                styles.roleText,
                {
                  color:
                    user?.role === "admin" ? colors.warning : colors.primary,
                },
              ]}
            >
              {user?.role === "admin" ? "Administrator" : "User"}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dashboardData?.accountCount || 0}
              </Text>
              <Text style={styles.statLabel}>Accounts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ${(dashboardData?.totalBalance || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Balance</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Settings</Text>
        </Card.Content>

        <List.Item
          title="Change Password"
          description="Update your account password"
          left={(props) => <List.Icon {...props} icon="lock" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setPasswordDialogVisible(true)}
        />
        <Divider />

        <List.Item
          title="Notifications"
          description="Manage notification preferences"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Notification settings will be available in a future update."
            )
          }
        />
        <Divider />

        <List.Item
          title="Export Data"
          description="Export your financial data"
          left={(props) => <List.Icon {...props} icon="download" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Data export will be available in a future update."
            )
          }
        />
      </Card>

      <Card style={styles.aboutCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About</Text>
        </Card.Content>

        <List.Item
          title="Version"
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <Divider />

        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-check" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            Alert.alert("Privacy Policy", "Privacy policy coming soon.")
          }
        />
        <Divider />

        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            Alert.alert("Terms of Service", "Terms of service coming soon.")
          }
        />
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={colors.error}
        icon="logout"
      >
        Logout
      </Button>

      <Portal>
        <Dialog
          visible={passwordDialogVisible}
          onDismiss={() => setPasswordDialogVisible(false)}
        >
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.dialogInput}
            />
            <TextInput
              mode="outlined"
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.dialogInput}
            />
            <TextInput
              mode="outlined"
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogVisible(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
            >
              Change
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  statsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  settingsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  aboutCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
  },
  dialogInput: {
    marginBottom: spacing.sm,
  },
});
