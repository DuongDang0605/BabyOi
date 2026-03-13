import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const WEEK_PLAN = [
  { day: 'Thứ 2', breakfast: 'Sinh tố Chuối Yến mạch', lunch: 'Salad Ức Gà Áp Chảo', dinner: 'Canh Rong Biển Đậu Hũ' },
  { day: 'Thứ 3', breakfast: 'Bơ Nghiền Trứng Chần', lunch: 'Mì Ý Sốt Bò Bằm', dinner: 'Cá Tuyết Hấp Gừng' },
  { day: 'Thứ 4', breakfast: 'Súp Bí Đỏ Kem Tươi', lunch: 'Thịt Viên Sốt Cà Chua', dinner: 'Tôm Rim Tỏi Đen' },
  { day: 'Thứ 5', breakfast: 'Cháo Cá Hồi Măng Tây', lunch: 'Salad Ức Gà Áp Chảo', dinner: 'Canh Rong Biển Đậu Hũ' },
  { day: 'Thứ 6', breakfast: 'Sinh tố Chuối Yến mạch', lunch: 'Tôm Rim Tỏi Đen', dinner: 'Cá Tuyết Hấp Gừng' },
  { day: 'Thứ 7', breakfast: 'Bơ Nghiền Trứng Chần', lunch: 'Mì Ý Sốt Bò Bằm', dinner: 'Thịt Viên Sốt Cà Chua' },
  { day: 'Chủ Nhật', breakfast: 'Súp Bí Đỏ Kem Tươi', lunch: 'Cháo Cá Hồi Măng Tây', dinner: 'Salad Ức Gà' },
];

export default function MealPlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerTitle: "Lịch Trình 7 Ngày",
        headerStyle: { backgroundColor: '#FFB6C1' },
        headerTintColor: '#FFF',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={30} color="#FF8FAB" />
          <Text style={styles.aiTitle}>Thực đơn AI đề xuất</Text>
          <Text style={styles.aiSub}>Dựa trên sở thích và dinh dưỡng của bạn</Text>
        </View>

        {WEEK_PLAN.map((item, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayText}>{item.day}</Text>
            </View>
            <View style={styles.mealRow}>
              <Ionicons name="sunny-outline" size={18} color="#FFB800" />
              <Text style={styles.mealText}><Text style={styles.bold}>Sáng:</Text> {item.breakfast}</Text>
            </View>
            <View style={styles.mealRow}>
              <Ionicons name="fast-food-outline" size={18} color="#FF8FAB" />
              <Text style={styles.mealText}><Text style={styles.bold}>Trưa:</Text> {item.lunch}</Text>
            </View>
            <View style={styles.mealRow}>
              <Ionicons name="moon-outline" size={18} color="#5C7A8A" />
              <Text style={styles.mealText}><Text style={styles.bold}>Tối:</Text> {item.dinner}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContent: { padding: 20 },
  aiHeader: { alignItems: 'center', marginBottom: 25 },
  aiTitle: { fontSize: 22, fontWeight: '900', color: '#FF8FAB', marginTop: 10 },
  aiSub: { fontSize: 14, color: '#5C7A8A', fontWeight: '500' },
  dayCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#FFB6C1', shadowOpacity: 0.1 },
  dayHeader: { borderBottomWidth: 1, borderBottomColor: '#FFE5EC', marginBottom: 10, paddingBottom: 5 },
  dayText: { fontSize: 18, fontWeight: '900', color: '#FF8FAB' },
  mealRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  mealText: { marginLeft: 10, fontSize: 14, color: '#5C7A8A' },
  bold: { fontWeight: '800', color: '#FF8FAB' }
});