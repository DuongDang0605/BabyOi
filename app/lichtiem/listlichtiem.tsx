import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VaccineScheduleScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sổ Tiêm Chủng</Text>
        </View>

        {/* --- THẺ TỔNG QUAN --- */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>4</Text>
            <Text style={styles.summaryLabel}>Đã tiêm</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryNumber, { color: '#ff9c6e' }]}>4</Text>
            <Text style={styles.summaryLabel}>Sắp tới</Text>
          </View>
        </View>


        {/* ==================== KHỐI: SẮP TỚI ==================== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⏳ Sắp tới</Text>
          <TouchableOpacity onPress={() => router.push('/lichtiem/danhsachchuatiem')}>
            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
          </TouchableOpacity>
        </View>
        
       <View style={[styles.vaccineCard, styles.upcomingCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.vaccineName}>Viêm não Nhật Bản (Imojev)</Text>
            <View style={styles.statusBadge_Upcoming}>
              <Text style={styles.statusText_Upcoming}>Sắp tới</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>Mũi 1. Phòng bệnh Viêm não Nhật Bản. Chỉ định tiêm mốc 9 tháng tuổi.</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>Dự kiến: 15/04/2026 (Tháng tới)</Text>
          </View>

          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => router.push('/lichtiem/datlichtiem')} 
          >
            <Text style={styles.bookButtonText}>💉 Đặt lịch tiêm ngay</Text>
          </TouchableOpacity>
        </View>


        {/* ==================== KHỐI: ĐÃ HOÀN THÀNH ==================== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✅ Đã hoàn thành</Text>
          <TouchableOpacity onPress={() => router.push('/lichtiem/danhsachdatiem')}>
            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Mũi đã hoàn thành 1 CÓ CHI TIẾT */}
        <View style={styles.vaccineCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.vaccineName}>Phế cầu (Synflorix)</Text>
            <View style={styles.statusBadge_Done}>
              <Text style={styles.statusText_Done}>Đã tiêm</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>Mũi 2. Phòng các bệnh do phế cầu khuẩn (Viêm phổi, viêm màng não).</Text>

          {/* KHUNG CHI TIẾT DỮ LIỆU ĐÃ TIÊM */}
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Nơi tiêm:</Text>
              <Text style={styles.detailValue}>VNVC Sơn Tây</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💰 Chi phí:</Text>
              <Text style={styles.detailValue}>1.045.000đ</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
              <Text style={styles.detailValue}>Bé trộm vía ngoan, tối về chỉ hơi ấm đầu không quấy khóc.</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>💖</Text>
            <Text style={styles.dateText}>Đã tiêm ngày: 10/02/2026</Text>
          </View>
        </View>

        {/* Mũi đã hoàn thành 2 CÓ CHI TIẾT */}
        <View style={styles.vaccineCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.vaccineName}>Rota virus (Rotarix)</Text>
            <View style={styles.statusBadge_Done}>
              <Text style={styles.statusText_Done}>Đã uống</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>Liều 2. Phòng tiêu chảy cấp do Rota virus.</Text>

          {/* KHUNG CHI TIẾT DỮ LIỆU ĐÃ TIÊM */}
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Nơi tiêm:</Text>
              <Text style={styles.detailValue}>Trạm Y tế Phường</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💰 Chi phí:</Text>
              <Text style={styles.detailValue}>Miễn phí (TCMR)</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
              <Text style={styles.detailValue}>Thuốc ngọt bé rất thích uống.</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>💖</Text>
            <Text style={styles.dateText}>Đã uống ngày: 15/12/2025</Text>
          </View>
        </View>

        <View style={{ height: 120 }} /> 
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/lichtiem/themmuitiem')}
        >
          <Text style={styles.addButtonText}>✨ + Thêm mũi tiêm mới</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollArea: {
    padding: 20,
  },
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
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
    zIndex: -1,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 25, 
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 2,
    backgroundColor: '#fef0f4',
    marginHorizontal: 15,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#a3d9b1', 
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5c7a8a',
  },
  /* --- MỚI: HEADER CỦA TỪNG KHỐI --- */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5c7a8a',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff8fab',
  },
  /* ------------------------------- */
  vaccineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  upcomingCard: {
    borderColor: '#ffe08a', 
    backgroundColor: '#fffcf5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    flex: 1,
  },
  statusBadge_Upcoming: {
    backgroundColor: '#fff0cb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText_Upcoming: {
    color: '#d46b08',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge_Done: {
    backgroundColor: '#eafaf1', 
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText_Done: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vaccineDesc: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 22,
  },
  /* --- MỚI: KHUNG CHI TIẾT MŨI ĐÃ TIÊM --- */
  detailBox: {
    backgroundColor: '#f8fdfa', // Xanh mint nhạt dịu mắt
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eafaf1',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#7a8c99',
    width: 75,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#334455',
    flex: 1,
    fontWeight: '700',
  },
  /* --------------------------------------- */
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9f3',
    padding: 12,
    borderRadius: 12,
  },
  dateIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#5c7a8a',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#ff9c6e', 
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#ff9c6e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  bookButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35, 
    backgroundColor: 'rgba(254, 249, 243, 0.95)', 
  },
  addButton: {
    backgroundColor: '#ff8fab', 
    paddingVertical: 16,
    borderRadius: 30, 
    alignItems: 'center',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});