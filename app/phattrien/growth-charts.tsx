import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get('window');

// DỮ LIỆU GIẢ LẬP
const GROWTH_DATA = {
  labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"],
  datasets: [
    { data: [3.2, 3.5, 3.9, 4.2, 4.6, 5.0, 5.3], color: (opacity = 1) => `#FF8FAB`, strokeWidth: 3 },
    { data: [50, 51, 52, 53.5, 55, 56.5, 58], color: (opacity = 1) => `#FFD166`, strokeWidth: 3 },
    { data: [12.8, 13.5, 14.4, 14.7, 15.2, 15.6, 15.8], color: (opacity = 1) => `#C1F0D0`, strokeWidth: 3 },
  ],
};

export default function GrowthChartsScreen() {
  const latest = { weight: 5.3, height: 58, bmi: 15.8 };

  return (
    <View style={styles.container}>
      {/* Tắt Header mặc định của Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER CHUẨN ĐỒNG BỘ NẰM TRONG SCROLLVIEW --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Sức khỏe</Text>
          
          {/* Cục tạ 45px cân bằng với nút Back để chữ vào giữa */}
          <View style={{ width: 45 }} />
        </View>

        {/* --- PHẦN 1: THẺ CHỈ SỐ NHANH --- */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: '#FF8FAB' }]}>
            <Ionicons name="speedometer-outline" size={18} color="#FFF" />
            <Text style={styles.cardValue}>{latest.weight}<Text style={styles.cardUnit}>kg</Text></Text>
            <Text style={styles.cardLabel}>Cân nặng</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FFD166' }]}>
            <Ionicons name="resize-outline" size={18} color="#FFF" />
            <Text style={styles.cardValue}>{latest.height}<Text style={styles.cardUnit}>cm</Text></Text>
            <Text style={styles.cardLabel}>Chiều cao</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#A7E4F5' }]}>
            <Ionicons name="bar-chart-outline" size={18} color="#FFF" />
            <Text style={styles.cardValue}>{latest.bmi}</Text>
            <Text style={styles.cardLabel}>Chỉ số BMI</Text>
          </View>
        </View>

        {/* --- PHẦN 2: BIỂU ĐỒ --- */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Lịch sử phát triển</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#FF8FAB' }]} /><Text style={styles.legendText}>Cân nặng</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#FFD166' }]} /><Text style={styles.legendText}>Chiều cao</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#C1F0D0' }]} /><Text style={styles.legendText}>BMI</Text></View>
          </View>
          <LineChart
            data={GROWTH_DATA}
            width={width - 50}
            height={200}
            chartConfig={{
              backgroundColor: "#FFF",
              backgroundGradientFrom: "#FFF",
              backgroundGradientTo: "#FFF",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
              labelColor: (opacity = 1) => `#5C7A8A`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#FFF" },
              propsForBackgroundLines: { stroke: "#F0F0F0" }
            }}
            bezier
            withVerticalLines={false}
            style={styles.chartStyle}
          />
        </View>

        {/* --- PHẦN 3: AI ADVICE --- */}
        <View style={styles.aiBox}>
          <Ionicons name="sparkles" size={24} color="#FF8FAB" />
          <Text style={styles.aiText}>Bé đang phát triển rất tốt. Mẹ hãy xem lịch sinh hoạt để duy trì đà này nhé!</Text>
        </View>

        {/* --- PHẦN 4: CỤM NÚT ĐIỀU HƯỚNG --- */}
        <View style={styles.buttonGroup}>
          
          {/* 1. Nút Cập nhật chỉ số */}
          <TouchableOpacity 
            style={styles.longButton} 
            onPress={() => router.push('/phattrien/update-index')} 
          >
            <View style={[styles.btnIconCircle, { backgroundColor: '#FF8FAB' }]}>
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text style={styles.longButtonText}>Cập nhật lại chỉ số</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFB6C1" />
          </TouchableOpacity>

          {/* 2. Nút Lịch sinh hoạt */}
          <TouchableOpacity 
            style={[styles.longButton, { borderColor: '#E8F5E9' }]} 
            onPress={() => router.push('/phattrien/daily-schedule')}
          >
            <View style={[styles.btnIconCircle, { backgroundColor: '#98D8AA' }]}>
              <Ionicons name="calendar-outline" size={22} color="white" />
            </View>
            <Text style={[styles.longButtonText, { color: '#5C7A8A' }]}>Lịch sinh hoạt của bé</Text>
            <Ionicons name="chevron-forward" size={20} color="#98D8AA" />
          </TouchableOpacity>

          {/* 3. Cặp nút Lịch sử */}
          <View style={styles.rowButtons}>
            <TouchableOpacity 
              style={styles.halfButton}
              onPress={() => router.push('/phattrien/health-history')}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: '#A7E4F5', marginBottom: 8 }]}>
                <Ionicons name="heart-outline" size={20} color="white" />
              </View>
              <Text style={styles.halfButtonText}>Lịch sử sức khỏe</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.halfButton}
              onPress={() => router.push('/phattrien/illness-history')}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: '#FFD166', marginBottom: 8 }]}>
                <Ionicons name="medkit-outline" size={20} color="white" />
              </View>
              <Text style={styles.halfButtonText}>Lịch sử bị bệnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContent: { padding: 20 },

  /* --- STYLES HEADER CHUẨN ĐỒNG BỘ --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
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

  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { width: (width - 60) / 3, padding: 12, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
  cardValue: { fontSize: 16, fontWeight: '900', color: '#FFF', marginTop: 8 },
  cardUnit: { fontSize: 10, fontWeight: '600' },
  cardLabel: { fontSize: 10, color: '#FFF', fontWeight: '700', marginTop: 4 },
  
  chartSection: { backgroundColor: '#FFF', borderRadius: 25, padding: 15, elevation: 5, shadowColor: '#FFB6C1', shadowOpacity: 0.2 },
  chartTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 10 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 11, fontWeight: '700', color: '#5C7A8A' },
  chartStyle: { borderRadius: 16, marginLeft: -15 },
  
  aiBox: { flexDirection: 'row', backgroundColor: '#FFF0F3', padding: 15, borderRadius: 20, marginTop: 20, alignItems: 'center' },
  aiText: { flex: 1, marginLeft: 10, color: '#FF8FAB', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  
  buttonGroup: { marginTop: 20, gap: 12 },
  longButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 20, borderWidth: 1.5, borderColor: '#FFE5EC', elevation: 3 },
  longButtonText: { flex: 1, fontSize: 15, fontWeight: '800', color: '#FF8FAB', marginLeft: 12 },
  rowButtons: { flexDirection: 'row', gap: 12 },
  halfButton: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 25, alignItems: 'center', borderWidth: 1.5, borderColor: '#F0F0F0', elevation: 2 },
  halfButtonText: { fontSize: 12, fontWeight: '800', color: '#5C7A8A', textAlign: 'center' },
  btnIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});