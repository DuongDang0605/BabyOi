import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <Text style={styles.subtitle}>Chào mừng mẹ bầu quay lại BabyOi!</Text>

      {/* 1. Ô nhập Email */}
      <TextInput 
        style={styles.input} 
        placeholder="Nhập email của mẹ" 
        keyboardType="email-address" // Mở bàn phím có sẵn nút @
      />

      {/* 2. Ô nhập Mật khẩu */}
      <TextInput 
        style={styles.input} 
        placeholder="Nhập mật khẩu" 
        secureTextEntry={true} // Biến chữ thành dấu chấm đen bảo mật
      />

      {/* 3. Nút Xác nhận */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Nền trắng tinh khôi
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a7e4f5', // Điểm nhấn màu xanh
    marginBottom: 10,
    textAlign: 'center', // Căn giữa chữ
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5', // Xám nhạt cho ô nhập liệu
    padding: 15,
    borderRadius: 10, // Bo góc nhẹ
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#a7e4f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});