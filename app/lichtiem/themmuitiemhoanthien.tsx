import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useNotification } from '../../lib/notification';

/**
 * REFACTOR: Sử dụng profileId động từ params điều hướng
 */

export default function AddVaccineSelectedScreen() {
  const { showNotification } = useNotification();
  const { profileId, vaccineTypeId, vaccineName } = useLocalSearchParams();

  const [injectionDate, setInjectionDate] = useState('');
  const [status, setStatus] = useState(-1); // Mặc định -1: Pending
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  const handleSave = () => {
    if (!profileId) {
      showNotification({
        type: 'error',
        title: 'Không tìm thấy hồ sơ',
        message: 'Vui lòng chọn hồ sơ trước khi lưu mũi tiêm.',
      });
      return;
    }

    const request = {
      profileId: Number(profileId),
      vaccineTypeId: Number(vaccineTypeId) || 101,
      injectionDate: injectionDate, // TODO: Chuyển đổi DD/MM/YYYY sang ISO YYYY-MM-DD
      location: location,
      note: note,
      price: Number(price.replace(/[^0-9]/g, '')),
      status: status
    };

    console.log("Gửi API POST /api/vaccine-records:", request);
    // Logic call axios/fetch ở đây
    router.push({
      pathname: '/lichtiem/listlichtiem',
      params: { profileId } // Quay lại đúng hồ sơ đang xem
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm Mũi Tiêm</Text>
        </View>

        {/* Tên vắc-xin */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>💉 </Text> Tên vắc-xin / Bệnh
          </Text>
          <TextInput 
            style={[styles.inputRounded, styles.inputCompleted]} 
            value={vaccineName as string || "Cúm mùa (Vaxigrip Tetra)"}
            editable={false} 
          />
        </View>

        {/* injectionDate */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📅 </Text> Ngày tiêm (hoặc dự kiến)
          </Text>
          <TextInput 
            style={styles.inputRounded} 
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#b0bec5"
            keyboardType="numeric"
            value={injectionDate}
            onChangeText={setInjectionDate}
          />
        </View>

        {/* location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📍 </Text> Địa điểm tiêm
          </Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="VD: VNVC Sơn Tây..."
            placeholderTextColor="#b0bec5"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* price */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>💰 </Text> Chi phí (VNĐ)
          </Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="VD: 1.045.000"
            placeholderTextColor="#b0bec5"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>⭐ </Text> Trạng thái
          </Text>
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[styles.pillButton, status === 3 ? styles.pillActive : styles.pillInactive]}
              onPress={() => setStatus(3)}
            >
              <Text style={status === 3 ? styles.pillActiveText : styles.pillInactiveText}>Đã tiêm ✅</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.pillButton, status === -1 ? styles.pillActive : styles.pillInactive]}
              onPress={() => setStatus(-1)}
            >
              <Text style={status === -1 ? styles.pillActiveText : styles.pillInactiveText}>Sắp tới ⏳</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📝 </Text> Ghi chú của mẹ
          </Text>
          <TextInput 
            style={[styles.inputRounded, styles.textArea]} 
            placeholder="VD: Bé hơi sốt nhẹ..."
            placeholderTextColor="#b0bec5"
            multiline={true}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💖 Lưu vào Sổ Tiêm</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 30 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5, zIndex: -1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#5c7a8a', marginBottom: 10, marginLeft: 5 },
  labelSticker: { fontSize: 18 },
  inputRounded: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, fontSize: 16, color: '#333333', borderWidth: 2, borderColor: '#f0f4f8', elevation: 3 },
  inputCompleted: { backgroundColor: '#f0fbff', borderColor: '#a7e4f5', fontWeight: 'bold', color: '#005b7f' },
  textArea: { height: 100, textAlignVertical: 'top', borderRadius: 20 },
  pillContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  pillButton: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', borderWidth: 2 },
  pillActive: { backgroundColor: '#fff0cb', borderColor: '#ffe08a', marginLeft: 10 },
  pillActiveText: { color: '#d46b08', fontWeight: 'bold', fontSize: 15 },
  pillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8', marginRight: 10 },
  pillInactiveText: { color: '#a0aab2', fontWeight: '600', fontSize: 15 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  saveButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
