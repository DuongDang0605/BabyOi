import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AppNotificationResponse,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api';

function formatDate(value: string | null) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function resolveRoute(notification: AppNotificationResponse) {
  if (!notification.dataJson) {
    return null;
  }

  try {
    const data = JSON.parse(notification.dataJson) as { screen?: string };
    if (data.screen === 'VaccineRecordDetail') {
      return '/lichtiem/listlichtiem';
    }
  } catch {
    return null;
  }

  return null;
}

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getNotifications({ page: 0, size: 50 });
      setItems(response.content ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadNotifications();
  }, [loadNotifications]));

  async function handlePress(item: AppNotificationResponse) {
    if (!item.read) {
      await markNotificationRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true, status: 3 } : entry));
    }

    const route = resolveRoute(item);
    if (route) {
      router.push(route as any);
    }
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    setItems((current) => current.map((entry) => ({ ...entry, read: true, status: 3 })));
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Thong bao',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton} onPress={handleReadAll}>
              <Ionicons name="checkmark-done" size={22} color="#ff8fab" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#ff8fab" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={items.length ? styles.listContent : styles.emptyContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications('refresh')} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-outline" size={40} color="#9eb2bf" />
              <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, !item.read && styles.unreadItem]}
              activeOpacity={0.85}
              onPress={() => handlePress(item)}
            >
              <View style={[styles.iconCircle, !item.read && styles.unreadIconCircle]}>
                <Ionicons name="notifications" size={18} color={item.read ? '#7c91a0' : '#ff8fab'} />
              </View>
              <View style={styles.itemBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  {!item.read ? <View style={styles.unreadDot} /> : null}
                </View>
                {item.body ? <Text style={styles.itemText} numberOfLines={3}>{item.body}</Text> : null}
                <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  emptyContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyBox: { alignItems: 'center', gap: 10 },
  emptyTitle: { color: '#7c91a0', fontSize: 16, fontWeight: '800' },
  item: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  unreadItem: { borderColor: '#ffd3df', backgroundColor: '#fff7f9' },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef5f8',
    marginRight: 12,
  },
  unreadIconCircle: { backgroundColor: '#ffe7ee' },
  itemBody: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemTitle: { flex: 1, color: '#344955', fontSize: 15, fontWeight: '900', lineHeight: 20 },
  itemText: { color: '#5c7a8a', fontSize: 13, fontWeight: '600', lineHeight: 19, marginTop: 4 },
  timeText: { color: '#9eb2bf', fontSize: 12, fontWeight: '700', marginTop: 8 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#ff8fab', marginTop: 5 },
});
