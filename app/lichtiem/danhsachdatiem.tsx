import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * REFACTOR: Sử dụng profileId động
 * API: GET /api/vaccine-records/profile/{profileId}?status=3
 */

export default function FinishedVaccinesScreen() {
  const { profileId } = useLocalSearchParams();
  const [finishedVaccines, setFinishedVaccines] = useState([]);

  useEffect(() => {
    if (profileId) {
      console.log(`Gọi API GET /api/vaccine-records/profile/${profileId}?status=3`);
      // Sau khi fetch, setFinishedVaccines(response.data);
    }
  }, [profileId]);

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

        {finishedVaccines.map((vaccine: any) => (
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
                <Text style={styles.detailValue}>{vaccine.location || "Chưa cập nhật"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>💰 Chi phí:</Text>
                <Text style={styles.detailValue}>
                  {vaccine.price ? `${vaccine.price.toLocaleString()}đ` : "Miễn phí"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
                <Text style={styles.detailValue}>{vaccine.note}</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>✅</Text>
              <Text style={styles.dateText}>Hoàn thành ngày: {vaccine.injectionDate}</Text>
            </View>
          </View>
        ))}

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
});
