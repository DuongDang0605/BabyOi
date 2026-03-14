import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddVaccineSelectedScreen() {
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm Mũi Tiêm</Text>
        </View>

        {/* 1. Khung Tên Vắc-xin (ĐÃ ĐIỀN CÚM MÙA) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>💉 </Text> Tên vắc-xin / Bệnh
          </Text>
          <TextInput 
            style={[styles.inputRounded, styles.inputCompleted]} 
            value="Cúm mùa (Vaxigrip Tetra)"
            editable={false} 
          />
        </View>

        {/* 2. KHUNG AI GỢI Ý (LOGIC MŨI CÚM) */}
        <View style={styles.aiSuggestionCard}>
          <Text style={styles.aiSuggestionTitle}>✨ Chuyên gia AI phân tích:</Text>
          <Text style={styles.aiSuggestionText}>
            Vì bé Ốc đang <Text style={styles.textHighlight}>8 tháng tuổi</Text> (lần đầu tiên tiêm Cúm), phác đồ chuẩn yêu cầu bé cần tiêm <Text style={styles.textHighlight}>2 mũi cách nhau 1 tháng</Text>.{'\n\n'}Mẹ nên cho bé tiêm Mũi 1 sớm vào khoảng <Text style={styles.textHighlight}>16/03/2026</Text> (tuần này) nhé! 🛡️
          </Text>
          <TouchableOpacity style={styles.applyAiButton}>
            <Text style={styles.applyAiButtonText}>👉 Áp dụng ngày: 16/03/2026</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Khung Ngày tiêm */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📅 </Text> Ngày tiêm (hoặc dự kiến)
          </Text>
          <TextInput 
            style={styles.inputRounded} 
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#b0bec5"
            keyboardType="numeric"
          />
        </View>

        {/* 4. Chọn Trạng thái */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>⭐ </Text> Trạng thái
          </Text>
          <View style={styles.pillContainer}>
            <TouchableOpacity style={[styles.pillButton, styles.pillInactive]}>
              <Text style={styles.pillInactiveText}>Đã tiêm ✅</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.pillButton, styles.pillActive]}>
              <Text style={styles.pillActiveText}>Sắp tới ⏳</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Ghi chú */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📝 </Text> Ghi chú của mẹ
          </Text>
          <TextInput 
            style={[styles.inputRounded, styles.textArea]} 
            placeholder="VD: Bé hơi sốt nhẹ vào buổi tối..."
            placeholderTextColor="#b0bec5"
            multiline={true}
          />
        </View>

        <View style={styles.decorationContainer}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2632/2632839.png' }} style={styles.bottomSticker} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Nút Lưu lại nổi bật ở đáy */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💖 Lưu vào Sổ Tiêm</Text>
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40, 
    marginBottom: 30,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5c7a8a', 
    marginBottom: 10,
    marginLeft: 5,
  },
  labelSticker: {
    fontSize: 18,
  },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25, 
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inputCompleted: {
    backgroundColor: '#f0fbff', 
    borderColor: '#a7e4f5',
    fontWeight: 'bold',
    color: '#005b7f',
  },
  aiSuggestionCard: {
    backgroundColor: '#f0f7ff', 
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1.5,
    borderColor: '#cce3ff',
    borderStyle: 'dashed', 
  },
  aiSuggestionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#005b7f',
    marginBottom: 8,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: '#445566',
    lineHeight: 22,
  },
  textHighlight: {
    fontWeight: 'bold',
    color: '#d46b08', 
  },
  applyAiButton: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#cce3ff',
  },
  applyAiButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#005b7f',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top', 
    borderRadius: 20,
  },
  pillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
  },
  pillActive: {
    backgroundColor: '#fff0cb', 
    borderColor: '#ffe08a',
    marginLeft: 10,
  },
  pillActiveText: {
    color: '#d46b08',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pillInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f4f8',
    marginRight: 10,
  },
  pillInactiveText: {
    color: '#a0aab2',
    fontWeight: '600',
    fontSize: 15,
  },
  decorationContainer: {
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  bottomSticker: {
    width: 80,
    height: 80,
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
    backgroundColor: '#ff8fab', 
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