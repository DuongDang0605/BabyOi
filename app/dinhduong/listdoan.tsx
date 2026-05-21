import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AiPlannerCard } from '../../components/dinhduong/AiPlannerCard';
import { DishCard, type Dish } from '../../components/dinhduong/DishCard';
import {
  FoodResponse,
  addFavoriteFood,
  addRestrictedFood,
  deleteFavoriteFood,
  deleteRestrictedFood,
  getFavoriteFoods,
  getFoodsPage,
  getRestrictedFoods,
  resolveAssetUrl,
} from '../../lib/api';
import { getAuthSession, hydrateAuthSession } from '../../lib/auth-session';

const MOM_FUNCTION_CODE = 1;
const BABY_FUNCTION_CODE = 2;
const PAGE_SIZE = 10;
const LOCAL_FAVORITE_IDS_KEY = 'babyoi_guest_favorite_food_ids';
const LOCAL_RESTRICTED_IDS_KEY = 'babyoi_guest_restricted_food_ids';

const FILTERS = {
  Mẹ: [
    { label: 'Tất cả', value: null },
    { label: 'Ăn kiêng', value: 'FOR_MOTHER_DIET' },
    { label: 'Đổi chế độ ăn', value: 'FOR_MOTHER_CHANGE_DIET' },
    { label: 'Sau sinh cho bú', value: 'FOR_MOTHER_POSTPARTUM_BREASTFEEDING' },
    { label: 'Tăng sữa', value: 'FOR_MOTHER_INCREASE_MILK_SUPPLY' },
    { label: 'Ngủ & stress', value: 'FOR_MOTHER_SLEEP_STRESS_SUPPORT' },
    { label: 'Năng lượng khỏe', value: 'FOR_MOTHER_HEALTHY_ENERGY' },
    { label: 'Dễ tiêu', value: 'FOR_MOTHER_DIGESTION_RECOVERY' },
  ],
  Bé: [
    { label: 'Tất cả', value: null },
    { label: '6-8 tháng', value: 'FOR_BABY_6_8_MONTHS' },
    { label: '9-11 tháng', value: 'FOR_BABY_9_11_MONTHS' },
    { label: '12-18 tháng', value: 'FOR_BABY_12_18_MONTHS' },
    { label: '19-24 tháng', value: 'FOR_BABY_19_24_MONTHS' },
    { label: '6-8 tháng phát triển', value: 'FOR_BABY_6_8_MONTHS_DEVELOPMENT' },
    { label: '9-11 tháng phát triển', value: 'FOR_BABY_9_11_MONTHS_DEVELOPMENT' },
    { label: '12-18 tháng phát triển', value: 'FOR_BABY_12_18_MONTHS_DEVELOPMENT' },
    { label: '19-24 tháng phát triển', value: 'FOR_BABY_19_24_MONTHS_DEVELOPMENT' },
  ],
} as const;

function formatNutritionSummary(food: FoodResponse) {
  const nutrition = food.nutrition;
  if (!nutrition) {
    return food.recommendation?.advice || 'Xem chi tiết món ăn.';
  }

  const calories = nutrition.totalCalories != null ? `${Math.round(nutrition.totalCalories)} ${nutrition.totalCaloriesUnit || 'kcal'}` : null;
  const protein = nutrition.totalProtein != null ? `${nutrition.totalProtein.toFixed(1)} ${nutrition.totalProteinUnit || 'g'} đạm` : null;
  return [calories, protein].filter(Boolean).join(' • ') || food.recommendation?.advice || 'Xem chi tiết dinh dưỡng.';
}

function mapFoodToDish(food: FoodResponse): Dish {
  const isMomFood = food.functionCode === MOM_FUNCTION_CODE;
  const dbImage = food.imageUrl?.trim();

  return {
    id: String(food.id),
    name: food.name,
    desc: formatNutritionSummary(food),
    rating: 5,
    image: resolveAssetUrl(dbImage),
    tag: isMomFood ? 'Cho Mẹ' : 'Cho Bé',
    food,
  };
}

async function getCurrentSession() {
  return getAuthSession() || await hydrateAuthSession();
}

async function readLocalIds(key: string) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function writeLocalIds(key: string, ids: string[]) {
  await AsyncStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
}

export default function ListDoAnScreen() {
  const [activeTab, setActiveTab] = useState<'Mẹ' | 'Bé'>('Bé');
  const [activeAdvanceFor, setActiveAdvanceFor] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [restrictedIds, setRestrictedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [foods, setFoods] = useState<FoodResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Dish>>(null);

  const targetCode = activeTab === 'Mẹ' ? MOM_FUNCTION_CODE : BABY_FUNCTION_CODE;
  const filterOptions = FILTERS[activeTab];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setActiveAdvanceFor(null);
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    setPage(0);
  }, [activeAdvanceFor, debouncedSearch]);

  useEffect(() => {
    let mounted = true;

    async function loadFoods() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFoodsPage({
          page,
          size: PAGE_SIZE,
          functionCode: targetCode,
          advanceFor: activeAdvanceFor,
          search: debouncedSearch,
        });

        if (mounted) {
          setFoods(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách món ăn.');
          setFoods([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFoods();
    return () => {
      mounted = false;
    };
  }, [activeAdvanceFor, debouncedSearch, page, targetCode]);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadUserFoodState() {
      const session = await getCurrentSession();
      if (!session?.userId) {
        const [localFavoriteIds, localRestrictedIds] = await Promise.all([
          readLocalIds(LOCAL_FAVORITE_IDS_KEY),
          readLocalIds(LOCAL_RESTRICTED_IDS_KEY),
        ]);

        if (mounted) {
          setFavoriteIds(localFavoriteIds);
          setRestrictedIds(localRestrictedIds);
        }
        return;
      }

      try {
        const [favorites, restricted] = await Promise.all([
          getFavoriteFoods(session.userId),
          getRestrictedFoods(session.userId),
        ]);

        if (mounted) {
          setFavoriteIds(favorites.map((item) => String(item.id)));
          setRestrictedIds(restricted.map((item) => String(item.id)));
        }
      } catch {
        if (mounted) {
          setActionMessage('Không tải được danh sách yêu thích/hạn chế.');
        }
      }
    }

    loadUserFoodState();
    return () => {
      mounted = false;
    };
  }, []));

  const dishes = useMemo(() => foods.map(mapFoodToDish), [foods]);
  const filteredDishes = useMemo(() => dishes.filter((dish) => !restrictedIds.includes(dish.id)), [dishes, restrictedIds]);

  const toggleFavorite = async (id: string) => {
    const session = await getCurrentSession();
    if (!session?.userId) {
      const nextIds = favoriteIds.includes(id)
        ? favoriteIds.filter((item) => item !== id)
        : [...favoriteIds, id];
      setFavoriteIds(nextIds);
      await writeLocalIds(LOCAL_FAVORITE_IDS_KEY, nextIds);
      return;
    }

    const wasFavorite = favoriteIds.includes(id);
    setFavoriteIds((prev) => wasFavorite ? prev.filter((item) => item !== id) : [...prev, id]);

    try {
      if (wasFavorite) {
        await deleteFavoriteFood(session.userId, id);
      } else {
        await addFavoriteFood(session.userId, id);
      }
    } catch (err) {
      setFavoriteIds((prev) => wasFavorite ? [...prev, id] : prev.filter((item) => item !== id));
      setActionMessage(err instanceof Error ? err.message : 'Không thể cập nhật món yêu thích.');
    }
  };

  const toggleRestriction = async (id: string) => {
    const session = await getCurrentSession();
    if (!session?.userId) {
      const wasRestricted = restrictedIds.includes(id);
      const nextIds = wasRestricted ? restrictedIds.filter((item) => item !== id) : [...restrictedIds, id];

      setRestrictedIds(nextIds);
      await writeLocalIds(LOCAL_RESTRICTED_IDS_KEY, nextIds);
      return;
    }

    const wasRestricted = restrictedIds.includes(id);
    setRestrictedIds((prev) => wasRestricted ? prev.filter((item) => item !== id) : [...prev, id]);

    try {
      if (wasRestricted) {
        await deleteRestrictedFood(session.userId, id);
      } else {
        await addRestrictedFood(session.userId, id);
      }
    } catch (err) {
      setRestrictedIds((prev) => wasRestricted ? [...prev, id] : prev.filter((item) => item !== id));
      setActionMessage(err instanceof Error ? err.message : 'Không thể cập nhật món hạn chế.');
    }
  };

  const handleDishPress = (item: Dish) => {
    router.push({ pathname: '/dinhduong/recipe-detail', params: { id: item.id, image: item.image } });
  };

  const reloadCurrentPage = () => {
    setPage((current) => current);
    setDebouncedSearch(searchQuery.trim());
  };

  const renderListState = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải món ăn...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={24} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reloadCurrentPage}>
            <Text style={styles.retryText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredDishes.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="restaurant-outline" size={24} color="#ABBEC8" />
          <Text style={styles.stateText}>Chưa có món phù hợp.</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        ref={flatListRef}
        data={filteredDishes}
        renderItem={({ item }) => (
          <DishCard
            item={item}
            isRestricted={false}
            isFavorite={favoriteIds.includes(item.id)}
            onPress={handleDishPress}
            onToggleRestriction={toggleRestriction}
            onToggleFavorite={toggleFavorite}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={filteredDishes.length > 0 ? styles.row : undefined}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.headerPinkBg}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#FFF" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Dinh Dưỡng</Text>
                <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="#FFF" /></TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#FF8FAB" />
                <TextInput
                  placeholder="Tìm món theo tên..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
                {!!searchQuery && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#FFB6C1" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'Mẹ' && styles.tabBtnActive]} onPress={() => setActiveTab('Mẹ')}><Text style={[styles.tabText, activeTab === 'Mẹ' && styles.tabTextActive]}>Cho Mẹ</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'Bé' && styles.tabBtnActive]} onPress={() => setActiveTab('Bé')}><Text style={[styles.tabText, activeTab === 'Bé' && styles.tabTextActive]}>Cho Bé</Text></TouchableOpacity>
              </View>
            </View>

            <AiPlannerCard onPress={() => router.push('/dinhduong/ai-planner')} />

            <View style={styles.navSection}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push({pathname: '/dinhduong/WeeklyView', params: {target: activeTab}})}>
                <View style={[styles.iconCircle, {backgroundColor: activeTab === 'Mẹ' ? '#FF8FAB' : '#89CFF0'}]}><Ionicons name={activeTab === 'Mẹ' ? 'person' : 'body'} size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Lịch ăn</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/dinhduong/favorite-dishes')}>
                <View style={[styles.iconCircle, {backgroundColor: '#FFB6C1'}]}><Ionicons name="heart" size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Yêu thích</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/dinhduong/restricted-dishes')}>
                <View style={[styles.iconCircle, {backgroundColor: '#ABBEC8'}]}><Ionicons name="eye-off" size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Hạn chế</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Phân loại {activeTab === 'Mẹ' ? 'cho mẹ' : 'cho bé'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {filterOptions.map((option) => {
                  const selected = activeAdvanceFor === option.value;
                  return (
                    <TouchableOpacity key={option.label} style={[styles.filterChip, selected && styles.filterChipActive]} onPress={() => setActiveAdvanceFor(option.value)}>
                      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{option.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {!!actionMessage && (
              <TouchableOpacity style={styles.messageBox} onPress={() => setActionMessage(null)}>
                <Text style={styles.messageText}>{actionMessage}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Gợi ý cho {activeTab}</Text>
              <Text style={styles.pageMeta}>{totalElements} món</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={renderListState}
        ListFooterComponent={() => (
           <View style={styles.restrictedSection}>
             {!loading && !error && totalPages > 1 && (
               <View style={styles.paginationBox}>
                 <TouchableOpacity style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]} disabled={page === 0} onPress={() => setPage(prev => Math.max(prev - 1, 0))}>
                   <Ionicons name="chevron-back" size={18} color={page === 0 ? '#C8D4DA' : '#FF8FAB'} />
                 </TouchableOpacity>
                 <Text style={styles.pageText}>Trang {page + 1}/{totalPages}</Text>
                 <TouchableOpacity style={[styles.pageBtn, page >= totalPages - 1 && styles.pageBtnDisabled]} disabled={page >= totalPages - 1} onPress={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}>
                   <Ionicons name="chevron-forward" size={18} color={page >= totalPages - 1 ? '#C8D4DA' : '#FF8FAB'} />
                 </TouchableOpacity>
               </View>
             )}
             <View style={{ height: 60 }} />
           </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  headerPinkBg: { backgroundColor: '#FFB6C1', paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  customHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 15, paddingHorizontal: 20, justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', paddingHorizontal: 15, height: 45, marginHorizontal: 20, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#5C7A8A' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 40, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 15, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#FFF' },
  tabText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  tabTextActive: { color: '#FF8FAB' },
  navSection: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  navBtn: { alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 3 },
  navBtnText: { fontSize: 11, fontWeight: '800', color: '#5C7A8A' },
  filterSection: { marginBottom: 14 },
  filterLabel: { marginHorizontal: 25, marginBottom: 8, color: '#5C7A8A', fontSize: 13, fontWeight: '900' },
  filterScroll: { paddingHorizontal: 20, paddingRight: 30 },
  filterChip: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FFE5EC', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginRight: 8 },
  filterChipActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
  filterChipText: { color: '#7D95A1', fontSize: 12, fontWeight: '800' },
  filterChipTextActive: { color: '#FFF' },
  messageBox: { marginHorizontal: 24, backgroundColor: '#FFF', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#FFE5EC', marginBottom: 12 },
  messageText: { color: '#FF8FAB', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  pageMeta: { color: '#ABBEC8', fontSize: 12, fontWeight: '900' },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  restrictedSection: { marginTop: 20 },
  paginationBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  pageBtn: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  pageBtnDisabled: { backgroundColor: '#F4F6F7', elevation: 0 },
  pageText: { marginHorizontal: 16, color: '#5C7A8A', fontWeight: '900' },
  stateBox: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 28 },
  stateText: { marginTop: 10, color: '#5C7A8A', fontWeight: '700', textAlign: 'center' },
  retryBtn: { marginTop: 12, backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14 },
  retryText: { color: '#FFF', fontWeight: '900' },
});
