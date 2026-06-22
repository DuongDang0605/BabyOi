import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Ingredient {
  id: string;
  name: string;
  amount: string; 
  unit: string;
  caloPerUnit: number; 
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
  icon: string;
}

export default function AnalyzeDishScreen() {
  const { name, image } = useLocalSearchParams();

  // --- 1. ANIMATED VALUES ---
  const rotateAnim = useRef(new Animated.Value(0)).current; // Xoay nguyên liệu
  const jumpAnim = useRef(new Animated.Value(0)).current;   // Nảy món ăn
  const steamAnim = useRef(new Animated.Value(0)).current;  // Khói bốc lên
  
  // New Nutrition Animations
  const fireAnim = useRef(new Animated.Value(0)).current;    // Lửa cháy
  const armAnim = useRef(new Animated.Value(0)).current;     // Tay tập tạ
  const leafAnim = useRef(new Animated.Value(0)).current;    // Lá rơi
  const shineAnim = useRef(new Animated.Value(0)).current;   // Bóng loáng

  useEffect(() => {
    // -- Thừa hưởng các animation cũ --
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, { toValue: 1, duration: 25000, easing: Easing.linear, useNativeDriver: true }).start(() => startRotation());
    };

    const startJumping = () => {
      Animated.loop(Animated.sequence([
        Animated.timing(jumpAnim, { toValue: -10, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(jumpAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])).start();
    };

    const startSteam = () => {
      steamAnim.setValue(0);
      Animated.loop(Animated.timing(steamAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })).start();
    };

    // -- ANIMATION MỚI CHO PHẦN DINH DƯỠNG --
    
    // 1. Lửa cháy (nhấp nháy scale và đổi màu via interpolate)
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnim, { toValue: 1, duration: 500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(fireAnim, { toValue: 0, duration: 500, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();

    // 2. Tay tập tạ (gồng lên nhịp nhàng)
    Animated.loop(
      Animated.sequence([
        Animated.timing(armAnim, { toValue: 1, duration: 800, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
        Animated.timing(armAnim, { toValue: 0, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(500),
      ])
    ).start();

    // 3. Lá rơi (rơi xuống và mờ dần)
    Animated.loop(
      Animated.timing(leafAnim, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // 4. Bóng loáng (vệt sáng chạy ngang)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.linear), useNativeDriver: true }),
        Animated.delay(1000),
      ])
    ).start();


    startRotation();
    startJumping();
    startSteam();
  }, [armAnim, fireAnim, jumpAnim, leafAnim, rotateAnim, shineAnim, steamAnim]);

  // --- DỮ LIỆU & LOGIC CŨ (GIỮ NGUYÊN) ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Ức gà', amount: '150', unit: 'g', caloPerUnit: 1.65, proteinPerUnit: 0.31, carbsPerUnit: 0, fatPerUnit: 0.036, icon: '🍗' },
    { id: '2', name: 'Xà lách', amount: '100', unit: 'g', caloPerUnit: 0.15, proteinPerUnit: 0.014, carbsPerUnit: 0.029, fatPerUnit: 0.002, icon: '🥬' },
    { id: '3', name: 'Bơ chín', amount: '50', unit: 'g', caloPerUnit: 1.6, proteinPerUnit: 0.02, carbsPerUnit: 0.085, fatPerUnit: 0.147, icon: '🥑' },
    { id: '4', name: 'Cà chua bi', amount: '50', unit: 'g', caloPerUnit: 0.18, proteinPerUnit: 0.009, carbsPerUnit: 0.039, fatPerUnit: 0.002, icon: '🍅' },
    { id: '5', name: 'Dầu Olive', amount: '10', unit: 'ml', caloPerUnit: 8.8, proteinPerUnit: 0, carbsPerUnit: 0, fatPerUnit: 0.99, icon: '🫒' },
    { id: '6', name: 'Hạt điều', amount: '15', unit: 'g', caloPerUnit: 5.5, proteinPerUnit: 0.18, carbsPerUnit: 0.3, fatPerUnit: 0.44, icon: '🥜' },
  ]);

  const totals = useMemo(() => {
    return ingredients.reduce((acc, item) => {
      const qty = parseFloat(item.amount) || 0;
      return {
        calo: acc.calo + (qty * item.caloPerUnit),
        protein: acc.protein + (qty * item.proteinPerUnit),
        carbs: acc.carbs + (qty * item.carbsPerUnit),
        fat: acc.fat + (qty * item.fatPerUnit),
      };
    }, { calo: 0, protein: 0, carbs: 0, fat: 0 });
  }, [ingredients]);

  const updateAmount = (id: string, text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setIngredients(prev => prev.map(item => item.id === id ? { ...item, amount: cleanText } : item));
  };

  // --- HELPER RENDERERS CHO ICON DINH DƯỠNG ---
  
  const renderFireIcon = () => {
    // Interpolate màu từ vàng sang đỏ cam
    const color = fireAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FFD166', '#FF8FAB'] // Vàng tươi -> Hồng đỏ của app
    });
    
    return (
      <Animated.View style={{ transform: [{ scale: fireAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] }}>
        <Animated.Text style={{ color, fontSize: 18, fontWeight: '900' }}>🔥</Animated.Text>
      </Animated.View>
    );
  };

  const renderArmIcon = () => {
    return (
      <Animated.View style={{ transform: [{ scale: armAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] }}>
        <MaterialCommunityIcons name="arm-flex" size={20} color="#A7E4F5" />
      </Animated.View>
    );
  };

  const renderLeafIcon = () => {
    const leafOpacity = leafAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] });
    const leafY = leafAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 25] });

    return (
      <View style={{ width: 20, height: 20, overflow: 'hidden', alignItems: 'center' }}>
        <Ionicons name="leaf" size={14} color="#FFD166" style={{ position: 'absolute', top: 3 }} />
        {/* Lá rơi phụ */}
        <Animated.View style={{ position: 'absolute', opacity: leafOpacity, transform: [{ translateY: leafY }, { rotate: '15deg' }] }}>
          <Ionicons name="leaf-outline" size={8} color="#FFE5EC" />
        </Animated.View>
      </View>
    );
  };

  // --- MAIN RENDER ---
  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
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
              {/* Vòng quay nguyên liệu  ắiruiweriwi  cũ */}
              {ingredients.map((ing, index) => {
                const initialAngle = (index * (360 / ingredients.length));
                const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: [`${initialAngle}deg`, `${initialAngle + 360}deg`] });
                const counterRotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: [`-${initialAngle}deg`, `-${initialAngle + 360}deg`] });
                return (
                  <Animated.View key={ing.id} style={[styles.floatingWrapper, { transform: [{ rotate: rotation }] }]}>
                    <Animated.View style={[styles.floatingIng, { transform: [{ rotate: counterRotation }] }]}>
                      <Text style={{fontSize: 22}}>{ing.icon}</Text>
                      <Text style={styles.floatingText}>{ing.name}</Text>
                    </Animated.View>
                  </Animated.View>
                );
              })}

              {/* Món ăn nảy cũ */}
              <Animated.View style={[styles.imageCircle, { transform: [{ translateY: jumpAnim }] }]}>
                <Image
                  source={{ uri: (image as string) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500' }}
                  style={styles.mainImg}
                  cachePolicy="disk"
                  contentFit="cover"
                />
              </Animated.View>
            </View>

            <Text style={styles.dishTitle}>{name || "Salad Ức Gà"}</Text>
            <TouchableOpacity style={styles.recipeButton} onPress={() => router.push('/dinhduong/recipe-detail')}>
              <Ionicons name="restaurant-outline" size={16} color="#FF8FAB" />
              <Text style={styles.recipeButtonText}>Xem cách chế biến</Text>
            </TouchableOpacity>
          </View>

          {/* --- PHẦN 2: CHỈ SỐ DINH DƯỠNG (UPDATE MỚI TỪ ĐÂY) --- */}
          <View style={styles.nutritionGrid}>
            {[
              { label: 'Calories', value: Math.round(totals.calo), unit: 'kcal', color: '#FFB6C1', renderIcon: renderFireIcon },
              { label: 'Protein', value: totals.protein.toFixed(1), unit: 'g', color: '#A7E4F5', renderIcon: renderArmIcon },
              { label: 'Carbs', value: totals.carbs.toFixed(1), unit: 'g', color: '#FFD166', renderIcon: renderLeafIcon },
              { label: 'Chất béo', value: totals.fat.toFixed(1), unit: 'g', color: '#C1F0D0', icon: 'water', isFat: true },
            ].map((stat, idx) => {
              
              // Ô Chất béo đặc biệt có hiệu ứng bóng loáng
              if (stat.isFat) {
                const shineX = shineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5] // Chạy từ trái sang phải ô
                });

                return (
                  <View key={idx} style={[styles.statCard, { borderColor: stat.color, overflow: 'hidden' }]}>
                    {/* Lớp Gradient bóng loáng chạy ngang */}
                    <Animated.View style={[styles.shineContainer, { transform: [{ translateX: shineX }] }]}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.shineGradient}
                      />
                    </Animated.View>
                    
                    <Ionicons name={stat.icon as any} size={18} color={stat.color} style={{opacity: 0.8}} />
                    <Text style={styles.statLabelText}>{stat.label}</Text>
                    <Text style={[styles.statValueText, { color: stat.color }]}>{stat.value} <Text style={styles.unitText}>{stat.unit}</Text></Text>
                  </View>
                );
              }

              // Các ô khác dùng renderIcon function
              return (
                <View key={idx} style={[styles.statCard, { borderColor: stat.color }]}>
                  {stat.renderIcon && stat.renderIcon()}
                  <Text style={styles.statLabelText}>{stat.label}</Text>
                  <Text style={[styles.statValueText, { color: stat.color }]}>{stat.value} <Text style={styles.unitText}>{stat.unit}</Text></Text>
                </View>
              );
            })}
          </View>

          {/* --- CÁC PHẦN CŨ (GIỮ NGUYÊN) --- */}
          <View style={styles.adjustSection}>
            <Text style={styles.sectionTitle}>Tùy chỉnh định lượng (g/ml)</Text>
            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingRow}>
                <View style={styles.ingLeft}>
                  <View style={styles.iconBg}><Text style={{fontSize: 18}}>{item.icon}</Text></View>
                  <Text style={styles.ingName}>{item.name}</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.textInput} keyboardType="numeric" value={item.amount} onChangeText={(text) => updateAmount(item.id, text)} placeholder="0" placeholderTextColor="#FFB6C1" />
                  <Text style={styles.unitLabel}>{item.unit}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Thêm vào món yêu thích</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContainer: { paddingHorizontal: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 70, marginBottom: 20 },
  backButton: { width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  analyzeCard: { alignItems: 'center', marginTop: 30, marginBottom: 30 },
  imageCircleContainer: { width: 350, height: 350, justifyContent: 'center', alignItems: 'center' },
  steamCloud: { position: 'absolute', top: 100, zIndex: 5 },
  floatingWrapper: { position: 'absolute', width: 320, height: 50, justifyContent: 'center', alignItems: 'flex-end' },
  floatingIng: { backgroundColor: '#FFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', elevation: 6, minWidth: 80, borderWidth: 1.5, borderColor: '#FFE5EC' },
  floatingText: { fontSize: 10, fontWeight: '800', color: '#5C7A8A' },
  imageCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#FFF', elevation: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#FFB6C1', zIndex: 10 },
  mainImg: { width: 160, height: 160, borderRadius: 80 },
  dishTitle: { fontSize: 26, fontWeight: '900', color: '#FF8FAB', marginTop: 15 },
  recipeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#FFB6C1' },
  recipeButtonText: { color: '#FF8FAB', fontSize: 13, fontWeight: '800', marginLeft: 6 },
  
  // Nutrition Grid Styles
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 2, marginBottom: 12, alignItems: 'center', position: 'relative' },
  statLabelText: { fontSize: 12, color: '#5C7A8A', fontWeight: '700', marginVertical: 4 },
  statValueText: { fontSize: 18, fontWeight: '900' },
  unitText: { fontSize: 12, fontWeight: '600' },
  
  // Shine Effect Styles (cho Chất béo)
  shineContainer: { position: 'absolute', top: 0, bottom: 0, width: '100%', zIndex: 1 },
  shineGradient: { width: SCREEN_WIDTH * 0.5, height: '100%', opacity: 0.5 },

  adjustSection: { backgroundColor: '#FFF', borderRadius: 30, padding: 20, elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.1 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 20, textAlign: 'center' },
  ingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: '#FEF9F3', padding: 10, borderRadius: 15 },
  ingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { backgroundColor: '#FFF', padding: 5, borderRadius: 10, marginRight: 10 },
  ingName: { fontWeight: '700', color: '#5C7A8A', fontSize: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1.5, borderColor: '#FFB6C1', paddingHorizontal: 10, height: 40 },
  textInput: { width: 55, textAlign: 'center', fontWeight: '900', color: '#FF8FAB', fontSize: 16 },
  unitLabel: { fontSize: 12, color: '#999', fontWeight: '700', marginLeft: 5 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(254, 249, 243, 0.95)', paddingBottom: 35 },
  saveButton: { backgroundColor: '#FFB6C1', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#FFB6C1', shadowOpacity: 0.4, shadowRadius: 10 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '900' }
});
