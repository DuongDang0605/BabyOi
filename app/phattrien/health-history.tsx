import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const HEALTH_HISTORY_DATA = [
  { id: '1', date: '14/03/2024', weight: '5.3', height: '58', bmi: '15.8', sickCount: '2', status: 'Tăng trưởng tốt' },
  { id: '2', date: '14/02/2024', weight: '5.0', height: '56.5', bmi: '15.6', sickCount: '1', status: 'Bình thường' },
  { id: '3', date: '14/01/2024', weight: '4.6', height: '55', bmi: '15.2', sickCount: '0', status: 'Bình thường' },
  { id: '4', date: '14/12/2023', weight: '4.2', height: '53.5', bmi: '14.7', sickCount: '2', status: 'Cần chú ý' },
  { id: '5', date: '14/11/2023', weight: '3.9', height: '52', bmi: '14.4', sickCount: '0', status: 'Bình thường' },
];

export default function HealthHistoryScreen() {
  
  const renderItem = ({ item }: { item: typeof HEALTH_HISTORY_DATA[0] }) => (
    <View style={styles.historyCard}>
      {/* Header: Ngày & Trạng thái */}
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={14} color="#FF8FAB" />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Tăng trưởng tốt' ? '#E8F5E9' : '#FFF0F3' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Tăng trưởng tốt' ? '#4CAF50' : '#FF8FAB' }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Thông số: Cân nặng - Chiều cao - BMI */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cân nặng</Text>
          <Text style={styles.statValue}>{item.weight}<Text style={styles.unit}>kg</Text></Text>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Chiều cao</Text>
          <Text style={styles.statValue}>{item.height}<Text style={styles.unit}>cm</Text></Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>BMI</Text>
          <Text style={[styles.statValue, { color: '#A7E4F5' }]}>{item.bmi}</Text>
        </View>
      </View>

      {/* Thông tin số lần bệnh - Chỉ hiển thị text gọn gàng */}
      <View style={styles.sickInfoBox}>
        <Ionicons name="medkit" size={16} color={item.sickCount === '0' ? '#98D8AA' : '#FFD166'} />
        <Text style={styles.sickText}>
            Số lần bị bệnh trong kỳ đo này: <Text style={styles.sickBold}>{item.sickCount} lần</Text>
        </Text>
      </View>

      {/* Nút Xem chi tiết */}
      <TouchableOpacity style={styles.detailBtn} activeOpacity={0.6}
      onPress={() => router.push({ pathname: '/phattrien/health-detail', params: { date: item.date } })}>
        <Text style={styles.detailBtnText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFB6C1" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerTitle: "Lịch Sử Sức Khỏe",
        headerStyle: { backgroundColor: '#FFB6C1' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        ),
      }} />

      <FlatList
        data={HEALTH_HISTORY_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.headerTitle}>Nhật ký phát triển</Text>
            <Text style={styles.headerSub}>Tổng hợp sức khỏe bé qua các lần cập nhật</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  listContent: { padding: 20 },
  listHeader: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#5C7A8A' },
  headerSub: { fontSize: 13, color: '#999', fontWeight: '600', marginTop: 4 },

  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 10
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 14, fontWeight: '800', color: '#5C7A8A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 10 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#333' },
  unit: { fontSize: 12, color: '#999', fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#EEE' },

  sickInfoBox: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sickText: { fontSize: 12, color: '#666', fontWeight: '600' },
  sickBold: { color: '#5C7A8A', fontWeight: '800' },

  detailBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  detailBtnText: { fontSize: 13, fontWeight: '700', color: '#FFB6C1', marginRight: 5 }
});