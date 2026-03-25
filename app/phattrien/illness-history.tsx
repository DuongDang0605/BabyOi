import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ALL_ILLNESS_DATA = [
  { id: '1', name: 'Viêm họng cấp', start: '02/03/2024', end: '05/03/2024', desc: 'Bé bị ho khan, sốt nhẹ về đêm. Đã uống siro ho.', month: '03/2024' },
  { id: '2', name: 'Rối loạn tiêu hóa', start: '10/03/2024', end: '12/03/2024', desc: 'Đi ngoài nhiều lần do tập ăn dặm món tôm.', month: '03/2024' },
  { id: '3', name: 'Sốt mọc răng', start: '15/02/2024', end: '17/02/2024', desc: 'Sốt 38.5 độ, lợi sưng đỏ, bé hay quấy khóc.', month: '02/2024' },
  { id: '4', name: 'Cảm cúm', start: '20/12/2023', end: '25/12/2023', desc: 'Sổ mũi nhiều, hắt hơi. Giữ ấm cổ cho bé.', month: '12/2023' },
];

export default function IllnessHistoryScreen() {
  // --- STATE CHO POPUP TẠO QR ---
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  
  // Trạng thái mặc định như bạn yêu cầu
  const [filterTime, setFilterTime] = useState('1_week'); // Mặc định: 1 tuần
  const [filterSeverity, setFilterSeverity] = useState('attention'); // Mặc định: Cần chú ý
  const [includeDiet, setIncludeDiet] = useState(false); // Mặc định: Không tích
  
  // Hàm xử lý khi bấm XÁC NHẬN TẠO QR
  const handleGenerateQR = () => {
    setQrModalVisible(false); // Tắt popup
    // Ở đây có thể truyền các param filter sang trang QR nếu cần dữ liệu thật
    // Hiện tại chuyển hướng thẳng sang trang Demo
    router.push('/phattrien/AItrichxuatbenhan');
  };

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
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Lịch Sử Bị Bệnh</Text>
              <View style={{ width: 45 }} />
            </View>

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

            <View style={styles.actionButtonGroup}>
              <TouchableOpacity 
                style={styles.addNewButton}
                onPress={() => router.push('/phattrien/thembenhmoi')}
              >
                <Ionicons name="add-circle" size={24} color="#ffffff" />
                <Text style={styles.addNewButtonText}>Thêm hồ sơ bệnh</Text>
              </TouchableOpacity>

              {/* MỞ POPUP THAY VÌ CHUYỂN TRANG LUÔN */}
              <TouchableOpacity 
                style={styles.qrExportButton}
                onPress={() => setQrModalVisible(true)} 
              >
                <Ionicons name="qr-code-outline" size={22} color="#2196F3" />
                <Text style={styles.qrExportText}>Tạo QR Bệnh án (Cho Bác sĩ)</Text>
                <Ionicons name="sparkles" size={16} color="#2196F3" style={styles.sparkleIcon} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Danh sách các đợt bệnh</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.paginationContainer}>
            <TouchableOpacity style={styles.pageArrow}><Ionicons name="chevron-back" size={20} color="#CCC" /></TouchableOpacity>
            <TouchableOpacity style={[styles.pageNumber, styles.pageActive]}><Text style={styles.pageTextActive}>1</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pageNumber}><Text style={styles.pageText}>2</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pageNumber}><Text style={styles.pageText}>3</Text></TouchableOpacity>
            <TouchableOpacity style={styles.pageArrow}><Ionicons name="chevron-forward" size={20} color="#FFB6C1" /></TouchableOpacity>
          </View>
        )}
      />

      {/* =========================================
          POPUP CẤU HÌNH DỮ LIỆU QR (MỚI)
      ========================================= */}
      <Modal visible={isQrModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Tuỳ chỉnh Dữ liệu QR</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#E0E0E0" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Chọn các thông tin muốn trích xuất cho Bác sĩ xem</Text>

            {/* Bộ lọc 1: Thời gian */}
            <Text style={styles.filterLabel}>1. Quãng thời gian:</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterPill, filterTime === '1_week' && styles.filterPillActive]}
                onPress={() => setFilterTime('1_week')}
              >
                <Text style={[styles.filterPillText, filterTime === '1_week' && styles.filterPillTextActive]}>1 Tuần</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterPill, filterTime === '1_month' && styles.filterPillActive]}
                onPress={() => setFilterTime('1_month')}
              >
                <Text style={[styles.filterPillText, filterTime === '1_month' && styles.filterPillTextActive]}>1 Tháng</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterPill, filterTime === 'all' && styles.filterPillActive]}
                onPress={() => setFilterTime('all')}
              >
                <Text style={[styles.filterPillText, filterTime === 'all' && styles.filterPillTextActive]}>Tất cả</Text>
              </TouchableOpacity>
            </View>

            {/* Bộ lọc 2: Mức độ */}
            <Text style={styles.filterLabel}>2. Mức độ bệnh lý:</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterPill, filterSeverity === 'attention' && styles.filterPillActiveWarning]}
                onPress={() => setFilterSeverity('attention')}
              >
                <Text style={[styles.filterPillText, filterSeverity === 'attention' && styles.filterPillTextActive]}>Chỉ "Cần chú ý"</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterPill, filterSeverity === 'all' && styles.filterPillActiveWarning]}
                onPress={() => setFilterSeverity('all')}
              >
                <Text style={[styles.filterPillText, filterSeverity === 'all' && styles.filterPillTextActive]}>Mọi mức độ</Text>
              </TouchableOpacity>
            </View>

            {/* Bộ lọc 3: Dinh dưỡng (Toggle) */}
            <Text style={styles.filterLabel}>3. Thông tin bổ sung:</Text>
            <TouchableOpacity 
              style={[styles.toggleBox, includeDiet && styles.toggleBoxActive]}
              onPress={() => setIncludeDiet(!includeDiet)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, includeDiet && styles.checkboxActive]}>
                {includeDiet && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.toggleTitle}>Đính kèm Chế độ dinh dưỡng</Text>
                <Text style={styles.toggleSub}>Trích xuất thực đơn 3 ngày gần nhất</Text>
              </View>
            </TouchableOpacity>

            {/* Nút Hành động */}
            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateQR}>
              <Ionicons name="qr-code" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.generateBtnText}>Tạo mã QR ngay</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  listContent: { padding: 20 },
  
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },

  statsOverview: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 20, elevation: 3, shadowColor: '#FFB6C1', shadowOpacity: 0.1, alignItems: 'center' },
  statMini: { flex: 1, alignItems: 'center' },
  statMiniNum: { fontSize: 20, fontWeight: '900', color: '#FF8FAB' },
  statMiniLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: '#F0F0F0' },

  actionButtonGroup: { marginBottom: 25 },
  addNewButton: { backgroundColor: '#FF8FAB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 20, marginBottom: 10, elevation: 4, shadowColor: '#FF8FAB', shadowOpacity: 0.3, shadowRadius: 5 },
  addNewButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', marginLeft: 8 },
  
  qrExportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 20, backgroundColor: '#F0F8FF', borderWidth: 1.5, borderColor: '#2196F3' },
  qrExportText: { color: '#2196F3', fontSize: 15, fontWeight: '800', marginHorizontal: 8 },
  sparkleIcon: { marginTop: -10 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15, marginLeft: 5 },

  illnessCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, borderWidth: 1, borderColor: '#FFF0F3' },
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

  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 40 },
  pageNumber: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  pageActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
  pageText: { fontSize: 14, fontWeight: '700', color: '#5C7A8A' },
  pageTextActive: { color: '#FFF' },
  pageArrow: { padding: 5 },

  /* =========================================
     STYLE CHO POPUP (MODAL) QR
  ========================================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#2196F3' },
  modalSubtitle: { fontSize: 13, color: '#8899AA', fontWeight: '600', marginBottom: 20 },
  
  filterLabel: { fontSize: 15, fontWeight: '800', color: '#333', marginBottom: 10, marginTop: 10 },
  filterRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  
  filterPill: { backgroundColor: '#F0F4F8', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  filterPillActive: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
  filterPillActiveWarning: { backgroundColor: '#FFF3E0', borderColor: '#FF9800' },
  
  filterPillText: { fontSize: 13, fontWeight: '700', color: '#8899AA' },
  filterPillTextActive: { color: '#2196F3' },

  toggleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E0E0E0', marginTop: 5 },
  toggleBoxActive: { backgroundColor: '#E8F9ED', borderColor: '#4CAF50' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  toggleTitle: { fontSize: 14, fontWeight: '800', color: '#333' },
  toggleSub: { fontSize: 12, color: '#8899AA', marginTop: 2 },

  generateBtn: { flexDirection: 'row', backgroundColor: '#2196F3', paddingVertical: 16, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 25, elevation: 3 },
  generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});