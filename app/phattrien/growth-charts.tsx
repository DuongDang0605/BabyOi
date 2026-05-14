import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GrowthLineChart } from '../../components/phattrien/GrowthLineChart';
import { GrowthSummary } from '../../components/phattrien/GrowthSummary';

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
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sức khỏe</Text>
          <View style={{ width: 45 }} />
        </View>

        {/* --- PHẦN 1: THẺ CHỈ SỐ NHANH --- */}
        <GrowthSummary
            weight={latest.weight}
            height={latest.height}
            bmi={latest.bmi}
        />

        {/* --- PHẦN 2: BIỂU ĐỒ --- */}
        <GrowthLineChart
            data={GROWTH_DATA}
            title="Lịch sử phát triển"
        />

        {/* --- PHẦN 3: AI ADVICE --- */}
        <View style={styles.aiBox}>
          <Ionicons name="sparkles" size={24} color="#FF8FAB" />
          <Text style={styles.aiText}>Bé đang phát triển rất tốt. Mẹ hãy xem lịch sinh hoạt để duy trì đà này nhé!</Text>
        </View>

        {/* --- PHẦN 4: CỤM NÚT ĐIỀU HƯỚNG --- */}
        <View style={styles.buttonGroup}>
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
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
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
