import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FoodIngredientResponse, FoodResponse, getFoodDetail, resolveAssetUrl, resolveOptimizedAssetUrl } from '../../lib/api';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AdjustableIngredient = FoodIngredientResponse & { currentAmount: string };
type SavedIngredientAmounts = Record<string, string>;

const FOOD_AMOUNT_STORAGE_PREFIX = 'babyoi_food_detail_amounts';
const IMAGE_PREFETCH_TIMEOUT_MS = 700;
const foodDetailCache = new Map<string, FoodResponse>();

function getFoodAmountStorageKey(foodId: string | number, profileId?: string | number | null) {
  return `${FOOD_AMOUNT_STORAGE_PREFIX}:${profileId ?? 'guest'}:${foodId}`;
}

async function readSavedIngredientAmounts(foodId: string | number) {
  const profile = getSelectedProfile() || await hydrateSelectedProfile();
  const raw = await AsyncStorage.getItem(getFoodAmountStorageKey(foodId, profile?.id));

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as SavedIngredientAmounts
      : {};
  } catch {
    return {};
  }
}

async function writeSavedIngredientAmounts(foodId: string | number, amounts: SavedIngredientAmounts) {
  const profile = getSelectedProfile() || await hydrateSelectedProfile();
  await AsyncStorage.setItem(getFoodAmountStorageKey(foodId, profile?.id), JSON.stringify(amounts));
}

function mapIngredientsWithSavedAmounts(food: FoodResponse, savedAmounts: SavedIngredientAmounts): AdjustableIngredient[] {
  return (food.ingredients || []).map((ingredient) => ({
    ...ingredient,
    currentAmount: savedAmounts[String(ingredient.id)] ?? (ingredient.amountPerServing != null ? String(ingredient.amountPerServing) : '0'),
  }));
}

function scaledValue(value: number | null | undefined, amount: number, baseAmount: number) {
  if (value == null || !Number.isFinite(amount) || !Number.isFinite(baseAmount) || baseAmount <= 0) {
    return 0;
  }

  return value * amount / baseAmount;
}

const TARGET_LABELS: Record<string, string> = {
  FOR_MOTHER_DIET: 'mẹ muốn giảm cân hoặc lấy lại vóc dáng',
  FOR_MOTHER_CHANGE_DIET: 'mẹ muốn thay đổi chế độ ăn để bữa ăn đỡ lặp lại',
  FOR_MOTHER_POSTPARTUM_BREASTFEEDING: 'mẹ sau sinh đang cho con bú',
  FOR_MOTHER_HEALTHY_ENERGY: 'mẹ cần bữa ăn khỏe, đủ no và không quá nặng bụng',
  FOR_MOTHER_DIGESTION_RECOVERY: 'mẹ muốn ăn mềm, dễ tiêu và hỗ trợ phục hồi tiêu hóa',
  FOR_MOTHER_INCREASE_MILK_SUPPLY: 'mẹ muốn tăng lượng sữa theo hướng ăn uống cân bằng',
  FOR_MOTHER_SLEEP_STRESS_SUPPORT: 'mẹ muốn cải thiện giấc ngủ và giảm căng thẳng',
  FOR_BABY_6_8_MONTHS: 'bé 6-8 tháng mới tập ăn dặm',
  FOR_BABY_9_11_MONTHS: 'bé 9-11 tháng đang tăng dần độ thô',
  FOR_BABY_12_18_MONTHS: 'bé 12-18 tháng tập ăn cơm nát và món mềm',
  FOR_BABY_19_24_MONTHS: 'bé 19-24 tháng ăn gần hơn với bữa gia đình',
  FOR_BABY_6_8_MONTHS_DEVELOPMENT: 'bé 6-8 tháng cần món mềm để làm quen vị mới và hỗ trợ phát triển',
  FOR_BABY_9_11_MONTHS_DEVELOPMENT: 'bé 9-11 tháng cần món có kết cấu rõ hơn để luyện nhai nuốt',
  FOR_BABY_12_18_MONTHS_DEVELOPMENT: 'bé 12-18 tháng cần món mềm, nhỏ, dễ tự xúc và hỗ trợ phát triển',
  FOR_BABY_19_24_MONTHS_DEVELOPMENT: 'bé 19-24 tháng cần món đa dạng hơn để phát triển kỹ năng ăn uống',
};

const FOOD_CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dkerzsvan/image/upload/food';

function firstParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function compactImageCandidates(candidates: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return candidates.filter((candidate): candidate is string => {
    if (!candidate || seen.has(candidate)) {
      return false;
    }

    seen.add(candidate);
    return true;
  });
}

function getFoodCloudinaryFallback(foodId?: number | string | null) {
  return foodId ? `${FOOD_CLOUDINARY_BASE_URL}/Food_${foodId}.jpg` : '';
}

function resolveRouteImageUrl(url?: string | null) {
  if (!url) {
    return '';
  }

  return /^https?:\/\//i.test(url) ? url : resolveAssetUrl(url);
}

async function warmDetailImages(food: FoodResponse) {
  const imageUrls = [
    resolveOptimizedAssetUrl(food.imageUrl, 'detail'),
    ...((food.ingredients || []).slice(0, 8).map((ingredient) => resolveOptimizedAssetUrl(ingredient.imageUrl, 'ingredient'))),
  ].filter((url): url is string => Boolean(url));

  if (imageUrls.length === 0) {
    return;
  }

  await Promise.race([
    Image.prefetch(imageUrls, 'memory-disk').catch(() => false),
    new Promise((resolve) => setTimeout(resolve, IMAGE_PREFETCH_TIMEOUT_MS)),
  ]);
}

function formatTargetCodeText(content?: string | null) {
  if (!content) {
    return '';
  }

  return Object.entries(TARGET_LABELS).reduce(
    (result, [code, label]) => result.replace(new RegExp(code, 'g'), label),
    content
  );
}
export default function RecipeDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; image?: string }>();
  const [food, setFood] = useState<FoodResponse | null>(null);
  const [ingredients, setIngredients] = useState<AdjustableIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImageUris, setFailedImageUris] = useState<Record<string, boolean>>({});
  const amountsLoadedRef = useRef(false);
  const saveAmountsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const fireAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;
  const leafAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const runningAnimations = [
      Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 28000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(Animated.sequence([
        Animated.timing(jumpAnim, { toValue: -10, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(jumpAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(fireAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(fireAnim, { toValue: 0, duration: 1200, easing: Easing.linear, useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(armAnim, { toValue: 1, duration: 1400, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
        Animated.timing(armAnim, { toValue: 0, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(900),
      ])),
      Animated.loop(Animated.timing(leafAnim, { toValue: 1, duration: 4500, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.linear), useNativeDriver: true }),
        Animated.delay(1800),
      ])),
    ];

    runningAnimations.forEach((animation) => animation.start());

    return () => {
      runningAnimations.forEach((animation) => animation.stop());
      rotateAnim.stopAnimation();
      jumpAnim.stopAnimation();
      fireAnim.stopAnimation();
      armAnim.stopAnimation();
      leafAnim.stopAnimation();
      shineAnim.stopAnimation();
    };
  }, [armAnim, fireAnim, jumpAnim, leafAnim, rotateAnim, shineAnim]);

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!params.id) {
        setError('Thiếu mã món ăn.');
        setLoading(false);
        return;
      }

      const foodId = String(params.id);
      const cachedFood = foodDetailCache.get(foodId);
      const savedAmounts = await readSavedIngredientAmounts(params.id);

      const applyFoodDetail = (data: FoodResponse) => {
        if (mounted) {
          amountsLoadedRef.current = false;
          setFood(data);
          setIngredients(mapIngredientsWithSavedAmounts(data, savedAmounts));
          amountsLoadedRef.current = true;
        }
      };

      if (cachedFood) {
        applyFoodDetail(cachedFood);
        setLoading(false);
      }

      try {
        if (!cachedFood) {
          setLoading(true);
        }
        setError(null);
        const data = await getFoodDetail(params.id);
        foodDetailCache.set(foodId, data);
        await warmDetailImages(data);
        applyFoodDetail(data);
      } catch (err) {
        if (mounted && !cachedFood) {
          setError(err instanceof Error ? err.message : 'Không thể tải chi tiết món ăn.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      mounted = false;
      amountsLoadedRef.current = false;
    };
  }, [params.id]);

  useEffect(() => {
    setFailedImageUris({});
  }, [params.id]);

  useEffect(() => {
    if (!params.id || !amountsLoadedRef.current || ingredients.length === 0) {
      return;
    }

    if (saveAmountsTimerRef.current) {
      clearTimeout(saveAmountsTimerRef.current);
    }

    saveAmountsTimerRef.current = setTimeout(() => {
      const amounts = Object.fromEntries(
        ingredients.map((ingredient) => [String(ingredient.id), ingredient.currentAmount])
      );
      writeSavedIngredientAmounts(params.id!, amounts);
    }, 300);

    return () => {
      if (saveAmountsTimerRef.current) {
        clearTimeout(saveAmountsTimerRef.current);
      }
    };
  }, [ingredients, params.id]);

  useEffect(() => {
    return () => {
      if (saveAmountsTimerRef.current) {
        clearTimeout(saveAmountsTimerRef.current);
      }
    };
  }, []);

  const routeImageUri = resolveRouteImageUrl(firstParamValue(params.image));
  const foodImageCandidates = useMemo(
    () => compactImageCandidates([
      resolveOptimizedAssetUrl(food?.imageUrl, 'detail'),
      routeImageUri,
      resolveOptimizedAssetUrl(getFoodCloudinaryFallback(food?.id), 'detail'),
    ]),
    [food?.id, food?.imageUrl, routeImageUri]
  );
  const imageUri = foodImageCandidates.find((candidate) => !failedImageUris[candidate]) || '';

  const markImageFailed = (uri: string) => {
    if (!uri) {
      return;
    }

    setFailedImageUris((current) => current[uri] ? current : { ...current, [uri]: true });
  };

  const totals = useMemo(() => {
    return ingredients.reduce((acc, item) => {
      const qty = Number.parseFloat(item.currentAmount) || 0;
      const baseAmount = item.nutrition?.baseAmount || 100;
      return {
        calo: acc.calo + scaledValue(item.nutrition?.calories, qty, baseAmount),
        protein: acc.protein + scaledValue(item.nutrition?.protein, qty, baseAmount),
        carbs: acc.carbs + scaledValue(item.nutrition?.carbs, qty, baseAmount),
        fat: acc.fat + scaledValue(item.nutrition?.fat, qty, baseAmount),
      };
    }, { calo: 0, protein: 0, carbs: 0, fat: 0 });
  }, [ingredients]);

  const updateAmount = (id: number, text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    setIngredients((prev) => {
      const nextIngredients = prev.map((item) => item.id === id ? { ...item, currentAmount: cleanText } : item);

      if (params.id) {
        const amounts = Object.fromEntries(
          nextIngredients.map((ingredient) => [String(ingredient.id), ingredient.currentAmount])
        );
        writeSavedIngredientAmounts(params.id, amounts);
      }

      return nextIngredients;
    });
  };

  const renderFireIcon = () => {
    const color = fireAnim.interpolate({ inputRange: [0, 1], outputRange: ['#FFD166', '#FF8FAB'] });
    return (
      <Animated.View style={{ transform: [{ scale: fireAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }}>
        <Animated.Text style={{ color, fontSize: 18, fontWeight: '900' }}>🔥</Animated.Text>
      </Animated.View>
    );
  };

  const renderArmIcon = () => (
    <Animated.View style={{ transform: [{ scale: armAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] }}>
      <MaterialCommunityIcons name="arm-flex" size={20} color="#A7E4F5" />
    </Animated.View>
  );

  const renderLeafIcon = () => {
    const leafOpacity = leafAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] });
    const leafY = leafAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 25] });

    return (
      <View style={{ width: 20, height: 20, overflow: 'hidden', alignItems: 'center' }}>
        <Ionicons name="leaf" size={14} color="#63B87A" style={{ position: 'absolute', top: 3 }} />
        <Animated.View style={{ position: 'absolute', opacity: leafOpacity, transform: [{ translateY: leafY }, { rotate: '15deg' }] }}>
          <Ionicons name="leaf-outline" size={8} color="#A8E6B5" />
        </Animated.View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <DetailLoadingSkeleton />;
    }

    if (error || !food) {
      return <StateBox icon="warning-outline" text={error || 'Không tìm thấy món ăn.'} />;
    }

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#ff8fab" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Phân Tích Chi Tiết</Text>
            <View style={{ width: 45 }} />
          </View>

          <View style={styles.analyzeCard}>
            <LinearGradient
              colors={['#FFF0F5', '#FEF9F3', '#E9F8FD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroWash}
            />
            <View style={styles.heroTopRow}>
              <View style={styles.heroPill}>
                <Ionicons name="sparkles" size={14} color="#FF8FAB" />
                <Text style={styles.heroPillText}>Gợi ý dinh dưỡng</Text>
              </View>
              {!!ingredients.length && (
                <View style={styles.heroPillBlue}>
                  <Ionicons name="leaf-outline" size={14} color="#45AFC8" />
                  <Text style={styles.heroPillBlueText}>{ingredients.length} nguyên liệu</Text>
                </View>
              )}
            </View>
            <View style={styles.imageCircleContainer}>
              {ingredients.slice(0, 8).map((ing, index) => {
                const initialAngle = index * (360 / Math.max(ingredients.slice(0, 8).length, 1));
                const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: [`${initialAngle}deg`, `${initialAngle + 360}deg`] });
                const counterRotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: [`-${initialAngle}deg`, `-${initialAngle + 360}deg`] });
                return (
                  <Animated.View key={ing.id} style={[styles.floatingWrapper, { transform: [{ rotate: rotation }] }]}>
                    <Animated.View style={[styles.floatingIng, { transform: [{ rotate: counterRotation }] }]}>
                      {resolveOptimizedAssetUrl(ing.imageUrl, 'ingredient') ? (
                        <Image source={{ uri: resolveOptimizedAssetUrl(ing.imageUrl, 'ingredient') }} style={styles.floatingImage} cachePolicy="memory-disk" contentFit="cover" recyclingKey={`floating-${ing.id}`} />
                      ) : <Ionicons name="leaf-outline" size={20} color="#FF8FAB" />}
                      <Text style={styles.floatingText} numberOfLines={1}>{ing.nameIngredients || 'Nguyên liệu'}</Text>
                    </Animated.View>
                  </Animated.View>
                );
              })}

              <Animated.View style={[styles.imageCircle, { transform: [{ translateY: jumpAnim }] }]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.mainImg} cachePolicy="memory-disk" contentFit="cover" priority="high" recyclingKey={`food-${food.id}-${imageUri}`} onError={() => markImageFailed(imageUri)} />
                ) : (
                  <View style={[styles.mainImg, styles.mainImagePlaceholder]}>
                    <Ionicons name="image-outline" size={32} color="#FF8FAB" />
                    <Text style={styles.mainImagePlaceholderText}>Thiếu ảnh DB</Text>
                  </View>
                )}
              </Animated.View>
            </View>

            <Text style={styles.dishTitle}>{food.name}</Text>
            {!!food.advanceFor && <Text style={styles.advanceFor}>{formatTargetCodeText(food.advanceFor)}</Text>}
            <View style={styles.detailChipRow}>
              <View style={styles.detailChip}>
                <Ionicons name="flame-outline" size={15} color="#FF8FAB" />
                <Text style={styles.detailChipText}>{Math.round(totals.calo)} kcal</Text>
              </View>
              <View style={[styles.detailChip, styles.detailChipBlue]}>
                <MaterialCommunityIcons name="arm-flex" size={15} color="#45AFC8" />
                <Text style={[styles.detailChipText, styles.detailChipBlueText]}>{totals.protein.toFixed(1)}g đạm</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.recipeButton} onPress={() => router.push({ pathname: '/dinhduong/recipe-cooking', params: { id: food.id, image: imageUri } })}>
              <Ionicons name="restaurant-outline" size={16} color="#FF8FAB" />
              <Text style={styles.recipeButtonText}>Xem cách chế biến</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nutritionGrid}>
            {[
              { label: 'Calories', value: Math.round(totals.calo), unit: 'kcal', color: '#FFB6C1', renderIcon: renderFireIcon },
              { label: 'Protein', value: totals.protein.toFixed(1), unit: 'g', color: '#A7E4F5', renderIcon: renderArmIcon },
              { label: 'Carbs', value: totals.carbs.toFixed(1), unit: 'g', color: '#63B87A', renderIcon: renderLeafIcon },
              { label: 'Chất béo', value: totals.fat.toFixed(1), unit: 'g', color: '#FFD166', icon: 'water', isFat: true },
            ].map((stat, idx) => {
              if (stat.isFat) {
                const shineX = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5] });
                return (
                  <View key={idx} style={[styles.statCard, { borderColor: stat.color, shadowColor: stat.color, overflow: 'hidden' }]}>
                    <Animated.View style={[styles.shineContainer, { transform: [{ translateX: shineX }] }]}>
                      <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.shineGradient} />
                    </Animated.View>
                    <Ionicons name={stat.icon as any} size={18} color={stat.color} style={{ opacity: 0.8 }} />
                    <Text style={styles.statLabelText}>{stat.label}</Text>
                    <Text style={[styles.statValueText, { color: stat.color }]}>{stat.value} <Text style={styles.unitText}>{stat.unit}</Text></Text>
                  </View>
                );
              }

              return (
                <View key={idx} style={[styles.statCard, { borderColor: stat.color, shadowColor: stat.color }]}>
                  {stat.renderIcon && stat.renderIcon()}
                  <Text style={styles.statLabelText}>{stat.label}</Text>
                  <Text style={[styles.statValueText, { color: stat.color }]}>{stat.value} <Text style={styles.unitText}>{stat.unit}</Text></Text>
                </View>
              );
            })}
          </View>

          <View style={styles.adjustSection}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionHeadingIcon}>
                <Ionicons name="options-outline" size={18} color="#FF8FAB" />
              </View>
              <Text style={styles.sectionTitle}>Tùy chỉnh định lượng (g/ml)</Text>
            </View>
            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingRow}>
                <View style={styles.ingLeft}>
                  <View style={styles.iconBg}>
                    {resolveOptimizedAssetUrl(item.imageUrl, 'ingredient') ? (
                      <Image source={{ uri: resolveOptimizedAssetUrl(item.imageUrl, 'ingredient') }} style={styles.ingImage} cachePolicy="memory-disk" contentFit="cover" recyclingKey={`ingredient-${item.id}`} />
                    ) : <Ionicons name="leaf-outline" size={18} color="#FF8FAB" />}
                  </View>
                  <View style={styles.ingTextBox}>
                    <Text style={styles.ingName} numberOfLines={1}>{item.nameIngredients || 'Nguyên liệu'}</Text>
                    {!!item.description && <Text style={styles.ingDescription} numberOfLines={2}>{item.description}</Text>}
                  </View>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={item.currentAmount} onChangeText={(text) => updateAmount(item.id, text)} placeholder="0" placeholderTextColor="#FFB6C1" />
                  <Text style={styles.unitLabel}>{item.unit || 'g'}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.recommendSection}>
            {!!food.recommendation?.goodPoints && <InfoBlock title="Điểm tốt" icon="sparkles-outline" content={formatTargetCodeText(food.recommendation.goodPoints)} />}
            {!!food.recommendation?.badPoints && <InfoBlock title="Lưu ý" icon="alert-circle-outline" content={formatTargetCodeText(food.recommendation.badPoints)} />}
            {!!food.recommendation?.advice && <InfoBlock title="Gợi ý dùng" icon="bulb-outline" content={formatTargetCodeText(food.recommendation.advice)} />}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderContent()}
      {!loading && food && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Thêm vào món yêu thích</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function DetailLoadingSkeleton() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phân Tích Chi Tiết</Text>
        <View style={{ width: 45 }} />
      </View>

      <View style={styles.loadingAnalyzeCard}>
        <View style={styles.skeletonCircle}>
          <ActivityIndicator color="#FF8FAB" />
        </View>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonPill} />
      </View>

      <View style={styles.skeletonGrid}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.skeletonStatCard}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLine} />
          </View>
        ))}
      </View>

      <View style={styles.skeletonPanel}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={styles.skeletonIngredientRow}>
            <View style={styles.skeletonIngredientIcon} />
            <View style={{ flex: 1 }}>
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonLineShort} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StateBox({ icon, text, loading }: { icon: string; text: string; loading?: boolean }) {
  return (
    <View style={styles.stateBox}>
      {loading ? <ActivityIndicator color="#FF8FAB" /> : <Ionicons name={icon as any} size={28} color="#FF8FAB" />}
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}

function InfoBlock({ title, icon, content }: { title: string; icon: string; content: string }) {
  return (
    <View style={styles.infoBlock}>
      <View style={styles.infoTitleRow}>
        <Ionicons name={icon as any} size={18} color="#FF8FAB" />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoContent}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContainer: { paddingHorizontal: 20 },
  stateBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { marginTop: 10, color: '#5C7A8A', fontWeight: '800', textAlign: 'center' },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 70, marginBottom: 20 },
  backButton: { width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  loadingAnalyzeCard: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  skeletonCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#FFF5F8', borderWidth: 5, borderColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center' },
  skeletonTitle: { width: '72%', height: 24, borderRadius: 12, backgroundColor: '#FFE5EC', marginTop: 22 },
  skeletonPill: { width: 160, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFE5EC', marginTop: 12 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  skeletonStatCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: '#FFE5EC', padding: 16, alignItems: 'center', marginBottom: 12 },
  skeletonIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFE5EC', marginBottom: 10 },
  skeletonLine: { width: '82%', height: 12, borderRadius: 6, backgroundColor: '#F1E8E2', marginTop: 8 },
  skeletonLineShort: { width: '54%', height: 10, borderRadius: 5, backgroundColor: '#FFE5EC', marginTop: 8 },
  skeletonPanel: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#FFE5EC', marginBottom: 120 },
  skeletonIngredientRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  skeletonIngredientIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFF5F8' },
  analyzeCard: { alignItems: 'center', marginTop: 12, marginBottom: 28, paddingTop: 18, paddingHorizontal: 14, paddingBottom: 22, borderRadius: 32, overflow: 'hidden', borderWidth: 1.5, borderColor: '#FFE5EC', backgroundColor: '#FFF', elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.14, shadowRadius: 12 },
  heroWash: { ...StyleSheet.absoluteFillObject },
  heroTopRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -8, zIndex: 20 },
  heroPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#FFE5EC' },
  heroPillText: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginLeft: 5 },
  heroPillBlue: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1FBFE', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#A7E4F5' },
  heroPillBlueText: { color: '#45AFC8', fontSize: 11, fontWeight: '900', marginLeft: 5 },
  imageCircleContainer: { width: 350, height: 350, justifyContent: 'center', alignItems: 'center' },
  floatingWrapper: { position: 'absolute', width: 320, height: 50, justifyContent: 'center', alignItems: 'flex-end' },
  floatingIng: { backgroundColor: '#FFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', elevation: 6, minWidth: 80, maxWidth: 112, borderWidth: 1.5, borderColor: '#FFE5EC', shadowColor: '#A7E4F5', shadowOpacity: 0.18, shadowRadius: 8 },
  floatingImage: { width: 24, height: 24, borderRadius: 12, marginBottom: 2, backgroundColor: '#FFE5EC' },
  floatingText: { fontSize: 10, fontWeight: '800', color: '#5C7A8A', maxWidth: 92 },
  imageCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#FFF', elevation: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: '#FFB6C1', zIndex: 10, shadowColor: '#FF8FAB', shadowOpacity: 0.28, shadowRadius: 14 },
  mainImg: { width: 166, height: 166, borderRadius: 83 },
  mainImagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F8' },
  mainImagePlaceholderText: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginTop: 6 },
  dishTitle: { fontSize: 27, fontWeight: '900', color: '#FF8FAB', marginTop: 0, textAlign: 'center', lineHeight: 34 },
  advanceFor: { fontSize: 12, color: '#5C7A8A', fontWeight: '800', marginTop: 7, textAlign: 'center', lineHeight: 17, paddingHorizontal: 8 },
  detailChipRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 13 },
  detailChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F5', borderWidth: 1, borderColor: '#FFE5EC', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, marginHorizontal: 4, marginBottom: 6 },
  detailChipBlue: { backgroundColor: '#E9F8FD', borderColor: '#A7E4F5' },
  detailChipText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginLeft: 5 },
  detailChipBlueText: { color: '#45AFC8' },
  recipeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 17, paddingVertical: 10, borderRadius: 22, marginTop: 8, borderWidth: 1.5, borderColor: '#FFB6C1', elevation: 3, shadowColor: '#FFB6C1', shadowOpacity: 0.18, shadowRadius: 8 },
  recipeButtonText: { color: '#FF8FAB', fontSize: 13, fontWeight: '900', marginLeft: 6 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 16, paddingTop: 18, borderRadius: 22, borderWidth: 2, marginBottom: 12, alignItems: 'center', position: 'relative', elevation: 3, shadowOpacity: 0.13, shadowRadius: 9 },
  statLabelText: { fontSize: 12, color: '#5C7A8A', fontWeight: '700', marginVertical: 4 },
  statValueText: { fontSize: 18, fontWeight: '900' },
  unitText: { fontSize: 12, fontWeight: '600' },
  shineContainer: { position: 'absolute', top: 0, bottom: 0, width: '100%', zIndex: 1 },
  shineGradient: { width: SCREEN_WIDTH * 0.5, height: '100%', opacity: 0.5 },
  adjustSection: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.12, borderWidth: 1, borderColor: '#FFE5EC' },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  sectionHeadingIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', textAlign: 'center' },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#FEF9F3', padding: 10, borderRadius: 17, borderWidth: 1, borderColor: '#F6E9ED' },
  ingLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  iconBg: { width: 34, height: 34, backgroundColor: '#FFF', borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ingImage: { width: 34, height: 34, borderRadius: 10 },
  ingTextBox: { flex: 1 },
  ingName: { fontWeight: '800', color: '#5C7A8A', fontSize: 14 },
  ingDescription: { color: '#7D95A1', fontSize: 10, lineHeight: 14, fontWeight: '600', marginTop: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#FFB6C1', paddingHorizontal: 10, height: 40 },
  textInput: { width: 55, textAlign: 'center', fontWeight: '900', color: '#FF8FAB', fontSize: 16 },
  unitLabel: { fontSize: 12, color: '#999', fontWeight: '700', marginLeft: 5 },
  recommendSection: { marginTop: 20 },
  infoBlock: { backgroundColor: '#FFF', borderRadius: 22, padding: 16, marginBottom: 14, elevation: 3, borderWidth: 1.5, borderColor: '#FFE5EC', shadowColor: '#A7E4F5', shadowOpacity: 0.08, shadowRadius: 8 },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoTitle: { color: '#FF8FAB', fontSize: 16, fontWeight: '900', marginLeft: 8 },
  infoContent: { color: '#5C7A8A', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(254, 249, 243, 0.95)', paddingBottom: 35 },
  saveButton: { backgroundColor: '#FFB6C1', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#FFB6C1', shadowOpacity: 0.4, shadowRadius: 10 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
});
