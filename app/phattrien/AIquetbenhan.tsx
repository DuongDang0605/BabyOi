import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AIScanResultScreen() {
  // Dữ liệu giả lập đã được AI bóc tách từ ảnh chụp Đơn thuốc
  const [illness, setIllness] = useState('Viêm mũi họng cấp (J00)');
  const [startDate] = useState('25/03/2026');
  const [severity, setSeverity] = useState('Cần chú ý'); 
  const severityLevels = ['Nhẹ', 'Bình thường', 'Cần chú ý'];
  
  const [details, setDetails] = useState(
    "Triệu chứng: Sốt nhẹ 38.2°C, ho húng hắng, sổ mũi dịch trong.\n\n" +
    "Trích xuất đơn thuốc (Viện Nhi TW):\n" +
    "1. Hapacol 150mg: Uống 1 gói/lần (Chỉ dùng khi sốt > 38.5°C, cách 4-6h).\n" +
    "2. Fysoline hồng (Nước muối sinh lý): Nhỏ mũi 3-4 lần/ngày.\n" +
    "3. Tăng cường cữ bú mẹ."
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* =========================================
          HEADER CHUẨN (ĐỒNG BỘ 100%)
      ========================================= */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận dữ liệu AI</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- BANNER BÁO CÁO AI THÀNH CÔNG --- */}
        <View style={styles.aiSuccessBanner}>
          <View style={styles.aiBannerHeader}>
            <View style={styles.aiIconBg}>
              <Ionicons name="sparkles" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.aiBannerTitle}>Đã đọc xong đơn thuốc!</Text>
              <Text style={styles.aiBannerSub}>Độ chính xác: 98% • Trích xuất lúc 08:00</Text>
            </View>
          </View>
          
          {/* Hình thu nhỏ của đơn thuốc (Mô phỏng) */}
          <View style={styles.sourceImageBox}>
            <Ionicons name="document-text" size={20} color="#8899AA" style={{ marginRight: 8 }} />
            <Text style={styles.sourceImageText}>Nguon: Don_thuoc_vien_Nhi_TW.jpg</Text>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={{ marginLeft: 'auto' }} />
          </View>
        </View>

        <Text style={styles.instructionText}>
          Mẹ hãy kiểm tra lại các thông tin AI tự động điền bên dưới và chỉnh sửa nếu cần nhé:
        </Text>

        {/* 1. TÊN BỆNH / TRIỆU CHỨNG */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🤒 Chẩn đoán của Bác sĩ</Text>
          <TextInput 
            style={[styles.inputRounded, { color: '#FF8FAB', fontWeight: 'bold' }]} 
            value={illness}
            onChangeText={setIllness}
          />
        </View>

        {/* 2. CHỌN NGÀY */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>📅 Ngày khám</Text>
            <TouchableOpacity style={styles.datePickerSim}>
              <Text style={[styles.dateText, { color: '#333' }]}>{startDate}</Text>
              <Ionicons name="calendar" size={18} color="#FFB6C1" />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>🚩 Tái khám</Text>
            <TouchableOpacity style={styles.datePickerSim}>
              <Text style={styles.dateText}>28/03/2026</Text>
              <Ionicons name="calendar-outline" size={18} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. MỨC ĐỘ NGHIÊM TRỌNG */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📊 Cảnh báo mức độ</Text>
          <View style={styles.pillContainer}>
            {severityLevels.map((level) => (
              <TouchableOpacity 
                key={level}
                style={[
                  styles.pillButton, 
                  severity === level ? styles.pillActive : styles.pillInactive
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text style={severity === level ? styles.pillActiveText : styles.pillInactiveText}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. CHI TIẾT TRIỆU CHỨNG & CÁCH XỬ LÝ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📝 Liều lượng & Ghi chú từ Đơn</Text>
          <TextInput 
            style={[styles.inputRounded, styles.textArea]} 
            value={details}
            onChangeText={setDetails}
            multiline={true}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- CỤM NÚT LƯU LẠI --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={() => router.replace('/phattrien/illness-history')}>
          <Text style={styles.saveButtonText}>Xác nhận & Lưu vào Sổ</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { paddingHorizontal: 20 },
  
  /* =========================================
     STYLE HEADER CHUẨN (ĐỒNG BỘ 100%)
  ========================================= */
  customHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 60, /* Chỉnh lại padding top cho cân đối với máy thật */
    marginBottom: 25,
    paddingHorizontal: 20
  },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },

  /* --- BANNER AI --- */
  aiSuccessBanner: {
    backgroundColor: '#E8F9ED',
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    elevation: 2,
  },
  aiBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  aiBannerTitle: { fontSize: 16, fontWeight: '900', color: '#2E7D32' },
  aiBannerSub: { fontSize: 12, color: '#4CAF50', fontWeight: '700', marginTop: 2 },
  sourceImageBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 10, borderRadius: 12 },
  sourceImageText: { fontSize: 13, color: '#5C7A8A', fontWeight: '600' },

  instructionText: { fontSize: 14, color: '#8899AA', fontWeight: '600', marginBottom: 25, lineHeight: 22, fontStyle: 'italic' },

  /* --- INPUTS --- */
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '800', color: '#5C7A8A', marginBottom: 10, marginLeft: 5 },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    fontSize: 15,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    elevation: 1,
  },
  textArea: { height: 160, textAlignVertical: 'top', lineHeight: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  datePickerSim: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  dateText: { fontSize: 14, color: '#8899AA', fontWeight: '700' },

  /* --- SEVERITY PILLS --- */
  pillContainer: { flexDirection: 'row', gap: 10 },
  pillButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  pillActive: { backgroundColor: '#FF9800', borderColor: '#FF9800' }, // Đổi màu Cần chú ý sang Cam
  pillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8' },
  pillActiveText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  pillInactiveText: { color: '#a0aab2', fontWeight: '700', fontSize: 13 },

  /* --- BOTTOM BAR --- */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
    backgroundColor: 'rgba(254, 249, 243, 0.95)',
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Đổi màu nút sang xanh lá thành công
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
});
