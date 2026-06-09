import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { useNotification } from '@/lib/notification';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function formatDate(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month} ${hour}:${minute}`;
}

function parseNotificationData(dataJson: string | null) {
  if (!dataJson) {
    return null;
  }

  try {
    return JSON.parse(dataJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function resolveRoute(notification: AppNotificationResponse) {
  const data = parseNotificationData(notification.dataJson);
  const directRoute = data?.route || data?.path || data?.pathname;

  if (typeof directRoute === 'string' && directRoute.startsWith('/')) {
    return directRoute;
  }

  const target = String(data?.screen ?? notification.sourceType ?? notification.type ?? '').toLowerCase();

  if (
    target.includes('vaccine')
    || target.includes('tiem')
    || target.includes('tiêm')
    || target.includes('vaccination')
  ) {
    return '/lichtiem/listlichtiem';
  }

  return null;
}

function getNotificationIcon(type?: string | null): IoniconName {
  const normalizedType = (type ?? '').toLowerCase();

  if (normalizedType.includes('vaccine') || normalizedType.includes('tiem')) {
    return 'shield-checkmark-outline';
  }
  if (normalizedType.includes('appointment') || normalizedType.includes('booking')) {
    return 'calendar-outline';
  }
  if (normalizedType.includes('chat')) {
    return 'chatbubble-ellipses-outline';
  }
  if (normalizedType.includes('promotion')) {
    return 'gift-outline';
  }

  return 'notifications-outline';
}

export default function NotificationsScreen() {
  const { showNotification } = useNotification();
  const [items, setItems] = useState<AppNotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const loadNotifications = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage('');

    try {
      const response = await getNotifications({ page: 0, size: 50 });
      setItems(response.content ?? []);
    } catch {
      setErrorMessage('Chưa tải được thông báo. Bạn thử lại sau một chút nhé.');
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
      setItems((current) => current.map((entry) => (
        entry.id === item.id ? { ...entry, read: true, status: 3 } : entry
      )));

      try {
        await markNotificationRead(item.id);
      } catch {
        setItems((current) => current.map((entry) => (
          entry.id === item.id ? { ...entry, read: false, status: item.status } : entry
        )));
        showNotification({
          type: 'error',
          title: 'Chưa đánh dấu đã đọc',
          message: 'Kết nối chưa ổn, bạn thử lại sau nhé.',
        });
      }
    }

    const route = resolveRoute(item);
    if (route) {
      router.push(route as any);
    }
  }

  async function handleReadAll() {
    if (!items.length || unreadCount === 0 || markingAll) {
      return;
    }

    const previousItems = items;
    setMarkingAll(true);
    setItems((current) => current.map((entry) => ({ ...entry, read: true, status: 3 })));

    try {
      await markAllNotificationsRead();
      showNotification({
        type: 'success',
        title: 'Đã đọc hết thông báo',
      });
    } catch {
      setItems(previousItems);
      showNotification({
        type: 'error',
        title: 'Chưa đọc hết được',
        message: 'Bạn thử lại sau một chút nhé.',
      });
    } finally {
      setMarkingAll(false);
    }
  }

  const renderHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home/home'))}
        style={styles.backButton}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
      </TouchableOpacity>

      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <Text style={styles.headerSubtitle}>
          {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Mẹ đã đọc hết thông báo'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.readAllButton,
          (!items.length || unreadCount === 0 || markingAll) && styles.disabledButton,
        ]}
        onPress={handleReadAll}
        activeOpacity={0.85}
        disabled={!items.length || unreadCount === 0 || markingAll}
      >
        {markingAll ? (
          <ActivityIndicator color="#FF8FAB" size="small" />
        ) : (
          <Ionicons name="checkmark-done" size={21} color="#FF8FAB" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    errorMessage ? (
      <View style={styles.errorBox}>
        <Ionicons name="alert-circle-outline" size={18} color="#F05F78" />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadNotifications('refresh')}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    ) : null
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentMint} />

      {renderHeader()}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#ff8fab" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={items.length ? styles.listContent : styles.emptyContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications('refresh')} />}
          ListHeaderComponent={renderError}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconBubble}>
                <Ionicons name="notifications-outline" size={34} color="#9EB2BF" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
              <Text style={styles.emptyText}>Khi có lịch tiêm, lịch hẹn hoặc nhắc nhở mới, mẹ sẽ thấy ở đây.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, !item.read && styles.unreadItem]}
              activeOpacity={0.85}
              onPress={() => handlePress(item)}
            >
              <View style={[styles.iconCircle, !item.read && styles.unreadIconCircle]}>
                <Ionicons
                  name={getNotificationIcon(item.type)}
                  size={19}
                  color={item.read ? '#7C91A0' : '#FF8FAB'}
                />
              </View>
              <View style={styles.itemBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  {!item.read ? <View style={styles.unreadDot} /> : null}
                </View>
                {item.body ? <Text style={styles.itemText} numberOfLines={3}>{item.body}</Text> : null}
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={13} color="#9EB2BF" />
                  <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
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
    top: 380,
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
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  backButton: {
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
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  headerTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#FF8FAB',
  },
  headerSubtitle: {
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  readAllButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.45,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  loadingText: {
    marginTop: 10,
    color: '#5C7A8A',
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 },
  emptyContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 80 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6F8',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD8E5',
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: '#9D2A42',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  retryButton: {
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#F05F78',
    fontSize: 12,
    fontWeight: '900',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyIconBubble: {
    width: 68,
    height: 68,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAF1F5',
    marginBottom: 12,
  },
  emptyTitle: { color: '#344955', fontSize: 17, fontWeight: '900' },
  emptyText: {
    marginTop: 6,
    color: '#7C91A0',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  unreadItem: { borderColor: '#FFD3DF', backgroundColor: '#FFF7F9' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF5F8',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  unreadIconCircle: { backgroundColor: '#FFE7EE' },
  itemBody: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemTitle: { flex: 1, color: '#344955', fontSize: 15, fontWeight: '900', lineHeight: 20 },
  itemText: { color: '#5C7A8A', fontSize: 13, fontWeight: '600', lineHeight: 19, marginTop: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  timeText: { color: '#9EB2BF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#FF8FAB', marginTop: 5 },
});
