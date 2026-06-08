import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
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
  ProfileResponse,
  addFavoriteFood,
  addRestrictedFood,
  deleteFavoriteFood,
  deleteRestrictedFood,
  getFavoriteFoodIds,
  getFoodsPage,
  getRestrictedFoodIds,
  resolveOptimizedAssetUrl,
} from '../../lib/api';
import { getAuthSession, hydrateAuthSession } from '../../lib/auth-session';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const MOM_FUNCTION_CODE = 1;
const BABY_FUNCTION_CODE = 2;
const PAGE_SIZE = 10;
const INITIAL_VISIBLE_IMAGE_COUNT = 6;
const IMAGE_PREFETCH_TIMEOUT_MS = 900;
const LOCAL_FAVORITE_IDS_KEY = 'babyoi_guest_favorite_food_ids';
const LOCAL_RESTRICTED_IDS_KEY = 'babyoi_guest_restricted_food_ids';

type AudienceTab = 'mom' | 'baby';

type CachedFoodPage = {
  foods: FoodResponse[];
  totalPages: number;
  totalElements: number;
};

const foodPageCache = new Map<string, CachedFoodPage>();

function getFoodImageUrls(foodsToPrefetch: FoodResponse[], limit = foodsToPrefetch.length) {
  return foodsToPrefetch
    .slice(0, limit)
    .map((food) => resolveOptimizedAssetUrl(food.imageUrl, 'card'))
    .filter((url): url is string => Boolean(url));
}

function prefetchFoodImages(foodsToPrefetch: FoodResponse[]) {
  const imageUrls = getFoodImageUrls(foodsToPrefetch);

  if (imageUrls.length > 0) {
    void Image.prefetch(imageUrls, 'memory-disk');
  }
}

async function warmInitialFoodImages(foodsToPrefetch: FoodResponse[]) {
  const imageUrls = getFoodImageUrls(foodsToPrefetch, INITIAL_VISIBLE_IMAGE_COUNT);

  if (imageUrls.length === 0) {
    return;
  }

  await Promise.race([
    Image.prefetch(imageUrls, 'memory-disk').catch(() => false),
    new Promise((resolve) => setTimeout(resolve, IMAGE_PREFETCH_TIMEOUT_MS)),
  ]);
}

const FILTERS = {
  mom: [
    { label: 'Tất cả', value: null },
    { label: 'Giảm cân', value: 'FOR_MOTHER_DIET' },
    { label: 'Đổi chế độ ăn', value: 'FOR_MOTHER_CHANGE_DIET' },
    { label: 'Sau sinh cho bú', value: 'FOR_MOTHER_POSTPARTUM_BREASTFEEDING' },
    { label: 'Tăng sữa', value: 'FOR_MOTHER_INCREASE_MILK_SUPPLY' },
    { label: 'Ngủ & stress', value: 'FOR_MOTHER_SLEEP_STRESS_SUPPORT' },
    { label: 'Năng lượng khỏe', value: 'FOR_MOTHER_HEALTHY_ENERGY' },
    { label: 'Dễ tiêu', value: 'FOR_MOTHER_DIGESTION_RECOVERY' },
  ],
  baby: [
    { label: 'Tất cả', value: null },
    { label: '6-8 tháng', value: 'FOR_BABY_6_8_MONTHS' },
    { label: '9-11 tháng', value: 'FOR_BABY_9_11_MONTHS' },
    { label: '12-18 tháng', value: 'FOR_BABY_12_18_MONTHS' },
    { label: '19-24 tháng', value: 'FOR_BABY_19_24_MONTHS' },
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
    image: resolveOptimizedAssetUrl(dbImage, 'card'),
    tag: isMomFood ? 'Cho Mẹ' : 'Cho Bé',
    food,
  };
}

function getAudienceTabFromProfile(profile: ProfileResponse | null): AudienceTab {
  return profile?.profileType === 'MOTHER' ? 'mom' : 'baby';
}

async function getCurrentSession() {
  return getAuthSession() || await hydrateAuthSession();
}

async function getCurrentProfileId() {
  const profile = getSelectedProfile() || await hydrateSelectedProfile();
  return profile?.id ?? null;
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
  const [activeTab, setActiveTab] = useState<AudienceTab>('baby');
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

  const targetCode = activeTab === 'mom' ? MOM_FUNCTION_CODE : BABY_FUNCTION_CODE;
  const filterOptions = FILTERS[activeTab];
  const audienceLabel = activeTab === 'mom' ? 'Mẹ' : 'Bé';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadSelectedProfileAudience() {
      const profile = getSelectedProfile() || await hydrateSelectedProfile();

      if (mounted) {
        setActiveTab(getAudienceTabFromProfile(profile));
      }
    }

    loadSelectedProfileAudience();
    return () => {
      mounted = false;
    };
  }, []));

  useEffect(() => {
    setActiveAdvanceFor(null);
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    setPage(0);
  }, [activeAdvanceFor, debouncedSearch]);

  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [page]);

  useEffect(() => {
    let mounted = true;

    async function loadFoods() {
      const cacheKey = [
        targetCode,
        activeAdvanceFor || 'all',
        debouncedSearch || 'all',
        page,
      ].join('|');
      const cachedPage = foodPageCache.get(cacheKey);

      if (cachedPage) {
        setFoods(cachedPage.foods);
        setTotalPages(cachedPage.totalPages);
        setTotalElements(cachedPage.totalElements);
        setLoading(false);
      }

      try {
        if (!cachedPage) {
          setLoading(true);
        }
        setError(null);
        const foodPage = await getFoodsPage({
          page,
          size: PAGE_SIZE,
          functionCode: targetCode,
          advanceFor: activeAdvanceFor,
          search: debouncedSearch,
        });

        const nextCache = {
          foods: foodPage.content || [],
          totalPages: foodPage.totalPages || 0,
          totalElements: foodPage.totalElements || 0,
        };

        foodPageCache.set(cacheKey, nextCache);

        if (!cachedPage) {
          await warmInitialFoodImages(nextCache.foods);
        }

        prefetchFoodImages(nextCache.foods.slice(INITIAL_VISIBLE_IMAGE_COUNT));

        if (mounted) {
          setFoods(nextCache.foods);
          setTotalPages(nextCache.totalPages);
          setTotalElements(nextCache.totalElements);
        }
      } catch (err) {
        if (mounted && !cachedPage) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách món ăn.');
          if (!cachedPage) {
            setFoods([]);
            setTotalPages(0);
            setTotalElements(0);
          }
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
  }, [activeAdvanceFor, activeTab, debouncedSearch, page, targetCode]);

  useEffect(() => {
    const nextPage = page + 1;

    if (nextPage >= totalPages) {
      return;
    }

    const cacheKey = [
      targetCode,
      activeAdvanceFor || 'all',
      debouncedSearch || 'all',
      nextPage,
    ].join('|');

    if (foodPageCache.has(cacheKey)) {
      return;
    }

    let cancelled = false;

    getFoodsPage({
      page: nextPage,
      size: PAGE_SIZE,
      functionCode: targetCode,
      advanceFor: activeAdvanceFor,
      search: debouncedSearch,
    }).then((foodPage) => {
      if (cancelled) {
        return;
      }

      const nextCache = {
        foods: foodPage.content || [],
        totalPages: foodPage.totalPages || 0,
        totalElements: foodPage.totalElements || 0,
      };

      foodPageCache.set(cacheKey, nextCache);
      prefetchFoodImages(nextCache.foods);
    }).catch(() => {
      // Background prefetch should not affect the visible list.
    });

    return () => {
      cancelled = true;
    };
  }, [activeAdvanceFor, debouncedSearch, page, targetCode, totalPages]);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadUserFoodState() {
      const session = await getCurrentSession();
      const profileId = session?.userId ? await getCurrentProfileId() : null;
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
      if (!profileId) {
        if (mounted) {
          setActionMessage('Vui lòng chọn hồ sơ trước khi xem yêu thích/hạn chế.');
        }
        return;
      }

      try {
        const [favoriteFoodIds, restrictedFoodIds] = await Promise.all([
          getFavoriteFoodIds(profileId),
          getRestrictedFoodIds(profileId),
        ]);

        if (mounted) {
          setFavoriteIds(favoriteFoodIds.map(String));
          setRestrictedIds(restrictedFoodIds.map(String));
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
    const profileId = session?.userId ? await getCurrentProfileId() : null;
    if (!session?.userId) {
      const nextIds = favoriteIds.includes(id)
        ? favoriteIds.filter((item) => item !== id)
        : [...favoriteIds, id];
      setFavoriteIds(nextIds);
      await writeLocalIds(LOCAL_FAVORITE_IDS_KEY, nextIds);
      return;
    }
    if (!profileId) {
      setActionMessage('Vui lòng chọn hồ sơ trước khi cập nhật món yêu thích.');
      return;
    }

    const wasFavorite = favoriteIds.includes(id);
    setFavoriteIds((prev) => wasFavorite ? prev.filter((item) => item !== id) : [...prev, id]);

    try {
      if (wasFavorite) {
        await deleteFavoriteFood(profileId, id);
      } else {
        await addFavoriteFood(profileId, id);
      }
    } catch (err) {
      setFavoriteIds((prev) => wasFavorite ? [...prev, id] : prev.filter((item) => item !== id));
      setActionMessage(err instanceof Error ? err.message : 'Không thể cập nhật món yêu thích.');
    }
  };

  const toggleRestriction = async (id: string) => {
    const session = await getCurrentSession();
    const profileId = session?.userId ? await getCurrentProfileId() : null;
    if (!session?.userId) {
      const wasRestricted = restrictedIds.includes(id);
      const nextIds = wasRestricted ? restrictedIds.filter((item) => item !== id) : [...restrictedIds, id];

      setRestrictedIds(nextIds);
      await writeLocalIds(LOCAL_RESTRICTED_IDS_KEY, nextIds);
      return;
    }
    if (!profileId) {
      setActionMessage('Vui lòng chọn hồ sơ trước khi cập nhật món hạn chế.');
      return;
    }

    const wasRestricted = restrictedIds.includes(id);
    setRestrictedIds((prev) => wasRestricted ? prev.filter((item) => item !== id) : [...prev, id]);

    try {
      if (wasRestricted) {
        await deleteRestrictedFood(profileId, id);
      } else {
        await addRestrictedFood(profileId, id);
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
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        columnWrapperStyle={filteredDishes.length > 0 ? styles.row : undefined}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        ListHeaderComponent={
          <View>
            <View style={styles.headerPinkBg}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="#FF8FAB" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Dinh Dưỡng</Text>
                <View style={styles.headerActionSpace} />
              </View>
              <LinearGradient colors={['#FF8FAB', '#FFD166', '#A7E4F5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
                <View style={styles.heroBubbleOne} />
                <View style={styles.heroBubbleTwo} />
                <View style={styles.heroIcon}>
                  <Ionicons name="restaurant" size={28} color="#FFF" />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroKicker}>{audienceLabel === 'Mẹ' ? 'Thực đơn cho mẹ' : 'Bữa ngon cho bé'}</Text>
                  <Text style={styles.heroTitle}>{totalElements || filteredDishes.length} món đang gợi ý</Text>
                  <Text style={styles.heroSubtitle}>Lọc nhanh theo độ tuổi, mục tiêu và món yêu thích.</Text>
                </View>
                <View style={styles.heroChip}>
                  <Ionicons name="sparkles" size={14} color="#FF8FAB" />
                  <Text style={styles.heroChipText}>AI gợi ý</Text>
                </View>
              </LinearGradient>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#FF8FAB" />
                <TextInput
                  placeholder="Tìm món theo tên..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {!!searchQuery && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#FFB6C1" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <AiPlannerCard onPress={() => router.push('/dinhduong/ai-planner')} />

            <View style={styles.navSection}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push({pathname: '/dinhduong/WeeklyView', params: {target: audienceLabel}})}>
                <View style={[styles.iconCircle, {backgroundColor: activeTab === 'mom' ? '#FF8FAB' : '#89CFF0'}]}><Ionicons name={activeTab === 'mom' ? 'person' : 'body'} size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Lịch ăn</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/dinhduong/favorite-dishes')}>
                <View style={[styles.iconCircle, {backgroundColor: '#FFD166'}]}><Ionicons name="heart" size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Yêu thích</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/dinhduong/restricted-dishes')}>
                <View style={[styles.iconCircle, {backgroundColor: '#7CCBC1'}]}><Ionicons name="eye-off" size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Hạn chế</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Phân loại cho {audienceLabel.toLowerCase()}</Text>
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
              <View style={styles.sectionTitleLeft}>
                <View style={styles.sectionTitleIcon}>
                  <Ionicons name="restaurant-outline" size={16} color="#FF8FAB" />
                </View>
                <Text style={styles.sectionTitle}>Gợi ý cho {audienceLabel}</Text>
              </View>
              <Text style={styles.pageMeta}>{totalElements} món</Text>
            </View>
          </View>
        }
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
  headerPinkBg: { backgroundColor: '#FEF9F3', paddingBottom: 12 },
  customHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 20, paddingHorizontal: 20, justifyContent: 'space-between' },
  backButton: { width: 45 },
  headerActionSpace: { width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#FF8FAB' },
  heroCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14, borderRadius: 28, padding: 16, overflow: 'hidden', shadowColor: '#A7E4F5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4 },
  heroBubbleOne: { position: 'absolute', right: -28, top: -34, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.24)' },
  heroBubbleTwo: { position: 'absolute', left: 118, bottom: -46, width: 118, height: 118, borderRadius: 59, backgroundColor: 'rgba(255,255,255,0.17)' },
  heroIcon: { width: 58, height: 58, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center', marginRight: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  heroCopy: { flex: 1 },
  heroKicker: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', opacity: 0.92 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 2 },
  heroSubtitle: { color: '#FFF8FA', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 3 },
  heroChip: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  heroChipText: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginLeft: 5 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', paddingHorizontal: 15, height: 45, marginHorizontal: 20, marginBottom: 15, borderWidth: 1.5, borderColor: '#FFE5EC' },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#5C7A8A' },
  navSection: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
  navBtn: { width: '31%', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#FFE5EC', elevation: 2, shadowColor: '#A7E4F5', shadowOpacity: 0.1, shadowRadius: 8 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 7, elevation: 3 },
  navBtnText: { fontSize: 11, fontWeight: '900', color: '#5C7A8A' },
  filterSection: { marginBottom: 16, paddingTop: 2 },
  filterLabel: { marginHorizontal: 25, marginBottom: 9, color: '#5C7A8A', fontSize: 13, fontWeight: '900' },
  filterScroll: { paddingHorizontal: 20, paddingRight: 30 },
  filterChip: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E9F8FD', borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, marginRight: 8, elevation: 1, shadowColor: '#A7E4F5', shadowOpacity: 0.08, shadowRadius: 5 },
  filterChipActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB', elevation: 3, shadowColor: '#FF8FAB', shadowOpacity: 0.18, shadowRadius: 7 },
  filterChipText: { color: '#7D95A1', fontSize: 12, fontWeight: '800' },
  filterChipTextActive: { color: '#FFF' },
  messageBox: { marginHorizontal: 24, backgroundColor: '#FFF', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#A7E4F5', marginBottom: 12 },
  messageText: { color: '#FF8FAB', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 15, backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#FFE5EC', elevation: 2, shadowColor: '#FFB6C1', shadowOpacity: 0.08, shadowRadius: 8 },
  sectionTitleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sectionTitleIcon: { width: 34, height: 34, borderRadius: 13, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center', marginRight: 9 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  pageMeta: { color: '#45AFC8', fontSize: 12, fontWeight: '900', backgroundColor: '#E9F8FD', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  restrictedSection: { marginTop: 20 },
  paginationBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  pageBtn: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#FFE5EC' },
  pageBtnDisabled: { backgroundColor: '#F4F6F7', elevation: 0 },
  pageText: { marginHorizontal: 16, color: '#5C7A8A', fontWeight: '900' },
  stateBox: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 28 },
  stateText: { marginTop: 10, color: '#5C7A8A', fontWeight: '700', textAlign: 'center' },
  retryBtn: { marginTop: 12, backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14 },
  retryText: { color: '#FFF', fontWeight: '900' },
});
