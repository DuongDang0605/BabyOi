import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { deleteVaccineRecord, getVaccineRecordsByProfile, type VaccineRecordResponse } from '../../lib/api';
import { useNotification } from '../../lib/notification';

export default function UpcomingVaccinesScreen() {
  const { showNotification } = useNotification();
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const [upcomingVaccines, setUpcomingVaccines] = useState<VaccineRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpcomingVaccines = async () => {
      const parsedProfileId = Number(Array.isArray(profileId) ? profileId[0] : profileId);

      if (!Number.isFinite(parsedProfileId)) {
        setUpcomingVaccines([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getVaccineRecordsByProfile(parsedProfileId, { status: -1 });
        setUpcomingVaccines([...data].sort((left, right) => new Date(left.injectionDate).getTime() - new Date(right.injectionDate).getTime()));
      } catch (error) {
        console.error('Lỗi tải danh sách sắp tới:', error);
        setUpcomingVaccines([]);
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingVaccines();
  }, [profileId]);

  const handleCancelVaccine = async (recordId: number) => {
    Alert.alert('Hủy lịch tiêm', 'Bạn có chắc chắn muốn hủy lịch này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lịch',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVaccineRecord(recordId);
            setUpcomingVaccines((current) => current.filter((item) => item.id !== recordId));
            showNotification({
              type: 'success',
              title: 'Đã hủy lịch tiêm',
              message: 'Lịch tiêm đã được xoá thành công.',
            });
          } catch (error) {
            console.error('Lỗi hủy lịch tiêm:', error);
            showNotification({
              type: 'error',
              title: 'Không thể hủy lịch',
              message: 'Vui lòng thử lại sau.',
            });
          }
        },
      },
    ]);
  };

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
          <Text style={styles.headerTitle}>Lịch Sắp Tới</Text>
          <View style={styles.rightPlaceholder} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroText}>Tháng tới bé sẽ có thêm các mốc quan trọng! 🎉</Text>
          <Text style={styles.heroSubtext}>Mẹ nhớ đặt lịch để bảo vệ sức khỏe cho con nhé.</Text>
        </View>

        {upcomingVaccines.length > 0 ? (
          upcomingVaccines.map((vaccine) => (
            <View key={vaccine.id} style={styles.vaccineCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.vaccineName}>{vaccine.vaccineTypeName}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Sắp tới</Text>
                </View>
              </View>

              <Text style={styles.vaccineDesc}>{vaccine.vaccineTypeDescription || 'Phòng bệnh theo chỉ định của bác sĩ.'}</Text>

              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>Dự kiến: {vaccine.injectionDate}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() =>
                    router.push({
                      pathname: '/lichtiem/themmuitiem',
                      params: {
                        profileId,
                        mode: 'confirm',
                        recordId: vaccine.id,
                        vaccineTypeId: vaccine.vaccineTypeId,
                        vaccineName: vaccine.vaccineTypeName,
                        injectionDate: vaccine.injectionDate,
                      },
                    })
                  }
                >
                  <Text style={styles.confirmButtonText}>✅ Xác nhận đã tiêm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelVaccine(vaccine.id)}
                >
                  <Text style={styles.cancelButtonText}>❌ Hủy lịch</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có lịch tiêm sắp tới.</Text>
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
  actionRow: { marginTop: 15, gap: 10 },
  confirmButton: { backgroundColor: '#8fd3a7', paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  confirmButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
  cancelButton: { backgroundColor: '#ff8fab', paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  cancelButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#8899aa', marginTop: 20 },
});
