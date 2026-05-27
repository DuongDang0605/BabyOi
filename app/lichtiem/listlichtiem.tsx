import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ConfirmSheet } from '../../components/common/ConfirmSheet';
import { useConfirmSheet } from '../../components/common/useConfirmSheet';
import { VaccineCard } from '../../components/lichtiem/VaccineCard';
import { VaccineSummary } from '../../components/lichtiem/VaccineSummary';
import {
  deleteVaccineRecord,
  getVaccineRecordsByProfile,
  getVaccineStatistics,
  type ProfileResponse,
  type VaccineRecordResponse,
} from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

function sortVaccinesByDate(records: VaccineRecordResponse[], direction: 'asc' | 'desc') {
  return [...records].sort((left, right) => {
    const leftDate = new Date(left.injectionDate).getTime();
    const rightDate = new Date(right.injectionDate).getTime();

    if (Number.isNaN(leftDate) || Number.isNaN(rightDate)) {
      return 0;
    }

    return direction === 'asc' ? leftDate - rightDate : rightDate - leftDate;
  });
}

export default function VaccineScheduleScreen() {
  const { showNotification } = useNotification();
  const confirmSheet = useConfirmSheet();
  const [selectedProfile, setSelectedProfileState] = useState<ProfileResponse | null>(null);
  const [stats, setStats] = useState({ pending: 0, success: 0, canceled: 0 });
  const [upcomingVaccines, setUpcomingVaccines] = useState<VaccineRecordResponse[]>([]);
  const [completedVaccines, setCompletedVaccines] = useState<VaccineRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadSelectedProfile = async () => {
        try {
          setLoading(true);
          const profile = getSelectedProfile() || (await hydrateSelectedProfile());

          if (mounted) {
            setSelectedProfileState(profile);
            if (!profile) {
              setUpcomingVaccines([]);
              setCompletedVaccines([]);
              setStats({ pending: 0, success: 0, canceled: 0 });
            }
          }
        } catch {
          if (mounted) {
            setSelectedProfileState(null);
            setUpcomingVaccines([]);
            setCompletedVaccines([]);
            setStats({ pending: 0, success: 0, canceled: 0 });
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      loadSelectedProfile();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const refreshVaccineData = useCallback(async () => {
    if (!selectedProfile) {
      return;
    }

    try {
      const [pendingData, completedData, statistics] = await Promise.all([
        getVaccineRecordsByProfile(selectedProfile.id, { status: -1, limit: 1 }),
        getVaccineRecordsByProfile(selectedProfile.id, { status: 3, limit: 3 }),
        getVaccineStatistics(selectedProfile.id),
      ]);

      setUpcomingVaccines(sortVaccinesByDate(Array.isArray(pendingData) ? pendingData : [], 'asc'));
      setCompletedVaccines(sortVaccinesByDate(Array.isArray(completedData) ? completedData : [], 'desc'));
      setStats({
        pending: statistics.pending,
        success: statistics.success,
        canceled: statistics.canceled,
      });
    } catch {
      setUpcomingVaccines([]);
      setCompletedVaccines([]);
      setStats({ pending: 0, success: 0, canceled: 0 });
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (!selectedProfile) {
      return;
    }

    let cancelled = false;

    const fetchVaccineData = async () => {
      setLoading(true);
      try {
        await refreshVaccineData();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVaccineData();

    return () => {
      cancelled = true;
    };
  }, [selectedProfile, refreshVaccineData]);

  const handleConfirmVaccine = (item: VaccineRecordResponse) => {
    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId: selectedProfile?.id,
        mode: 'confirm',
        recordId: item.id,
        vaccineTypeId: item.vaccineTypeId,
        vaccineName: item.vaccineTypeName,
        injectionDate: item.injectionDate,
      },
    });
  };

  const handleCancelVaccine = (recordId: number) => {
    confirmSheet.show({
      title: 'Hủy lịch tiêm',
      message: 'Bạn có chắc chắn muốn hủy lịch này?',
      confirmText: 'Hủy lịch',
      cancelText: 'Không',
      onConfirm: async () => {
        try {
          await deleteVaccineRecord(recordId);
          setLoading(true);
          await refreshVaccineData();
          showNotification({
            type: 'success',
            title: 'Đã hủy lịch tiêm',
            message: 'Lịch tiêm đã được hủy thành công.',
          });
        } catch {
          showNotification({
            type: 'error',
            title: 'Không thể hủy lịch',
            message: 'Vui lòng thử lại sau.',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sổ Tiêm Chủng</Text>
        </View>

        <VaccineSummary completedCount={stats.success} upcomingCount={stats.pending} />

        {loading && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color="#ff8fab" />
            <Text style={styles.inlineLoadingText}>Đang tải lịch tiêm...</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sắp tới</Text>
          <TouchableOpacity
            disabled={!selectedProfile}
            onPress={() => router.push({ pathname: '/lichtiem/danhsachchuatiem', params: { profileId: selectedProfile?.id } })}
          >
            <Text style={[styles.seeAllText, !selectedProfile && styles.disabledText]}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loading ? null : selectedProfile ? (
          upcomingVaccines.length > 0 ? (
            upcomingVaccines.map((item) => (
              <VaccineCard
                key={item.id}
                vaccine={{
                  id: String(item.id),
                  name: item.vaccineTypeName,
                  desc: item.vaccineTypeDescription ?? 'Phòng bệnh theo chỉ định của bác sĩ.',
                  date: item.injectionDate,
                  vaccineTypeId: item.vaccineTypeId,
                  injectionDate: item.injectionDate,
                  status: 'upcoming',
                }}
                onConfirmPress={() => handleConfirmVaccine(item)}
                onCancelPress={() => handleCancelVaccine(item.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có lịch tiêm cho {selectedProfile.name}</Text>
          )
        ) : (
          <Text style={styles.emptyText}>Bạn chưa chọn hồ sơ. Hãy chọn hồ sơ trước khi xem lịch tiêm.</Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đã hoàn thành</Text>
          <TouchableOpacity
            disabled={!selectedProfile}
            onPress={() => router.push({ pathname: '/lichtiem/danhsachdatiem', params: { profileId: selectedProfile?.id } })}
          >
            <Text style={[styles.seeAllText, !selectedProfile && styles.disabledText]}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loading ? null : completedVaccines.length > 0 ? (
          completedVaccines.map((item) => (
            <VaccineCard
              key={item.id}
              vaccine={{
                id: String(item.id),
                name: item.vaccineTypeName,
                desc: item.vaccineTypeDescription ?? 'Phòng bệnh theo chỉ định của bác sĩ.',
                date: item.injectionDate,
                status: 'completed',
                location: item.location ?? undefined,
                cost: item.price ? `${item.price.toLocaleString()}đ` : 'Miễn phí',
                note: item.note ?? undefined,
              }}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>Chưa có mũi tiêm đã hoàn thành.</Text>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addButton, !selectedProfile && styles.disabledButton]}
          disabled={!selectedProfile}
          onPress={() => router.push({ pathname: '/lichtiem/themmuitiem', params: { profileId: selectedProfile?.id } })}
        >
          <Text style={styles.addButtonText}>+ Thêm mũi tiêm mới</Text>
        </TouchableOpacity>
      </View>

      <ConfirmSheet
        visible={confirmSheet.visible}
        title={confirmSheet.payload.title}
        message={confirmSheet.payload.message}
        confirmText={confirmSheet.payload.confirmText}
        cancelText={confirmSheet.payload.cancelText}
        onCancel={confirmSheet.hide}
        onConfirm={confirmSheet.handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
  backButton: { width: 45 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5, zIndex: -1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#5c7a8a' },
  seeAllText: { fontSize: 14, fontWeight: 'bold', color: '#ff8fab' },
  disabledText: { color: '#c7d1d8' },
  inlineLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginVertical: 14, paddingVertical: 12, borderRadius: 18, backgroundColor: '#fff5f8', borderWidth: 1, borderColor: '#ffe5ec' },
  inlineLoadingText: { color: '#ff8fab', fontWeight: '800' },
  emptyText: { textAlign: 'center', color: '#8899aa', marginVertical: 20, fontStyle: 'italic' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  addButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 },
  disabledButton: { opacity: 0.45 },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
