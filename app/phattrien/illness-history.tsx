import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ALL_ILLNESS_DATA = [
  { id: '1', name: 'Viêm họng cấp', start: '02/03/2024', end: '05/03/2024', desc: 'Bé bị ho khan, sốt nhẹ về đêm. Đã uống siro ho.', month: '03/2024' },
  { id: '2', name: 'Rối loạn tiêu hóa', start: '10/03/2024', end: '12/03/2024', desc: 'Đi ngoài nhiều lần do tập ăn dặm món tôm.', month: '03/2024' },
  { id: '3', name: 'Sốt mọc răng', start: '15/02/2024', end: '17/02/2024', desc: 'Sốt 38.5 độ, lợi sưng đỏ, bé hay quấy khóc.', month: '02/2024' },
  { id: '4', name: 'Cảm cúm', start: '20/12/2023', end: '25/12/2023', desc: 'Sổ mũi nhiều, hắt hơi. Giữ ấm cổ cho bé.', month: '12/2023' },
];

export default function IllnessHistoryScreen() {
  
  const renderItem = ({ item }: { item: typeof ALL_ILLNESS_DATA[0] }) => (
    <View style={styles.illnessCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="medkit" size={18} color="#FFD166" />
          </View>
          <Text style={styles.illnessName}>{item.name}</Text>
        </View>
        <Text style={styles.monthLabel}>{item.month}</Text>
      </View>

      <View style={styles.timeBox}>
        <View style={styles.timeLine}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.timeText}>Từ: <Text style={styles.timeBold}>{item.start}</Text></Text>
          <Ionicons name="arrow-forward" size={12} color="#CCC" style={{marginHorizontal: 5}} />
          <Text style={styles.timeText}>Đến: <Text style={styles.timeBold}>{item.end}</Text></Text>
        </View>
      </View>

      <View style={styles.descContainer}>
        <Text style={styles.descText} numberOfLines={2}>
          <Text style={styles.descTitle}>Ghi chú: </Text>{item.desc}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.detailLink}
        onPress={() => router.push({ pathname: '/phattrien/health-detail', params: { date: item.month } })}
      >
        <Text style={styles.linkText}>Xem bệnh án chi tiết</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFB6C1" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={ALL_ILLNESS_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Lịch Sử Bị Bệnh</Text>
              <View style={{ width: 45 }} />
            </View>

            {/* Thẻ tổng quan chỉ số */}
            <View style={styles.statsOverview}>
                <View style={styles.statMini}>
                    <Text style={styles.statMiniNum}>{ALL_ILLNESS_DATA.length}</Text>
                    <Text style={styles.statMiniLabel}>Tổng đợt bệnh</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statMini}>
                    <Text style={[styles.statMiniNum, {color: '#98D8AA'}]}>Tốt</Text>
                    <Text style={styles.statMiniLabel}>Sức đề kháng</Text>
                </View>
            </View>

            {/* NÚT THÊM MỚI Ở TRÊN */}
            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={() => router.push('/phattrien/thembenhmoi')}
            >
              <Ionicons name="add-circle" size={24} color="#ffffff" />
              <Text style={styles.addNewButtonText}>Ghi chép đợt bệnh mới</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Danh sách các đợt bệnh</Text>
          </View>
        )}
        ListFooterComponent={() => (
          /* --- PHÂN TRANG TĨNH --- */
          <View style={styles.paginationContainer}>
            <TouchableOpacity style={styles.pageArrow}>
              <Ionicons name="chevron-back" size={20} color="#CCC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.pageNumber, styles.pageActive]}>
              <Text style={styles.pageTextActive}>1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.pageNumber}>
              <Text style={styles.pageText}>2</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.pageNumber}>
              <Text style={styles.pageText}>3</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pageArrow}>
              <Ionicons name="chevron-forward" size={20} color="#FFB6C1" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  listContent: { padding: 20 },
  
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },

  statsOverview: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
    alignItems: 'center'
  },
  statMini: { flex: 1, alignItems: 'center' },
  statMiniNum: { fontSize: 20, fontWeight: '900', color: '#FF8FAB' },
  statMiniLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: '#F0F0F0' },

  // Nút thêm mới ở trên
  addNewButton: {
    backgroundColor: '#FF8FAB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 25,
    gap: 10,
    elevation: 4,
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addNewButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15, marginLeft: 5 },

  illnessCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#FFF0F3'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  nameGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF9EB', justifyContent: 'center', alignItems: 'center' },
  illnessName: { fontSize: 16, fontWeight: '800', color: '#333', flex: 1 },
  monthLabel: { fontSize: 11, color: '#AAA', fontWeight: '700' },

  timeBox: { backgroundColor: '#FDFDFD', padding: 8, borderRadius: 10, marginBottom: 10 },
  timeLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontSize: 12, color: '#777' },
  timeBold: { fontWeight: '700', color: '#5C7A8A' },

  descContainer: { marginBottom: 12 },
  descTitle: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' },
  descText: { fontSize: 13, color: '#666', lineHeight: 18 },

  detailLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10 },
  linkText: { fontSize: 12, fontWeight: '700', color: '#FFB6C1', marginRight: 4 },

  // Phân trang
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 40,
  },
  pageNumber: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  pageActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
  pageText: { fontSize: 14, fontWeight: '700', color: '#5C7A8A' },
  pageTextActive: { color: '#FFF' },
  pageArrow: { padding: 5 },
});