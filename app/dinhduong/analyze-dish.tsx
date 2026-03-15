import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
        carbs: acc.carbs + (acc.carbs === undefined ? (qty * item.carbsPerUnit) : (qty * item.carbsPerUnit)),
        fat: acc.fat + (qty * item.fatPerUnit),
      };
    }, { calo: 0, protein: 0, carbs: 0, fat: 0 });
  }, [ingredients]);

  const updateAmount = (id: string, text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setIngredients(prev => prev.map(item => item.id === id ? { ...item, amount: cleanText } : item));
  };

  return (
    <View style={styles.mainContainer}>
      {/* Tắt Header mặc định */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- HEADER CHUẨN ĐỒNG BỘ - ĐÃ ĐẨY XUỐNG SÂU --- */}
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#ff8fab" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Phân Tích Chi Tiết</Text>
            
            <View style={{ width: 45 }} />
          </View>

          {/* --- Phần 1: Hình ảnh & Nguyên liệu bay --- */}
          <View style={styles.analyzeCard}>
            <View style={styles.imageCircleContainer}>
              {ingredients.map((ing, index) => {
                const angle = (index * (360 / ingredients.length)) * (Math.PI / 180);
                const x = Math.cos(angle) * 125;
                const y = Math.sin(angle) * 125;
                return (
                  <View key={ing.id} style={[styles.floatingIng, { transform: [{ translateX: x }, { translateY: y }] }]}>
                    <Text style={{fontSize: 22}}>{ing.icon}</Text>
                    <Text style={styles.floatingText}>{ing.name}</Text>
                  </View>
                );
              })}
              <View style={styles.imageCircle}>
                <Image source={{ uri: (image as string) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500' }} style={styles.mainImg} />
              </View>
            </View>
            <Text style={styles.dishTitle}>{name || "Salad Ức Gà"}</Text>
            <TouchableOpacity 
              style={styles.recipeButton} 
              onPress={() => router.push('/dinhduong/recipe-detail')}
            >
              <Ionicons name="restaurant-outline" size={16} color="#FF8FAB" />
              <Text style={styles.recipeButtonText}>Xem cách chế biến</Text>
            </TouchableOpacity>
          </View>

          {/* --- Phần 2: Chỉ số dinh dưỡng --- */}
          <View style={styles.nutritionGrid}>
            {[
              { label: 'Calories', value: Math.round(totals.calo), unit: 'kcal', color: '#FFB6C1', icon: 'flame' },
              { label: 'Protein', value: totals.protein.toFixed(1), unit: 'g', color: '#A7E4F5', icon: 'barbell' },
              { label: 'Carbs', value: totals.carbs.toFixed(1), unit: 'g', color: '#FFD166', icon: 'leaf' },
              { label: 'Chất béo', value: totals.fat.toFixed(1), unit: 'g', color: '#C1F0D0', icon: 'water' },
            ].map((stat, idx) => (
              <View key={idx} style={[styles.statCard, { borderColor: stat.color }]}>
                <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                <Text style={styles.statLabelText}>{stat.label}</Text>
                <Text style={[styles.statValueText, { color: stat.color }]}>{stat.value} <Text style={styles.unitText}>{stat.unit}</Text></Text>
              </View>
            ))}
          </View>

          {/* --- Phần 3: Chỉnh sửa định lượng --- */}
          <View style={styles.adjustSection}>
            <Text style={styles.sectionTitle}>Tùy chỉnh định lượng (g/ml)</Text>
            {ingredients.map((item) => (
              <View key={item.id} style={styles.ingRow}>
                <View style={styles.ingLeft}>
                  <View style={styles.iconBg}><Text style={{fontSize: 18}}>{item.icon}</Text></View>
                  <Text style={styles.ingName}>{item.name}</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={item.amount}
                    onChangeText={(text) => updateAmount(item.id, text)}
                    placeholder="0"
                    placeholderTextColor="#FFB6C1"
                  />
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

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContainer: { paddingHorizontal: 20 },

  /* --- HEADER CHUẨN ĐỒNG BỘ - SIÊU THOÁNG --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 70, // Tăng lên 70 để né camera notch hoàn toàn
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 45, 
  },
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
  },

  analyzeCard: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  imageCircleContainer: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
  imageCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#FFF', elevation: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFB6C1', shadowColor: '#FFB6C1', shadowOpacity: 0.3, shadowRadius: 10 },
  mainImg: { width: 162, height: 162, borderRadius: 81 },
  floatingIng: { position: 'absolute', backgroundColor: '#FFF', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 18, alignItems: 'center', elevation: 6, minWidth: 80, borderWidth: 1, borderColor: '#FFE5EC', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  floatingText: { fontSize: 10, fontWeight: '800', color: '#5C7A8A' },
  dishTitle: { fontSize: 26, fontWeight: '900', color: '#FF8FAB', marginTop: 15 },
  recipeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#FFB6C1' },
  recipeButtonText: { color: '#FF8FAB', fontSize: 13, fontWeight: '800', marginLeft: 6 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 1.5, marginBottom: 12, alignItems: 'center' },
  statLabelText: { fontSize: 12, color: '#5C7A8A', fontWeight: '700', marginVertical: 4 },
  statValueText: { fontSize: 18, fontWeight: '900' },
  unitText: { fontSize: 12, fontWeight: '600' },
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