import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClinicCard } from '../../components/clinic/ClinicCard';
import { CustomHeader } from '../../components/common/CustomHeader';

/**
 * API: VaccinationCenterResponse
 * id: number
 * name: string
 * address: string
 * distance: number
 * price: number
 * discountPrice: number
 * note: string
 *
 * Endpoint: GET /api/vaccination-centers/vaccine-type/{vaccineTypeId}
 */

export default function ClinicListScreen() {
  const { vaccineTypeId = '101' } = useLocalSearchParams();
  const [searchText, setSearchText] = useState('');
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    // Logic: Fetch danh sách trung tâm từ API
  }, [vaccineTypeId]);

  const filteredClinics = clinics.filter((clinic: any) =>
    clinic.name.toLowerCase().includes(searchText.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <CustomHeader title="Chọn Cơ Sở" />

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
          <Text style={styles.sectionTitle}>📍 Cơ sở có sẵn vắc-xin</Text>
        </View>

        {/* DANH SÁCH CƠ SỞ TỪ API */}
        {filteredClinics.length > 0 ? filteredClinics.map((clinic: any) => (
          <ClinicCard
            key={clinic.id}
            clinic={{
              ...clinic,
              // Map các trường từ VaccinationCenterResponse sang UI
              displayPrice: clinic.discountPrice || clinic.price,
              hasDiscount: clinic.discountPrice < clinic.price,
              discountText: clinic.note // Hoặc logic tính % giảm giá
            }}
            onSelect={() => router.back()}
          />
        )) : (
          <Text style={styles.emptyText}>Đang tải danh sách cơ sở...</Text>
        )}

        <View style={{ height: 40 }}></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', marginHorizontal: 20, marginBottom: 20, borderRadius: 18, paddingHorizontal: 15, borderWidth: 2, borderColor: '#f0f4f8', elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#333333', fontWeight: '600' },
  scrollArea: { paddingHorizontal: 20 },
  sectionHeader: { marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#5c7a8a' },
  emptyText: { textAlign: 'center', color: '#8899aa', marginTop: 20, fontStyle: 'italic' }
});
