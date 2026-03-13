import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
export default function VaccineScheduleScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sổ tiêm chủng', headerBackTitle: 'Trang chủ' }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Thẻ Tổng quan */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>12</Text>
            <Text style={styles.summaryLabel}>Đã tiêm</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryNumber, { color: '#e67e22' }]}>1</Text>
            <Text style={styles.summaryLabel}>Sắp tới</Text>
          </View>
        </View>

        {/* --- DANH SÁCH LỊCH TIÊM --- */}

       {/* Khối: Sắp tới (Màu cam) */}
        <Text style={styles.sectionTitle}>Sắp tới (9 Tháng tuổi)</Text>
        
        <View style={[styles.vaccineCard, styles.upcomingCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.vaccineName}>Sởi đơn (MVVAC)</Text>
            <View style={styles.statusBadge_Upcoming}>
              <Text style={styles.statusText_Upcoming}>Chờ tiêm</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>Phòng bệnh Sởi. Tiêm mũi 1 lúc 9 tháng tuổi.</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>Dự kiến: 15/04/2026</Text>
          </View>

         {/* NÚT ĐẶT LỊCH TIÊM */}
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => router.push('/lichtiem/datlichtiem')} // <--- Thêm lệnh chuyển trang này
          >
            <Text style={styles.bookButtonText}>💉 Đặt lịch tiêm ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Khối: Đã hoàn thành (Màu xanh lá) */}
        <Text style={styles.sectionTitle}>Đã hoàn thành</Text>

        {/* Mũi tiêm 1 */}
        <View style={styles.vaccineCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.vaccineName}>Cúm mùa (Vaxigrip)</Text>
            <View style={styles.statusBadge_Done}>
              <Text style={styles.statusText_Done}>Đã tiêm</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>Mũi 2 (Cách mũi 1 ít nhất 1 tháng).</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>✅</Text>
            <Text style={styles.dateText}>Đã tiêm ngày: 10/02/2026</Text>
          </View>
        </View>

        {/* Mũi tiêm 2 */}
        <View style={styles.vaccineCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.vaccineName}>6 trong 1 (Infanrix Hexa)</Text>
            <View style={styles.statusBadge_Done}>
              <Text style={styles.statusText_Done}>Đã tiêm</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>Mũi 3. Phòng Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Hib.</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateIcon}>✅</Text>
            <Text style={styles.dateText}>Đã tiêm ngày: 15/12/2025</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Nút Thêm lịch tiêm thủ công */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Thêm mũi tiêm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eeeeee',
    marginHorizontal: 15,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50', // Màu xanh lá cho số đã tiêm
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    marginLeft: 5,
  },
  vaccineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50', // Viền xanh lá mặc định cho mũi đã tiêm
  },
  upcomingCard: {
    borderLeftColor: '#e67e22', // Đổi viền cam cho mũi sắp tới
    backgroundColor: '#fffdf9', // Nền hơi ám vàng để nổi bật
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge_Upcoming: {
    backgroundColor: '#fdebd0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText_Upcoming: {
    color: '#d35400',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge_Done: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText_Done: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vaccineDesc: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  dateIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#444444',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#a7e4f5',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#005b7f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#ff9c6e', // Màu cam nổi bật (cùng màu với nút AI) để kích thích bấm
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bookButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});