import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';

export default function BookingVaccineScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Xác nhận đặt lịch', headerBackTitle: 'Quay lại' }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Thông tin Vắc-xin</Text>
          <View style={styles.vaccineInfo}>
            <View>
              <Text style={styles.vaccineName}>Sởi đơn (MVVAC)</Text>
              <Text style={styles.vaccineOrigin}>Xuất xứ: Việt Nam</Text>
            </View>
            <Text style={styles.vaccinePrice}>265.000đ</Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Lưu ý trước khi tiêm</Text>
          <Text style={styles.warningText}>• Bé không ốm sốt trong 3 ngày gần nhất.</Text>
          <Text style={styles.warningText}>• Mang theo sổ tiêm chủng gốc (nếu có).</Text>
          <Text style={styles.warningText}>• Ăn uống đầy đủ, không để bé quá đói trước khi tiêm.</Text>
        </View>

        <Text style={styles.sectionTitle}>📍 Đề xuất cơ sở gần bạn</Text>
        
        <TouchableOpacity style={[styles.clinicCard, styles.clinicCardSelected]}>
          <View style={styles.radioSelected}>
            <View style={styles.radioInner}></View>
          </View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>VNVC Sơn Tây</Text>
            <Text style={styles.clinicAddress}>Số 1 Phùng Khắc Khoan, Quang Trung, Sơn Tây, Hà Nội</Text>
            <Text style={styles.distance}>🚗 Cách bạn 2.5 km</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clinicCard}>
          <View style={styles.radioUnselected}></View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>Phòng tiêm chủng Safemedi</Text>
            <Text style={styles.clinicAddress}>Khu đô thị HUD, Trung Hưng, Sơn Tây, Hà Nội</Text>
            <Text style={styles.distance}>🚗 Cách bạn 4.1 km</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>🎟 Ưu đãi</Text>
        <View style={styles.voucherContainer}>
          <TextInput 
            style={styles.voucherInput}
            placeholder="Nhập mã giảm giá..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }}></View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalPrice}>265.000đ</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Xác nhận đặt lịch</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollArea: {
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 10,
  },
  vaccineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005b7f', 
  },
  vaccineOrigin: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  vaccinePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4d4f',
  },
  warningCard: {
    backgroundColor: '#fffbe6', 
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffe58f',
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d46b08',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 5,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  clinicCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clinicCardSelected: {
    borderColor: '#a7e4f5', 
    backgroundColor: '#f0fbff',
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cccccc',
    marginRight: 15,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#a7e4f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#a7e4f5',
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 18,
  },
  distance: {
    fontSize: 12,
    color: '#2e7d32', 
    fontWeight: '600',
  },
  voucherContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  voucherInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
  },
  applyButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 10,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    padding: 15,
    paddingBottom: 30, 
    borderTopWidth: 1,
    borderColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 13,
    color: '#666666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#ff9c6e', 
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});