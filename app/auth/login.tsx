import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';

export default function LoginScreen() {
  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* --- KHU VỰC TIÊU ĐỀ & LOGO --- */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/logo1.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Đăng Nhập</Text>
          <Text style={styles.subtitle}>Chào mừng mẹ đã quay lại với BabyOi! ✨</Text>
        </View>

        {/* --- KHU VỰC NHẬP LIỆU --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📧 Email của mẹ</Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="VD: mebau@gmail.com"
            placeholderTextColor="#b0bec5"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🔒 Mật khẩu</Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="Nhập mật khẩu..."
            placeholderTextColor="#b0bec5"
            secureTextEntry={true}
          />
          {/* Nút quên mật khẩu */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* --- NÚT XÁC NHẬN CHÍNH --- */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/home/home')} // Nhớ sửa đường dẫn này đúng với file home của bạn
        >
          <Text style={styles.loginButtonText}>Đăng Nhập 💖</Text>
        </TouchableOpacity>

        {/* --- DẢI PHÂN CÁCH --- */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>
          <View style={styles.line} />
        </View>

        {/* --- NÚT ĐĂNG NHẬP MẠNG XÃ HỘI --- */}
        <View style={styles.socialContainer}>
          {/* Nút Google */}
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          {/* Nút Facebook */}
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* --- NÚT ĐĂNG KÝ (DÀNH CHO NGƯỜI MỚI) --- */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Mẹ chưa có tài khoản? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3', // Nền kem sữa pastel đồng bộ
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  /* --- TIÊU ĐỀ --- */
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ff8fab', // Hồng pastel đậm
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#5c7a8a', // Xanh xám dịu mắt
    textAlign: 'center',
    fontWeight: '600',
  },
  /* --- NHẬP LIỆU --- */
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5c7a8a',
    marginBottom: 8,
    marginLeft: 5,
  },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25, // Bo tròn mạnh
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    // Bóng đổ nhẹ
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 5,
  },
  forgotText: {
    fontSize: 14,
    color: '#ff8fab',
    fontWeight: 'bold',
  },
  /* --- NÚT ĐĂNG NHẬP --- */
  loginButton: {
    backgroundColor: '#ff8fab', // Nút hồng phấn
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  /* --- DẢI PHÂN CÁCH --- */
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#f0f4f8',
  },
  orText: {
    marginHorizontal: 15,
    color: '#8899aa',
    fontSize: 14,
    fontWeight: '600',
  },
  /* --- MẠNG XÃ HỘI --- */
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    width: '47%',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5c7a8a',
  },
  /* --- ĐĂNG KÝ --- */
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  registerText: {
    fontSize: 15,
    color: '#5c7a8a',
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ff8fab', // Chữ Đăng ký màu hồng nhấn mạnh
  },
});