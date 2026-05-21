import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer'; // Đảm bảo đã cài đặt 'buffer' hoặc dùng btoa nếu môi trường hỗ trợ

export default function AddVaccineScreen() {
  const { profileId } = useLocalSearchParams();

  // State cho tìm kiếm vắc-xin từ API
  const [vaccineTypes, setVaccineTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // State cho form
  const [vaccineTypeId, setHoldVaccineTypeId] = useState<number | null>(null);
  const [injectionDate, setInjectionDate] = useState('');
  const [status, setStatus] = useState(-1);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  // Hàm gọi API tìm kiếm vắc-xin thực tế
  const searchVaccines = async (query: string) => {
    setSearchText(query);

    if (query.trim().length === 0) {
      setVaccineTypes([]);
      setShowDropdown(false);
      return;
    }

    try {
      setLoading(true);
      setShowDropdown(true);

      // 1. Xác định Host (10.0.2.2 cho Android Emulator, localhost cho iOS/Web)
      const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      const url = `http://${host}:8085/api/vaccine-types?keyword=${encodeURIComponent(query)}`;

      // 2. Cấu hình Basic Auth (Dựa trên hình ảnh Postman của bạn)
      // Username: mother@babyoi.local | Password: Bạn hãy thay '123456' bằng pass thực tế
      const auth = Buffer.from('mother@babyoi.local:123456').toString('base64');

      console.log(`Đang gọi API: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Kết quả tìm kiếm từ BE:", data);
        setVaccineTypes(data);
      } else {
        console.error("Lỗi API Backend:", response.status);
        setVaccineTypes([]);
      }

    } catch (error) {
      console.error("Lỗi kết nối mạng:", error);
      setVaccineTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!profileId || !vaccineTypeId) {
      alert("Vui lòng chọn hồ sơ và loại vắc-xin!");
      return;
    }

    const request = {
      profileId: Number(profileId),
      vaccineTypeId: vaccineTypeId,
      injectionDate: injectionDate,
      location: location,
      note: note,
      price: Number(price.replace(/[^0-9]/g, '')),
      status: status
    };

    console.log("Gửi API POST /api/vaccine-records:", request);
    // TODO: Call API POST /api/vaccine-records với Auth tương tự
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea} keyboardShouldPersistTaps="handled">
        
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm Mũi Tiêm</Text>
        </View>

        {/* 1. Tìm kiếm Vắc-xin từ API thực tế */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>💉 </Text> Tên vắc-xin / Bệnh phòng ngừa
          </Text>
          
          <View style={styles.dropdownWrapper}>
            <TextInput
              style={[styles.inputRounded, showDropdown && styles.inputActive]}
              placeholder="Nhập tên vắc-xin (VD: soi, viem gan...)"
              placeholderTextColor="#b0bec5"
              value={searchText}
              onChangeText={searchVaccines}
              onFocus={() => { if (searchText.length > 0) setShowDropdown(true); }}
            />
            
            {showDropdown && (
              <View style={styles.dropdownBox}>
                {loading ? (
                  <ActivityIndicator color="#ff8fab" style={{ margin: 15 }} />
                ) : (
                  vaccineTypes.length > 0 ? (
                    vaccineTypes.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setHoldVaccineTypeId(item.id);
                          setSearchText(item.name);
                          setShowDropdown(false);

                          // Chuyển hướng sang màn hình hoàn thiện nếu cần AI tư vấn
                          router.push({
                            pathname: '/lichtiem/themmuitiemhoanthien',
                            params: { profileId, vaccineTypeId: item.id, vaccineName: item.name }
                          });
                        }}
                      >
                        <Text style={styles.dropdownText}>
                          💉 <Text style={styles.textBold}>{item.name}</Text>
                        </Text>
                        <Text style={styles.dropdownSubtext}>{item.description || "Không có mô tả"}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownSubtext}>Không tìm thấy vắc-xin nào phù hợp</Text>
                    </View>
                  )
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📅 </Text> Ngày tiêm (hoặc dự kiến)
          </Text>
          <TextInput 
            style={styles.inputRounded} 
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#b0bec5"
            value={injectionDate}
            onChangeText={setInjectionDate}
          />
        </View>

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📝 </Text> Ghi chú của mẹ
          </Text>
          <TextInput 
            style={[styles.inputRounded, styles.textArea]} 
            placeholder="VD: Bé hơi sốt nhẹ vào buổi tối..."
            placeholderTextColor="#b0bec5"
            multiline={true}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={{ height: 100 }} />
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
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: '700', color: '#5c7a8a', marginBottom: 10, marginLeft: 5 },
  labelSticker: { fontSize: 18 },
  inputRounded: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, fontSize: 16, color: '#333333', borderWidth: 2, borderColor: '#f0f4f8', elevation: 3 },
  dropdownWrapper: { zIndex: 10 },
  inputActive: { borderBottomLeftRadius: 5, borderBottomRightRadius: 5, borderColor: '#a7e4f5' },
  dropdownBox: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#a7e4f5', borderTopWidth: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', elevation: 4 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f4f8' },
  dropdownText: { fontSize: 15, color: '#333333', marginBottom: 4 },
  dropdownSubtext: { fontSize: 13, color: '#8899aa', fontStyle: 'italic' },
  textBold: { fontWeight: 'bold', color: '#ff8fab' },
  textArea: { height: 100, textAlignVertical: 'top', borderRadius: 20 },
  pillContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  pillButton: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', borderWidth: 2 },
  pillActive: { backgroundColor: '#c1f0d0', borderColor: '#a3d9b1', marginRight: 10 },
  pillActiveText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 15 },
  pillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8', marginLeft: 10 },
  pillInactiveText: { color: '#a0aab2', fontWeight: '600', fontSize: 15 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.9)' },
  saveButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
