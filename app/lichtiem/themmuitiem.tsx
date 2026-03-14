import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddVaccineScreen() {
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* 1. Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm Mũi Tiêm</Text>
        </View>

        {/* 2. Khung Tên Vắc-xin KÈM DROPDOWN GỢI Ý CHI TIẾT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>💉 </Text> Tên vắc-xin / Bệnh phòng ngừa
          </Text>
          
          <View style={styles.dropdownWrapper}>
            {/* Đổi chữ đang gõ thành "Cúm" */}
            <TextInput 
              style={[styles.inputRounded, styles.inputActive]} 
              value="Cúm"
              placeholderTextColor="#b0bec5"
            />
            
            <View style={styles.dropdownBox}>
              
              {/* Lựa chọn 1: Cúm Vaxigrip (Pháp) */}
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => router.push('/lichtiem/themmuitiemhoanthien')}
              >
                <Text style={styles.dropdownText}>
                  💉 <Text style={styles.textBold}>Cúm</Text> mùa (Vaxigrip Tetra)
                </Text>
                <Text style={styles.dropdownSubtext}>
                  (Cho bé từ 6 tháng tuổi - Mũi 1)
                </Text>
              </TouchableOpacity>
              
              {/* Lựa chọn 2: Cúm Influvac (Hà Lan) */}
              <TouchableOpacity style={styles.dropdownItem}>
                <Text style={styles.dropdownText}>
                  💉 <Text style={styles.textBold}>Cúm</Text> mùa (Influvac Tetra)
                </Text>
                <Text style={styles.dropdownSubtext}>
                  (Cho bé từ 6 tháng tuổi - Mũi 1)
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.dropdownItem, styles.dropdownCreateNew]}>
                <Text style={styles.dropdownCreateText}>✨ + Tạo mới mũi tiêm: "Cúm"</Text>
              </TouchableOpacity>

            </View>
          </View>
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
            <TouchableOpacity style={[styles.pillButton, styles.pillActive]}>
              <Text style={styles.pillActiveText}>Đã tiêm ✅</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.pillButton, styles.pillInactive]}>
              <Text style={styles.pillInactiveText}>Sắp tới ⏳</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Khung Ghi chú */}
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

        <View style={{ height: 100 }} />
      </ScrollView>

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
    marginBottom: 25,
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
  dropdownWrapper: {
    zIndex: 10,
  },
  inputActive: {
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderColor: '#a7e4f5',
  },
  dropdownBox: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#a7e4f5',
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  dropdownText: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 4, 
  },
  dropdownSubtext: {
    fontSize: 13,
    color: '#8899aa', 
    fontStyle: 'italic',
  },
  textBold: {
    fontWeight: 'bold',
    color: '#ff8fab',
  },
  dropdownCreateNew: {
    backgroundColor: '#fef0f4',
    borderBottomWidth: 0,
  },
  dropdownCreateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d6336c',
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
    backgroundColor: '#c1f0d0', 
    borderColor: '#a3d9b1',
    marginRight: 10,
  },
  pillActiveText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pillInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f4f8',
    marginLeft: 10,
  },
  pillInactiveText: {
    color: '#a0aab2',
    fontWeight: '600',
    fontSize: 15,
  },
  decorationContainer: {
    alignItems: 'center',
    marginTop: 20,
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
    backgroundColor: 'rgba(254, 249, 243, 0.9)', 
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