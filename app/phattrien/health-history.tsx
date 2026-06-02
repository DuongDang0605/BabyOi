import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HealthHistoryCard } from '../../components/phattrien/HealthHistoryCard';
import type { HealthRecordResponse } from '../../lib/api';
import { getHealthRecords } from '../../lib/api';
import { getFilterParams, type HealthFilterMode } from '../../lib/health-format';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const FILTERS: Array<{ label: string; value: HealthFilterMode }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hôm nay', value: 'day' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Năm nay', value: 'year' },
];

export default function HealthHistoryScreen() {
  const [records, setRecords] = useState<HealthRecordResponse[]>([]);
  const [filterMode, setFilterMode] = useState<HealthFilterMode>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile?.id) {
      setRecords([]);
      setError('Vui lòng chọn hồ sơ trước khi xem lịch sử sức khỏe.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getHealthRecords(profile.id, getFilterParams(filterMode));
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử sức khỏe.');
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  useFocusEffect(useCallback(() => {
    loadRecords();
  }, [loadRecords]));

  const renderState = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải lịch sử sức khỏe...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={26} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRecords}>
            <Text style={styles.retryText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (records.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="heart-outline" size={26} color="#A7E4F5" />
          <Text style={styles.stateText}>Chưa có chỉ số sức khỏe trong khoảng thời gian này.</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={records}
        renderItem={({ item }) => (
          <HealthHistoryCard
            item={item}
            onPress={(rec) => {
              const [year, month] = rec.recordDate.split('-');
              router.push({ pathname: '/phattrien/health-detail', params: { month, year } });
            }}
          />
        )}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderState}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Lịch Sử Sức Khỏe</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => router.push('/phattrien/update-index')}>
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="fitness" size={28} color="#FFF" />
              </View>
              <Text style={styles.listHeaderTitle}>Nhật ký phát triển</Text>
              <Text style={styles.headerSub}>Tổng hợp sức khỏe theo hồ sơ đang chọn</Text>
            </View>

            <View style={styles.filterRow}>
              {FILTERS.map((filter) => {
                const selected = filterMode === filter.value;
                return (
                  <TouchableOpacity
                    key={filter.value}
                    style={[styles.filterChip, selected && styles.filterChipActive]}
                    onPress={() => setFilterMode(filter.value)}
                  >
                    <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7EE' },
  listContent: { padding: 20, paddingBottom: 60 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { width: 45 },
  addButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF8FAB', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  listHeader: { marginBottom: 16, backgroundColor: '#FFF', borderRadius: 26, padding: 18, borderWidth: 1.5, borderColor: '#FFE5EC', shadowColor: '#FFB6C1', shadowOpacity: 0.12, shadowRadius: 12, elevation: 3 },
  heroIconWrap: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#A7E4F5', alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: '#A7E4F5', shadowOpacity: 0.28, shadowRadius: 8, elevation: 2 },
  listHeaderTitle: { fontSize: 20, fontWeight: '900', color: '#5C7A8A' },
  headerSub: { fontSize: 13, color: '#7D8D97', fontWeight: '600', marginTop: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  filterChip: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FFE5EC', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, shadowColor: '#FFB6C1', shadowOpacity: 0.08, shadowRadius: 5, elevation: 1 },
  filterChipActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB', shadowOpacity: 0.22 },
  filterText: { color: '#5C7A8A', fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#FFF' },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 45, paddingHorizontal: 20 },
  stateText: { color: '#5C7A8A', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  retryBtn: { backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, marginTop: 12 },
  retryText: { color: '#FFF', fontWeight: '900' },
});
