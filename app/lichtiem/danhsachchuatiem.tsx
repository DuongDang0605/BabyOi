import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// DỮ LIỆU LOGIC: Các mũi tiêm mốc 9 tháng tuổi cho bé Ốc
const UPCOMING_VACCINES = [
  {
    id: 'u1',
    name: 'Viêm não Nhật Bản (Imojev)',
    desc: 'Mũi 1. Phòng bệnh Viêm não Nhật Bản do muỗi truyền. Chỉ định tiêm mốc 9 tháng tuổi.',
    date: '15/04/2026',
    status: 'Sắp tới',
  },
  {
    id: 'u2',
    name: 'Thủy đậu (Varilrix)',
    desc: 'Mũi 1. Phòng bệnh Thủy đậu. Vắc-xin Varilrix có thể tiêm sớm ngay từ lúc 9 tháng tuổi.',
    date: '15/04/2026',
    status: 'Sắp tới',
  },
  {
    id: 'u3',
    name: 'Não mô cầu ACYW (Menactra)',
    desc: 'Mũi 1. Phòng Viêm màng não mủ do não mô cầu khuẩn 4 tuýp A, C, Y, W-135.',
    date: '25/04/2026',
    status: 'Chờ tiêm',
  }
];

export default function UpcomingVaccinesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- BAO TOÀN BỘ BẰNG SCROLLVIEW NHƯ FORM CHUẨN --- */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Lịch Sắp Tới</Text>
          
          {/* Cục tạ Sticker cân bằng với nút Back */}
          <View style={styles.rightPlaceholder}>
          </View>
        </View>

        {/* Lời nhắc nhở dễ thương */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>Tháng tới bé Ốc tròn 9 tháng tuổi rồi! 🎉</Text>
          <Text style={styles.heroSubtext}>Mẹ nhớ đặt lịch để bảo vệ sức khỏe cho con nhé.</Text>
        </View>

        {/* --- DANH SÁCH MŨI CHƯA TIÊM --- */}
        {UPCOMING_VACCINES.map((vaccine) => (
          <View key={vaccine.id} style={styles.vaccineCard}>
            
            <View style={styles.cardHeader}>
              <Text style={styles.vaccineName}>{vaccine.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{vaccine.status}</Text>
              </View>
            </View>
            
            <Text style={styles.vaccineDesc}>{vaccine.desc}</Text>

            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>Dự kiến: {vaccine.date}</Text>
            </View>

            {/* Nút Đặt lịch tiêm cho từng mũi */}
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => router.push('/lichtiem/datlichtiem')} 
            >
              <Text style={styles.bookButtonText}>💉 Đặt lịch tiêm ngay</Text>
            </TouchableOpacity>

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
    padding: 20, // CHUẨN: padding đều 4 phía
  },
  /* --- STYLES HEADER CHUẨN ĐỒNG BỘ --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25, // Đổi thành 25 cho đồng bộ
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
    width: 45, 
  },
  headerTitle: {
    flex: 1, // Điền đầy khoảng trống giữa để tự động căn giữa chữ
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
  },
  rightPlaceholder: {
    width: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerSticker: {
    width: 40,
    height: 40,
  },
  /* --- LỜI NHẮC --- */
  heroSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 15,
    backgroundColor: '#fffcf5', // Nền vàng kem
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffe08a',
    borderStyle: 'dashed',
  },
  heroText: {
    fontSize: 16,
    color: '#d46b08',
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtext: {
    fontSize: 14,
    color: '#5c7a8a',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  /* --- VACCINE CARD SẮP TỚI --- */
  vaccineCard: {
    backgroundColor: '#fffcf5', // Vàng kem nhạt
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffe08a', // Viền vàng pastel
    shadowColor: '#ffe08a',
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
    backgroundColor: '#fff0cb', // Nền vàng
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#d46b08',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vaccineDesc: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 22,
  },
  /* --- NGÀY DỰ KIẾN --- */
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Nền trắng cho nổi bật trên nền vàng
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
    fontWeight: '800',
  },
  /* --- NÚT ĐẶT LỊCH --- */
  bookButton: {
    backgroundColor: '#ff9c6e', // Cam pastel
    paddingVertical: 14,
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
    fontWeight: '900',
    fontSize: 14,
  },
});