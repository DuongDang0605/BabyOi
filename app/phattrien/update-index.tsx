import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
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
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerTitle: "Cập Nhật Chỉ Số",
        headerStyle: { backgroundColor: '#FFB6C1' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>
        ),
      }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Hướng dẫn nhỏ */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#FF8FAB" />
            <Text style={styles.infoText}>
              Nhập chỉ số mới nhất để AI phân tích biểu đồ tăng trưởng cho bé mẹ nhé!
            </Text>
          </View>

          {/* Form nhập liệu - Theo phong cách ảnh 2 */}
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

            {/* Vòng đầu (Thay cho Waist trong ảnh mẫu vì đây là App cho bé) */}
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

          {/* Nút Save - Màu Xanh Mint đồng bộ với Lịch sinh hoạt */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { padding: 25 },
  
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF0F3', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center',
    marginBottom: 30 
  },
  infoText: { 
    flex: 1, 
    marginLeft: 10, 
    color: '#FF8FAB', 
    fontSize: 13, 
    fontWeight: '600' 
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
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#EEE',
    paddingHorizontal: 15,
    height: 55,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  unitText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: '#98D8AA', // Màu xanh mint từ nút Lịch sinh hoạt
    height: 55,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    elevation: 4,
    shadowColor: '#98D8AA',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  cancelText: {
    color: '#AAA',
    fontWeight: '700',
    fontSize: 15,
  }
});