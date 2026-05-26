import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConfirmSheet } from '../../components/common/ConfirmSheet';
import { useConfirmSheet } from '../../components/common/useConfirmSheet';

import { VaccineCard } from '../../components/lichtiem/VaccineCard';
import { VaccineSummary } from '../../components/lichtiem/VaccineSummary';
import { deleteVaccineRecord, getCurrentUser, getProfilesByUserId, getVaccineRecordsByProfile, getVaccineStatistics, type ProfileResponse, type VaccineRecordResponse } from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile, setSelectedProfile } from '../../lib/profile-session';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3532/3532361.png';

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
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [selectedProfile, setSelectedProfileState] = useState<ProfileResponse | null>(null);
  const [stats, setStats] = useState({ pending: 0, success: 0, canceled: 0 });
  const [upcomingVaccines, setUpcomingVaccines] = useState<VaccineRecordResponse[]>([]);
  const [completedVaccines, setCompletedVaccines] = useState<VaccineRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);

        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
          throw new Error('Không tìm thấy userId hợp lệ từ /api/users/me');
        }

        const data = await getProfilesByUserId(currentUser.id);

        if (!Array.isArray(data) || data.length === 0) {
          setProfiles([]);
          setSelectedProfileState(null);
          await setSelectedProfile(null);
          return;
        }

        const storedProfile = getSelectedProfile() || (await hydrateSelectedProfile());
        const matchedStoredProfile = storedProfile && data.find((profile) => profile.id === storedProfile.id);
        const nextProfile = matchedStoredProfile ?? data[0];

        setProfiles(data);
        setSelectedProfileState(nextProfile);
        await setSelectedProfile(nextProfile);
      } catch (error) {
        console.error('Lỗi tải hồ sơ:', error);
        setProfiles([]);
        setSelectedProfileState(null);
        await setSelectedProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const refreshVaccineData = useCallback(async () => {
    if (!selectedProfile || profiles.length === 0) {
      return;
    }

    const orderedProfiles = [selectedProfile, ...profiles.filter((profile) => profile.id !== selectedProfile.id)];
    let lastError: unknown;

    for (const profile of orderedProfiles) {
      try {
        const [pendingData, completedData, statistics] = await Promise.all([
          getVaccineRecordsByProfile(profile.id, { status: -1, limit: 1 }),
          getVaccineRecordsByProfile(profile.id, { status: 3, limit: 3 }),
          getVaccineStatistics(profile.id),
        ]);

        const pendingVaccines = sortVaccinesByDate(Array.isArray(pendingData) ? pendingData : [], 'asc');
        const completed = sortVaccinesByDate(Array.isArray(completedData) ? completedData : [], 'desc');

        if (profile.id !== selectedProfile.id) {
          setSelectedProfileState(profile);
          await setSelectedProfile(profile);
        }

        setUpcomingVaccines(pendingVaccines);
        setCompletedVaccines(completed);
        setStats({
          pending: statistics.pending,
          success: statistics.success,
          canceled: statistics.canceled,
        });
        return;
      } catch (error) {
        lastError = error;
        console.warn(`Lỗi tải dữ liệu cho hồ sơ ${profile.id}, thử hồ sơ khác nếu có.`, error);
      }
    }

    console.error('Không thể tải dữ liệu tiêm chủng cho bất kỳ hồ sơ nào.', lastError);
    setUpcomingVaccines([]);
    setCompletedVaccines([]);
    setStats({ pending: 0, success: 0, canceled: 0 });
  }, [profiles, selectedProfile]);

  useEffect(() => {
    if (!selectedProfile || profiles.length === 0) {
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
  }, [selectedProfile, profiles, refreshVaccineData]);

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
        } catch (error) {
          console.error('Lỗi hủy lịch tiêm:', error);
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
          <Text style={styles.headerTitle}>Sổ Tiêm Chủng</Text>
        </View>

        <View style={styles.profileSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileList}>
            {profiles.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.profileItem, selectedProfile?.id === p.id && styles.profileItemActive]}
                onPress={async () => {
                  setSelectedProfileState(p);
                  await setSelectedProfile(p);
                }}
              >
                <Image source={{ uri: p.imageUrl || DEFAULT_AVATAR }} style={styles.profileAvatar} />
                <Text style={[styles.profileName, selectedProfile?.id === p.id && styles.profileNameActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addProfileItem} onPress={() => router.push('/profile/profile')}>
              <Ionicons name="add" size={24} color="#ff8fab" />
              <Text style={styles.addProfileText}>Thêm</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <VaccineSummary completedCount={stats.success} upcomingCount={stats.pending} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⏳ Sắp tới</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/lichtiem/danhsachchuatiem', params: { profileId: selectedProfile?.id } })}>
            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
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
            <Text style={styles.emptyText}>Chưa có lịch tiêm cho {selectedProfile?.name}</Text>
          )
        ) : (
          <Text style={styles.emptyText}>Bạn chưa có hồ sơ nào. Hãy thêm hồ sơ để xem lịch tiêm.</Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✅ Đã hoàn thành</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/lichtiem/danhsachdatiem', params: { profileId: selectedProfile?.id } })}>
            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push({ pathname: '/lichtiem/themmuitiem', params: { profileId: selectedProfile?.id } })}
        >
          <Text style={styles.addButtonText}>✨ + Thêm mũi tiêm mới</Text>
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
  profileSelector: { marginBottom: 25 },
  profileList: { paddingHorizontal: 5, alignItems: 'center' },
  profileItem: { alignItems: 'center', marginRight: 20, opacity: 0.6 },
  profileItemActive: { opacity: 1 },
  profileAvatar: { width: 55, height: 55, borderRadius: 28, borderWidth: 2, borderColor: '#f0f4f8', marginBottom: 5 },
  profileName: { fontSize: 13, fontWeight: '700', color: '#5c7a8a' },
  profileNameActive: { color: '#ff8fab' },
  addProfileItem: { alignItems: 'center', justifyContent: 'center', width: 55, height: 55, borderRadius: 28, borderWidth: 2, borderColor: '#ff8fab', borderStyle: 'dashed', marginRight: 20 },
  addProfileText: { fontSize: 11, fontWeight: 'bold', color: '#ff8fab', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#5c7a8a' },
  seeAllText: { fontSize: 14, fontWeight: 'bold', color: '#ff8fab' },
  emptyText: { textAlign: 'center', color: '#8899aa', marginVertical: 20, fontStyle: 'italic' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  addButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
