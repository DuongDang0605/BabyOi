import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GrowthLineChart } from '../../components/phattrien/GrowthLineChart';
import { GrowthSummary } from '../../components/phattrien/GrowthSummary';
import type { HealthRecordResponse } from '../../lib/api';
import { getHealthRecords } from '../../lib/api';
import { formatNullableNumber, toDisplayMonth } from '../../lib/health-format';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

function buildChartData(records: HealthRecordResponse[]) {
  const ordered = [...records].sort((a, b) => a.recordDate.localeCompare(b.recordDate)).slice(-7);

  return {
    labels: ordered.map((item) => toDisplayMonth(item.recordDate).slice(0, 2)),
    datasets: [
      { data: ordered.map((item) => item.weight || 0), color: () => '#98D8AA', strokeWidth: 3 },
      { data: ordered.map((item) => item.height || 0), color: () => '#FFD166', strokeWidth: 3 },
      { data: ordered.map((item) => item.bmi || 0), color: () => '#C1F0D0', strokeWidth: 3 },
    ],
  };
}

export default function GrowthChartsScreen() {
  const [records, setRecords] = useState<HealthRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile?.id) {
      setError('Vui lòng chọn hồ sơ trước khi xem sức khỏe.');
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getHealthRecords(profile.id);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu sức khỏe.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadRecords();
  }, [loadRecords]));

  const latest = records[0] || null;
  const chartData = useMemo(() => buildChartData(records), [records]);
  const hasChartData = records.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sức khỏe</Text>
          <View style={{ width: 45 }} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBubbleTop} />
          <View style={styles.heroBubbleBottom} />
          <View style={styles.heroIcon}>
            <Ionicons name="heart-circle" size={34} color="#FFF" />
          </View>
          <View style={styles.heroTextGroup}>
            <Text style={styles.heroTitle}>Theo dõi thể chất</Text>
            <Text style={styles.heroSubtitle}>Cập nhật chỉ số, xem xu hướng và lịch sử sức khỏe của bé.</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#FF8FAB" />
            <Text style={styles.stateText}>Đang tải chỉ số sức khỏe...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons name="warning-outline" size={28} color="#FF8FAB" />
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadRecords}>
              <Text style={styles.retryText}>Tải lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <GrowthSummary
              weight={formatNullableNumber(latest?.weight)}
              height={formatNullableNumber(latest?.height)}
              bmi={formatNullableNumber(latest?.bmi)}
            />

            {hasChartData ? (
              <GrowthLineChart data={chartData} title="Lịch sử phát triển" />
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="bar-chart-outline" size={28} color="#A7E4F5" />
                <Text style={styles.emptyChartText}>Chưa có dữ liệu biểu đồ. Hãy cập nhật chỉ số đầu tiên.</Text>
              </View>
            )}

            <View style={styles.aiBox}>
              <Ionicons name="sparkles" size={24} color="#FF8FAB" />
              <Text style={styles.aiText}>
                {latest
                  ? `Chỉ số mới nhất được ghi nhận ngày ${latest.recordDate}. Mẹ có thể cập nhật thêm để biểu đồ theo dõi sát hơn.`
                  : 'Hãy nhập chỉ số sức khỏe đầu tiên để hệ thống bắt đầu theo dõi.'}
              </Text>
            </View>
          </>
        )}

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.longButton}
            onPress={() => router.push('/phattrien/update-index')}
          >
            <View style={[styles.btnIconCircle, { backgroundColor: '#FF8FAB' }]}>
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text style={styles.longButtonText}>Cập nhật lại chỉ số</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFB6C1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.longButton, { borderColor: '#E8F5E9' }]}
            onPress={() => router.push('/phattrien/daily-schedule')}
          >
            <View style={[styles.btnIconCircle, { backgroundColor: '#98D8AA' }]}>
              <Ionicons name="calendar-outline" size={22} color="white" />
            </View>
            <Text style={[styles.longButtonText, { color: '#5C7A8A' }]}>Lịch sinh hoạt của bé</Text>
            <Ionicons name="chevron-forward" size={20} color="#98D8AA" />
          </TouchableOpacity>

          <View style={styles.rowButtons}>
            <TouchableOpacity
              style={styles.halfButton}
              onPress={() => router.push('/phattrien/health-history')}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: '#A7E4F5', marginBottom: 8 }]}>
                <Ionicons name="heart-outline" size={20} color="white" />
              </View>
              <Text style={styles.halfButtonText}>Lịch sử sức khỏe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.halfButton}
              onPress={() => router.push('/phattrien/illness-history')}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: '#FFD166', marginBottom: 8 }]}>
                <Ionicons name="medkit-outline" size={20} color="white" />
              </View>
              <Text style={styles.halfButtonText}>Lịch sử bị bệnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7EE' },
  scrollContent: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  heroCard: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden', backgroundColor: '#FF8FAB', borderRadius: 28, padding: 18, marginBottom: 20, shadowColor: '#FF8FAB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 5 },
  heroBubbleTop: { position: 'absolute', right: -28, top: -30, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.24)' },
  heroBubbleBottom: { position: 'absolute', left: 112, bottom: -46, width: 122, height: 122, borderRadius: 61, backgroundColor: 'rgba(255,209,102,0.32)' },
  heroIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  heroTextGroup: { flex: 1 },
  heroTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  heroSubtitle: { color: '#FFF8FA', fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 4 },
  aiBox: { flexDirection: 'row', backgroundColor: '#FFF0F3', padding: 15, borderRadius: 20, marginTop: 20, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFE0E9' },
  aiText: { flex: 1, marginLeft: 10, color: '#FF8FAB', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  buttonGroup: { marginTop: 20, gap: 12 },
  longButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, borderWidth: 1.5, borderColor: '#FFE5EC', elevation: 3, shadowColor: '#FFB6C1', shadowOpacity: 0.12, shadowRadius: 8 },
  longButtonText: { flex: 1, fontSize: 15, fontWeight: '800', color: '#FF8FAB', marginLeft: 12 },
  rowButtons: { flexDirection: 'row', gap: 12 },
  halfButton: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 25, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#8BDDEC', shadowOpacity: 0.1, shadowRadius: 8 },
  halfButtonText: { fontSize: 12, fontWeight: '800', color: '#5C7A8A', textAlign: 'center' },
  btnIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  stateText: { color: '#5C7A8A', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  retryBtn: { backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, marginTop: 12 },
  retryText: { color: '#FFF', fontWeight: '900' },
  emptyChart: { backgroundColor: '#FFF', borderRadius: 24, padding: 22, alignItems: 'center', borderWidth: 1.5, borderColor: '#E9F8FD' },
  emptyChartText: { color: '#5C7A8A', fontSize: 13, fontWeight: '700', marginTop: 8, textAlign: 'center' },
});
