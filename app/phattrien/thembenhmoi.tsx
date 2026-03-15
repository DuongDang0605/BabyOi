import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddIllnessScreen() {
  const [severity, setSeverity] = useState('Bình thường');
  const severityLevels = ['Nhẹ', 'Bình thường', 'Cần chú ý'];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ghi Chép Bệnh</Text>
          <View style={{ width: 45 }} />
        </View>

        {/* 1. TÊN BỆNH / TRIỆU CHỨNG */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🤒 Tên bệnh hoặc triệu chứng</Text>
          <TextInput 
            style={styles.inputRounded} 
            placeholder="VD: Viêm họng, Sốt mọc răng..."
            placeholderTextColor="#b0bec5"
          />
        </View>

        {/* 2. CHỌN NGÀY (Dạng Row) */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>📅 Ngày bắt đầu</Text>
            <TouchableOpacity style={styles.datePickerSim}>
              <Text style={styles.dateText}>14/03/2026</Text>
              <Ionicons name="calendar-outline" size={18} color="#FFB6C1" />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>🚩 Ngày kết thúc</Text>
            <TouchableOpacity style={styles.datePickerSim}>
              <Text style={styles.dateText}>--/--/----</Text>
              <Ionicons name="flag-outline" size={18} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. MỨC ĐỘ NGHIÊM TRỌNG */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📊 Mức độ nghiêm trọng</Text>
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
          <Text style={styles.label}>📝 Chi tiết triệu chứng & Thuốc</Text>
          <TextInput 
            style={[styles.inputRounded, styles.textArea]} 
            placeholder="Bé có sốt không? Mẹ đã cho bé uống thuốc gì hoặc đi khám ở đâu chưa?"
            placeholderTextColor="#b0bec5"
            multiline={true}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- NÚT LƯU LẠI --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
          <Text style={styles.saveButtonText}> Lưu ghi chép</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  
  /* --- HEADER CHUẨN --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },

  /* --- INPUTS --- */
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '800', color: '#5C7A8A', marginBottom: 10, marginLeft: 5 },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    fontSize: 15,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    elevation: 2,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
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
  dateText: { fontSize: 14, color: '#5C7A8A', fontWeight: '700' },

  /* --- SEVERITY PILLS --- */
  pillContainer: { flexDirection: 'row', gap: 10 },
  pillButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  pillActive: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
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
    backgroundColor: '#ff8fab',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#ff8fab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
});