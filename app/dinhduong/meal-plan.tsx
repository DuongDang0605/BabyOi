import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch Trình 7 Ngày</Text>
          <View style={{ width: 45 }} />
        </View>

        {/* --- NỘI DUNG AI ĐỀ XUẤT --- */}
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={30} color="#FF8FAB" />
          <Text style={styles.aiTitle}>Thực đơn AI đề xuất</Text>
          <Text style={styles.aiSub}>Chạm vào món ăn để xem công thức mẹ nhé!</Text>
        </View>

        {WEEK_PLAN.map((item, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayText}>{item.day}</Text>
            </View>
            
            {/* BỮA SÁNG */}
            <TouchableOpacity 
              style={styles.mealRow} 
              onPress={() => router.push({ pathname: '/dinhduong/recipe-detail', params: { name: item.breakfast } })}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFF9EB' }]}>
                <Ionicons name="sunny-outline" size={18} color="#FFB800" />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealText}><Text style={styles.bold}>Sáng:</Text> {item.breakfast}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#FFE5EC" />
            </TouchableOpacity>
            
            {/* BỮA TRƯA */}
            <TouchableOpacity 
              style={styles.mealRow} 
              onPress={() => router.push({ pathname: '/dinhduong/recipe-detail', params: { name: item.lunch } })}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFF0F3' }]}>
                <Ionicons name="fast-food-outline" size={18} color="#FF8FAB" />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealText}><Text style={styles.bold}>Trưa:</Text> {item.lunch}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#FFE5EC" />
            </TouchableOpacity>
            
            {/* BỮA TỐI */}
            <TouchableOpacity 
              style={styles.mealRow} 
              onPress={() => router.push({ pathname: '/dinhduong/recipe-detail', params: { name: item.dinner } })}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F0F4F8' }]}>
                <Ionicons name="moon-outline" size={18} color="#5C7A8A" />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealText}><Text style={styles.bold}>Tối:</Text> {item.dinner}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#FFE5EC" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContent: { paddingHorizontal: 20 },

  /* --- HEADER CHUẨN (Né camera notch) --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 70, 
    marginBottom: 25,
    paddingTop: 5,
  },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },

  aiHeader: { alignItems: 'center', marginBottom: 30 },
  aiTitle: { fontSize: 22, fontWeight: '900', color: '#FF8FAB', marginTop: 10 },
  aiSub: { fontSize: 13, color: '#5C7A8A', fontWeight: '700', marginTop: 4 },

  dayCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 18, 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#FFB6C1', 
    shadowOpacity: 0.15,
    borderWidth: 1,
    borderColor: '#f0f4f8'
  },
  dayHeader: { borderBottomWidth: 1.5, borderBottomColor: '#FDF0F3', marginBottom: 10, paddingBottom: 8 },
  dayText: { fontSize: 18, fontWeight: '900', color: '#FF8FAB' },
  
  /* --- MEAL ROW TƯƠNG TÁC --- */
  mealRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 5, 
    paddingVertical: 8,
    borderRadius: 12,
  },
  mealInfo: { flex: 1 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealText: { fontSize: 14, color: '#5C7A8A', fontWeight: '600' },
  bold: { fontWeight: '900', color: '#FF8FAB' }
});