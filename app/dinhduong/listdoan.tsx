import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { DishCard, type Dish } from '../../components/dinhduong/DishCard';
import {
  FoodResponse,
  IngredientFoodSuggestionResponse,
  ProfileResponse,
  addFavoriteFood,
  addRestrictedFood,
  deleteFavoriteFood,
  deleteRestrictedFood,
  getFavoriteFoodIds,
  getFoodsPage,
  getRestrictedFoodIds,
  resolveOptimizedAssetUrl,
  suggestFoodsFromIngredients,
  trackNutritionPageView,
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
  const params = useLocalSearchParams<{ openedFrom?: string; entryKey?: string }>();
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
  const [ingredientPhotoUri, setIngredientPhotoUri] = useState<string | null>(null);
  const [suggestionResult, setSuggestionResult] = useState<IngredientFoodSuggestionResponse | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const flatListRef = useRef<FlatList<Dish>>(null);
  const listStartOffsetRef = useRef(0);
  const handledHomeEntryKeyRef = useRef<string | null>(null);
  const lastNutritionViewTrackedAtRef = useRef(0);

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

  useFocusEffect(useCallback(() => {
    const now = Date.now();
    if (now - lastNutritionViewTrackedAtRef.current < 1500) {
      return;
    }
    lastNutritionViewTrackedAtRef.current = now;

    void (async () => {
      const session = await getCurrentSession();
      if (session) {
        await trackNutritionPageView();
      }
    })().catch(() => undefined);
  }, []));

  useFocusEffect(useCallback(() => {
    if (params.openedFrom !== 'home') {
      return;
    }

    const entryKey = params.entryKey || 'home';
    if (handledHomeEntryKeyRef.current === entryKey) {
      return;
    }

    handledHomeEntryKeyRef.current = entryKey;
    const animationFrame = requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [params.entryKey, params.openedFrom]));

  useEffect(() => {
    setActiveAdvanceFor(null);
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    setPage(0);
  }, [activeAdvanceFor, debouncedSearch]);

  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: Math.max(listStartOffsetRef.current - 8, 0),
        animated: true,
      });
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

  const handleSuggestionFoodPress = (food: FoodResponse) => {
    router.push({
      pathname: '/dinhduong/recipe-detail',
      params: {
        id: String(food.id),
        image: resolveOptimizedAssetUrl(food.imageUrl, 'card'),
      },
    });
  };

  const applyIngredientPhoto = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setIngredientPhotoUri(result.assets[0].uri);
    setSuggestionResult(null);
  };

  const pickIngredientPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('BabyOi', 'Bạn cần cho phép truy cập thư viện ảnh để chọn ảnh nguyên liệu.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.55,
      aspect: [4, 3],
    });

    applyIngredientPhoto(result);
  };

  const captureIngredientPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('BabyOi', 'Bạn cần cho phép truy cập camera để chụp ảnh nguyên liệu.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.55,
      aspect: [4, 3],
    });

    applyIngredientPhoto(result);
  };

  const analyzeIngredientPhoto = async () => {
    if (!ingredientPhotoUri) {
      Alert.alert('BabyOi', 'Mẹ chụp hoặc chọn ảnh nguyên liệu trước nhé.');
      return;
    }

    setSuggestionLoading(true);
    setActionMessage(null);

    try {
      const profileId = await getCurrentProfileId();
      const result = await suggestFoodsFromIngredients({
        profileId,
        imageUri: ingredientPhotoUri,
        limit: 6,
      });

      setSuggestionResult(result);
      if (!result.suggestions?.length) {
        setActionMessage('Chưa tìm thấy món phù hợp từ ảnh nguyên liệu này.');
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Không thể gợi ý món từ ảnh nguyên liệu.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const reloadCurrentPage = () => {
    setPage((current) => current);
    setDebouncedSearch(searchQuery.trim());
  };

  const rememberListStartOffset = (event: LayoutChangeEvent) => {
    listStartOffsetRef.current = event.nativeEvent.layout.y;
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
              </LinearGradient>
            </View>

            <View style={styles.aiSuggestionCard}>
              <View style={styles.aiSuggestionHeader}>
                <View style={styles.aiSuggestionTitleBox}>
                  <Text style={styles.aiSuggestionKicker}>ĐẬU DINH DƯỠNG</Text>
                  <Text style={styles.aiSuggestionTitle}>Đậu dinh dưỡng gợi ý món ăn</Text>
                  <Text style={styles.aiSuggestionSubtitle}>Lên thực đơn hoặc chụp nguyên liệu để tìm món hợp với hồ sơ hiện tại.</Text>
                </View>
                <View style={styles.aiSuggestionIcon}>
                  <Image source={require('../../assets/images/AI_food_transparent.png')} style={styles.aiSuggestionImage} />
                </View>
              </View>

              <View style={styles.aiQuickActions}>
                <TouchableOpacity style={styles.aiPlannerAction} onPress={() => router.push('/dinhduong/ai-planner')} activeOpacity={0.9}>
                  <View style={styles.aiActionIconPink}>
                    <Ionicons name="calendar-outline" size={19} color="#FFFFFF" />
                  </View>
                  <View style={styles.aiActionCopy}>
                    <Text style={styles.aiActionTitle}>Lên thực đơn</Text>
                    <Text style={styles.aiActionSubtitle} numberOfLines={1}>Kế hoạch 7 ngày</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={17} color="#FF8FAB" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.aiCameraAction} onPress={ingredientPhotoUri ? analyzeIngredientPhoto : captureIngredientPhoto} disabled={suggestionLoading} activeOpacity={0.9}>
                  <View style={styles.aiActionIconBlue}>
                    <Ionicons name="camera-outline" size={19} color="#FFFFFF" />
                  </View>
                  <View style={styles.aiActionCopy}>
                    <Text style={styles.aiActionTitle}>Chụp tìm món</Text>
                    <Text style={styles.aiActionSubtitle} numberOfLines={1}>{ingredientPhotoUri ? 'Phân tích ảnh đã chọn' : 'Từ nguyên liệu sẵn có'}</Text>
                  </View>
                  {suggestionLoading ? (
                    <ActivityIndicator color="#45AFC8" size="small" />
                  ) : (
                    <Ionicons name="sparkles" size={17} color="#45AFC8" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.ingredientAiPanel}>
              <View style={styles.ingredientAiHeader}>
                <View style={styles.ingredientAiIcon}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.ingredientAiTitleBox}>
                  <Text style={styles.ingredientAiTitle}>Chụp tìm với Đậu dinh dưỡng</Text>
                  <Text style={styles.ingredientAiSubtitle}>Chọn ảnh nguyên liệu, Đậu dinh dưỡng sẽ nhận diện và gợi ý món phù hợp.</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.ingredientPhotoBox} activeOpacity={0.9} onPress={ingredientPhotoUri ? analyzeIngredientPhoto : captureIngredientPhoto}>
                {ingredientPhotoUri ? (
                  <>
                    <Image source={{ uri: ingredientPhotoUri }} style={styles.ingredientPhoto} contentFit="cover" />
                    <LinearGradient colors={['transparent', 'rgba(92,122,138,0.54)']} style={styles.ingredientPhotoShade} />
                    <View style={styles.ingredientPhotoBadge}>
                      <Ionicons name="sparkles" size={14} color="#FF8FAB" />
                      <Text style={styles.ingredientPhotoBadgeText}>Sẵn sàng phân tích</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.ingredientPhotoEmpty}>
                    <Ionicons name="camera-outline" size={34} color="#FF8FAB" />
                    <Text style={styles.ingredientPhotoEmptyTitle}>Chụp ảnh nguyên liệu có sẵn</Text>
                    <Text style={styles.ingredientPhotoEmptyText}>Ví dụ: bí đỏ, trứng, cá hồi, rau củ...</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.ingredientActions}>
                <TouchableOpacity style={styles.ingredientSecondaryBtn} onPress={pickIngredientPhoto} disabled={suggestionLoading}>
                  <Ionicons name="images-outline" size={18} color="#FF8FAB" />
                  <Text style={styles.ingredientSecondaryText}>Chọn ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ingredientPrimaryBtn, (!ingredientPhotoUri || suggestionLoading) && styles.ingredientPrimaryBtnDisabled]} onPress={analyzeIngredientPhoto} disabled={!ingredientPhotoUri || suggestionLoading}>
                  {suggestionLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  )}
                  <Text style={styles.ingredientPrimaryText}>{suggestionLoading ? 'Đang gợi ý' : 'Gợi ý món'}</Text>
                </TouchableOpacity>
              </View>

              {!!suggestionResult?.detectedIngredients?.length && (
                <View style={styles.detectedBox}>
                  <Text style={styles.detectedTitle}>Đậu dinh dưỡng thấy trong ảnh</Text>
                  <View style={styles.detectedChips}>
                    {suggestionResult.detectedIngredients.slice(0, 8).map((ingredient, index) => (
                      <View key={`${ingredient.name}-${index}`} style={styles.detectedChip}>
                        <Text style={styles.detectedChipText}>{ingredient.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {!!suggestionResult?.warnings?.length && (
                <View style={styles.suggestionWarningBox}>
                  <Ionicons name="information-circle-outline" size={17} color="#D9912B" />
                  <Text style={styles.suggestionWarningText}>{suggestionResult.warnings[0]}</Text>
                </View>
              )}

              {!!suggestionResult?.suggestions?.length && (
                <View style={styles.suggestionList}>
                  <Text style={styles.suggestionListTitle}>Món phù hợp từ nguyên liệu</Text>
                  {suggestionResult.suggestions.map((item, index) => {
                    const food = item.food;
                    const imageUri = resolveOptimizedAssetUrl(food.imageUrl, 'ingredient');
                    const matchedText = item.matchedIngredients?.length ? item.matchedIngredients.join(', ') : 'Nguyên liệu phù hợp';
                    const score = item.matchScore != null ? Math.round(item.matchScore * 100) : null;

                    return (
                      <TouchableOpacity key={`${food.id}-${index}`} style={styles.suggestionItem} onPress={() => handleSuggestionFoodPress(food)} activeOpacity={0.88}>
                        {imageUri ? (
                          <Image source={{ uri: imageUri }} style={styles.suggestionImage} contentFit="cover" cachePolicy="memory-disk" />
                        ) : (
                          <View style={[styles.suggestionImage, styles.suggestionImagePlaceholder]}>
                            <Ionicons name="restaurant-outline" size={22} color="#FF8FAB" />
                          </View>
                        )}
                        <View style={styles.suggestionContent}>
                          <View style={styles.suggestionNameRow}>
                            <Text style={styles.suggestionName} numberOfLines={1}>{food.name}</Text>
                            {score != null && <Text style={styles.suggestionScore}>{score}%</Text>}
                          </View>
                          <Text style={styles.suggestionMatched} numberOfLines={1}>{matchedText}</Text>
                          {!!item.suitabilityNote && <Text style={styles.suggestionNote} numberOfLines={2}>{item.suitabilityNote}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#A8BDC8" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              </View>
            </View>

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

            <View style={styles.sectionTitleRow} onLayout={rememberListStartOffset}>
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
  headerPinkBg: { backgroundColor: '#FEF9F3', paddingBottom: 4 },
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
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', paddingHorizontal: 15, height: 45, marginHorizontal: 20, marginTop: 12, marginBottom: 10, borderWidth: 1.5, borderColor: '#FFE5EC' },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#5C7A8A' },
  aiSuggestionCard: { marginHorizontal: 20, marginTop: 4, marginBottom: 4, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: '#FFE5EC', elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.13, shadowRadius: 14 },
  aiSuggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiSuggestionTitleBox: { flex: 1, minWidth: 0 },
  aiSuggestionKicker: { color: '#FF8FAB', fontSize: 10, fontWeight: '900', letterSpacing: 0 },
  aiSuggestionTitle: { color: '#5C7A8A', fontSize: 18, fontWeight: '900', marginTop: 2 },
  aiSuggestionSubtitle: { color: '#7D95A1', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 3 },
  aiSuggestionIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  aiSuggestionImage: { width: 70, height: 70 },
  aiQuickActions: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 12 },
  aiPlannerAction: { flex: 1, minHeight: 58, borderRadius: 18, backgroundColor: '#FFF0F5', borderWidth: 1, borderColor: '#FFE5EC', paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  aiCameraAction: { flex: 1, minHeight: 58, borderRadius: 18, backgroundColor: '#E9F8FD', borderWidth: 1, borderColor: '#D6F1F8', paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' },
  aiActionIconPink: { width: 34, height: 34, borderRadius: 13, backgroundColor: '#FF8FAB', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  aiActionIconBlue: { width: 34, height: 34, borderRadius: 13, backgroundColor: '#45AFC8', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  aiActionCopy: { flex: 1, minWidth: 0 },
  aiActionTitle: { color: '#5C7A8A', fontSize: 12, fontWeight: '900' },
  aiActionSubtitle: { color: '#7D95A1', fontSize: 10, fontWeight: '800', marginTop: 2 },
  ingredientAiPanel: { borderTopWidth: 1, borderTopColor: '#F5E8EE', paddingTop: 12 },
  ingredientAiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ingredientAiIcon: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF8FAB', marginRight: 10 },
  ingredientAiTitleBox: { flex: 1 },
  ingredientAiTitle: { color: '#5C7A8A', fontSize: 16, fontWeight: '900' },
  ingredientAiSubtitle: { color: '#7D95A1', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 2 },
  ingredientPhotoBox: { height: 158, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFF7FA', borderWidth: 1, borderColor: '#FFE5EC' },
  ingredientPhoto: { width: '100%', height: '100%' },
  ingredientPhotoShade: { ...StyleSheet.absoluteFillObject },
  ingredientPhotoBadge: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  ingredientPhotoBadgeText: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginLeft: 5 },
  ingredientPhotoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  ingredientPhotoEmptyTitle: { marginTop: 8, color: '#5C7A8A', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  ingredientPhotoEmptyText: { marginTop: 4, color: '#7D95A1', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  ingredientActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  ingredientSecondaryBtn: { flex: 1, height: 42, borderRadius: 15, borderWidth: 1, borderColor: '#FFE5EC', backgroundColor: '#FFF7FA', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginRight: 8 },
  ingredientSecondaryText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginLeft: 5 },
  ingredientPrimaryBtn: { flex: 1.35, height: 42, borderRadius: 15, backgroundColor: '#FF8FAB', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', elevation: 2, shadowColor: '#FF8FAB', shadowOpacity: 0.2, shadowRadius: 8 },
  ingredientPrimaryBtnDisabled: { backgroundColor: '#F3C8D3', elevation: 0 },
  ingredientPrimaryText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', marginLeft: 6 },
  detectedBox: { marginTop: 14 },
  detectedTitle: { color: '#5C7A8A', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  detectedChips: { flexDirection: 'row', flexWrap: 'wrap' },
  detectedChip: { backgroundColor: '#E9F8FD', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginRight: 7, marginBottom: 7 },
  detectedChipText: { color: '#45AFC8', fontSize: 11, fontWeight: '900' },
  suggestionWarningBox: { marginTop: 10, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E8', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9 },
  suggestionWarningText: { flex: 1, color: '#9A6A1F', fontSize: 11, fontWeight: '800', lineHeight: 16, marginLeft: 6 },
  suggestionList: { marginTop: 14 },
  suggestionListTitle: { color: '#5C7A8A', fontSize: 13, fontWeight: '900', marginBottom: 9 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFEFF', borderRadius: 17, padding: 9, borderWidth: 1, borderColor: '#E9F8FD', marginBottom: 9 },
  suggestionImage: { width: 58, height: 58, borderRadius: 14, backgroundColor: '#FFF0F5', marginRight: 10 },
  suggestionImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  suggestionContent: { flex: 1, minWidth: 0 },
  suggestionNameRow: { flexDirection: 'row', alignItems: 'center' },
  suggestionName: { flex: 1, color: '#5C7A8A', fontSize: 13, fontWeight: '900', marginRight: 8 },
  suggestionScore: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', backgroundColor: '#FFF0F5', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  suggestionMatched: { color: '#45AFC8', fontSize: 11, fontWeight: '900', marginTop: 3 },
  suggestionNote: { color: '#7D95A1', fontSize: 11, fontWeight: '700', lineHeight: 15, marginTop: 3 },
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
