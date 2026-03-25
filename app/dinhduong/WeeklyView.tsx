import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function WeeklyViewScreen() {
  const { target } = useLocalSearchParams();

  const renderMeal = (time: string, dish: string, calo: number) => (
    <View style={styles.mealItem}>
      <View style={styles.mealDot} />
      <Text style={styles.mealTime}>{time}:</Text>
      <Text style={styles.mealDish}>{dish}</Text>
      <Text style={styles.mealCalo}>{calo} kcal</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#FF8FAB" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Thực Đơn Tuần Của {target}</Text>
        <TouchableOpacity><Ionicons name="download-outline" size={24} color="#FF8FAB" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {DAYS.map((day, i) => (
          <View key={i} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day}</Text>
              <View style={styles.totalBadge}>
                <Text style={styles.totalText}>Tổng: {target === 'Bé' ? '1,450' : '2,100'} kcal</Text>
              </View>
            </View>
            <View style={styles.mealList}>
              {renderMeal('Sáng', target === 'Bé' ? 'Cháo cá hồi' : 'Phở bò organic', target === 'Bé' ? 350 : 550)}
              {renderMeal('Trưa', target === 'Bé' ? 'Súp bí đỏ' : 'Salad ức gà áp chảo', target === 'Bé' ? 550 : 850)}
              {renderMeal('Tối', target === 'Bé' ? 'Sữa hạt + Trái cây' : 'Cá hồi nướng', target === 'Bé' ? 550 : 700)}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  dayCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, marginBottom: 15, elevation: 2 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10, marginBottom: 15 },
  dayTitle: { fontSize: 17, fontWeight: '900', color: '#FF8FAB' },
  totalBadge: { backgroundColor: '#FFF0F3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  totalText: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' },
  mealList: { gap: 12 },
  mealItem: { flexDirection: 'row', alignItems: 'center' },
  mealDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFB6C1', marginRight: 10 },
  mealTime: { width: 50, fontWeight: '800', color: '#5C7A8A', fontSize: 13 },
  mealDish: { flex: 1, color: '#78909C', fontSize: 13, fontWeight: '600' },
  mealCalo: { fontSize: 12, color: '#FFB6C1', fontWeight: '700' }
});