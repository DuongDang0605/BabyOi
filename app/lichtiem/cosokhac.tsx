import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// DATA: Ưu tiên ưu đãi trước, sau đó sắp xếp theo khoảng cách (< 15km)
// ĐÃ SỬA GIÁ KHỚP VỚI MŨI IMOJEV
const ALL_CLINICS = [
  // --- NHÓM CÓ ƯU ĐÃI (Xếp trên cùng) ---
  {
    id: 'c1',
    name: 'Phòng tiêm chủng Nhi Đồng',
    address: 'Đường Chùa Thông, Sơn Tây, Hà Nội',
    distance: 3.6,
    price: '635.000đ', // Đã giảm 50k
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Cơ Sở</Text>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3209/3209995.png' }} style={styles.headerSticker} />
      </View>

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
        {ALL_CLINICS.map((clinic) => (
          <View key={clinic.id} style={styles.clinicCard}>
            
            <View style={styles.clinicInfo}>
              <View style={styles.clinicNameRow}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                {clinic.hasDiscount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{clinic.discountText}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.clinicAddress}>{clinic.address}</Text>
              
              <View style={styles.clinicMetaRow}>
                <Text style={styles.distance}>🚗 Cách {clinic.distance} km</Text>
                <Text style={styles.clinicCardPrice}>{clinic.price}</Text>
              </View>
            </View>

            {/* Nút Chọn */}
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => router.back()} // Bấm Chọn thì lùi về trang trước
            >
              <Text style={styles.selectButtonText}>Chọn</Text>
            </TouchableOpacity>
            
          </View>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 15,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333333',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5c7a8a',
  },
  clinicCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center', 
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  clinicInfo: {
    flex: 1,
    paddingRight: 10, 
  },
  clinicNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', 
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#333333',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#ffe08a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d46b08',
  },
  clinicAddress: {
    fontSize: 13,
    color: '#8899aa',
    marginBottom: 10,
    lineHeight: 18,
  },
  clinicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#2e7d32', 
    fontWeight: '800',
    marginRight: 15,
  },
  clinicCardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff8fab',
  },
  selectButton: {
    backgroundColor: '#ffb6c1', 
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  selectButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
});