import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// DỮ LIỆU LOGIC: 4 Mũi tiêm sớm nhất của bé từ sơ sinh đến 2 tháng tuổi
const FINISHED_VACCINES = [
  {
    id: 'v1',
    name: 'Rota virus (Rotarix) - Liều 1',
    type: 'Đã uống',
    desc: 'Phòng tiêu chảy cấp do Rota virus. Dùng mốc 2 tháng tuổi.',
    location: 'VNVC Sơn Tây',
    price: '825.000đ',
    note: 'Thuốc ngọt, bé Ốc rất hợp tác, không trớ.',
    date: '15/09/2025',
    color: '#a3d9b1', // Xanh lá pastel
  },
  {
    id: 'v2',
    name: '6-trong-1 (Infanrix Hexa) - Mũi 1',
    type: 'Đã tiêm',
    desc: 'Phòng Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Hib. Tiêm mốc 2 tháng tuổi.',
    location: 'VNVC Sơn Tây',
    price: '1.045.000đ',
    note: 'Tối về bé hơi hâm hấp ấm đầu, chườm ấm là khỏi.',
    date: '15/09/2025',
    color: '#a3d9b1',
  },
  {
    id: 'v3',
    name: 'Viêm gan B - Mũi 1',
    type: 'Đã tiêm',
    desc: 'Phòng bệnh Viêm gan B lây từ mẹ sang con. Tiêm trong 24h đầu sau sinh.',
    location: 'Bệnh viện Đa khoa Sơn Tây',
    price: 'Miễn phí (TCMR)',
    note: 'Tiêm xong bé ngủ ngoan, không quấy khóc.',
    date: '16/07/2025',
    color: '#a3d9b1',
  },
  {
    id: 'v4',
    name: 'Lao (BCG)',
    type: 'Đã tiêm',
    desc: 'Phòng bệnh Lao. Tiêm càng sớm càng tốt sau khi sinh.',
    location: 'Bệnh viện Đa khoa Sơn Tây',
    price: 'Miễn phí (TCMR)',
    note: 'Vết tiêm có làm mủ nhẹ và để lại sẹo nhỏ ở vai trái.',
    date: '16/07/2025',
    color: '#a3d9b1',
  },
];

export default function FinishedVaccinesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đã Hoàn Thành</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* Lời khen ngợi động viên */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>Bé Ốc đã rất dũng cảm hoàn thành</Text>
          <Text style={styles.heroNumber}>4 mũi tiêm</Text>
          <Text style={styles.heroSubtext}>Ba mẹ thật tuyệt vời vì đã ghi chép đầy đủ! 💖</Text>
        </View>

        {/* --- DANH SÁCH CHI TIẾT --- */}
        {FINISHED_VACCINES.map((vaccine) => (
          <View key={vaccine.id} style={styles.vaccineCard}>
            
            {/* Tên và Trạng thái */}
            <View style={styles.cardHeader}>
              <Text style={styles.vaccineName}>{vaccine.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{vaccine.type}</Text>
              </View>
            </View>
            
            <Text style={styles.vaccineDesc}>{vaccine.desc}</Text>

            {/* Khung Chi tiết: Nơi tiêm, Giá, Ghi chú */}
            <View style={styles.detailBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📍 Nơi tiêm:</Text>
                <Text style={styles.detailValue}>{vaccine.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>💰 Chi phí:</Text>
                <Text style={styles.detailValue}>{vaccine.price}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
                <Text style={styles.detailValue}>{vaccine.note}</Text>
              </View>
            </View>

            {/* Ngày hoàn thành */}
            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>✅</Text>
              <Text style={styles.dateText}>Hoàn thành ngày: {vaccine.date}</Text>
            </View>

          </View>
        ))}

        <View style={{ height: 40 }} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  /* --- STYLES HEADER ĐỒNG BỘ --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 20,
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
  headerSticker: {
    width: 45,
    height: 45,
  },
  /* --- HERO SECTION LỜI KHEN --- */
  heroSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 15,
  },
  heroText: {
    fontSize: 15,
    color: '#5c7a8a',
    fontWeight: '600',
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#a3d9b1', // Màu xanh lá biểu thị hoàn thành
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 14,
    color: '#ff8fab',
    fontWeight: 'bold',
  },
  /* --- VACCINE CARD ĐÃ HOÀN THÀNH --- */
  vaccineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#eafaf1', // Viền thẻ màu xanh lá nhạt
    shadowColor: '#a3d9b1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#334455',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: '#eafaf1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
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
  /* --- KHUNG CHI TIẾT DỮ LIỆU --- */
  detailBox: {
    backgroundColor: '#f8fdfa', // Xanh mint rất nhạt
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eafaf1',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#7a8c99',
    width: 75,
    fontWeight: '700',
  },
  detailValue: {
    fontSize: 13,
    color: '#334455',
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
  },
  /* --- NGÀY HOÀN THÀNH --- */
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9f3',
    padding: 12,
    borderRadius: 12,
  },
  dateIcon: {
    marginRight: 8,
    fontSize: 15,
  },
  dateText: {
    fontSize: 14,
    color: '#5c7a8a',
    fontWeight: '800', // Chữ ngày tháng in đậm
  },
});