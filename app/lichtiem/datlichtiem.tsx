import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * API endpoints:
 * 1. GET /api/vaccination-centers/vaccine-type/{vaccineTypeId} -> Trả về VaccinationCenterResponse[]
 * 2. POST /api/vaccine-records -> VaccineRecordRequest (Bổ sung trường price)
 */

export default function BookingVaccineScreen() {
  const { vaccineTypeId = '101', vaccineName = 'Viêm não Nhật Bản (Imojev)' } = useLocalSearchParams();

  // Dữ liệu centers sẽ được fetch từ API 1
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | string | null>(null);

  useEffect(() => {
    console.log(`Gọi API GET /api/vaccination-centers/vaccine-type/${vaccineTypeId}`);
    // Giả định sau khi fetch: setClinics(response.data)
  }, [vaccineTypeId]);

  const selectedClinic = clinics.find((c: any) => c.id === selectedClinicId);

  const handleConfirm = () => {
    // API 2: Tạo bản ghi VaccineRecordRequest
    const request = {
      profileId: 1,
      vaccineTypeId: Number(vaccineTypeId),
      injectionDate: new Date().toISOString(),
      location: selectedClinic ? selectedClinic.name : "Tự chọn",
      price: selectedClinic ? (selectedClinic.discountPrice || selectedClinic.price) : 0, // Đã bổ sung trường price
      note: "Đặt lịch qua app BabyOi",
      status: -1 // TABLE_STATUS.PENDING
    };
    console.log("Gửi API POST /api/vaccine-records:", request);
    router.push('/lichtiem/listlichtiem');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác Nhận Đặt Lịch</Text>
        </View>

        {/* Thông tin Vắc-xin */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Thông tin Vắc-xin</Text>
          <View style={styles.vaccineInfo}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.vaccineName}>{vaccineName}</Text>
              <Text style={styles.vaccineOrigin}>ID loại: {vaccineTypeId}</Text>
            </View>
            <Text style={styles.vaccinePrice}>
              {selectedClinic ? `${(selectedClinic.discountPrice || selectedClinic.price).toLocaleString()}đ` : '---'}
            </Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Lưu ý trước khi tiêm</Text>
          <Text style={styles.warningText}>• Bé không ốm sốt trong 3 ngày gần nhất.</Text>
          <Text style={styles.warningText}>• Mang theo sổ tiêm chủng gốc (nếu có).</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Chọn cơ sở tiêm</Text>
          <TouchableOpacity onPress={() => router.push('/lichtiem/cosokhac')}>
            <Text style={styles.seeAllText}>Cơ sở khác ➔</Text>
          </TouchableOpacity>
        </View>
        
        {/* Render từ VaccinationCenterResponse */}
        {clinics.length > 0 ? clinics.map((clinic: any) => {
          const isSelected = selectedClinicId === clinic.id;
          return (
            <TouchableOpacity 
              key={clinic.id}
              style={[styles.clinicCard, isSelected && styles.clinicCardSelected]}
              onPress={() => setSelectedClinicId(clinic.id)}
            >
              <View style={isSelected ? styles.radioSelected : styles.radioUnselected}>
                {isSelected && <View style={styles.radioInner}></View>}
              </View>
              
              <View style={styles.clinicInfo}>
                <View style={styles.clinicNameRow}>
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  {clinic.discountPrice < clinic.price && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>🔥 Ưu đãi</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.clinicAddress}>{clinic.address}</Text>
                <View style={styles.clinicMetaRow}>
                  <Text style={styles.distance}>🚗 Cách bạn {clinic.distance} km</Text>
                  <Text style={styles.clinicCardPrice}>{(clinic.discountPrice || clinic.price).toLocaleString()}đ</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }) : (
          <Text style={{ textAlign: 'center', color: '#8899aa', marginTop: 10 }}>Đang tìm trung tâm gần nhất...</Text>
        )}

        <View style={{ height: 120 }}></View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalPrice}>
            {selectedClinic ? `${(selectedClinic.discountPrice || selectedClinic.price).toLocaleString()}đ` : '0đ'}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Xác nhận đặt lịch</Text>
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
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 2, borderColor: '#f0f4f8', elevation: 3 },
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
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 2, borderColor: '#f0f4f8' },
  priceContainer: { flex: 1 },
  totalLabel: { fontSize: 14, color: '#5c7a8a', fontWeight: '600' },
  totalPrice: { fontSize: 22, fontWeight: '900', color: '#ff8fab', marginTop: 2 },
  confirmButton: { backgroundColor: '#ffb6c1', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center', elevation: 5 },
  confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
