import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
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

import { FoodIngredientResponse, FoodResponse, getFoodDetail, resolveAssetUrl } from '../../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AdjustableIngredient = FoodIngredientResponse & { currentAmount: string };

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

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const fireAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;
  const leafAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true }).start(() => startRotation());
    };

    Animated.loop(Animated.sequence([
      Animated.timing(jumpAnim, { toValue: -10, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(jumpAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(fireAnim, { toValue: 1, duration: 500, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(fireAnim, { toValue: 0, duration: 500, easing: Easing.linear, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(armAnim, { toValue: 1, duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      Animated.timing(armAnim, { toValue: 0, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
      Animated.delay(500),
    ])).start();

    Animated.loop(Animated.timing(leafAnim, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true })).start();

    Animated.loop(Animated.sequence([
      Animated.timing(shineAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.linear), useNativeDriver: true }),
      Animated.delay(1000),
    ])).start();

    startRotation();
  }, [armAnim, fireAnim, jumpAnim, leafAnim, rotateAnim, shineAnim]);

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!params.id) {
        setError('Thiếu mã món ăn.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getFoodDetail(params.id);
        if (mounted) {
          setFood(data);
          setIngredients((data.ingredients || []).map((ingredient) => ({
            ...ingredient,
            currentAmount: ingredient.amountPerServing != null ? String(ingredient.amountPerServing) : '0',
          })));
        }
      } catch (err) {
        if (mounted) {
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
    };
  }, [params.id]);

  const imageUri = resolveAssetUrl(food?.imageUrl);

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
    setIngredients(prev => prev.map(item => item.id === id ? { ...item, currentAmount: cleanText } : item));
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
        <Ionicons name="leaf" size={14} color="#FFD166" style={{ position: 'absolute', top: 3 }} />
        <Animated.View style={{ position: 'absolute', opacity: leafOpacity, transform: [{ translateY: leafY }, { rotate: '15deg' }] }}>
          <Ionicons name="leaf-outline" size={8} color="#FFE5EC" />
        </Animated.View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <StateBox icon="restaurant-outline" text="Đang tải chi tiết món ăn..." loading />;
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
            <View style={styles.imageCircleContainer}>
              {ingredients.slice(0, 8).map((ing, index) => {
                const initialAngle = index * (360 / Math.max(ingredients.slice(0, 8).length, 1));
                const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: [`${initialAngle}deg`, `${initialAngle + 360}deg`] });
                const counterRotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: [`-${initialAngle}deg`, `-${initialAngle + 360}deg`] });
                return (
                  <Animated.View key={ing.id} style={[styles.floatingWrapper, { transform: [{ rotate: rotation }] }]}>
                    <Animated.View style={[styles.floatingIng, { transform: [{ rotate: counterRotation }] }]}>
                      {resolveAssetUrl(ing.imageUrl) ? <Image source={{ uri: resolveAssetUrl(ing.imageUrl) }} style={styles.floatingImage} /> : <Ionicons name="leaf-outline" size={20} color="#FF8FAB" />}
                      <Text style={styles.floatingText} numberOfLines={1}>{ing.nameIngredients || 'Nguyên liệu'}</Text>
                    </Animated.View>
                  </Animated.View>
                );
              })}

              <Animated.View style={[styles.imageCircle, { transform: [{ translateY: jumpAnim }] }]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.mainImg} />
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
            <TouchableOpacity style={styles.recipeButton} onPress={() => router.push({ pathname: '/dinhduong/recipe-cooking', params: { id: food.id, image: imageUri } })}>
              <Ionicons name="restaurant-outline" size={16} color="#FF8FAB" />
              <Text style={styles.recipeButtonText}>Xem cách chế biến</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nutritionGrid}>
            {[
              { label: 'Calories', value: Math.round(totals.calo), unit: 'kcal', color: '#FFB6C1', renderIcon: renderFireIcon },
              { label: 'Protein', value: totals.protein.toFixed(1), unit: 'g', color: '#A7E4F5', renderIcon: renderArmIcon },
              { label: 'Carbs', value: totals.carbs.toFixed(1), unit: 'g', color: '#FFD166', renderIcon: renderLeafIcon },
              { label: 'Chất béo', value: totals.fat.toFixed(1), unit: 'g', color: '#C1F0D0', icon: 'water', isFat: true },
            ].map((stat, idx) => {
              if (stat.isFat) {
                const shineX = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5] });
                return (
                  <View key={idx} style={[styles.statCard, { borderColor: stat.color, overflow: 'hidden' }]}>
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
                <View key={idx} style={[styles.statCard, { borderColor: stat.color }]}>
                  {stat.renderIcon && stat.renderIcon()}
                  <Text style={styles.statLabelText}>{stat.label}</Text>
                  <Text style={[styles.statValueText, { color: stat.color }]}>{stat.value} <Text style={styles.unitText}>{stat.unit}</Text></Text>
                </View>
              );
            })}
          </View>

          <View style={styles.adjustSection}>
            <Text style={styles.sectionTitle}>Tùy chỉnh định lượng (g/ml)</Text>
            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingRow}>
                <View style={styles.ingLeft}>
                  <View style={styles.iconBg}>
                    {resolveAssetUrl(item.imageUrl) ? <Image source={{ uri: resolveAssetUrl(item.imageUrl) }} style={styles.ingImage} /> : <Ionicons name="leaf-outline" size={18} color="#FF8FAB" />}
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
  analyzeCard: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  imageCircleContainer: { width: 350, height: 350, justifyContent: 'center', alignItems: 'center' },
  floatingWrapper: { position: 'absolute', width: 320, height: 50, justifyContent: 'center', alignItems: 'flex-end' },
  floatingIng: { backgroundColor: '#FFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', elevation: 6, minWidth: 80, maxWidth: 112, borderWidth: 1.5, borderColor: '#FFE5EC' },
  floatingImage: { width: 24, height: 24, borderRadius: 12, marginBottom: 2, backgroundColor: '#FFE5EC' },
  floatingText: { fontSize: 10, fontWeight: '800', color: '#5C7A8A', maxWidth: 92 },
  imageCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#FFF', elevation: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#FFB6C1', zIndex: 10 },
  mainImg: { width: 160, height: 160, borderRadius: 80 },
  mainImagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F8' },
  mainImagePlaceholderText: { color: '#FF8FAB', fontSize: 11, fontWeight: '900', marginTop: 6 },
  dishTitle: { fontSize: 26, fontWeight: '900', color: '#FF8FAB', marginTop: 15, textAlign: 'center' },
  advanceFor: { fontSize: 12, color: '#7D95A1', fontWeight: '800', marginTop: 5, textAlign: 'center' },
  recipeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#FFB6C1' },
  recipeButtonText: { color: '#FF8FAB', fontSize: 13, fontWeight: '800', marginLeft: 6 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 2, marginBottom: 12, alignItems: 'center', position: 'relative' },
  statLabelText: { fontSize: 12, color: '#5C7A8A', fontWeight: '700', marginVertical: 4 },
  statValueText: { fontSize: 18, fontWeight: '900' },
  unitText: { fontSize: 12, fontWeight: '600' },
  shineContainer: { position: 'absolute', top: 0, bottom: 0, width: '100%', zIndex: 1 },
  shineGradient: { width: SCREEN_WIDTH * 0.5, height: '100%', opacity: 0.5 },
  adjustSection: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.1 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 20, textAlign: 'center' },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#FEF9F3', padding: 10, borderRadius: 15 },
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
  infoBlock: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 14, elevation: 2, borderWidth: 1, borderColor: '#FFE5EC' },
  infoTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoTitle: { color: '#FF8FAB', fontSize: 16, fontWeight: '900', marginLeft: 8 },
  infoContent: { color: '#5C7A8A', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(254, 249, 243, 0.95)', paddingBottom: 35 },
  saveButton: { backgroundColor: '#FFB6C1', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#FFB6C1', shadowOpacity: 0.4, shadowRadius: 10 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
});
