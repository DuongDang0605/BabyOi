import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HealthDetailScreen() {
  // Nhận dữ liệu truyền qua từ trang danh sách (giả lập)
  const { date } = useLocalSearchParams();
  const formattedDate = date && typeof date === 'string' ? date.slice(-7) : '03/2026';
  // Dữ liệu giả lập chi tiết cho tháng được chọn
  const MONTHLY_DETAIL = {
    stats: {
      weight: '5.3',
      height: '58',
      bmi: '15.8',
      status: 'Tăng trưởng tốt',
    },
    illnesses: [
      {
        id: '1',
        name: 'Viêm họng cấp',
        start: '02/03/2024',
        end: '05/03/2024',
        desc: 'Bé bị ho khan, sốt nhẹ về đêm. Đã đi khám và uống siro ho theo đơn bác sĩ.',
        severity: 'Nhẹ'
      },
      {
        id: '2',
        name: 'Rối loạn tiêu hóa',
        start: '10/03/2024',
        end: '12/03/2024',
        desc: 'Đi ngoài nhiều lần, phân lỏng do tập ăn dặm món mới (tôm).',
        severity: 'Bình thường'
      }
    ]
  };

  return (
    <View style={styles.container}>
      {/* --- Tắt Header mặc định --- */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- BAO TOÀN BỘ BẰNG SCROLLVIEW CHUẨN FORM --- */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
      {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          {/* Hiển thị tiêu đề đúng định dạng 03/2026 */}
          <Text style={styles.headerTitle}>{formattedDate}</Text>
          
          <View style={{ width: 45 }} />
        </View>
        
        {/* --- PHẦN 1: CHỈ SỐ CƠ THỂ --- */}
        <View style={styles.sectionHeader}>
          <Ionicons name="body-outline" size={20} color="#FF8FAB" />
          <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Cân nặng</Text>
            <Text style={styles.statValue}>{MONTHLY_DETAIL.stats.weight}<Text style={styles.unit}>kg</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Chiều cao</Text>
            <Text style={styles.statValue}>{MONTHLY_DETAIL.stats.height}<Text style={styles.unit}>cm</Text></Text>
          </View>
          <View style={[styles.statCard, { borderRightWidth: 0 }]}>
            <Text style={styles.statLabel}>BMI</Text>
            <Text style={[styles.statValue, { color: '#A7E4F5' }]}>{MONTHLY_DETAIL.stats.bmi}</Text>
          </View>
        </View>

        {/* --- PHẦN 2: DANH SÁCH BỆNH TRONG THÁNG --- */}
        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <Ionicons name="medkit-outline" size={20} color="#FF8FAB" />
          <Text style={styles.sectionTitle}>Các đợt bệnh</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>{MONTHLY_DETAIL.illnesses.length}</Text>
          </View>
        </View>

        {MONTHLY_DETAIL.illnesses.length > 0 ? (
          MONTHLY_DETAIL.illnesses.map((item) => (
            <View key={item.id} style={styles.illnessCard}>
              <View style={styles.illnessHeader}>
                <Text style={styles.illnessName}>{item.name}</Text>
                <View style={styles.severityTag}>
                  <Text style={styles.severityText}>{item.severity}</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Ionicons name="calendar-outline" size={14} color="#999" />
                  <Text style={styles.timeText}>Bắt đầu: <Text style={styles.timeBold}>{item.start}</Text></Text>
                </View>
                <View style={styles.timeItem}>
                  <Ionicons name="flag-outline" size={14} color="#999" />
                  <Text style={styles.timeText}>Kết thúc: <Text style={styles.timeBold}>{item.end}</Text></Text>
                </View>
              </View>

              <View style={styles.descBox}>
                <Text style={styles.descTitle}>Miêu tả bệnh:</Text>
                <Text style={styles.descText}>{item.desc}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#98D8AA" />
            <Text style={styles.emptyText}>Chúc mừng! Bé không bị bệnh trong tháng này.</Text>
          </View>
        )}

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

  // Section Title
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  badgeCount: { backgroundColor: '#FF8FAB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  // Stats Grid
  statsGrid: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 20,
    elevation: 4,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
  },
  statCard: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  statLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 5 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#333' },
  unit: { fontSize: 12, color: '#999' },

  // Illness Card
  illnessCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#FFD166', // Màu nhấn cho y tế
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },
  illnessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  illnessName: { fontSize: 16, fontWeight: '800', color: '#FF8FAB' },
  severityTag: { backgroundColor: '#FFF0F3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  severityText: { fontSize: 10, color: '#FF8FAB', fontWeight: '800' },
  
  timeRow: { flexDirection: 'column', gap: 6, marginBottom: 12, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 12 },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 13, color: '#666' },
  timeBold: { fontWeight: '700', color: '#5C7A8A' },

  descBox: { marginTop: 5 },
  descTitle: { fontSize: 13, fontWeight: '800', color: '#5C7A8A', marginBottom: 4 },
  descText: { fontSize: 13, color: '#777', lineHeight: 18, fontStyle: 'italic' },

  emptyBox: { alignItems: 'center', marginTop: 20, gap: 10 },
  emptyText: { color: '#999', fontWeight: '600', textAlign: 'center' }
});