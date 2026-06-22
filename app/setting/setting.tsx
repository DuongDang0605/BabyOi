import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import {
  getNotificationSettings,
  NotificationSettingsPayload,
  NotificationSettingsResponse,
  updateNotificationSettings,
} from '@/lib/api';
import { useNotification } from '@/lib/notification';

type NotificationCategoryKey = 'vaccineEnabled' | 'appointmentEnabled' | 'chatEnabled' | 'promotionEnabled' | 'systemEnabled';

const NOTIFICATION_ROWS: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  key: NotificationCategoryKey;
}[] = [
  { label: 'Nhắc lịch tiêm', description: 'Lịch sắp tiêm và mũi quá hạn', icon: 'shield-checkmark-outline', color: '#5ABF7A', key: 'vaccineEnabled' },
  { label: 'Đặt lịch', description: 'Trạng thái và lịch hẹn khám', icon: 'calendar-outline', color: '#4D9DE0', key: 'appointmentEnabled' },
  { label: 'Tin nhắn', description: 'Tin nhắn và trao đổi mới', icon: 'chatbubble-ellipses-outline', color: '#FF9F43', key: 'chatEnabled' },
  { label: 'Khuyến mãi', description: 'Ưu đãi dành cho mẹ và bé', icon: 'gift-outline', color: '#E56B9F', key: 'promotionEnabled' },
  { label: 'Hệ thống', description: 'Bảo mật và cập nhật dịch vụ', icon: 'information-circle-outline', color: '#7C91A0', key: 'systemEnabled' },
];

const CHANNEL_KEYS_BY_CATEGORY: Record<NotificationCategoryKey, (keyof NotificationSettingsResponse)[]> = {
  vaccineEnabled: ['vaccineInAppEnabled', 'vaccinePushEnabled'],
  appointmentEnabled: ['appointmentInAppEnabled', 'appointmentPushEnabled'],
  chatEnabled: ['chatInAppEnabled', 'chatPushEnabled'],
  promotionEnabled: ['promotionInAppEnabled', 'promotionPushEnabled'],
  systemEnabled: ['systemInAppEnabled', 'systemPushEnabled'],
};

export default function SettingScreen() {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationSettings()
      .then(setSettings)
      .catch(() => {
        showNotification({
          type: 'error',
          title: 'Chưa tải được cài đặt',
          message: 'Mẹ thử lại sau một chút nhé.',
        });
      })
      .finally(() => setLoading(false));
  }, [showNotification]);

  function buildNotificationPayload(key: NotificationCategoryKey, value: boolean) {
    const payload: NotificationSettingsPayload = { [key]: value };
    CHANNEL_KEYS_BY_CATEGORY[key].forEach((channelKey) => {
      payload[channelKey] = value;
    });
    if (value) {
      payload.pushEnabled = true;
    }
    return payload;
  }

  async function toggleNotificationType(key: NotificationCategoryKey, value: boolean) {
    const previous = settings;
    const payload = buildNotificationPayload(key, value);
    setSettings((current) => current ? { ...current, ...payload } : current);
    try {
      const updated = await updateNotificationSettings(payload);
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
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentMint} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => router.replace('/home/home')}
            style={styles.headerButton}
            activeOpacity={0.85}
            accessibilityLabel="Quay về trang chủ"
          >
            <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Cài đặt</Text>
            <Text style={styles.headerSubtitle}>Cá nhân hóa trải nghiệm BabyOi</Text>
          </View>

          <View style={styles.headerButton}>
            <Ionicons name="settings-outline" size={22} color="#5ABF7A" />
          </View>
        </View>

        <LinearGradient colors={['#FFFFFF', '#FFF8FA']} style={styles.introBanner}>
          <View style={styles.introIcon}>
            <Ionicons name="notifications-outline" size={22} color="#FF8FAB" />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Thông báo của mẹ</Text>
            <Text style={styles.introText}>Mỗi công tắc áp dụng đồng thời cho thông báo trong app và ngoài điện thoại.</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Loại thông báo</Text>
        <View style={styles.settingsGroup}>
          {loading || !settings ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#FF8FAB" />
              <Text style={styles.loadingText}>Đang tải cài đặt...</Text>
            </View>
          ) : (
            NOTIFICATION_ROWS.map((item, index) => (
              <SettingRow
                key={item.key}
                label={item.label}
                description={item.description}
                icon={item.icon}
                color={item.color}
                value={Boolean(settings[item.key])}
                isLast={index === NOTIFICATION_ROWS.length - 1}
                onValueChange={(value) => toggleNotificationType(item.key, value)}
              />
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/legal/privacy-policy' as any)}
          activeOpacity={0.82}
        >
          <View style={styles.linkIcon}>
            <Ionicons name="shield-checkmark-outline" size={21} color="#4D9DE0" />
          </View>
          <View style={styles.linkCopy}>
            <Text style={styles.linkRowText}>Chính sách quyền riêng tư</Text>
            <Text style={styles.linkHint}>Cách BabyOi bảo vệ và sử dụng dữ liệu</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9AAAB5" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SettingRow({
  label,
  description,
  icon,
  color,
  value,
  isLast,
  onValueChange,
}: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: boolean;
  isLast: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={[styles.row, isLast && styles.lastRow]}>
      <View style={[styles.rowIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowText}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D8E3E8', true: '#FFD3DF' }}
        thumbColor={value ? '#FF8FAB' : '#FFFFFF'}
        accessibilityLabel={`Bật hoặc tắt thông báo ${label}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  backgroundAccentTop: {
    position: 'absolute',
    top: 62,
    left: -42,
    width: 154,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 182, 193, 0.18)',
    transform: [{ rotate: '-18deg' }],
  },
  backgroundAccentMint: {
    position: 'absolute',
    top: 430,
    right: -44,
    width: 144,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(184, 239, 207, 0.24)',
    transform: [{ rotate: '18deg' }],
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 56,
    marginBottom: 18,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { textAlign: 'center', fontSize: 24, fontWeight: '900', color: '#FF8FAB' },
  headerSubtitle: { color: '#5C7A8A', fontSize: 12, fontWeight: '800', marginTop: 3 },
  introBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    marginBottom: 24,
  },
  introIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEAF0',
    marginRight: 12,
  },
  introCopy: { flex: 1 },
  introTitle: { color: '#344955', fontSize: 15, fontWeight: '900', marginBottom: 3 },
  introText: { color: '#6E8593', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  sectionTitle: { color: '#344955', fontSize: 16, fontWeight: '900', marginBottom: 10 },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F5',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  loadingBox: { minHeight: 100, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#7A8C99', fontSize: 12, fontWeight: '700', marginTop: 8 },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  lastRow: { borderBottomWidth: 0 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowCopy: { flex: 1, paddingVertical: 12, paddingRight: 8 },
  rowText: { color: '#344955', fontSize: 14, fontWeight: '900' },
  rowDescription: { color: '#8496A2', fontSize: 11, fontWeight: '700', lineHeight: 16, marginTop: 2 },
  linkRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F5',
  },
  linkIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5FC', marginRight: 12 },
  linkCopy: { flex: 1, paddingVertical: 12, paddingRight: 8 },
  linkRowText: { color: '#344955', fontSize: 14, fontWeight: '900' },
  linkHint: { color: '#8496A2', fontSize: 11, fontWeight: '700', lineHeight: 16, marginTop: 2 },
});
