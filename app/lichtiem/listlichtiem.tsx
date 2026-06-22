import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ConfirmSheet } from '../../components/common/ConfirmSheet';
import { useConfirmSheet } from '../../components/common/useConfirmSheet';
import { VaccineCard } from '../../components/lichtiem/VaccineCard';
import { VaccineSummary } from '../../components/lichtiem/VaccineSummary';
import {
  getVaccineProgress,
  getVaccineStatistics,
  resumeProfileDiseaseSchedule,
  stopProfileDiseaseSchedule,
  type ProfileResponse,
  type VaccineProgressResponse,
} from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const PENDING_STATUS = -1;
const SUCCESS_STATUS = 3;
const INITIAL_VISIBLE_DISEASES = 6;
const LOAD_MORE_DISEASES = 6;
const DAY_MS = 86400000;

type VaccineProgressDose = NonNullable<VaccineProgressResponse['doses']>[number];

function getDateTime(value?: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getLocalDayTime(value?: string | null) {
  const time = getDateTime(value);
  if (!Number.isFinite(time)) {
    return Number.POSITIVE_INFINITY;
  }
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function getTodayTime() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
}

function getDoseDayOffset(dose: VaccineProgressDose) {
  return Math.round((getLocalDayTime(dose.injectionDate) - getTodayTime()) / DAY_MS);
}

function formatShortDate(value?: string | null) {
  if (!value) {
    return 'chưa có ngày';
  }

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}-${month}-${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function getSortedDoses(progress: VaccineProgressResponse) {
  return [...(progress.doses ?? [])].sort((left, right) => {
    const dateDiff = getDateTime(left.injectionDate) - getDateTime(right.injectionDate);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return (left.doseOrder ?? 0) - (right.doseOrder ?? 0);
  });
}

function getNextPendingDose(progress: VaccineProgressResponse) {
  return getSortedDoses(progress).find((dose) => dose.status === PENDING_STATUS) ?? null;
}

function getPriorityPendingDose(progress: VaccineProgressResponse) {
  const pendingDoses = getSortedDoses(progress)
    .filter((dose) => dose.status === PENDING_STATUS && Number.isFinite(getLocalDayTime(dose.injectionDate)));

  const dueSoon = pendingDoses
    .filter((dose) => {
      const offset = getDoseDayOffset(dose);
      return offset >= 0 && offset <= 7;
    })
    .sort((left, right) => getDoseDayOffset(left) - getDoseDayOffset(right));
  if (dueSoon.length > 0) {
    return dueSoon[0];
  }

  const overdue = pendingDoses
    .filter((dose) => getDoseDayOffset(dose) < 0)
    .sort((left, right) => getDoseDayOffset(left) - getDoseDayOffset(right));
  if (overdue.length > 0) {
    return overdue[0];
  }

  const future = pendingDoses
    .filter((dose) => getDoseDayOffset(dose) >= 8)
    .sort((left, right) => getDoseDayOffset(left) - getDoseDayOffset(right));
  return future[0] ?? getNextPendingDose(progress);
}

function getProgressSortBucket(progress: VaccineProgressResponse) {
  if (progress.stopped) {
    return { group: 3, order: Number.POSITIVE_INFINITY };
  }

  const dose = getPriorityPendingDose(progress);
  if (!dose) {
    return { group: 2, order: Number.POSITIVE_INFINITY };
  }

  const offset = getDoseDayOffset(dose);
  if (offset >= 0 && offset <= 7) {
    return { group: 0, order: offset };
  }
  if (offset < 0) {
    return { group: 1, order: offset };
  }
  return { group: 2, order: offset };
}

function compareDiseaseProgress(left: VaccineProgressResponse, right: VaccineProgressResponse) {
  const leftBucket = getProgressSortBucket(left);
  const rightBucket = getProgressSortBucket(right);

  if (leftBucket.group !== rightBucket.group) {
    return leftBucket.group - rightBucket.group;
  }
  if (leftBucket.order !== rightBucket.order) {
    return leftBucket.order - rightBucket.order;
  }
  return (left.diseaseName ?? '').localeCompare(right.diseaseName ?? '', 'vi', { sensitivity: 'base' });
}

function buildProgressText(progress: VaccineProgressResponse) {
  const completed = progress.completedDoses ?? 0;
  const total = progress.totalDoses ?? progress.doses?.length ?? completed;
  const base = `Đã qua/đã tiêm ${completed}/${total} mũi`;

  if (progress.nextDoseOrder) {
    return `${base} • Mũi tiếp theo: ${progress.nextDoseOrder}`;
  }

  return `${base} • Đã đủ lịch hiện tại`;
}

function buildDoseHistory(progress: VaccineProgressResponse) {
  return getSortedDoses(progress)
    .filter((dose) => dose.status === SUCCESS_STATUS)
    .map((dose) => {
      const order = dose.doseOrder ? `Lần ${dose.doseOrder}` : 'Đã tiêm';
      const vaccineName = dose.vaccineName ? ` - ${dose.vaccineName}` : '';
      const date = formatShortDate(dose.actualInjectionDate || dose.injectionDate);
      return `${order}${vaccineName}: ${date}`;
    });
}

function getProgressKey(item: VaccineProgressResponse) {
  return String(item.diseaseId ?? item.diseaseCode ?? item.diseaseName ?? item.doses?.map((dose) => dose.recordId).join('-') ?? 'unknown-progress');
}

function getNextDate(progress: VaccineProgressResponse) {
  return getPriorityPendingDose(progress)?.injectionDate || progress.nextInjectionDate || null;
}

function canChangeVaccine(progress: VaccineProgressResponse) {
  return !['NOT_INTERCHANGEABLE', 'SPECIAL_RESTART_REQUIRED'].includes(progress.interchangeRuleCode ?? '');
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function matchesDiseaseSearch(item: VaccineProgressResponse, keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);
  if (!normalizedKeyword) {
    return true;
  }

  const vaccineNames = item.doses?.map((dose) => dose.vaccineName ?? '').join(' ') ?? '';
  const searchableText = normalizeSearchText([
    item.diseaseName,
    item.diseaseCode,
    buildProgressText(item),
    vaccineNames,
  ].filter(Boolean).join(' '));

  return searchableText.includes(normalizedKeyword);
}

async function loadVaccineOverview(profileId: number | string) {
  const [progressData, statistics] = await Promise.all([
    getVaccineProgress(profileId, { silent: true }),
    getVaccineStatistics(profileId, { silent: true }),
  ]);

  return {
    progress: Array.isArray(progressData) ? progressData : [],
    stats: {
      pending: statistics.pending,
      overdue: statistics.overdue ?? 0,
      upcoming: statistics.upcoming ?? statistics.pending,
      success: statistics.success,
      canceled: statistics.canceled,
    },
  };
}

export default function VaccineScheduleScreen() {
  const confirmSheet = useConfirmSheet();
  const { showNotification } = useNotification();
  const hasLoadedDataRef = useRef(false);
  const [selectedProfile, setSelectedProfileState] = useState<ProfileResponse | null>(null);
  const [stats, setStats] = useState({ pending: 0, overdue: 0, upcoming: 0, success: 0, canceled: 0 });
  const [diseaseProgress, setDiseaseProgress] = useState<VaccineProgressResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_DISEASES);
  const [loading, setLoading] = useState(true);

  const filteredDiseaseProgress = diseaseProgress
    .filter((item) => matchesDiseaseSearch(item, searchQuery))
    .sort(compareDiseaseProgress);
  const visibleDiseaseProgress = filteredDiseaseProgress.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredDiseaseProgress.length;

  const refreshVaccineData = useCallback(async () => {
    if (!selectedProfile) {
      return;
    }

    try {
      const overview = await loadVaccineOverview(selectedProfile.id);
      setDiseaseProgress(overview.progress);
      setStats(overview.stats);
    } catch {
      setDiseaseProgress([]);
      setStats({ pending: 0, overdue: 0, upcoming: 0, success: 0, canceled: 0 });
    }
  }, [selectedProfile]);

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function loadScreenData() {
      if (!hasLoadedDataRef.current) {
        setLoading(true);
      }

      try {
        const profile = getSelectedProfile() || (await hydrateSelectedProfile());

        if (cancelled) {
          return;
        }

        setSelectedProfileState(profile);
        if (!profile) {
          setDiseaseProgress([]);
          setStats({ pending: 0, overdue: 0, upcoming: 0, success: 0, canceled: 0 });
          return;
        }

        try {
          const overview = await loadVaccineOverview(profile.id);

          if (!cancelled) {
            setDiseaseProgress(overview.progress);
            setStats(overview.stats);
          }
        } catch {
          if (!cancelled) {
            setDiseaseProgress([]);
            setStats({ pending: 0, overdue: 0, upcoming: 0, success: 0, canceled: 0 });
          }
        }
      } catch {
        if (!cancelled) {
          setSelectedProfileState(null);
          setDiseaseProgress([]);
          setStats({ pending: 0, overdue: 0, upcoming: 0, success: 0, canceled: 0 });
        }
      } finally {
        if (!cancelled) {
          hasLoadedDataRef.current = true;
          setLoading(false);
        }
      }
    }

    loadScreenData();

    return () => {
      cancelled = true;
    };
  }, []));

  const returnToHome = () => {
    router.replace('/home/home');
  };

  const openChangeSchedule = (item: VaccineProgressResponse) => {
    if (!selectedProfile) {
      return;
    }

    const nextDose = getPriorityPendingDose(item);
    if (!nextDose?.recordId) {
      router.push({
        pathname: '/lichtiem/themmuitiem',
        params: {
          profileId: selectedProfile.id,
          returnTo: 'list',
          diseaseId: item.diseaseId ?? '',
          diseaseName: item.diseaseName ?? '',
          doseOrder: nextDose?.doseOrder ?? item.nextDoseOrder ?? '',
          injectionDate: nextDose?.injectionDate || item.nextInjectionDate || '',
        },
      });
      return;
    }

    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId: selectedProfile.id,
        returnTo: 'list',
        mode: 'edit',
        recordId: nextDose.recordId,
        vaccineTypeId: nextDose.vaccineId ?? '',
        vaccineName: nextDose.vaccineName || item.diseaseName || 'Vắc-xin',
        diseaseId: item.diseaseId ?? '',
        diseaseName: item.diseaseName ?? '',
        doseOrder: nextDose.doseOrder ?? item.nextDoseOrder ?? '',
        injectionDate: nextDose.injectionDate || item.nextInjectionDate || '',
        allowVaccineChange: canChangeVaccine(item) ? '1' : '0',
      },
    });
  };

  const openDiseaseDetail = (item: VaccineProgressResponse) => {
    router.push({
      pathname: '/lichtiem/chitietbenh',
      params: {
        profileId: selectedProfile?.id,
        diseaseId: item.diseaseId ?? '',
        diseaseCode: item.diseaseCode ?? '',
        diseaseName: item.diseaseName ?? '',
      },
    });
  };

  const openConfirmDose = (item: VaccineProgressResponse) => {
    if (!selectedProfile) {
      return;
    }

    const nextDose = getPriorityPendingDose(item);
    if (!nextDose) {
      showNotification({
        type: 'warning',
        title: 'Chưa có mũi cần xác nhận',
        message: `${item.diseaseName ?? 'Bệnh này'} hiện không có mũi sắp tới trong lịch.`,
      });
      return;
    }

    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId: selectedProfile.id,
        returnTo: 'list',
        mode: 'confirm',
        recordId: nextDose.recordId ?? '',
        vaccineTypeId: nextDose.vaccineId ?? '',
        vaccineName: nextDose.vaccineName || item.diseaseName || 'Vắc-xin',
        diseaseId: item.diseaseId ?? '',
        diseaseName: item.diseaseName ?? '',
        doseOrder: nextDose.doseOrder ?? item.nextDoseOrder ?? '',
        source: nextDose.source ?? '',
        injectionDate: nextDose.injectionDate || item.nextInjectionDate || '',
        note: nextDose.note ?? '',
        status: SUCCESS_STATUS,
        allowVaccineChange: canChangeVaccine(item) ? '1' : '0',
      },
    });
  };

  const stopDiseaseSchedule = async (item: VaccineProgressResponse) => {
    if (!selectedProfile || !item.diseaseId || item.stopped) {
      return;
    }

    confirmSheet.show({
      title: 'Dừng tiêm bệnh này?',
      message: `Tạm dừng lịch tiêm cho ${item.diseaseName ?? 'bệnh này'} nhé? Bé vẫn có thể tiêm lại bất cứ lúc nào.`,
      cancelText: 'Không',
      confirmText: 'Dừng tiêm',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await stopProfileDiseaseSchedule(selectedProfile.id, item.diseaseId as number);
          await refreshVaccineData();
          showNotification({
            type: 'success',
            title: 'Đã tạm dừng lịch tiêm',
            message: `${item.diseaseName ?? 'Bệnh này'} sẽ được đưa xuống dưới danh sách.`,
          });
        } catch {
          showNotification({
            type: 'error',
            title: 'Chưa dừng được lịch tiêm',
            message: 'Có lỗi xảy ra, bạn thử lại sau một chút nhé.',
          });
        }
      },
    });
  };

  const resumeDiseaseSchedule = async (item: VaccineProgressResponse) => {
    if (!selectedProfile || !item.diseaseId || !item.stopped) {
      return;
    }

    try {
      await resumeProfileDiseaseSchedule(selectedProfile.id, item.diseaseId);
      await refreshVaccineData();
      showNotification({
        type: 'success',
        title: 'Đã bật tiêm lại',
        message: `${item.diseaseName ?? 'Bệnh này'} sẽ được theo dõi tiếp trong lịch tiêm.`,
      });
    } catch {
      showNotification({
        type: 'error',
        title: 'Chưa bật tiêm lại được',
        message: 'Có lỗi xảy ra, bạn thử lại sau một chút nhé.',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(INITIAL_VISIBLE_DISEASES);
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={returnToHome} style={styles.backButton}>
            <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Sổ Tiêm Chủng</Text>
            <Text style={styles.headerSubtitle}>Theo dõi tiến trình theo từng bệnh</Text>
          </View>
          <View style={styles.headerGhostButton}>
            <Ionicons name="shield-checkmark" size={21} color="#5ABF7A" />
          </View>
        </View>

        {selectedProfile ? (
          <LinearGradient colors={['#FFFFFF', '#FFF8FA']} style={styles.profileBanner}>
            <Ionicons name="person-circle-outline" size={20} color="#ff8fab" />
            <Text style={styles.profileBannerText}>Hồ sơ đang xem: {selectedProfile.name}</Text>
          </LinearGradient>
        ) : null}

        <VaccineSummary completedCount={stats.success} overdueCount={stats.overdue} upcomingCount={stats.upcoming} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách bệnh</Text>
          <Text style={styles.sectionHint}>Sắp xếp theo mũi gần nhất</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#7A8C99" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bệnh hoặc vắc-xin"
            placeholderTextColor="#9AAAB5"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearchChange('')} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={18} color="#FF8FAB" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.resultCountText}>
          {filteredDiseaseProgress.length} bệnh phù hợp
        </Text>

        {selectedProfile ? (
          filteredDiseaseProgress.length > 0 ? (
            <>
            {visibleDiseaseProgress.map((item) => {
              const nextDose = getPriorityPendingDose(item);
              const stopped = Boolean(item.stopped);

              return (
                <VaccineCard
                  key={getProgressKey(item)}
                  vaccine={{
                    id: getProgressKey(item),
                    name: item.diseaseName ?? 'Bệnh chưa cập nhật',
                    desc: buildProgressText(item),
                    date: getNextDate(item) ?? '',
                    vaccineTypeId: nextDose?.vaccineId ?? undefined,
                    injectionDate: getNextDate(item) ?? undefined,
                    status: 'disease',
                    progressText: buildProgressText(item),
                    doseHistory: buildDoseHistory(item),
                    warnings: stopped ? ['Đã dừng lịch tiêm bệnh này.'] : item.warnings ?? undefined,
                    isStopped: stopped,
                    canConfirmDose: Boolean(nextDose),
                  }}
                  onConfirmPress={() => openConfirmDose(item)}
                  onSchedulePress={() => openChangeSchedule(item)}
                  onDetailPress={() => openDiseaseDetail(item)}
                  onStopPress={() => stopDiseaseSchedule(item)}
                  onResumePress={() => resumeDiseaseSchedule(item)}
                />
              );
            })}
            {canLoadMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => setVisibleCount((current) => current + LOAD_MORE_DISEASES)}
                activeOpacity={0.86}
              >
                <Ionicons name="chevron-down-circle-outline" size={18} color="#FF8FAB" />
                <Text style={styles.loadMoreText}>Xem thêm bệnh</Text>
              </TouchableOpacity>
            ) : null}
            </>
          ) : (
            <Text style={styles.emptyText}>Không tìm thấy bệnh hoặc vắc-xin phù hợp.</Text>
          )
        ) : (
          <Text style={styles.emptyText}>Bạn chưa chọn hồ sơ. Hãy chọn hồ sơ để xem lịch tiêm.</Text>
        )}

        <View style={{ height: 34 }} />
      </ScrollView>

      <ConfirmSheet
        visible={confirmSheet.visible}
        title={confirmSheet.payload.title}
        message={confirmSheet.payload.message}
        confirmText={confirmSheet.payload.confirmText}
        cancelText={confirmSheet.payload.cancelText}
        tone={confirmSheet.payload.tone}
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
    marginLeft: 7,
    color: '#5C7A8A',
    fontWeight: '900',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#334455' },
  sectionHint: { fontSize: 12, fontWeight: '800', color: '#7A8C99' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderRadius: 19,
    paddingHorizontal: 13,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 9,
    color: '#334455',
    fontSize: 13,
    fontWeight: '800',
  },
  clearSearchButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCountText: {
    marginBottom: 12,
    paddingHorizontal: 5,
    color: '#7A8C99',
    fontSize: 12,
    fontWeight: '800',
  },
  loadMoreButton: {
    minHeight: 44,
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#FFE5EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    marginLeft: 6,
    color: '#FF8FAB',
    fontSize: 13,
    fontWeight: '900',
  },
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
});
