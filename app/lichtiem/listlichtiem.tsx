import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
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

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadSelectedProfile() {
      try {
        setLoading(true);
        const profile = getSelectedProfile() || (await hydrateSelectedProfile());

        if (!mounted) {
          return;
        }

        setSelectedProfileState(profile);
        if (!profile) {
          setUpcomingVaccines([]);
          setCompletedVaccines([]);
          setStats({ pending: 0, success: 0, canceled: 0 });
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setSelectedProfileState(null);
          setUpcomingVaccines([]);
          setCompletedVaccines([]);
          setStats({ pending: 0, success: 0, canceled: 0 });
          setLoading(false);
        }
      }
    }

    loadSelectedProfile();

    return () => {
      mounted = false;
    };
  }, []));

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

    async function fetchVaccineData() {
      setLoading(true);
      try {
        await refreshVaccineData();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchVaccineData();

    return () => {
      cancelled = true;
    };
  }, [selectedProfile, refreshVaccineData]);

  useFocusEffect(useCallback(() => {
    if (!selectedProfile) {
      return;
    }

    let cancelled = false;

    async function reloadOnFocus() {
      setLoading(true);
      try {
        await refreshVaccineData();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    reloadOnFocus();

    return () => {
      cancelled = true;
    };
  }, [selectedProfile, refreshVaccineData]));

  const handleConfirmVaccine = (item: VaccineRecordResponse) => {
    if (!selectedProfile) {
      return;
    }

    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId: selectedProfile.id,
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

  const openAddVaccine = () => {
    if (!selectedProfile) {
      router.push('/profile/select-profile');
      return;
    }

    router.push({ pathname: '/lichtiem/themmuitiem', params: { profileId: selectedProfile.id } });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
        <ActivityIndicator color="#ff8fab" />
        <Text style={styles.loadingText}>Đang tải sổ tiêm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentMint} />
      <View pointerEvents="none" style={styles.backgroundSparkle}>
        <Ionicons name="sparkles" size={23} color="#FFD36E" />
      </View>
      <View pointerEvents="none" style={styles.backgroundHeart}>
        <Ionicons name="heart" size={28} color="#FF9DBA" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerSparkle}>✦</Text>
            <Text style={styles.headerTitle}>Sổ Tiêm Chủng</Text>
            <Text style={styles.headerSubtitle}>Theo dõi từng mũi bảo vệ của bé</Text>
          </View>
          <View style={styles.headerGhostButton}>
            <Ionicons name="shield-checkmark" size={21} color="#5ABF7A" />
          </View>
        </View>

        {selectedProfile ? (
          <LinearGradient colors={['#FFFFFF', '#FFF8FA']} style={styles.profileBanner}>
            <Ionicons name="person-circle-outline" size={20} color="#ff8fab" />
            <Text style={styles.profileBannerText}>Hồ sơ đang xem: {selectedProfile.name}</Text>
            <Ionicons name="sparkles" size={14} color="#FFD36E" />
          </LinearGradient>
        ) : null}

        <VaccineSummary completedCount={stats.success} upcomingCount={stats.pending} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⏳ Sắp tới</Text>
          <TouchableOpacity
            disabled={!selectedProfile}
            onPress={() => router.push({ pathname: '/lichtiem/danhsachchuatiem', params: { profileId: selectedProfile?.id } })}
          >
            <Text style={[styles.seeAllText, !selectedProfile && styles.disabledText]}>Xem tất cả ➔</Text>
          </TouchableOpacity>
        </View>

        {selectedProfile ? (
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
          <Text style={styles.emptyText}>Bạn chưa chọn hồ sơ. Hãy chọn hồ sơ để xem lịch tiêm.</Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✅ Đã hoàn thành</Text>
          <TouchableOpacity
            disabled={!selectedProfile}
            onPress={() => router.push({ pathname: '/lichtiem/danhsachdatiem', params: { profileId: selectedProfile?.id } })}
          >
            <Text style={[styles.seeAllText, !selectedProfile && styles.disabledText]}>Xem tất cả ➔</Text>
          </TouchableOpacity>
        </View>

        {completedVaccines.length > 0 ? (
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
        <TouchableOpacity style={styles.addButton} onPress={openAddVaccine}>
          <LinearGradient colors={['#FF8FAB', '#FFB86C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addButtonGradient}>
            <Ionicons name="add-circle" size={23} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Thêm mũi tiêm mới</Text>
          </LinearGradient>
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
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF9F3',
  },
  loadingText: {
    marginTop: 10,
    color: '#5C7A8A',
    fontSize: 13,
    fontWeight: '800',
  },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  scrollArea: { padding: 20 },
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
    top: 454,
    right: -46,
    width: 144,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(184, 239, 207, 0.24)',
    transform: [{ rotate: '18deg' }],
  },
  backgroundSparkle: {
    position: 'absolute',
    top: 120,
    left: 32,
    opacity: 0.78,
    transform: [{ rotate: '-12deg' }],
  },
  backgroundHeart: {
    position: 'absolute',
    top: 202,
    right: 34,
    opacity: 0.35,
    transform: [{ rotate: '14deg' }],
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 42,
    marginBottom: 18,
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
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerSparkle: {
    position: 'absolute',
    left: '23%',
    top: 0,
    color: '#FFD8E5',
    fontSize: 14,
    fontWeight: '900',
  },
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
  headerGhostButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 19,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  profileBannerText: {
    marginHorizontal: 7,
    color: '#5C7A8A',
    fontWeight: '900',
    fontSize: 13,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#334455' },
  seeAllText: { fontSize: 13, fontWeight: '900', color: '#FF8FAB' },
  disabledText: { color: '#c7cfd6' },
  emptyText: {
    textAlign: 'center',
    color: '#6F7D8A',
    marginVertical: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
    backgroundColor: 'rgba(254, 249, 243, 0.95)',
  },
  addButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 5,
  },
  addButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginLeft: 8,
  },
});
