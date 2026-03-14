import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function UpdateIndexScreen() {
  // Quản lý trạng thái nhập liệu
  const [height, setHeight] = useState('100');
  const [weight, setWeight] = useState('15');
  const [headCircumference, setHeadCircumference] = useState('45');

  const handleSave = () => {
    Alert.alert("Thành công", "Chỉ số của bé đã được cập nhật!");
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Tắt Header mặc định */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="close" size={28} color="#ff8fab" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Cập Nhật Chỉ Số</Text>
            
            {/* Cục tạ 45px cân bằng với nút Close để chữ vào giữa */}
            <View style={{ width: 45 }} />
          </View>

          {/* Hướng dẫn nhỏ */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#FF8FAB" />
            <Text style={styles.infoText}>
              Nhập chỉ số mới nhất để AI phân tích biểu đồ tăng trưởng cho bé mẹ nhé!
            </Text>
          </View>

          {/* Form nhập liệu */}
          <View style={styles.form}>
            
            {/* Chiều cao */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chiều cao (cm)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 100"
                />
                <Text style={styles.unitText}>(cm)</Text>
              </View>
            </View>

            {/* Cân nặng */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 15"
                />
                <Text style={styles.unitText}>(kg)</Text>
              </View>
            </View>

            {/* Vòng đầu */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vòng đầu (cm)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={headCircumference}
                  onChangeText={setHeadCircumference}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 45"
                />
                <Text style={styles.unitText}>(cm)</Text>
              </View>
            </View>

          </View>

          {/* Nút Save - Màu Xanh Mint đồng bộ */}
          <TouchableOpacity 
            style={styles.saveButton} 
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Lưu chỉ số</Text>
            <Ionicons name="checkmark-circle" size={22} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Hủy bỏ</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' }, // Màu kem đồng bộ toàn app
  scrollContent: { padding: 20 },

  /* --- HEADER CHUẨN ĐỒNG BỘ --- */
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
  
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF0F3', 
    padding: 15, 
    borderRadius: 20, 
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE5EC'
  },
  infoText: { 
    flex: 1, 
    marginLeft: 10, 
    color: '#FF8FAB', 
    fontSize: 13, 
    fontWeight: '700' 
  },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#5C7A8A',
    marginLeft: 5 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    paddingHorizontal: 15,
    height: 60,
    elevation: 2,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  unitText: {
    color: '#999',
    fontWeight: '700',
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: '#98D8AA', 
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    elevation: 5,
    shadowColor: '#98D8AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  cancelText: {
    color: '#AAA',
    fontWeight: '700',
    fontSize: 15,
  }
});