import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { HealthMonthlyDetailResponse } from '../../lib/api';
import { getHealthMonthlyDetail } from '../../lib/api';
import { formatNullableNumber, getIllnessStatusLabel, toDisplayDate } from '../../lib/health-format';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

export default function HealthDetailScreen() {
  const params = useLocalSearchParams<{ month?: string; year?: string }>();
  const [detail, setDetail] = useState<HealthMonthlyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const month = useMemo(() => {
    const parsed = Number(params.month || new Date().getMonth() + 1);
    return Number.isFinite(parsed) && parsed >= 1 && parsed <= 12 ? parsed : new Date().getMonth() + 1;
  }, [params.month]);
  const year = useMemo(() => {
    const parsed = Number(params.year || new Date().getFullYear());
    return Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  }, [params.year]);
  const formattedDate = `${String(month).padStart(2, '0')}/${year}`;

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      const profile = getSelectedProfile() || await hydrateSelectedProfile();
      if (!profile?.id) {
        if (mounted) {
          setError('Vui lòng chọn hồ sơ trước khi xem chi tiết sức khỏe.');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getHealthMonthlyDetail(profile.id, { month, year });
        if (mounted) {
          setDetail(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải chi tiết sức khỏe.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [month, year]);

  const healthRecord = detail?.healthRecord;
  const illnesses = detail?.illnesses || [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{formattedDate}</Text>
          <View style={{ width: 45 }} />
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#FF8FAB" />
            <Text style={styles.stateText}>Đang tải chi tiết sức khỏe...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons name="warning-outline" size={28} color="#FF8FAB" />
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="body-outline" size={20} color="#FF8FAB" />
              <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.weightStat]}>
                <Ionicons name="scale-outline" size={20} color="#98D8AA" style={styles.statIcon} />
                <Text style={styles.statLabel}>Cân nặng</Text>
                <Text style={styles.statValue}>{formatNullableNumber(healthRecord?.weight)}<Text style={styles.unit}>kg</Text></Text>
              </View>
              <View style={[styles.statCard, styles.heightStat]}>
                <Ionicons name="body-outline" size={20} color="#3DB9D3" style={styles.statIcon} />
                <Text style={styles.statLabel}>Chiều cao</Text>
                <Text style={styles.statValue}>{formatNullableNumber(healthRecord?.height)}<Text style={styles.unit}>cm</Text></Text>
              </View>
              <View style={[styles.statCard, styles.tdeeStat]}>
                <Ionicons name="flame-outline" size={20} color="#98D8AA" style={styles.statIcon} />
                <Text style={styles.statLabel}>TDEE</Text>
                <Text style={[styles.statValue, { color: '#A7E4F5' }]}>{formatNullableNumber(healthRecord?.tdee, 0)}<Text style={styles.unit}>kcal</Text></Text>
              </View>
            </View>
            {!!healthRecord?.tdeeNote && (
              <View style={styles.tdeeNoteBox}>
                <Ionicons name="information-circle-outline" size={16} color="#3DB9D3" />
                <Text style={styles.tdeeNoteText}>{healthRecord.tdeeNote}</Text>
              </View>
            )}

            <View style={[styles.sectionHeader, { marginTop: 30 }]}>
              <Ionicons name="medkit-outline" size={20} color="#FF8FAB" />
              <Text style={styles.sectionTitle}>Các đợt bệnh</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>{illnesses.length}</Text>
              </View>
            </View>

            {illnesses.length > 0 ? (
              illnesses.map((item) => (
                <View key={item.id} style={styles.illnessCard}>
                  <View style={styles.illnessHeader}>
                    <Text style={styles.illnessName}>{item.illnessType}</Text>
                    <View style={styles.severityTag}>
                      <Text style={styles.severityText}>{getIllnessStatusLabel(item.status, item.statusLabel)}</Text>
                    </View>
                  </View>

                  <View style={styles.timeRow}>
                    <View style={styles.timeItem}>
                      <Ionicons name="calendar-outline" size={14} color="#999" />
                      <Text style={styles.timeText}>Bắt đầu: <Text style={styles.timeBold}>{toDisplayDate(item.startAt)}</Text></Text>
                    </View>
                    <View style={styles.timeItem}>
                      <Ionicons name="flag-outline" size={14} color="#999" />
                      <Text style={styles.timeText}>Kết thúc: <Text style={styles.timeBold}>{toDisplayDate(item.endAt)}</Text></Text>
                    </View>
                  </View>

                  {!!item.description && (
                    <View style={styles.descBox}>
                      <Text style={styles.descTitle}>Miêu tả bệnh:</Text>
                      <Text style={styles.descText}>{item.description}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-circle-outline" size={40} color="#98D8AA" />
                <Text style={styles.emptyText}>Không có đợt bệnh nào trong tháng này.</Text>
              </View>
            )}
          </>
        )}

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, borderWidth: 1, borderColor: '#FFE5EC' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  badgeCount: { backgroundColor: '#FF8FAB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', gap: 8, backgroundColor: '#FFF', borderRadius: 25, padding: 12, elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.14, shadowRadius: 10, borderWidth: 1.5, borderColor: '#FFE5EC' },
  statCard: { flex: 1, alignItems: 'center', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 4 },
  weightStat: { backgroundColor: '#F1FBF4' },
  heightStat: { backgroundColor: '#EFFBFE' },
  tdeeStat: { backgroundColor: '#F1FBF4' },
  statIcon: { marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#333' },
  unit: { fontSize: 12, color: '#999' },
  tdeeNoteBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFFBFE', borderRadius: 16, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#DDF5FB' },
  tdeeNoteText: { flex: 1, color: '#5C7A8A', fontSize: 12, fontWeight: '700', lineHeight: 16 },
  illnessCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#FFD166', elevation: 3, shadowColor: '#FFD166', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.14, shadowRadius: 8, borderWidth: 1, borderColor: '#FFF3D5' },
  illnessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  illnessName: { fontSize: 16, fontWeight: '800', color: '#FF8FAB', flex: 1 },
  severityTag: { backgroundColor: '#FFF0F3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  severityText: { fontSize: 10, color: '#FF8FAB', fontWeight: '800' },
  timeRow: { flexDirection: 'column', gap: 6, marginBottom: 12, backgroundColor: '#EFFBFE', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#DDF5FB' },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 13, color: '#666' },
  timeBold: { fontWeight: '700', color: '#5C7A8A' },
  descBox: { marginTop: 5, backgroundColor: '#FFF9EB', padding: 10, borderRadius: 12 },
  descTitle: { fontSize: 13, fontWeight: '800', color: '#5C7A8A', marginBottom: 4 },
  descText: { fontSize: 13, color: '#777', lineHeight: 18, fontStyle: 'italic' },
  emptyBox: { alignItems: 'center', marginTop: 20, gap: 10 },
  emptyText: { color: '#999', fontWeight: '600', textAlign: 'center' },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  stateText: { color: '#5C7A8A', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10 },
});
