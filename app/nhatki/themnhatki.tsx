import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddMomentScreen() {
  const [selectedMilestone, setSelectedMilestone] = useState('Lần đầu tiên');
  const milestones = ['Lần đầu tiên', 'Sinh nhật', 'Đi chơi', 'Khác'];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Bao toàn bộ bằng ScrollView giống y hệt trang Sổ Tiêm */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER ĐƯỢC CHUYỂN VÀO TRONG SCROLLVIEW --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Thêm Kỷ Niệm</Text>
          
          <View style={{ width: 45 }} />
        </View>

        {/* 1. KHU VỰC TẢI ẢNH LÊN */}
        <TouchableOpacity style={styles.imageUploadBox}>
          <View style={styles.imageUploadInner}>
            <Ionicons name="images-outline" size={40} color="#ffb6c1" />
            <Text style={styles.uploadText}>Chạm để chọn ảnh của bé Ốc</Text>
          </View>
        </TouchableOpacity>

        {/* 2. TIÊU ĐỀ KỶ NIỆM */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🏷️ Tiêu đề kỷ niệm</Text>
          <TextInput 
            style={styles.inputRounded} 
            placeholder="VD: Chiếc răng đầu tiên của con..."
            placeholderTextColor="#b0bec5"
          />
        </View>

        {/* 3. NGÀY LƯU GIỮ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Ngày lưu giữ</Text>
          <TextInput 
            style={[styles.inputRounded, { color: '#5c7a8a', fontWeight: 'bold' }]} 
            value="14/03/2026" 
            editable={false} 
          />
        </View>

        {/* 4. CHỌN CỘT MỐC */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>✨ Đánh dấu cột mốc</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {milestones.map((item) => (
              <TouchableOpacity 
                key={item}
                style={[
                  styles.pillButton, 
                  selectedMilestone === item ? styles.pillActive : styles.pillInactive
                ]}
                onPress={() => setSelectedMilestone(item)}
              >
                <Text style={selectedMilestone === item ? styles.pillActiveText : styles.pillInactiveText}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. TÂM SỰ CỦA MẸ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📝 Lời yêu thương mẹ gửi con</Text>
          <TextInput 
            style={[styles.inputRounded, styles.textArea]} 
            placeholder="Hôm nay bé Ốc đã làm được điều gì khiến mẹ bất ngờ thế? Kể lại đây nhé..."
            placeholderTextColor="#b0bec5"
            multiline={true}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- NÚT LƯU KỶ NIỆM --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💖 Lưu lại kỷ niệm</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollArea: {
    padding: 20,
  },
  /* --- HEADER Y HỆT SỔ TIÊM --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
    width: 45, 
  },
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
  },
  /* --- PHẦN CÒN LẠI --- */
  imageUploadBox: {
    backgroundColor: '#fff5f7', 
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    borderStyle: 'dashed',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  imageUploadInner: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#ff8fab',
    fontWeight: '700',
    marginTop: 10,
    fontSize: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5c7a8a',
    marginBottom: 10,
    marginLeft: 5,
  },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    fontSize: 15,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pillScroll: {
    flexDirection: 'row',
  },
  pillButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  pillActive: {
    backgroundColor: '#fff0cb',
    borderColor: '#ffe08a',
  },
  pillActiveText: {
    color: '#d46b08',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pillInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f4f8',
  },
  pillInactiveText: {
    color: '#a0aab2',
    fontWeight: '600',
    fontSize: 14,
  },
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
    backgroundColor: '#ffb6c1',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});