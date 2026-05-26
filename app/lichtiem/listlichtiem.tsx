import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VaccineCard } from '../../components/lichtiem/VaccineCard';
import { VaccineSummary } from '../../components/lichtiem/VaccineSummary';
import { API_BASE_URL, getCurrentUser, getProfilesByUserId, type ProfileResponse } from '../../lib/api';
import { getAuthorizationHeader, hydrateAuthSession } from '../../lib/auth-session';
import { getSelectedProfile, hydrateSelectedProfile, setSelectedProfile } from '../../lib/profile-session';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3532/3532361.png';

async function fetchVaccineRecords(profileId: number, status: number) {
  await hydrateAuthSession();

  const authorizationHeader = getAuthorizationHeader();
  if (!authorizationHeader) {
    throw new Error('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
  }

  const response = await fetch(`${API_BASE_URL}/api/vaccine-records/profile/${profileId}?status=${status}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authorizationHeader,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Lỗi API ${response.status}`);
  }

  return response.json();
}

export default function VaccineScheduleScreen() {
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [selectedProfile, setSelectedProfileState] = useState<ProfileResponse | null>(null);
  const [stats, setStats] = useState({ pending: 0, success: 0, canceled: 0 });
  const [upcomingVaccines, setUpcomingVaccines] = useState<any[]>([]);
  const [completedVaccines, setCompletedVaccines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải danh sách hồ sơ theo user đang đăng nhập
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

        const storedProfile = getSelectedProfile() || await hydrateSelectedProfile();
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

  // 2. Tải dữ liệu tiêm chủng khi đổi hồ sơ
  useEffect(() => {
    if (!selectedProfile || profiles.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchVaccineData = async () => {
      const orderedProfiles = [selectedProfile, ...profiles.filter((profile) => profile.id !== selectedProfile.id)];
      let lastError: unknown;

      for (const profile of orderedProfiles) {
        try {
          const [pendingData, completedData] = await Promise.all([
            fetchVaccineRecords(profile.id, -1),
            fetchVaccineRecords(profile.id, 3),
          ]);

          if (cancelled) {
            return;
          }

          const pendingVaccines = Array.isArray(pendingData) ? pendingData : [];
          const completed = Array.isArray(completedData) ? completedData : [];

          if (profile.id !== selectedProfile.id) {
            setSelectedProfileState(profile);
            await setSelectedProfile(profile);
          }

          setUpcomingVaccines(pendingVaccines);
          setCompletedVaccines(completed);
          setStats({
            pending: pendingVaccines.length,
            success: completed.length,
            canceled: 0,
          });
          return;
        } catch (error) {
          lastError = error;
          console.warn(`Lỗi tải dữ liệu cho hồ sơ ${profile.id}, thử hồ sơ khác nếu có.`, error);
        }
      }

      if (!cancelled) {
        console.error('Không thể tải dữ liệu tiêm chủng cho bất kỳ hồ sơ nào.', lastError);
        setUpcomingVaccines([]);
        setCompletedVaccines([]);
        setStats({ pending: 0, success: 0, canceled: 0 });
      }
    };

    fetchVaccineData();

    return () => {
      cancelled = true;
    };
  }, [selectedProfile, profiles]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#ff8fab" />;

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

        {/* --- DYNAMIC PROFILE SELECTOR --- */}
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
          upcomingVaccines.length > 0 ? upcomingVaccines.map(item => (
            <VaccineCard
              key={item.id}
              vaccine={{
                ...item,
                name: item.vaccineTypeName,
                desc: item.vaccineTypeDescription,
                date: item.injectionDate,
                status: 'upcoming'
              }}
              onBookPress={() => router.push({ pathname: '/lichtiem/datlichtiem', params: { profileId: selectedProfile?.id, vaccineTypeId: item.vaccineTypeId } })}
            />
          )) : (
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

        {completedVaccines.map(item => (
          <VaccineCard
            key={item.id}
            vaccine={{
              ...item,
              name: item.vaccineTypeName,
              desc: item.vaccineTypeDescription,
              date: item.injectionDate,
              status: 'completed',
              cost: item.price ? `${item.price.toLocaleString()}đ` : 'Miễn phí'
            }}
          />
        ))}

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
