import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VaccineCard } from '../../components/lichtiem/VaccineCard';
import { deleteVaccineRecord, getVaccineRecordsPageByProfile, type VaccineRecordResponse } from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const PAGE_SIZE = 10;
const PENDING_STATUS = -1;

export default function UpcomingVaccinesScreen() {
  const { showNotification } = useNotification();
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [upcomingVaccines, setUpcomingVaccines] = useState<VaccineRecordResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const canLoadMore = page + 1 < totalPages;

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function resolveProfileId() {
      const routeProfileId = Number(Array.isArray(profileId) ? profileId[0] : profileId);
      if (Number.isFinite(routeProfileId)) {
        setCurrentProfileId(routeProfileId);
        return;
      }

      const profile = getSelectedProfile() || (await hydrateSelectedProfile());
      if (mounted) {
        setCurrentProfileId(profile?.id ?? null);
      }
    }

    resolveProfileId();

    return () => {
      mounted = false;
    };
  }, [profileId]));

  const loadUpcomingVaccines = useCallback(async (pageIndex: number, replace = false) => {
    if (!currentProfileId) {
      setUpcomingVaccines([]);
      setTotalPages(0);
      setTotalElements(0);
      setLoading(false);
      return;
    }

    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await getVaccineRecordsPageByProfile(currentProfileId, {
        status: PENDING_STATUS,
        page: pageIndex,
        size: PAGE_SIZE,
      });

      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setUpcomingVaccines((current) => {
        if (replace) {
          return data.content;
        }

        const existingIds = new Set(current.map((item) => item.id));
        return [...current, ...data.content.filter((item) => !existingIds.has(item.id))];
      });
    } catch {
      if (replace) {
        setUpcomingVaccines([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentProfileId]);

  useEffect(() => {
    setPage(0);
    setTotalPages(0);
    loadUpcomingVaccines(0, true);
  }, [loadUpcomingVaccines]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && canLoadMore) {
      loadUpcomingVaccines(page + 1);
    }
  };

  const handleCancelVaccine = async (recordId: number) => {
    Alert.alert('Hủy lịch tiêm', 'Bạn có chắc chắn muốn hủy lịch này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lịch',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVaccineRecord(recordId);
            await loadUpcomingVaccines(0, true);
            showNotification({
              type: 'success',
              title: 'Đã hủy lịch tiêm',
              message: 'Lịch tiêm đã được xoá thành công.',
            });
          } catch {
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

  const renderVaccine = ({ item: vaccine }: { item: VaccineRecordResponse }) => (
    <VaccineCard
      vaccine={{
        id: String(vaccine.id),
        name: vaccine.vaccineTypeName,
        desc: vaccine.vaccineTypeDescription || 'Phòng bệnh theo chỉ định của bác sĩ.',
        date: vaccine.injectionDate,
        vaccineTypeId: vaccine.vaccineTypeId,
        injectionDate: vaccine.injectionDate,
        status: 'upcoming',
      }}
      onConfirmPress={() =>
        router.push({
          pathname: '/lichtiem/themmuitiem',
          params: {
            profileId: currentProfileId,
            mode: 'confirm',
            recordId: vaccine.id,
            vaccineTypeId: vaccine.vaccineTypeId,
            vaccineName: vaccine.vaccineTypeName,
            injectionDate: vaccine.injectionDate,
          },
        })
      }
      onCancelPress={() => handleCancelVaccine(vaccine.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
        <ActivityIndicator color="#ff8fab" />
        <Text style={styles.loadingText}>Đang tải lịch sắp tới...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentYellow} />

      <FlatList
        data={upcomingVaccines}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderVaccine}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <>
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
              </TouchableOpacity>
              <View style={styles.headerCopy}>
                <Text style={styles.headerSparkle}>✦</Text>
                <Text style={styles.headerTitle}>Lịch Sắp Tới</Text>
                <Text style={styles.headerSubtitle}>Nhắc mẹ những mũi quan trọng</Text>
              </View>
              <View style={styles.headerGhostButton}>
                <Ionicons name="calendar-outline" size={21} color="#FF9C6E" />
              </View>
            </View>

            <LinearGradient colors={['#FFFFFF', '#FFF8E8', '#FFF5F8']} style={styles.heroSection}>
              <View style={styles.heroSparkle} />
              <Ionicons name="sparkles" size={25} color="#FFD36E" />
              <Text style={styles.heroText}>Tháng tới bé có thêm các mốc quan trọng</Text>
              <Text style={styles.heroNumber}>{totalElements} lịch tiêm</Text>
              <Text style={styles.heroSubtext}>Mẹ nhớ đặt lịch để bảo vệ sức khỏe cho con nhé.</Text>
            </LinearGradient>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-clear-outline" size={28} color="#A7E4F5" />
            <Text style={styles.emptyText}>Không có lịch tiêm sắp tới.</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#ff8fab" />
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )
        }
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
  backgroundAccentTop: {
    position: 'absolute',
    top: 58,
    left: -40,
    width: 150,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 182, 193, 0.18)',
    transform: [{ rotate: '-18deg' }],
  },
  backgroundAccentYellow: {
    position: 'absolute',
    top: 420,
    right: -44,
    width: 150,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 209, 102, 0.2)',
    transform: [{ rotate: '18deg' }],
  },
  listContent: { padding: 20 },
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
    left: '20%',
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#FFE6BA',
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  heroSparkle: {
    position: 'absolute',
    top: 16,
    right: 24,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE9A8',
  },
  heroText: {
    fontSize: 14,
    color: '#5C7A8A',
    fontWeight: '800',
    marginTop: 7,
    textAlign: 'center',
  },
  heroNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF9C6E',
    marginTop: 3,
  },
  heroSubtext: {
    fontSize: 13,
    color: '#5C7A8A',
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 34,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE5EC',
  },
  emptyText: {
    textAlign: 'center',
    color: '#5C7A8A',
    marginTop: 9,
    fontWeight: '800',
  },
  footerLoading: { paddingVertical: 18 },
});
