import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  generateNutritionPlan,
  getHealthRecords,
  getNutritionPlanHistory,
  type HealthRecordResponse,
  type ProfileResponse,
} from '../../lib/api';
import {
  getNutritionPlanMetaStorageKey,
  getNutritionPlanStorageKey,
  persistNutritionPlanIngredientAmounts,
} from '../../lib/nutrition-plan-storage';
import { ensureCurrentUserSelectedProfile } from '../../lib/profile-session';

const NUTRITION_MASCOT = require('../../assets/images/AI_food_pink.png');
const WEIGHT_LOSS_GOAL = 'Giảm cân';

type GoalOption = {
  label: string;
  code: string;
};

const MOTHER_GOALS: GoalOption[] = [
  { label: WEIGHT_LOSS_GOAL, code: 'FOR_MOTHER_DIET' },
  { label: 'Đổi chế độ ăn', code: 'FOR_MOTHER_CHANGE_DIET' },
  { label: 'Sau sinh cho bú', code: 'FOR_MOTHER_POSTPARTUM_BREASTFEEDING' },
  { label: 'Tăng sữa', code: 'FOR_MOTHER_INCREASE_MILK_SUPPLY' },
  { label: 'Ngủ và giảm căng thẳng', code: 'FOR_MOTHER_SLEEP_STRESS_SUPPORT' },
  { label: 'Năng lượng khỏe', code: 'FOR_MOTHER_HEALTHY_ENERGY' },
  { label: 'Dễ tiêu', code: 'FOR_MOTHER_DIGESTION_RECOVERY' },
];

const MEAL_TYPES_BY_COUNT: Record<number, string[]> = {
  1: ['BREAKFAST'],
  2: ['BREAKFAST', 'LUNCH'],
  3: ['BREAKFAST', 'LUNCH', 'DINNER'],
  4: ['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'DINNER'],
  5: ['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER'],
  6: ['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK'],
};

function toDisplayDate(date: Date) {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseDisplayDate(value: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getProfileLabel(profileType?: string | null) {
  const type = profileType?.toUpperCase();
  return type === 'MOTHER' ? 'mẹ' : 'bé';
}

function getAgeMonths(dateOfBirth?: string | null) {
  if (!dateOfBirth) {
    return 12;
  }
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months += today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function getChildGoalCodes(dateOfBirth?: string | null) {
  const months = getAgeMonths(dateOfBirth);
  if (months <= 8) {
    return { range: '6-8 tháng', base: 'FOR_BABY_6_8_MONTHS', development: 'FOR_BABY_6_8_MONTHS_DEVELOPMENT' };
  }
  if (months <= 11) {
    return { range: '9-11 tháng', base: 'FOR_BABY_9_11_MONTHS', development: 'FOR_BABY_9_11_MONTHS_DEVELOPMENT' };
  }
  if (months <= 18) {
    return { range: '12-18 tháng', base: 'FOR_BABY_12_18_MONTHS', development: 'FOR_BABY_12_18_MONTHS_DEVELOPMENT' };
  }
  return { range: '19-24 tháng', base: 'FOR_BABY_19_24_MONTHS', development: 'FOR_BABY_19_24_MONTHS_DEVELOPMENT' };
}

function getGoalsForProfile(profile?: ProfileResponse | null): GoalOption[] {
  const type = profile?.profileType?.toUpperCase();
  if (type === 'MOTHER') {
    return MOTHER_GOALS;
  }
  const ageMonths = getAgeMonths(profile?.dateOfBirth);
  if (ageMonths < 4) {
    return [];
  }
  const childCodes = getChildGoalCodes(profile?.dateOfBirth);
  return [{ label: 'Dinh dưỡng phù hợp độ tuổi', code: childCodes.base }];
}

function parseTargetWeight(value: string) {
  const parsed = Number.parseFloat(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getChildMealsPerDay(ageMonths: number) {
  if (ageMonths < 6) return 1;
  if (ageMonths <= 8) return 2;
  return 3;
}

function hasEnergyEstimate(health?: HealthRecordResponse | null) {
  return health?.tdee != null && health.tdee > 0;
}

function getLatestHealthRecord(records: HealthRecordResponse[]) {
  return [...records].sort((a, b) => {
    const dateDiff = new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime();
    return dateDiff || b.id - a.id;
  })[0] ?? null;
}

function getHealthRequirementMessage(profile?: ProfileResponse | null) {
  return profile?.profileType?.toUpperCase() === 'MOTHER'
    ? 'Mẹ cần cập nhật chiều cao, cân nặng và mức vận động để BabyOi tính TDEE trước khi tạo lịch ăn.'
    : 'Hồ sơ bé cần có cân nặng mới nhất để BabyOi tính nhu cầu năng lượng trước khi tạo lịch ăn.';
}

export default function AIPlannerScreen() {
  const today = useMemo(() => new Date(), []);
  const [selectedProfile, setSelectedProfile] = useState<ProfileResponse | null>(null);
  const [startDate, setStartDate] = useState(toDisplayDate(today));
  const [durationDays, setDurationDays] = useState(7);
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [currentGoal, setCurrentGoal] = useState<GoalOption>(() => ({
    label: '12-18 tháng',
    code: 'FOR_BABY_12_18_MONTHS',
  }));
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [latestHealth, setLatestHealth] = useState<HealthRecordResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plannerError, setPlannerError] = useState('');

  const parsedStartDate = useMemo(() => parseDisplayDate(startDate), [startDate]);
  const endDateDisplay = useMemo(() => {
    if (!parsedStartDate) {
      return '--';
    }
    return toDisplayDate(addDays(parsedStartDate, durationDays - 1));
  }, [durationDays, parsedStartDate]);
  const availableGoals = useMemo(() => getGoalsForProfile(selectedProfile), [selectedProfile]);
  const selectedProfileAgeMonths = useMemo(
    () => getAgeMonths(selectedProfile?.dateOfBirth),
    [selectedProfile?.dateOfBirth],
  );
  const isChildProfile = selectedProfile?.profileType?.toUpperCase() !== 'MOTHER';
  const isChildUnderSixMonths = isChildProfile && selectedProfileAgeMonths < 6;
  const effectiveMealsPerDay = isChildProfile ? getChildMealsPerDay(selectedProfileAgeMonths) : mealsPerDay;
  const allowedMealTypes = MEAL_TYPES_BY_COUNT[effectiveMealsPerDay] || MEAL_TYPES_BY_COUNT[3];
  const isWeightLossGoal = !isChildProfile && currentGoal.label === WEIGHT_LOSS_GOAL;
  const profileLabel = getProfileLabel(selectedProfile?.profileType);
  const hasRequiredHealthData = hasEnergyEstimate(latestHealth);

  useEffect(() => {
    let mounted = true;
    ensureCurrentUserSelectedProfile()
      .then((profile) => {
        if (mounted) {
          setSelectedProfile(profile);
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Vui lòng chọn hồ sơ trước khi tạo lịch ăn.';
        Alert.alert('Bé Đậu dinh dưỡng', message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!availableGoals.length) {
      return;
    }
    if (!availableGoals.some((goal) => goal.label === currentGoal.label && goal.code === currentGoal.code)) {
      setCurrentGoal(availableGoals[0]);
      setTargetWeightKg('');
    }
  }, [availableGoals, currentGoal]);

  useEffect(() => {
    if (!selectedProfile?.id) {
      setLatestHealth(null);
      return;
    }

    let mounted = true;
    setHealthLoading(true);
    getHealthRecords(selectedProfile.id)
      .then((records) => {
        if (mounted) {
          setLatestHealth(getLatestHealthRecord(records));
        }
      })
      .catch(() => {
        if (mounted) {
          setLatestHealth(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setHealthLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedProfile?.id]);

  const openHealthUpdate = () => {
    router.push('/phattrien/update-index');
  };

  const showHealthRequiredAlert = (profile: ProfileResponse) => {
    Alert.alert(
      'Cần cập nhật chỉ số',
      getHealthRequirementMessage(profile),
      [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Cập nhật ngay', onPress: openHealthUpdate },
      ],
    );
  };

  const createPlan = async () => {
    setPlannerError('');
    if (loading) {
      return;
    }
    if (!parsedStartDate) {
      Alert.alert('Bé Đậu dinh dưỡng', 'Ngày bắt đầu cần đúng định dạng dd-mm-yyyy.');
      return;
    }
    let profile = selectedProfile;
    if (!profile) {
      try {
        profile = await ensureCurrentUserSelectedProfile();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Vui lòng chọn hồ sơ trước khi tạo lịch ăn.';
        Alert.alert('Bé Đậu dinh dưỡng', message);
        return;
      }
    }
    if (profile.profileType?.toUpperCase() !== 'MOTHER' && getAgeMonths(profile.dateOfBirth) < 6) {
      setPlannerError('Bé dưới 6 tháng nên bú mẹ hoàn toàn; chưa thể tạo lịch ăn bổ sung.');
      Alert.alert(
        'Chưa thể tạo lịch ăn',
        'Bé dưới 6 tháng nên bú mẹ hoàn toàn. Lịch ăn bổ sung sẽ mở khi bé đủ 6 tháng.',
      );
      return;
    }
    let healthForPlan = latestHealth;
    if (!hasEnergyEstimate(healthForPlan)) {
      setPlannerError(getHealthRequirementMessage(profile));
      try {
        const records = await getHealthRecords(profile.id);
        healthForPlan = getLatestHealthRecord(records);
        setLatestHealth(healthForPlan);
      } catch {
        healthForPlan = null;
      }
    }
    if (!hasEnergyEstimate(healthForPlan)) {
      showHealthRequiredAlert(profile);
      return;
    }
    try {
      const existingPlans = await getNutritionPlanHistory(profile.id);
      if (existingPlans.some((item) => item.lifecycleStatus === 'ACTIVE')) {
        setPlannerError('Hãy hoàn thành hoặc xóa lịch ăn đang thực hiện trước khi tạo lịch mới.');
        Alert.alert(
          'Đang có lịch ăn',
          'Hãy hoàn thành hoặc xóa lịch ăn đang thực hiện trước khi tạo lịch mới.',
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Xem lịch ăn', onPress: () => router.replace('/dinhduong/WeeklyView') },
          ],
        );
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không kiểm tra được lịch ăn hiện tại.';
      setPlannerError(message);
      Alert.alert('Bé Đậu dinh dưỡng', message);
      return;
    }

    const targetWeight = isWeightLossGoal ? parseTargetWeight(targetWeightKg) : null;
    if (isWeightLossGoal && (targetWeight == null || targetWeight < 30 || targetWeight > 200)) {
      Alert.alert('Bé Đậu dinh dưỡng', 'Khi chọn mục tiêu giảm cân, mẹ cần nhập cân nặng hướng đến hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const startDateIso = toIsoDate(parsedStartDate);
      const endDateIso = toIsoDate(addDays(parsedStartDate, durationDays - 1));
      const goalForPlanner = isWeightLossGoal && targetWeight != null
        ? `${currentGoal.label} - cân nặng hướng đến ${targetWeight} kg`
        : currentGoal.label;
      const trimmedNotes = userNotes.trim();
      const plan = await generateNutritionPlan({
        profileId: profile.id,
        startDate: startDateIso,
        endDate: endDateIso,
        mealsPerDay: effectiveMealsPerDay,
        allowedMealTypes,
        currentGoal: goalForPlanner,
        goalCode: currentGoal.code,
        targetWeightKg: targetWeight ?? undefined,
        userNotes: trimmedNotes,
      });
      await persistNutritionPlanIngredientAmounts(plan);
      await AsyncStorage.setItem(getNutritionPlanStorageKey(profile.id), JSON.stringify(plan));
      await AsyncStorage.setItem(getNutritionPlanMetaStorageKey(profile.id), JSON.stringify({
        currentGoal: goalForPlanner,
        targetWeightKg: targetWeight,
        userNotes: trimmedNotes,
      }));
      router.replace({
        pathname: '/dinhduong/WeeklyView',
        params: { planId: plan.planId ? String(plan.planId) : 'latest', target: getProfileLabel(profile.profileType) },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không tạo được lịch ăn, mẹ thử lại nhé.';
      setPlannerError(message);
      if (/cập nhật|TDEE|EER|cân nặng|chiều cao|vận động/i.test(message)) {
        showHealthRequiredAlert(profile);
      } else {
        Alert.alert('Bé Đậu dinh dưỡng', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#FF8FAB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bé Đậu dinh dưỡng</Text>
        <View style={styles.iconButton}>
          <Ionicons name="nutrition-outline" size={22} color="#FF8FAB" />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroImageWrap}>
              <Image source={NUTRITION_MASCOT} style={styles.heroImage} resizeMode="cover" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>Bé Đậu dinh dưỡng</Text>
              <Text style={styles.heroTitle}>Lập thực đơn từ hồ sơ {profileLabel}</Text>
              <Text style={styles.heroSubtitle}>Bé Đậu dùng sức khỏe, TDEE, món yêu thích, món hạn chế và thư viện món ăn để cân khẩu phần phù hợp.</Text>
            </View>
          </View>

          {selectedProfile && !healthLoading && !hasRequiredHealthData && (
            <View style={styles.healthNotice}>
              <View style={styles.healthNoticeIcon}>
                <Ionicons name="pulse-outline" size={19} color="#D9912B" />
              </View>
              <View style={styles.healthNoticeBody}>
                <Text style={styles.healthNoticeTitle}>Thiếu chỉ số sức khỏe</Text>
                <Text style={styles.healthNoticeText}>{getHealthRequirementMessage(selectedProfile)}</Text>
              </View>
              <TouchableOpacity style={styles.healthNoticeButton} onPress={openHealthUpdate}>
                <Text style={styles.healthNoticeButtonText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={19} color="#FF8FAB" />
              <TextInput value={startDate} onChangeText={setStartDate} style={styles.dateInput} placeholder="dd-mm-yyyy" autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Khoảng thời gian</Text>
            <View style={styles.segmentRow}>
              {[3, 5, 7].map((days) => (
                <TouchableOpacity key={days} style={[styles.segment, durationDays === days && styles.segmentActive]} onPress={() => setDurationDays(days)}>
                  <Text style={[styles.segmentText, durationDays === days && styles.segmentTextActive]}>{days} ngày</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helper}>Kết thúc: {endDateDisplay}</Text>
          </View>

          {!isChildProfile && (
            <View style={styles.section}>
              <Text style={styles.label}>Số bữa mỗi ngày</Text>
              <View style={styles.mealCountRow}>
                {[3, 4, 5, 6].map((count) => (
                  <TouchableOpacity key={count} style={[styles.mealSegment, mealsPerDay === count && styles.segmentActive]} onPress={() => setMealsPerDay(count)}>
                    <Text style={[styles.segmentText, mealsPerDay === count && styles.segmentTextActive]}>{count} bữa</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {isChildProfile ? (
            isChildUnderSixMonths ? (
              <View style={styles.section}>
                <Text style={styles.label}>Chế độ dinh dưỡng theo độ tuổi</Text>
                <View style={styles.ageWarning}>
                  <Ionicons name="information-circle-outline" size={20} color="#D9912B" />
                  <Text style={styles.ageWarningText}>
                    Bé dưới 6 tháng nên bú mẹ hoàn toàn. Lịch ăn bổ sung sẽ mở khi bé đủ 6 tháng.
                  </Text>
                </View>
              </View>
            ) : selectedProfileAgeMonths < 12 ? (
              <View style={styles.section}>
                <Text style={styles.label}>Chế độ dinh dưỡng theo độ tuổi</Text>
                <View style={styles.ageWarning}>
                  <Ionicons name="information-circle-outline" size={20} color="#D9912B" />
                  <Text style={styles.ageWarningText}>
                    Bé từ 6 đến 11 tháng tuổi, sữa mẹ vẫn là nguồn dinh dưỡng chính; các bữa ăn dặm chỉ là phần bổ sung và cần tăng dần theo khả năng của bé.
                  </Text>
                </View>
              </View>
            ) : null
          ) : (
            <View style={styles.section}>
              <Text style={styles.label}>Mục tiêu của mẹ</Text>
              <View style={styles.chipWrap}>
                {availableGoals.map((goal) => (
                  <TouchableOpacity
                    key={`${goal.code}-${goal.label}`}
                    style={[styles.goalChip, currentGoal.label === goal.label && styles.goalChipActive]}
                    onPress={() => setCurrentGoal(goal)}
                  >
                    <Text style={[styles.goalText, currentGoal.label === goal.label && styles.goalTextActive]}>{goal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {isWeightLossGoal && (
            <View style={styles.section}>
              <Text style={styles.label}>Cân nặng hướng đến</Text>
              <View style={styles.inputRow}>
                <Ionicons name="scale-outline" size={19} color="#FF8FAB" />
                <TextInput
                  value={targetWeightKg}
                  onChangeText={setTargetWeightKg}
                  style={styles.dateInput}
                  placeholder="Ví dụ: 55"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputSuffix}>kg</Text>
              </View>
              <Text style={styles.helper}>Bé Đậu sẽ dùng mốc này để chọn tổng năng lượng và khẩu phần an toàn hơn.</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Yếu tố cần lưu ý</Text>
            <TextInput
              value={userNotes}
              onChangeText={setUserNotes}
              style={styles.goalInput}
              multiline
              placeholder="Ví dụ: bé dị ứng tôm, không thích cà rốt; mẹ muốn né món cay, nhiều dầu."
              textAlignVertical="top"
            />
          </View>

          {!!plannerError && (
            <View style={styles.plannerErrorBox}>
              <Ionicons name="alert-circle-outline" size={19} color="#D95757" />
              <Text style={styles.plannerErrorText}>{plannerError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={createPlan}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />}
            <Text style={styles.primaryText}>{loading ? 'Đang tạo lịch ăn' : 'Tạo lịch ăn'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 58, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 19, fontWeight: '900', color: '#5C7A8A' },
  keyboard: { flex: 1 },
  content: { padding: 20, paddingBottom: 42 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#FFE3EA', marginBottom: 18 },
  heroImageWrap: { width: 96, height: 104, borderRadius: 8, marginRight: 14, backgroundColor: '#FFF0F3', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroCopy: { flex: 1 },
  heroKicker: { fontSize: 11, fontWeight: '900', color: '#FF8FAB', marginBottom: 4 },
  heroTitle: { fontSize: 18, lineHeight: 24, fontWeight: '900', color: '#5C7A8A' },
  heroSubtitle: { fontSize: 13, lineHeight: 19, color: '#78909C', fontWeight: '600', marginTop: 6 },
  healthNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#FFE3A8', borderRadius: 8, padding: 12, marginBottom: 18 },
  healthNoticeIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#FFF0C2', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  healthNoticeBody: { flex: 1 },
  healthNoticeTitle: { color: '#9A6A19', fontWeight: '900', fontSize: 13 },
  healthNoticeText: { color: '#9A6A19', fontWeight: '700', fontSize: 12, lineHeight: 17, marginTop: 2 },
  healthNoticeButton: { height: 34, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FF8FAB', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  healthNoticeButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  section: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '900', color: '#5C7A8A', marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E3E6', borderRadius: 8, paddingHorizontal: 14, height: 52 },
  dateInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#5C7A8A', fontWeight: '800' },
  inputSuffix: { color: '#78909C', fontWeight: '900', fontSize: 14, marginLeft: 8 },
  segmentRow: { flexDirection: 'row', gap: 10 },
  mealCountRow: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E3E6' },
  mealSegment: { flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E3E6' },
  segmentActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
  segmentText: { fontSize: 14, fontWeight: '900', color: '#78909C' },
  segmentTextActive: { color: '#FFFFFF' },
  helper: { marginTop: 8, color: '#78909C', fontWeight: '700', fontSize: 12, lineHeight: 17 },
  ageWarning: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#FFE3A8', borderRadius: 8, padding: 12 },
  ageWarningText: { flex: 1, marginLeft: 8, color: '#9A6A19', fontWeight: '700', fontSize: 12, lineHeight: 18 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E3E6' },
  goalChipActive: { backgroundColor: '#FFF0F3', borderColor: '#FF8FAB' },
  goalText: { color: '#5C7A8A', fontWeight: '800', fontSize: 13 },
  goalTextActive: { color: '#FF8FAB' },
  goalInput: { minHeight: 96, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E3E6', borderRadius: 8, padding: 14, color: '#5C7A8A', fontWeight: '700', fontSize: 14, lineHeight: 20 },
  primaryButton: { height: 54, borderRadius: 8, backgroundColor: '#FF8FAB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 },
  primaryButtonDisabled: { opacity: 0.72 },
  primaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  plannerErrorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FFF2F2', borderWidth: 1, borderColor: '#FFD5D5', borderRadius: 8, padding: 12, marginBottom: 12 },
  plannerErrorText: { flex: 1, color: '#B63D3D', fontSize: 13, fontWeight: '800', lineHeight: 19 },
});
