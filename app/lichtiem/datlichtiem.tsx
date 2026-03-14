import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CLINICS_DATA = [
  {
    id: 'c1',
    name: 'Phòng tiêm chủng Nhi Đồng',
    address: 'Đường Chùa Thông, Sơn Tây, Hà Nội',
    distance: '3.6 km',
    price: '635.000đ', // Đã giảm 50k
    hasDiscount: true,
    discountText: '🔥 Giảm 50K',
    isSelfBook: false,
  },
  {
    id: 'c2',
    name: 'VNVC Sơn Tây',
    address: 'Số 1 Phùng Khắc Khoan, Quang Trung, Sơn Tây',
    distance: '1.8 km',
    price: '685.000đ', // Giá gốc VNVC
    hasDiscount: false,
    isSelfBook: false,
  },
  {
    id: 'c3',
    name: 'Phòng tiêm chủng Safemedi',
    address: 'Khu đô thị HUD, Trung Hưng, Sơn Tây',
    distance: '7.2 km',
    price: '690.000đ',
    hasDiscount: false,
    isSelfBook: false,
  },
  {
    id: 'self_book',
    name: 'Tự đặt lịch / Khác',
    address: 'Mẹ tự liên hệ cơ sở và đưa bé đi tiêm',
    distance: '',
    price: 'Tự chi trả',
    hasDiscount: false,
    isSelfBook: true,
  }
];

export default function BookingVaccineScreen() {
  const [selectedClinicId, setSelectedClinicId] = useState(CLINICS_DATA[0].id);
  const selectedClinic = CLINICS_DATA.find(clinic => clinic.id === selectedClinicId);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác Nhận Đặt Lịch</Text>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3209/3209995.png' }} style={styles.headerSticker} />
        </View>

        {/* 1. Thông tin mũi tiêm (ĐÃ SỬA THÀNH IMOJEV) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Thông tin Vắc-xin</Text>
          <View style={styles.vaccineInfo}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.vaccineName}>Viêm não Nhật Bản (Imojev)</Text>
              <Text style={styles.vaccineOrigin}>Xuất xứ: Thái Lan (Sanofi)</Text>
            </View>
            <Text style={styles.vaccinePrice}>{selectedClinic?.price}</Text>
          </View>
        </View>

        {/* 2. Lưu ý y tế */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Lưu ý trước khi tiêm</Text>
          <Text style={styles.warningText}>• Bé không ốm sốt trong 3 ngày gần nhất.</Text>
          <Text style={styles.warningText}>• Mang theo sổ tiêm chủng gốc (nếu có).</Text>
          <Text style={styles.warningText}>• Ăn uống đầy đủ, không để bé quá đói trước khi tiêm.</Text>
        </View>

        {/* 3. Chọn cơ sở tiêm */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Chọn cơ sở tiêm</Text>
          <TouchableOpacity onPress={() => router.push('/lichtiem/cosokhac')}>
            <Text style={styles.seeAllText}>Cơ sở khác ➔</Text>
          </TouchableOpacity>
        </View>
        
        {/* Render danh sách cơ sở */}
        {CLINICS_DATA.map((clinic) => {
          const isSelected = selectedClinicId === clinic.id;

          return (
            <TouchableOpacity 
              key={clinic.id}
              style={[
                styles.clinicCard, 
                isSelected && styles.clinicCardSelected,
                clinic.isSelfBook && styles.clinicCardSelfBook
              ]}
              onPress={() => setSelectedClinicId(clinic.id)}
            >
              <View style={isSelected ? styles.radioSelected : styles.radioUnselected}>
                {isSelected && <View style={styles.radioInner}></View>}
              </View>
              
              <View style={styles.clinicInfo}>
                <View style={styles.clinicNameRow}>
                  <Text style={[styles.clinicName, clinic.isSelfBook && styles.selfBookName]}>
                    {clinic.name}
                  </Text>
                  {clinic.hasDiscount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{clinic.discountText}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.clinicAddress}>{clinic.address}</Text>
                
                <View style={styles.clinicMetaRow}>
                  {clinic.isSelfBook ? (
                    <Text style={styles.distance}>🏥 Chủ động thời gian</Text>
                  ) : (
                    <Text style={styles.distance}>🚗 Cách bạn {clinic.distance}</Text>
                  )}
                  <Text style={[styles.clinicCardPrice, clinic.isSelfBook && styles.selfBookPrice]}>
                    {clinic.price}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* 4. Voucher */}
        {!selectedClinic?.isSelfBook && (
          <>
            <Text style={styles.sectionTitle}>🎟 Mã giảm giá của mẹ</Text>
            <View style={styles.voucherContainer}>
              <TextInput 
                style={styles.voucherInput}
                placeholder="Nhập mã giảm giá..."
                placeholderTextColor="#b0bec5"
              />
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 120 }}></View>
      </ScrollView>

      {/* 5. Thanh Xác nhận đặt lịch */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={[styles.totalPrice, selectedClinic?.isSelfBook && styles.selfBookPrice]}>
            {selectedClinic?.price}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>
            {selectedClinic?.isSelfBook ? 'Lưu lịch tiêm này' : 'Xác nhận đặt lịch'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5, zIndex: -1 },
  headerSticker: { width: 45, height: 45 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 2, borderColor: '#f0f4f8', shadowColor: '#a7e4f5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#5c7a8a', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#fef0f4', paddingBottom: 10 },
  vaccineInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vaccineName: { fontSize: 16, fontWeight: '800', color: '#333333' },
  vaccineOrigin: { fontSize: 13, color: '#8899aa', marginTop: 4 },
  vaccinePrice: { fontSize: 18, fontWeight: '900', color: '#ff8fab' },
  warningCard: { backgroundColor: '#fffcf5', borderRadius: 16, padding: 18, marginBottom: 25, borderWidth: 2, borderColor: '#ffe08a' },
  warningTitle: { fontSize: 15, fontWeight: '900', color: '#d46b08', marginBottom: 10 },
  warningText: { fontSize: 14, color: '#5c7a8a', marginBottom: 5, lineHeight: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#5c7a8a' },
  seeAllText: { fontSize: 14, fontWeight: 'bold', color: '#ff8fab' },
  clinicCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 18, padding: 16, marginBottom: 15, alignItems: 'flex-start', borderWidth: 2, borderColor: '#f0f4f8' },
  clinicCardSelected: { borderColor: '#ffb6c1', backgroundColor: '#fff5f7' },
  clinicCardSelfBook: { borderStyle: 'dashed', borderColor: '#cbd5e1', backgroundColor: '#f8fdfa' },
  selfBookName: { color: '#2e7d32' },
  selfBookPrice: { color: '#5c7a8a', fontSize: 16 },
  radioUnselected: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 15, marginTop: 2 },
  radioSelected: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ff8fab', justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 2 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff8fab' },
  clinicInfo: { flex: 1 },
  clinicNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  clinicName: { fontSize: 15, fontWeight: '900', color: '#333333', marginRight: 8 },
  discountBadge: { backgroundColor: '#ffe08a', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discountBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#d46b08' },
  clinicAddress: { fontSize: 13, color: '#8899aa', marginBottom: 8, lineHeight: 18 },
  clinicMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distance: { fontSize: 12, color: '#2e7d32', fontWeight: '700' },
  clinicCardPrice: { fontSize: 14, fontWeight: 'bold', color: '#ff8fab' },
  voucherContainer: { flexDirection: 'row', marginBottom: 20 },
  voucherInput: { flex: 1, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#f0f4f8', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, color: '#333333' },
  applyButton: { backgroundColor: '#a3d9b1', paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 15, marginLeft: 10, shadowColor: '#a3d9b1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 },
  applyButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 2, borderColor: '#f0f4f8' },
  priceContainer: { flex: 1 },
  totalLabel: { fontSize: 14, color: '#5c7a8a', fontWeight: '600' },
  totalPrice: { fontSize: 22, fontWeight: '900', color: '#ff8fab', marginTop: 2 },
  confirmButton: { backgroundColor: '#ffb6c1', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center', shadowColor: '#ffb6c1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 5 },
  confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});