import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import { getNotificationSettings, NotificationSettingsResponse, updateNotificationSettings } from '@/lib/api';
import { useNotification } from '@/lib/notification';

export default function SettingScreen() {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
});
