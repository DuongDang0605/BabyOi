import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * API: VaccineRecordResponse (Đã có vaccineTypeDescription từ BE)
 * status = -1: Pending
 */

export default function UpcomingVaccinesScreen() {
  const [upcomingVaccines, setUpcomingVaccines] = useState([]);

  useEffect(() => {
    // Logic: Fetch upcoming vaccines
    // GET /api/vaccine-records/profile/1?status=-1
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch Sắp Tới</Text>
          <View style={styles.rightPlaceholder} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroText}>Tháng tới bé sẽ có thêm các mốc quan trọng! 🎉</Text>
          <Text style={styles.heroSubtext}>Mẹ nhớ đặt lịch để bảo vệ sức khỏe cho con nhé.</Text>
        </View>

        {upcomingVaccines.length > 0 ? upcomingVaccines.map((vaccine: any) => (
          <View key={vaccine.id} style={styles.vaccineCard}>
            
            <View style={styles.cardHeader}>
              <Text style={styles.vaccineName}>{vaccine.vaccineTypeName}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Sắp tới</Text>
              </View>
            </View>
            
            {/* Sử dụng vaccineTypeDescription từ BE */}
            <Text style={styles.vaccineDesc}>
              {vaccine.vaccineTypeDescription || "Phòng bệnh theo chỉ định của bác sĩ."}
            </Text>

            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>Dự kiến: {vaccine.injectionDate}</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => router.push({
                pathname: '/lichtiem/datlichtiem',
                params: {
                  vaccineTypeId: vaccine.vaccineTypeId,
                  vaccineName: vaccine.vaccineTypeName
                }
              })}
            >
              <Text style={styles.bookButtonText}>💉 Đặt lịch tiêm ngay</Text>
            </TouchableOpacity>

          </View>
        )) : (
          <Text style={{ textAlign: 'center', color: '#8899aa', marginTop: 20 }}>Không có lịch tiêm sắp tới.</Text>
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
  heroSection: { alignItems: 'center', marginBottom: 25, paddingVertical: 15, backgroundColor: '#fffcf5', borderRadius: 20, borderWidth: 2, borderColor: '#ffe08a', borderStyle: 'dashed' },
  heroText: { fontSize: 16, color: '#d46b08', fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  heroSubtext: { fontSize: 14, color: '#5c7a8a', fontWeight: '600', textAlign: 'center', paddingHorizontal: 10 },
  vaccineCard: { backgroundColor: '#fffcf5', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 2, borderColor: '#ffe08a', elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  vaccineName: { fontSize: 16, fontWeight: '900', color: '#334455', flex: 1, marginRight: 10 },
  statusBadge: { backgroundColor: '#fff0cb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  statusText: { color: '#d46b08', fontSize: 12, fontWeight: 'bold' },
  vaccineDesc: { fontSize: 14, color: '#666666', marginBottom: 15, lineHeight: 22 },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 12, borderRadius: 12 },
  dateIcon: { marginRight: 8, fontSize: 15 },
  dateText: { fontSize: 14, color: '#5c7a8a', fontWeight: '800' },
  bookButton: { backgroundColor: '#ff9c6e', paddingVertical: 14, borderRadius: 15, alignItems: 'center', marginTop: 15, elevation: 2 },
  bookButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
});
