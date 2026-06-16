import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { deleteCurrentAccount, getNotificationSettings, NotificationSettingsResponse, updateNotificationSettings } from '@/lib/api';
import { clearAuthSession } from '@/lib/auth-session';
import { useNotification } from '@/lib/notification';
import { clearSelectedProfile } from '@/lib/profile-session';
import { deactivateCurrentDeviceToken } from '@/lib/push-notifications';

export default function SettingScreen() {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    getNotificationSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  async function toggleSetting(key: keyof NotificationSettingsResponse, value: boolean) {
    const previous = settings;
    setSettings((current) => current ? { ...current, [key]: value } : current);
    try {
      const updated = await updateNotificationSettings({ [key]: value });
      setSettings(updated);
    } catch {
      setSettings(previous);
      showNotification({
        type: 'error',
        title: 'Chưa lưu được cài đặt',
        message: 'Mẹ thử lại sau một chút nhé.',
      });
    }
  }

  async function deleteAccount() {
    try {
      setDeletingAccount(true);
      try {
        await deactivateCurrentDeviceToken();
      } catch {
        // The account deletion endpoint will invalidate server-side device tokens.
      }

      await deleteCurrentAccount();
      await clearSelectedProfile();
      await clearAuthSession();
      router.replace('/auth/login');
    } catch {
      showNotification({
        type: 'error',
        title: 'Chưa xóa được tài khoản',
        message: 'Mẹ thử lại sau một chút nhé.',
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Xóa tài khoản BabyOi?',
      'Tài khoản và dữ liệu cá nhân liên quan sẽ được xóa hoặc vô danh hóa khỏi BabyOi. Một số bản ghi kỹ thuật có thể được giữ lại nếu cần cho bảo mật hoặc nghĩa vụ pháp lý.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Cài đặt', headerShadowVisible: false }} />
      <View style={styles.card}>
        <Text style={styles.title}>Cài đặt</Text>
        <Text style={styles.sectionTitle}>Thông báo</Text>

        {loading || !settings ? (
          <ActivityIndicator color="#ff8fab" />
        ) : (
          <>
            <SettingRow label="Push ngoài điện thoại" value={settings.pushEnabled} onValueChange={(value) => toggleSetting('pushEnabled', value)} />
            <SettingRow label="Nhắc lịch tiêm" value={settings.vaccineEnabled} onValueChange={(value) => toggleSetting('vaccineEnabled', value)} />
            <SettingRow label="Đặt lịch" value={settings.appointmentEnabled} onValueChange={(value) => toggleSetting('appointmentEnabled', value)} />
            <SettingRow label="Tin nhắn" value={settings.chatEnabled} onValueChange={(value) => toggleSetting('chatEnabled', value)} />
            <SettingRow label="Khuyến mãi" value={settings.promotionEnabled} onValueChange={(value) => toggleSetting('promotionEnabled', value)} />
            <SettingRow label="Hệ thống" value={settings.systemEnabled} onValueChange={(value) => toggleSetting('systemEnabled', value)} />
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/legal/privacy-policy' as any)}
          activeOpacity={0.82}
        >
          <Text style={styles.linkRowText}>Chính sách quyền riêng tư</Text>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <TouchableOpacity
          style={[styles.deleteButton, deletingAccount && styles.disabledButton]}
          disabled={deletingAccount}
          onPress={confirmDeleteAccount}
          activeOpacity={0.84}
        >
          {deletingAccount ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SettingRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d8e3e8', true: '#ffd3df' }}
        thumbColor={value ? '#ff8fab' : '#ffffff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f0f4f8',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#344955',
    marginBottom: 10,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  rowText: {
    color: '#5c7a8a',
    fontSize: 15,
    fontWeight: '800',
  },
  linkRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkRowText: {
    color: '#5c7a8a',
    fontSize: 15,
    fontWeight: '800',
  },
  linkArrow: {
    color: '#ff8fab',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
