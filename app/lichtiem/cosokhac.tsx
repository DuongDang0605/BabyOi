import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClinicCard } from '../../components/clinic/ClinicCard';
import { CustomHeader } from '../../components/common/CustomHeader';

// DATA: Ưu tiên ưu đãi trước, sau đó sắp xếp theo khoảng cách (< 15km)
const ALL_CLINICS = [
  // --- NHÓM CÓ ƯU ĐÃI (Xếp trên cùng) ---
  {
    id: 'c1',
    name: 'Phòng tiêm chủng Nhi Đồng',
    address: 'Đường Chùa Thông, Sơn Tây, Hà Nội',
    distance: 3.6,
    price: '635.000đ', 
    hasDiscount: true,
    discountText: '🔥 Giảm 50K',
  },
  {
    id: 'c4',
    name: 'The Medcare Sơn Tây',
    address: 'Khu đô thị HUD, Trung Hưng, Sơn Tây',
    distance: 5.2,
    price: '685.000đ', 
    hasDiscount: true,
    discountText: '🎁 Tặng đồ chơi',
  },
  // --- NHÓM KHÔNG CÓ ƯU ĐÃI (Xếp theo khoảng cách gần -> xa) ---
  {
    id: 'c2',
    name: 'VNVC Sơn Tây',
    address: 'Số 1 Phùng Khắc Khoan, Quang Trung, Sơn Tây',
    distance: 1.8,
    price: '685.000đ',
    hasDiscount: false,
  },
  {
    id: 'c5',
    name: 'Phòng khám Đa khoa Sơn Tây',
    address: 'Đường La Thành, Viên Sơn, Sơn Tây',
    distance: 4.1,
    price: '690.000đ',
    hasDiscount: false,
  },
  {
    id: 'c3',
    name: 'Phòng tiêm chủng Safemedi',
    address: 'Khu đô thị HUD, Trung Hưng, Sơn Tây',
    distance: 7.2,
    price: '690.000đ',
    hasDiscount: false,
  },
  {
    id: 'c6',
    name: 'Trung tâm Y tế Phúc Thọ',
    address: 'Thị trấn Phúc Thọ, Hà Nội',
    distance: 12.5,
    price: '670.000đ',
    hasDiscount: false,
  }
];

export default function ClinicListScreen() {
  const [searchText, setSearchText] = useState('');

  const filteredClinics = ALL_CLINICS.filter(clinic =>
    clinic.name.toLowerCase().includes(searchText.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
      <CustomHeader title="Chọn Cơ Sở" />

      {/* --- THANH TÌM KIẾM --- */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#b0bec5" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm tên cơ sở hoặc đường..."
          placeholderTextColor="#b0bec5"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Cơ sở quanh bạn (Bán kính 15km)</Text>
        </View>

        {/* --- DANH SÁCH CƠ SỞ --- */}
        {filteredClinics.map((clinic) => (
          <ClinicCard
            key={clinic.id}
            clinic={clinic}
            onSelect={() => router.back()}
          />
        ))}

        <View style={{ height: 40 }}></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3', 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333333',
    fontWeight: '600'
  },
  scrollArea: { paddingHorizontal: 20 },
  sectionHeader: { marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#5c7a8a' },
});
