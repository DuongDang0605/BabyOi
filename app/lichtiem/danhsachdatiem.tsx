import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getVaccineRecordsByProfile, type VaccineRecordResponse } from '../../lib/api';

export default function FinishedVaccinesScreen() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const [finishedVaccines, setFinishedVaccines] = useState<VaccineRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFinishedVaccines = async () => {
      const parsedProfileId = Number(Array.isArray(profileId) ? profileId[0] : profileId);

      if (!Number.isFinite(parsedProfileId)) {
        setFinishedVaccines([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getVaccineRecordsByProfile(parsedProfileId, { status: 3 });
        setFinishedVaccines([...data].sort((left, right) => new Date(right.injectionDate).getTime() - new Date(left.injectionDate).getTime()));
      } catch {
        setFinishedVaccines([]);
      } finally {
        setLoading(false);
      }
    };

    loadFinishedVaccines();
  }, [profileId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color="#ff8fab" />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đã Hoàn Thành</Text>
          <View style={styles.rightPlaceholder} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroText}>Bé đã dũng cảm hoàn thành</Text>
          <Text style={styles.heroNumber}>{finishedVaccines.length} mũi tiêm</Text>
          <Text style={styles.heroSubtext}>Ba mẹ thật tuyệt vời! 💖</Text>
        </View>

        {finishedVaccines.length > 0 ? (
          finishedVaccines.map((vaccine) => (
            <View key={vaccine.id} style={styles.vaccineCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.vaccineName}>{vaccine.vaccineTypeName}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Đã tiêm</Text>
                </View>
              </View>

              <Text style={styles.vaccineDesc}>{vaccine.vaccineTypeDescription}</Text>

              <View style={styles.detailBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📍 Nơi tiêm:</Text>
                  <Text style={styles.detailValue}>{vaccine.location || 'Chưa cập nhật'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>💰 Chi phí:</Text>
                  <Text style={styles.detailValue}>{vaccine.price ? `${vaccine.price.toLocaleString()}đ` : 'Miễn phí'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
                  <Text style={styles.detailValue}>{vaccine.note || 'Không có ghi chú'}</Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>✅</Text>
                <Text style={styles.dateText}>Hoàn thành ngày: {vaccine.injectionDate}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có mũi tiêm đã hoàn thành.</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  rightPlaceholder: { width: 45 },
  heroSection: { alignItems: 'center', marginBottom: 25, paddingVertical: 15 },
  heroText: { fontSize: 15, color: '#5c7a8a', fontWeight: '600', marginBottom: 4 },
  heroNumber: { fontSize: 28, fontWeight: '900', color: '#a3d9b1', marginBottom: 4 },
  heroSubtext: { fontSize: 14, color: '#ff8fab', fontWeight: 'bold' },
  vaccineCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 2, borderColor: '#eafaf1', elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  vaccineName: { fontSize: 16, fontWeight: '900', color: '#334455', flex: 1, marginRight: 10 },
  statusBadge: { backgroundColor: '#eafaf1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  statusText: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
  vaccineDesc: { fontSize: 14, color: '#666666', marginBottom: 15, lineHeight: 22 },
  detailBox: { backgroundColor: '#f8fdfa', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eafaf1' },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#7a8c99', width: 75, fontWeight: '700' },
  detailValue: { fontSize: 13, color: '#334455', flex: 1, fontWeight: '600', lineHeight: 20 },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef9f3', padding: 12, borderRadius: 12 },
  dateIcon: { marginRight: 8, fontSize: 15 },
  dateText: { fontSize: 14, color: '#5c7a8a', fontWeight: '800' },
  emptyText: { textAlign: 'center', color: '#8899aa', marginTop: 20 },
});
