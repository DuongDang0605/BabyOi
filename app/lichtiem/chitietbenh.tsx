import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ConfirmSheet } from '../../components/common/ConfirmSheet';
import { useConfirmSheet } from '../../components/common/useConfirmSheet';
import {
  createVaccineRecord,
  deleteVaccineRecord,
  getChildDiseasePlan,
  getVaccineProgress,
  getVaccineRecord,
  updateVaccineRecord,
  type ChildDiseaseDosePlanResponse,
  type ChildDiseasePlanResponse,
  type VaccineProgressDoseResponse,
  type VaccineProgressResponse,
  type VaccineRecordResponse,
} from '../../lib/api';
import { useNotification } from '../../lib/notification';

const PENDING_STATUS = -1;
const SUCCESS_STATUS = 3;
const CANCELED_STATUS = -2;

const VACCINE_RECORD_SOURCE = {
  STANDARD: 1,
  CUSTOM: 2,
};

type DoseWithRecord = {
  dose: VaccineProgressDoseResponse;
  record: VaccineRecordResponse | null;
  planDose: ChildDiseaseDosePlanResponse | null;
};

const getParamValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

function formatDate(value?: string | null) {
  if (!value) {
    return 'Chưa cập nhật';
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

function getDateTime(value?: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function getStatusLabel(status?: number | null) {
  if (status === SUCCESS_STATUS) {
    return 'Đã tiêm';
  }
  if (status === PENDING_STATUS) {
    return 'Sắp tới';
  }
  return 'Khác';
}

function getStatusIcon(status?: number | null) {
  if (status === SUCCESS_STATUS) {
    return 'shield-checkmark';
  }
  if (status === PENDING_STATUS) {
    return 'calendar-outline';
  }
  return 'ellipse-outline';
}

function formatPrice(value?: number | null) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return `${value.toLocaleString('vi-VN')}đ`;
}

function canChangeVaccine(progress?: VaccineProgressResponse | null) {
  return !['NOT_INTERCHANGEABLE', 'SPECIAL_RESTART_REQUIRED'].includes(progress?.interchangeRuleCode ?? '');
}

function getSortedDoses(progress?: VaccineProgressResponse | null) {
  return [...(progress?.doses ?? [])].sort((left, right) => {
    const leftDate = getDateTime(left.actualInjectionDate || left.injectionDate);
    const rightDate = getDateTime(right.actualInjectionDate || right.injectionDate);

    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return (left.doseOrder ?? 0) - (right.doseOrder ?? 0);
  });
}

export default function DiseaseVaccineDetailScreen() {
  const params = useLocalSearchParams<{ profileId?: string; diseaseId?: string; diseaseCode?: string; diseaseName?: string; refreshAt?: string }>();
  const profileId = getParamValue(params.profileId);
  const diseaseId = Number(getParamValue(params.diseaseId));
  const diseaseCode = getParamValue(params.diseaseCode);
  const routeDiseaseName = getParamValue(params.diseaseName);
  const refreshAt = getParamValue(params.refreshAt);
  const { showNotification } = useNotification();
  const confirmSheet = useConfirmSheet();

  const [progress, setProgress] = useState<VaccineProgressResponse | null>(null);
  const [plan, setPlan] = useState<ChildDiseasePlanResponse | null>(null);
  const [doseRecords, setDoseRecords] = useState<DoseWithRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      if (!profileId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [progressItems, diseasePlan] = await Promise.all([
          getVaccineProgress(profileId),
          Number.isFinite(diseaseId) ? getChildDiseasePlan(diseaseId) : Promise.resolve(null),
        ]);
        const matchedProgress = progressItems.find((item) => {
          if (Number.isFinite(diseaseId) && item.diseaseId === diseaseId) {
            return true;
          }
          return Boolean(diseaseCode && item.diseaseCode === diseaseCode);
        }) ?? null;

        const sortedDoses = getSortedDoses(matchedProgress);
        const planDoses = diseasePlan?.doses ?? [];
        const doseRows = sortedDoses.length > 0
          ? sortedDoses
          : planDoses.map((item) => ({
              recordId: null,
              doseOrder: item.schedule.doseOrder,
              source: VACCINE_RECORD_SOURCE.STANDARD,
              sourceCode: 'STANDARD',
              vaccineId: null,
              vaccineName: item.schedule.doseLabel,
              manufacturer: null,
              injectionDate: null,
              actualInjectionDate: null,
              status: PENDING_STATUS,
              note: item.schedule.note,
            }));
        const records = await Promise.all(sortedDoses.map(async (dose) => {
          if (!dose.recordId) {
            return {
              dose,
              record: null,
              planDose: planDoses.find((item) => item.schedule.doseOrder === dose.doseOrder) ?? null,
            };
          }

          try {
            return {
              dose,
              record: await getVaccineRecord(dose.recordId),
              planDose: planDoses.find((item) => item.schedule.doseOrder === dose.doseOrder) ?? null,
            };
          } catch {
            return {
              dose,
              record: null,
              planDose: planDoses.find((item) => item.schedule.doseOrder === dose.doseOrder) ?? null,
            };
          }
        }));

        if (!cancelled) {
          setProgress(matchedProgress);
          setPlan(diseasePlan);
          setDoseRecords(records.length > 0 ? records : doseRows.map((dose) => ({
            dose,
            record: null,
            planDose: planDoses.find((item) => item.schedule.doseOrder === dose.doseOrder) ?? null,
          })));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [diseaseCode, diseaseId, profileId, refreshAt]);

  const title = progress?.diseaseName || plan?.disease.name || routeDiseaseName || 'Chi tiết bệnh';
  const completedCount = progress?.completedDoses ?? 0;
  const totalDoses = progress?.totalDoses ?? progress?.doses?.length ?? plan?.doses.length ?? 0;
  const nextDose = useMemo(() => doseRecords.find((item) => item.dose.status === PENDING_STATUS), [doseRecords]);
  const lastPendingDoseOrder = useMemo(() => {
    return doseRecords
      .filter((item) => item.dose.status === PENDING_STATUS)
      .map((item) => item.dose.doseOrder ?? 0)
      .reduce((max, doseOrder) => Math.max(max, doseOrder), 0);
  }, [doseRecords]);
  const isFullyCompleted = doseRecords.length > 0 && !nextDose;
  const diseaseVaccineOptions = useMemo(() => {
    const seen = new Set<number>();
    return (plan?.doses ?? [])
      .flatMap((item) => item.vaccineOptions ?? [])
      .filter((option) => {
        const key = option.vaccineId ?? option.id;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }, [plan]);
  const warningText = progress?.warnings?.filter(Boolean).join(' ') || '';

  const goBackToList = () => {
    router.replace({
      pathname: '/lichtiem/listlichtiem',
      params: {
        profileId: profileId ?? '',
        refreshAt: Date.now().toString(),
      },
    });
  };

  const openUpdateDose = (item: DoseWithRecord) => {
    if (!profileId) {
      return;
    }

    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId,
        mode: item.dose.recordId ? 'edit' : undefined,
        recordId: item.dose.recordId ?? '',
        vaccineTypeId: item.dose.vaccineId ?? '',
        vaccineName: item.dose.vaccineName || item.record?.vaccineTypeName || title,
        diseaseId: plan?.disease.id ?? progress?.diseaseId ?? '',
        diseaseName: title,
        doseOrder: item.dose.doseOrder ?? '',
        source: item.dose.source ?? '',
        injectionDate: item.record?.injectionDate || item.dose.injectionDate || '',
        location: item.record?.location || '',
        price: item.record?.price ? String(item.record.price) : '',
        note: item.record?.note || item.dose.note || '',
        status: item.record?.status ?? item.dose.status ?? '',
        allowVaccineChange: canChangeVaccine(progress) ? '1' : '0',
      },
    });
  };

  const openAddCustomDose = () => {
    if (!profileId) {
      return;
    }

    const targetDiseaseId = plan?.disease.id ?? progress?.diseaseId;
    if (!targetDiseaseId) {
      return;
    }

    const nextCustomDoseOrder = Math.max(0, ...(doseRecords.map((item) => item.dose.doseOrder ?? 0))) + 1;
    router.push({
      pathname: '/lichtiem/themmuitiem',
      params: {
        profileId: String(profileId),
        diseaseId: String(targetDiseaseId),
        diseaseName: title,
        doseOrder: String(nextCustomDoseOrder),
        source: String(VACCINE_RECORD_SOURCE.CUSTOM),
        allowVaccineChange: '1',
      },
    });
  };

  const performSkipDose = async (item: DoseWithRecord) => {
    if (!profileId) {
      return;
    }
    const source = item.dose.source ?? VACCINE_RECORD_SOURCE.STANDARD;

    const payload = {
      profileId: Number(profileId),
      diseaseId: plan?.disease.id ?? progress?.diseaseId ?? undefined,
      doseOrder: item.dose.doseOrder ?? undefined,
      source,
      vaccineTypeId: item.dose.vaccineId ?? null,
      injectionDate: item.record?.injectionDate || item.dose.injectionDate || null,
      actualInjectionDate: item.record?.actualInjectionDate || undefined,
      price: item.record?.price ?? undefined,
      note: item.record?.note || item.dose.note || undefined,
      status: CANCELED_STATUS,
    };

    try {
      if (source === VACCINE_RECORD_SOURCE.CUSTOM && item.dose.recordId) {
        await deleteVaccineRecord(item.dose.recordId);
      } else if (item.dose.recordId) {
        await updateVaccineRecord(item.dose.recordId, payload);
      } else {
        await createVaccineRecord(payload);
      }
      showNotification({
        type: 'success',
        title: 'Đã bỏ mũi này',
        message: 'Lịch cá nhân của bé đã được cập nhật.',
      });
      const progressItems = await getVaccineProgress(profileId);
      setProgress(progressItems.find((entry) => entry.diseaseId === (plan?.disease.id ?? progress?.diseaseId)) ?? progress);
      router.replace({
        pathname: '/lichtiem/chitietbenh',
        params: {
          profileId,
          diseaseId: String(plan?.disease.id ?? progress?.diseaseId ?? ''),
          diseaseCode: diseaseCode ?? '',
          diseaseName: title,
          refreshAt: Date.now().toString(),
        },
      });
    } catch {
      showNotification({
        type: 'error',
        title: 'Chưa bỏ được mũi',
        message: 'Vui lòng thử lại sau.',
      });
    }
  };

  const skipDose = (item: DoseWithRecord) => {
    const doseLabel = item.dose.doseOrder ? `mũi ${item.dose.doseOrder}` : 'mũi này';
    const isCustom = item.dose.source === VACCINE_RECORD_SOURCE.CUSTOM;
    confirmSheet.show({
      title: 'Bỏ mũi này?',
      message: isCustom
        ? `Xóa hẳn ${doseLabel} được thêm riêng khỏi lịch của bé nhé?`
        : `Bỏ ${doseLabel} khỏi lịch cá nhân của bé nhé? Mũi này sẽ không còn được tính trong tiến trình, nhưng khung lịch chung không bị thay đổi.`,
      cancelText: 'Không',
      confirmText: 'Bỏ mũi',
      tone: 'danger',
      onConfirm: () => performSkipDose(item),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
        <ActivityIndicator color="#ff8fab" />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={goBackToList} style={styles.backButton}>
            <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>Thông tin bệnh và các lần tiêm</Text>
          </View>
          <View style={styles.headerGhostButton}>
            <Ionicons name="medical-outline" size={21} color="#5ABF7A" />
          </View>
        </View>

        <LinearGradient colors={['#FFFFFF', '#FFF8FA', '#EFFBFF']} style={styles.infoCard}>
          <View style={styles.cardGlowPink} />
          <Text style={styles.infoLabel}>Thông tin bệnh</Text>
          <Text style={styles.infoTitle}>{title}</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricNumber}>{completedCount}/{totalDoses}</Text>
              <Text style={styles.metricLabel}>Tiến trình</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={[styles.metricNumber, styles.nextMetricNumber]}>
                {nextDose?.dose.doseOrder ?? progress?.nextDoseOrder ?? '-'}
              </Text>
              <Text style={styles.metricLabel}>Mũi tiếp theo</Text>
            </View>
          </View>
          <View style={styles.infoLine}>
            <Ionicons name="calendar-number-outline" size={16} color="#FF9C6E" />
            <Text style={styles.infoLineText}>Dự kiến tiếp theo: {formatDate(nextDose?.dose.injectionDate || progress?.nextInjectionDate)}</Text>
          </View>
          {warningText ? (
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#D46B08" />
              <Text style={styles.warningText}>{warningText}</Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Các lần tiêm</Text>
          <TouchableOpacity style={styles.addDoseButton} onPress={openAddCustomDose} activeOpacity={0.86}>
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addDoseButtonText}>Thêm mũi</Text>
          </TouchableOpacity>
        </View>

        {doseRecords.length > 0 ? (
          doseRecords.map(({ dose, record, planDose }, index) => {
            const isDone = dose.status === SUCCESS_STATUS;
            const isPending = dose.status === PENDING_STATUS;
            const canSkipDose = isPending && (dose.doseOrder ?? 0) === lastPendingDoseOrder;
            const shouldShowTimelineLine = index < doseRecords.length - 1 || isFullyCompleted;
            const isCustomDose = dose.source === VACCINE_RECORD_SOURCE.CUSTOM;
            const vaccineOptions = planDose?.vaccineOptions ?? (isCustomDose ? diseaseVaccineOptions : []);

            return (
            <View key={`${dose.recordId ?? index}-${dose.doseOrder ?? index}`} style={styles.doseCard}>
              <View style={styles.doseTimeline}>
                <View style={[styles.doseIcon, isDone ? styles.doneIcon : styles.pendingIcon]}>
                  <Ionicons
                    name={getStatusIcon(dose.status)}
                    size={18}
                    color={isDone ? '#5ABF7A' : '#FF9C6E'}
                  />
                </View>
                {shouldShowTimelineLine ? <View style={styles.timelineLine} /> : null}
              </View>

              <View style={styles.doseContent}>
                <View style={styles.doseHeaderRow}>
                  <View style={styles.doseTitleBlock}>
                    <Text style={styles.doseTitle}>Lần {dose.doseOrder ?? index + 1}</Text>
                    <Text style={styles.doseSubtitle}>{dose.vaccineName || record?.vaccineTypeName || 'Vắc-xin chưa cập nhật'}</Text>
                  </View>
                  <LinearGradient
                    colors={isDone ? ['#E8F9ED', '#EAFBFF'] : ['#FFF1C9', '#FFE6EE']}
                    style={styles.statusBadge}
                  >
                    <Text style={[styles.statusText, isDone ? styles.doneText : styles.pendingText]}>
                      {getStatusLabel(dose.status)}
                    </Text>
                  </LinearGradient>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={15} color="#5EC9E8" />
                  <Text style={styles.detailLabel}>{isDone ? 'Thời gian' : 'Dự kiến'}</Text>
                  <Text style={styles.detailValue}>{formatDate(isDone ? record?.actualInjectionDate || dose.actualInjectionDate || record?.injectionDate || dose.injectionDate : record?.injectionDate || dose.injectionDate)}</Text>
                </View>

                {isDone ? (
                  <>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={15} color="#FF8FAB" />
                      <Text style={styles.detailLabel}>Địa điểm</Text>
                      <Text style={styles.detailValue}>{record?.location || 'Chưa cập nhật'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={15} color="#5ABF7A" />
                      <Text style={styles.detailLabel}>Giá</Text>
                      <Text style={styles.detailValue}>{formatPrice(record?.price)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={15} color="#B55CCB" />
                      <Text style={styles.detailLabel}>Ghi chú</Text>
                      <Text style={styles.detailValue}>{record?.note || dose.note || 'Không có ghi chú'}</Text>
                    </View>
                  </>
                ) : null}

                {isPending && vaccineOptions.length > 0 ? (
                  <View style={styles.optionBox}>
                    <Text style={styles.optionTitle}>Vaccine có thể dùng</Text>
                    {vaccineOptions.slice(0, 4).map((option) => (
                      <View key={option.id} style={styles.optionRow}>
                        <Ionicons
                          name={option.preferred ? 'star' : 'medical-outline'}
                          size={14}
                          color={option.preferred ? '#FF9C6E' : '#5EC9E8'}
                        />
                        <Text style={styles.optionText}>
                          {option.vaccineName || 'Vaccine chưa cập nhật'}
                          {option.manufacturer ? ` - ${option.manufacturer}` : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.doseActionRow}>
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => openUpdateDose({ dose, record, planDose })}
                    activeOpacity={0.86}
                  >
                    <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>{dose.recordId ? 'Cập nhật thông tin' : 'Lên lịch mũi này'}</Text>
                  </TouchableOpacity>
                  {canSkipDose ? (
                    <TouchableOpacity
                      style={styles.skipButton}
                      onPress={() => skipDose({ dose, record, planDose })}
                      activeOpacity={0.86}
                    >
                      <Ionicons name="remove-circle-outline" size={16} color="#D46B08" />
                      <Text style={styles.skipButtonText}>Bỏ mũi</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>Chưa có thông tin lần tiêm cho bệnh này.</Text>
        )}

        {isFullyCompleted ? (
          <View style={styles.addStageRow}>
            <View style={styles.stageTimeline}>
              <View style={styles.stageTimelineLine} />
              <View style={styles.stageIcon}>
                <Ionicons name="add" size={18} color="#FF8FAB" />
              </View>
            </View>
            <TouchableOpacity style={styles.addStageButton} onPress={openAddCustomDose} activeOpacity={0.86}>
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.addStageButtonText}>Thêm mũi mới</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
  scrollArea: { paddingHorizontal: 20, paddingTop: 20 },
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
  header: {
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
    fontSize: 22,
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
  infoCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    overflow: 'hidden',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  cardGlowPink: {
    position: 'absolute',
    right: -18,
    top: -22,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255, 143, 171, 0.12)',
  },
  infoLabel: {
    color: '#7A8C99',
    fontSize: 12,
    fontWeight: '900',
  },
  infoTitle: {
    marginTop: 4,
    color: '#334455',
    fontSize: 20,
    fontWeight: '900',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#EEF0F4',
  },
  metricNumber: {
    color: '#5ABF7A',
    fontSize: 24,
    fontWeight: '900',
  },
  nextMetricNumber: {
    color: '#FF9C6E',
  },
  metricLabel: {
    marginTop: 2,
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '900',
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoLineText: {
    flex: 1,
    marginLeft: 8,
    color: '#5C7A8A',
    fontSize: 13,
    fontWeight: '800',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 11,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 241, 201, 0.62)',
    borderWidth: 1,
    borderColor: '#FFE6BA',
  },
  warningText: {
    flex: 1,
    marginLeft: 7,
    color: '#9A5A00',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    color: '#334455',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#7A8C99',
    fontSize: 12,
    fontWeight: '800',
  },
  addDoseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#FF8FAB',
  },
  addDoseButtonText: {
    marginLeft: 5,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  addStageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageTimeline: {
    width: 40,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  stageTimelineLine: {
    position: 'absolute',
    top: -26,
    width: 2,
    height: 43,
    backgroundColor: '#FFE5EC',
    zIndex: 0,
  },
  stageIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFE6EE',
    zIndex: 1,
  },
  addStageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#FF8FAB',
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  addStageButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  doseCard: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  doseTimeline: {
    width: 40,
    alignItems: 'center',
  },
  doseIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doneIcon: {
    backgroundColor: '#E8F9ED',
  },
  pendingIcon: {
    backgroundColor: '#FFF1C9',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 5,
    backgroundColor: '#FFE5EC',
  },
  doseContent: {
    flex: 1,
    padding: 13,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: '#FFE5EC',
  },
  doseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  doseTitleBlock: {
    flex: 1,
    paddingRight: 8,
  },
  doseTitle: {
    color: '#334455',
    fontSize: 15,
    fontWeight: '900',
  },
  doseSubtitle: {
    marginTop: 3,
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  doneText: {
    color: '#2E7D32',
  },
  pendingText: {
    color: '#D46B08',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  detailLabel: {
    width: 62,
    marginLeft: 7,
    color: '#7A8C99',
    fontSize: 12,
    fontWeight: '900',
  },
  detailValue: {
    flex: 1,
    color: '#334455',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  optionBox: {
    marginTop: 11,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 251, 255, 0.72)',
    borderWidth: 1,
    borderColor: '#DDF5FB',
  },
  optionTitle: {
    color: '#334455',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  optionText: {
    flex: 1,
    marginLeft: 7,
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  doseActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 13,
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 18,
    backgroundColor: '#5ABF7A',
    shadowColor: '#5ABF7A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: '#FFF1C9',
    borderWidth: 1,
    borderColor: '#FFE6BA',
  },
  updateButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  skipButtonText: {
    marginLeft: 5,
    color: '#D46B08',
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
