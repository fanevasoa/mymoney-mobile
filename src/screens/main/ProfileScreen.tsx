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
  SegmentedButtons,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { authService } from "../../api";
import { changeLanguage, getCurrentLanguage } from "../../i18n";
import { colors, spacing, borderRadius } from "../../theme";
import type { ThemeMode } from "../../types";

export default function ProfileScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { clearData, dashboardData } = useApp();
  const { themeMode, setThemeMode, colors: themeColors } = useTheme();
  const { showToast } = useToast();
  const [language, setLanguageState] = React.useState(getCurrentLanguage());

  const [passwordDialogVisible, setPasswordDialogVisible] =
    useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  const handleLanguageChange = async (lang: string) => {
    setLanguageState(lang);
    await changeLanguage(lang);
  };

  const handleLogout = (): void => {
    Alert.alert(t("auth.logout"), t("auth.logout") + "?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
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
      showToast(t("profile.fillAllFields"), "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast(t("profile.passwordMinLength"), "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t("profile.passwordsNoMatch"), "error");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({ currentPassword, newPassword });

      showToast(t("profile.passwordChanged"));
      setPasswordDialogVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("profile.failedChangePassword");
      showToast(message, "error");
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
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name)}
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: themeColors.textPrimary }]}>
            {user?.name || t("profile.user")}
          </Text>
          <Text
            style={[styles.userEmail, { color: themeColors.textSecondary }]}
          >
            {user?.email}
          </Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: themeColors.surfaceVariant },
            ]}
          >
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
              {user?.role === "admin"
                ? t("profile.administrator")
                : t("profile.user")}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            {t("profile.accountSummary")}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.primary }]}>
                {dashboardData?.accountCount || 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: themeColors.textSecondary }]}
              >
                {t("common.accounts")}
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: themeColors.border },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.primary }]}>
                ${(dashboardData?.totalBalance || 0).toLocaleString()}
              </Text>
              <Text
                style={[styles.statLabel, { color: themeColors.textSecondary }]}
              >
                {t("profile.totalBalance")}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: themeColors.textPrimary }]}
          >
            {t("profile.settings")}
          </Text>
          <Text
            style={[styles.themeLabel, { color: themeColors.textSecondary }]}
          >
            {t("profile.appearance")}
          </Text>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(value) => setThemeMode(value as ThemeMode)}
            buttons={[
              {
                value: "system",
                label: t("profile.system"),
                icon: "cellphone",
              },
              {
                value: "light",
                label: t("profile.light"),
                icon: "white-balance-sunny",
              },
              {
                value: "dark",
                label: t("profile.dark"),
                icon: "moon-waning-crescent",
              },
            ]}
            style={styles.themeButtons}
          />
          <Text
            style={[styles.themeLabel, { color: themeColors.textSecondary }]}
          >
            {t("profile.language")}
          </Text>
          <SegmentedButtons
            value={language}
            onValueChange={handleLanguageChange}
            buttons={[
              { value: "en", label: "English" },
              { value: "fr", label: "Français" },
              { value: "mg", label: "Malagasy" },
            ]}
            style={styles.themeButtons}
          />
        </Card.Content>
        <Divider style={{ marginTop: spacing.md }} />

        <List.Item
          title={t("profile.changePassword")}
          description={t("profile.changePasswordDesc")}
          left={(props) => <List.Icon {...props} icon="lock" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setPasswordDialogVisible(true)}
        />
        <Divider />

        <List.Item
          title={t("profile.notifications")}
          description={t("profile.notificationsDesc")}
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            showToast(t("profile.notificationsComingSoon"), "info")
          }
        />
        <Divider />

        <List.Item
          title={t("profile.exportData")}
          description={t("profile.exportDataDesc")}
          left={(props) => <List.Icon {...props} icon="download" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showToast(t("profile.exportComingSoon"), "info")}
        />
      </Card>

      <Card style={styles.aboutCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t("profile.about")}</Text>
        </Card.Content>

        <List.Item
          title={t("profile.version")}
          description="1.0.0"
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <Divider />

        <List.Item
          title={t("profile.privacyPolicy")}
          left={(props) => <List.Icon {...props} icon="shield-check" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            showToast(t("profile.privacyPolicyComingSoon"), "info")
          }
        />
        <Divider />

        <List.Item
          title={t("profile.termsOfService")}
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => showToast(t("profile.termsComingSoon"), "info")}
        />
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={colors.error}
        icon="logout"
      >
        {t("auth.logout")}
      </Button>

      <Portal>
        <Dialog
          visible={passwordDialogVisible}
          onDismiss={() => setPasswordDialogVisible(false)}
        >
          <Dialog.Title>{t("profile.changePassword")}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label={t("profile.currentPassword")}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.dialogInput}
            />
            <TextInput
              mode="outlined"
              label={t("profile.newPassword")}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.dialogInput}
            />
            <TextInput
              mode="outlined"
              label={t("profile.confirmNewPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogVisible(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onPress={handleChangePassword}
              loading={isChangingPassword}
              disabled={isChangingPassword}
            >
              {t("profile.change")}
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
  themeLabel: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  themeButtons: {
    marginBottom: spacing.xs,
  },
});
