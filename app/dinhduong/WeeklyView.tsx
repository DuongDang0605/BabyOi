import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  completeNutritionPlan,
  deleteNutritionPlan,
  getFoodsPage,
  getNutritionPlanHistory,
  updateNutritionPlanMeal,
  type FoodResponse,
  type NutritionPlanDayResponse,
  type NutritionPlanMealResponse,
  type NutritionPlanResponse,
  type ProfileResponse,
} from '../../lib/api';
import {
  clearNutritionPlanIngredientAmounts,
  getNutritionPlanStorageKey,
  persistNutritionPlanIngredientAmounts,
} from '../../lib/nutrition-plan-storage';
import { ensureCurrentUserSelectedProfile } from '../../lib/profile-session';

const NUTRITION_MASCOT = require('../../assets/images/AI_food_pink.png');

const MEAL_LABELS: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  BREAKFAST: { label: 'Sáng', icon: 'sunny-outline', color: '#E7A600', bg: '#FFF8DF' },
  MORNING_SNACK: { label: 'Phụ sáng', icon: 'cafe-outline', color: '#45AFC8', bg: '#E8F8FB' },
  LUNCH: { label: 'Trưa', icon: 'fast-food-outline', color: '#FF8FAB', bg: '#FFF0F3' },
  AFTERNOON_SNACK: { label: 'Phụ chiều', icon: 'leaf-outline', color: '#7CCBC1', bg: '#EAF8F5' },
  DINNER: { label: 'Tối', icon: 'moon-outline', color: '#5C7A8A', bg: '#F0F4F8' },
  EVENING_SNACK: { label: 'Phụ tối', icon: 'sparkles-outline', color: '#9D7BEA', bg: '#F3EDFF' },
};

type MealEditState = {
  key: string;
  mealId: number | string;
};

function formatDate(value?: string | null) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}

function formatKcal(value?: number | null) {
  return value != null && Number.isFinite(value) && value > 0 ? `${Math.round(value)} kcal` : 'Chưa rõ kcal';
}

function mealCalories(meal: NutritionPlanMealResponse) {
  return meal.adjustedCalories ?? meal.nutrition?.totalCalories ?? 0;
}

function dayCalories(meals: NutritionPlanMealResponse[]) {
  return meals.reduce((sum, meal) => sum + mealCalories(meal), 0);
}

function mealKey(meal: NutritionPlanMealResponse) {
  return String(meal.id || `${meal.mealType}-${meal.foodId}`);
}

function mealMeta(mealType: string) {
  return MEAL_LABELS[mealType] ?? {
    label: mealType,
    icon: 'restaurant-outline' as const,
    color: '#FF8FAB',
    bg: '#FFF0F3',
  };
}

function isActive(plan: NutritionPlanResponse) {
  return plan.lifecycleStatus === 'ACTIVE';
}

const NUTRITION_PLAN_NOTICE = 'Lịch ăn mang tính chất tham khảo về cả món ăn lẫn thành phần, mẹ có thể tinh chỉnh cho phù hợp với bản thân hoặc cho bé.';

function getAgeMonths(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) months -= 1;
  return Math.max(0, months);
}

function childMilkNotice(profile?: ProfileResponse | null) {
  if (!profile || profile.profileType?.toUpperCase() === 'MOTHER') return null;
  const ageMonths = getAgeMonths(profile.dateOfBirth);
  if (ageMonths == null) return null;
  if (ageMonths < 6) {
    return 'Trước 6 tháng, sữa mẹ nên là nguồn dinh dưỡng duy nhất. Chỉ làm quen ăn dặm sớm khi có hướng dẫn của bác sĩ hoặc chuyên gia dinh dưỡng.';
  }
  if (ageMonths < 12) {
    return 'Bé từ 6 đến 11 tháng tuổi, sữa mẹ vẫn là nguồn dinh dưỡng chính; các bữa ăn dặm chỉ là phần bổ sung và cần tăng dần theo khả năng của bé.';
  }
  return null;
}

export default function WeeklyViewScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [plans, setPlans] = useState<NutritionPlanResponse[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPlanId, setActionPlanId] = useState<number | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealEditState | null>(null);
  const [replacementSearch, setReplacementSearch] = useState('');
  const [replacementFoods, setReplacementFoods] = useState<FoodResponse[]>([]);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [savingFoodId, setSavingFoodId] = useState<number | null>(null);

  const selectedPlan = useMemo(
    () => plans.find((item) => item.planId === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );
  const hasActivePlan = plans.some(isActive);
  const milkNotice = childMilkNotice(profile);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const selectedProfile = await ensureCurrentUserSelectedProfile();
      setProfile(selectedProfile);
      const items = await getNutritionPlanHistory(selectedProfile.id);
      const sorted = items || [];
      setPlans(sorted);
      setSelectedPlanId((current) => sorted.some((item) => item.planId === current) ? current : null);
    } catch (error) {
      setPlans([]);
      const message = error instanceof Error ? error.message : 'Không tải được lịch ăn.';
      Alert.alert('Bé Đậu dinh dưỡng', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadPlans();
  }, [loadPlans]));

  const persistUpdatedPlan = async (nextPlan: NutritionPlanResponse) => {
    setPlans((items) => items.map((item) => item.planId === nextPlan.planId ? nextPlan : item));
    await persistNutritionPlanIngredientAmounts(nextPlan);
    if (profile?.id) {
      await AsyncStorage.setItem(getNutritionPlanStorageKey(profile.id), JSON.stringify(nextPlan));
    }
  };

  const openPlan = async (plan: NutritionPlanResponse) => {
    setSelectedPlanId(plan.planId);
    setEditingMeal(null);
    await persistNutritionPlanIngredientAmounts(plan);
  };

  const completePlan = (plan: NutritionPlanResponse) => {
    if (!plan.planId) return;
    Alert.alert(
      'Hoàn thành lịch ăn',
      'Lịch này sẽ được chuyển vào lịch sử. Sau đó bạn có thể tạo lịch mới cho hồ sơ này.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            setActionPlanId(plan.planId);
            try {
              const completed = await completeNutritionPlan(plan.planId!);
              await persistUpdatedPlan(completed);
              setSelectedPlanId(null);
            } catch (error) {
              Alert.alert('Bé Đậu dinh dưỡng', error instanceof Error ? error.message : 'Không hoàn thành được lịch ăn.');
            } finally {
              setActionPlanId(null);
            }
          },
        },
      ],
    );
  };

  const removePlan = (plan: NutritionPlanResponse) => {
    if (!plan.planId) return;
    Alert.alert('Xóa lịch ăn', 'Lịch ăn này sẽ bị xóa khỏi danh sách.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setActionPlanId(plan.planId);
          try {
            await deleteNutritionPlan(plan.planId!);
            await clearNutritionPlanIngredientAmounts(plan);
            setPlans((items) => items.filter((item) => item.planId !== plan.planId));
            setSelectedPlanId(null);
            if (profile?.id) {
              await AsyncStorage.removeItem(getNutritionPlanStorageKey(profile.id));
            }
          } catch (error) {
            Alert.alert('Bé Đậu dinh dưỡng', error instanceof Error ? error.message : 'Không xóa được lịch ăn.');
          } finally {
            setActionPlanId(null);
          }
        },
      },
    ]);
  };

  const loadReplacementFoods = async (search = replacementSearch) => {
    if (!selectedPlan) return;
    setReplacementLoading(true);
    try {
      const page = await getFoodsPage({
        page: 0,
        size: 12,
        functionCode: selectedPlan.profileType?.toUpperCase() === 'MOTHER' ? 1 : 2,
        advanceFor: selectedPlan.goalCode || undefined,
        search: search.trim(),
      });
      setReplacementFoods(page.content || []);
    } catch (error) {
      Alert.alert('Bé Đậu dinh dưỡng', error instanceof Error ? error.message : 'Không tải được món thay thế.');
    } finally {
      setReplacementLoading(false);
    }
  };

  const startEditMeal = (meal: NutritionPlanMealResponse) => {
    if (!meal.id || !isActive(selectedPlan!)) return;
    setEditingMeal({ key: mealKey(meal), mealId: meal.id });
    setReplacementSearch('');
    setReplacementFoods([]);
    void loadReplacementFoods('');
  };

  const replaceMealFood = async (food: FoodResponse) => {
    if (!editingMeal || savingFoodId != null) return;
    setSavingFoodId(food.id);
    try {
      const updated = await updateNutritionPlanMeal(editingMeal.mealId, { foodId: food.id });
      await persistUpdatedPlan(updated);
      setEditingMeal(null);
      setReplacementFoods([]);
    } catch (error) {
      Alert.alert('Bé Đậu dinh dưỡng', error instanceof Error ? error.message : 'Không đổi được món.');
    } finally {
      setSavingFoodId(null);
    }
  };

  const renderReplacementPanel = (meal: NutritionPlanMealResponse) => {
    if (editingMeal?.key !== mealKey(meal)) return null;
    return (
      <View style={styles.editPanel}>
        <Text style={styles.editTitle}>Chọn món thay thế</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#FF8FAB" />
          <TextInput
            value={replacementSearch}
            onChangeText={setReplacementSearch}
            placeholder="Nhập tên món"
            placeholderTextColor="#A8BDC8"
            style={styles.searchInput}
            onSubmitEditing={() => void loadReplacementFoods()}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => void loadReplacementFoods()}>
            <Text style={styles.searchButtonText}>Tìm</Text>
          </TouchableOpacity>
        </View>
        {replacementLoading ? (
          <ActivityIndicator color="#FF8FAB" />
        ) : replacementFoods.length ? (
          replacementFoods.map((food) => (
            <TouchableOpacity key={food.id} style={styles.foodOption} onPress={() => void replaceMealFood(food)}>
              {food.imageUrl ? <Image source={{ uri: food.imageUrl }} style={styles.foodImage} /> : <View style={styles.foodImage} />}
              <View style={styles.foodOptionText}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodKcal}>{formatKcal(food.nutrition?.totalCalories)}</Text>
              </View>
              {savingFoodId === food.id ? <ActivityIndicator color="#FF8FAB" /> : <Ionicons name="swap-horizontal-outline" size={20} color="#FF8FAB" />}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyHint}>Không có món phù hợp.</Text>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setEditingMeal(null)}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMeal = (meal: NutritionPlanMealResponse) => {
    const meta = mealMeta(meal.mealType);
    return (
      <View key={mealKey(meal)} style={styles.mealItem}>
        <TouchableOpacity
          style={styles.mealRow}
          onPress={() => meal.foodId && router.push({ pathname: '/dinhduong/recipe-detail', params: { id: meal.foodId } })}
        >
          <View style={[styles.mealIcon, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={18} color={meta.color} />
          </View>
          <View style={styles.mealContent}>
            <Text style={styles.mealType}>{meta.label}</Text>
            <Text style={styles.mealName}>{meal.foodName || 'Món trong thực đơn'}</Text>
            <Text style={styles.mealKcal}>{formatKcal(mealCalories(meal))}</Text>
            {!!meal.reason && <Text style={styles.reason}>{meal.reason}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={17} color="#A8BDC8" />
        </TouchableOpacity>
        {selectedPlan && isActive(selectedPlan) && (
          <TouchableOpacity style={styles.swapButton} onPress={() => startEditMeal(meal)}>
            <Ionicons name="swap-horizontal-outline" size={16} color="#5C7A8A" />
            <Text style={styles.swapButtonText}>Đổi món</Text>
          </TouchableOpacity>
        )}
        {renderReplacementPanel(meal)}
      </View>
    );
  };

  const renderDay = (day: NutritionPlanDayResponse) => (
    <View key={day.id || day.date} style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayTitle}>Ngày {day.dayIndex}</Text>
          <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
        </View>
        <View style={styles.kcalBadge}>
          <Text style={styles.kcalBadgeLabel}>Tổng ngày</Text>
          <Text style={styles.kcalBadgeValue}>{formatKcal(dayCalories(day.meals || []))}</Text>
        </View>
      </View>
      {!!day.note && <Text style={styles.dayNote}>{day.note}</Text>}
      {(day.meals || []).map(renderMeal)}
    </View>
  );

  const renderOverview = () => (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlans} tintColor="#FF8FAB" />}
    >
      <LinearGradient
        colors={['#FF8FAB', '#FFB6C8', '#A7E4F5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.intro}
      >
        <View style={styles.introImageWrap}>
          <Image source={NUTRITION_MASCOT} style={styles.introImage} resizeMode="cover" />
        </View>
        <View style={styles.introText}>
          <Text style={styles.introKicker}>Bé Đậu dinh dưỡng</Text>
          <Text style={styles.introTitle}>Lịch ăn của {profile?.name || 'hồ sơ'}</Text>
          <Text style={styles.introSubtitle}>Mới nhất trước, chạm vào một lịch để xem từng bữa.</Text>
        </View>
      </LinearGradient>

      <View style={styles.noticeBox}>
        <View style={styles.noticeIcon}>
          <Ionicons name="information-circle-outline" size={20} color="#D9912B" />
        </View>
        <Text style={styles.noticeText}>{NUTRITION_PLAN_NOTICE}</Text>
      </View>
      {!!milkNotice && (
        <View style={styles.milkNoticeBox}>
          <View style={styles.milkNoticeIcon}>
            <Ionicons name="water-outline" size={20} color="#45AFC8" />
          </View>
          <Text style={styles.milkNoticeText}>{milkNotice}</Text>
        </View>
      )}

      {!hasActivePlan && (
        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/dinhduong/ai-planner')}>
          <Ionicons name="add-circle-outline" size={19} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Tạo lịch ăn mới</Text>
        </TouchableOpacity>
      )}

      {plans.length ? plans.map((item) => (
        <TouchableOpacity key={item.planId} style={styles.planCard} onPress={() => void openPlan(item)} activeOpacity={0.88}>
          <View style={styles.planCardTop}>
            <View style={[styles.planIcon, isActive(item) ? styles.activePlanIcon : styles.completedPlanIcon]}>
              <Ionicons name={isActive(item) ? 'calendar' : 'checkmark'} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.planCardHeading}>
              <Text style={styles.planRange}>Từ {formatDate(item.startDate)} đến {formatDate(item.endDate)}</Text>
              <Text style={[styles.statusText, isActive(item) ? styles.activeText : styles.completedText]}>
                {isActive(item) ? 'Đang thực hiện' : 'Đã hoàn thành'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#A8BDC8" />
          </View>
          <View style={styles.planStats}>
            <View style={styles.planStat}>
              <Ionicons name="calendar-outline" size={14} color="#45AFC8" />
              <Text style={styles.planStatText}>{item.days?.length || 0} ngày</Text>
            </View>
            <View style={styles.planStat}>
              <Ionicons name="restaurant-outline" size={14} color="#FF8FAB" />
              <Text style={styles.planStatText}>{item.mealsPerDay || 0} bữa/ngày</Text>
            </View>
          </View>
          {!!item.summary && <Text style={styles.planSummary} numberOfLines={2}>{item.summary}</Text>}
        </TouchableOpacity>
      )) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chưa có lịch ăn</Text>
          <Text style={styles.emptyText}>Tạo lịch đầu tiên cho riêng hồ sơ này.</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDetail = () => {
    if (!selectedPlan) return null;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['#FFF0F5', '#F1FBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detailSummary}
        >
          <View style={styles.detailTop}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={23} color="#FF8FAB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailRange}>Từ {formatDate(selectedPlan.startDate)} đến {formatDate(selectedPlan.endDate)}</Text>
              <Text style={styles.planMeta}>{selectedPlan.mealsPerDay} bữa/ngày</Text>
            </View>
            <View style={[styles.statusBadge, isActive(selectedPlan) ? styles.activeBadge : styles.completedBadge]}>
              <Text style={isActive(selectedPlan) ? styles.activeText : styles.completedText}>
                {isActive(selectedPlan) ? 'Đang thực hiện' : 'Đã hoàn thành'}
              </Text>
            </View>
          </View>
          {!!selectedPlan.summary && <Text style={styles.detailSummaryText}>{selectedPlan.summary}</Text>}
          {selectedPlan.targetDailyCalories != null && (
            <Text style={styles.targetText}>Giới hạn mỗi ngày: {formatKcal(selectedPlan.targetDailyCalories)}</Text>
          )}
          <View style={styles.detailNotice}>
            <Ionicons name="information-circle-outline" size={18} color="#D9912B" />
            <Text style={styles.detailNoticeText}>{NUTRITION_PLAN_NOTICE}</Text>
          </View>
          {!!milkNotice && (
            <View style={styles.detailMilkNotice}>
              <Ionicons name="water-outline" size={18} color="#45AFC8" />
              <Text style={styles.detailMilkNoticeText}>{milkNotice}</Text>
            </View>
          )}
          {!!(selectedPlan.userNotes || (selectedPlan.profileType?.toUpperCase() === 'MOTHER' && selectedPlan.currentGoal)) && (
            <Text style={styles.noteText}>
              {selectedPlan.profileType?.toUpperCase() === 'MOTHER' && selectedPlan.currentGoal ? `Mục tiêu: ${selectedPlan.currentGoal}` : ''}
              {selectedPlan.userNotes ? `${selectedPlan.profileType?.toUpperCase() === 'MOTHER' && selectedPlan.currentGoal ? '\n' : ''}Yếu tố lưu ý: ${selectedPlan.userNotes}` : ''}
            </Text>
          )}
          <View style={styles.actionRow}>
            {isActive(selectedPlan) && (
              <TouchableOpacity style={styles.completeButton} onPress={() => completePlan(selectedPlan)}>
                {actionPlanId === selectedPlan.planId ? <ActivityIndicator color="#2B8A78" /> : <Ionicons name="checkmark-circle-outline" size={17} color="#2B8A78" />}
                <Text style={styles.completeButtonText}>Hoàn thành lịch</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={() => removePlan(selectedPlan)}>
              <Ionicons name="trash-outline" size={17} color="#D95757" />
              <Text style={styles.deleteButtonText}>Xóa lịch</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        {(selectedPlan.days || []).map(renderDay)}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => selectedPlan ? setSelectedPlanId(null) : router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedPlan ? 'Chi tiết lịch ăn' : 'Lịch ăn'}</Text>
        <View style={styles.headerMark}>
          <Ionicons name="nutrition-outline" size={21} color="#FF8FAB" />
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.loadingText}>Đang tải lịch ăn</Text>
        </View>
      ) : selectedPlan ? renderDetail() : renderOverview()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 18, backgroundColor: '#FEF9F3' },
  iconButton: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  headerMark: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FF8FAB', fontSize: 22, fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingBottom: 44 },
  intro: { minHeight: 126, flexDirection: 'row', alignItems: 'center', borderRadius: 28, padding: 16, marginBottom: 18, overflow: 'hidden', elevation: 4, shadowColor: '#A7E4F5', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 9 } },
  introImageWrap: { width: 82, height: 94, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.48)', overflow: 'hidden', marginRight: 14 },
  introImage: { width: '100%', height: '100%' },
  introText: { flex: 1 },
  introKicker: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', opacity: 0.92 },
  introTitle: { color: '#FFFFFF', fontSize: 19, lineHeight: 24, fontWeight: '900', marginTop: 3 },
  introSubtitle: { color: '#FFF8FA', fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 4 },
  noticeBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#FFE3A8', borderRadius: 18, padding: 12, marginBottom: 16 },
  noticeIcon: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#FFF1C7', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  noticeText: { flex: 1, color: '#9A6A19', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  milkNoticeBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E9F8FD', borderWidth: 1, borderColor: '#D6F1F8', borderRadius: 18, padding: 12, marginBottom: 16 },
  milkNoticeIcon: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#D6F1F8', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  milkNoticeText: { flex: 1, color: '#397F92', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  createButton: { height: 50, borderRadius: 18, backgroundColor: '#FF8FAB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, elevation: 3, shadowColor: '#FF8FAB', shadowOpacity: 0.2, shadowRadius: 9 },
  createButtonText: { color: '#FFFFFF', fontWeight: '900' },
  planCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFE5EC', borderRadius: 22, padding: 15, marginBottom: 13, elevation: 2, shadowColor: '#A7E4F5', shadowOpacity: 0.1, shadowRadius: 10 },
  planCardTop: { flexDirection: 'row', alignItems: 'center' },
  planIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  activePlanIcon: { backgroundColor: '#FF8FAB' },
  completedPlanIcon: { backgroundColor: '#65B8A8' },
  planCardHeading: { flex: 1, minWidth: 0 },
  statusText: { fontSize: 11, fontWeight: '900', marginTop: 4 },
  activeText: { color: '#FF8FAB', fontWeight: '900' },
  completedText: { color: '#2B8A78', fontWeight: '900' },
  planRange: { color: '#5C7A8A', fontSize: 14, lineHeight: 19, fontWeight: '900' },
  planMeta: { color: '#78909C', fontSize: 12, fontWeight: '800', marginTop: 5 },
  planStats: { flexDirection: 'row', alignItems: 'center', marginTop: 13, gap: 8 },
  planStat: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FBFC', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, gap: 5 },
  planStatText: { color: '#78909C', fontSize: 11, fontWeight: '900' },
  planSummary: { color: '#78909C', fontSize: 12, lineHeight: 18, fontWeight: '600', marginTop: 10 },
  detailSummary: { borderWidth: 1, borderColor: '#FFE5EC', borderRadius: 24, padding: 16, marginBottom: 16, overflow: 'hidden' },
  detailTop: { flexDirection: 'row', alignItems: 'flex-start' },
  detailIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 11, borderWidth: 1, borderColor: '#FFE5EC' },
  detailRange: { color: '#5C7A8A', fontSize: 15, lineHeight: 20, fontWeight: '900' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  activeBadge: { backgroundColor: '#FFF0F3' },
  completedBadge: { backgroundColor: '#EAF8F5' },
  detailSummaryText: { color: '#5C7A8A', fontWeight: '700', lineHeight: 19, marginTop: 12 },
  targetText: { color: '#FF8FAB', fontWeight: '900', fontSize: 12, marginTop: 8 },
  detailNotice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E8', borderRadius: 15, padding: 10, marginTop: 12, borderWidth: 1, borderColor: '#FFE3A8' },
  detailNoticeText: { flex: 1, color: '#9A6A19', fontSize: 11, lineHeight: 17, fontWeight: '800', marginLeft: 7 },
  detailMilkNotice: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#E9F8FD', borderRadius: 15, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#D6F1F8' },
  detailMilkNoticeText: { flex: 1, color: '#397F92', fontSize: 11, lineHeight: 17, fontWeight: '800', marginLeft: 7 },
  noteText: { color: '#78909C', fontSize: 12, lineHeight: 18, fontWeight: '700', marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  completeButton: { flex: 1, minHeight: 42, borderRadius: 15, backgroundColor: '#EAF8F5', borderWidth: 1, borderColor: '#CBEDE6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  completeButtonText: { color: '#2B8A78', fontSize: 12, fontWeight: '900' },
  deleteButton: { flex: 1, minHeight: 42, borderRadius: 15, backgroundColor: '#FFF2F2', borderWidth: 1, borderColor: '#FFD5D5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  deleteButtonText: { color: '#D95757', fontSize: 12, fontWeight: '900' },
  dayCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFE5EC', borderRadius: 22, padding: 15, marginBottom: 14, elevation: 2, shadowColor: '#A7E4F5', shadowOpacity: 0.08, shadowRadius: 9 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  dayTitle: { color: '#FF8FAB', fontSize: 16, fontWeight: '900' },
  dayDate: { color: '#78909C', fontSize: 12, fontWeight: '800', marginTop: 3 },
  kcalBadge: { backgroundColor: '#FFF0F5', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'flex-end' },
  kcalBadgeLabel: { color: '#FF8FAB', fontSize: 10, fontWeight: '900' },
  kcalBadgeValue: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginTop: 2 },
  dayNote: { color: '#78909C', fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 9 },
  mealItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F5F6' },
  mealRow: { flexDirection: 'row', alignItems: 'center' },
  mealIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  mealContent: { flex: 1 },
  mealType: { color: '#FF8FAB', fontSize: 11, fontWeight: '900' },
  mealName: { color: '#5C7A8A', fontSize: 14, lineHeight: 19, fontWeight: '900', marginTop: 2 },
  mealKcal: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginTop: 3 },
  reason: { color: '#78909C', fontSize: 11, lineHeight: 16, fontWeight: '600', marginTop: 3 },
  swapButton: { minHeight: 38, borderRadius: 14, backgroundColor: '#F1FBFE', borderWidth: 1, borderColor: '#D6F1F8', marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  swapButtonText: { color: '#5C7A8A', fontSize: 12, fontWeight: '900' },
  editPanel: { backgroundColor: '#FAFCFD', borderWidth: 1, borderColor: '#DDE8EE', borderRadius: 18, padding: 12, marginTop: 9 },
  editTitle: { color: '#5C7A8A', fontSize: 13, fontWeight: '900', marginBottom: 9 },
  searchRow: { height: 44, borderRadius: 16, borderWidth: 1, borderColor: '#DDE8EE', backgroundColor: '#FFFFFF', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 7, color: '#5C7A8A', fontWeight: '700' },
  searchButton: { minHeight: 31, borderRadius: 12, backgroundColor: '#FFF0F5', paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' },
  searchButtonText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900' },
  foodOption: { minHeight: 60, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEF1F4', padding: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  foodImage: { width: 44, height: 44, borderRadius: 13, backgroundColor: '#FFF0F5', marginRight: 9 },
  foodOptionText: { flex: 1 },
  foodName: { color: '#5C7A8A', fontSize: 12, fontWeight: '900' },
  foodKcal: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginTop: 3 },
  closeButton: { height: 38, borderRadius: 14, borderWidth: 1, borderColor: '#DDE8EE', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: '#78909C', fontWeight: '900' },
  emptyHint: { color: '#78909C', fontSize: 12, fontWeight: '700', marginBottom: 9 },
  emptyState: { alignItems: 'center', paddingVertical: 42 },
  emptyTitle: { color: '#5C7A8A', fontSize: 18, fontWeight: '900' },
  emptyText: { color: '#78909C', fontWeight: '700', marginTop: 7 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#78909C', fontWeight: '800', marginTop: 9 },
});
