import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'; 

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        {/* Logo bừa nhưng vẫn rất cute hợp tone */}
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3144/3144883.png' }} 
          style={styles.logo}
        />
        <Text style={styles.title}>BabyOi ✨</Text>
        <Text style={styles.subtitle}>Sổ tay sức khỏe & dinh dưỡng{"\n"}dành cho Mẹ và Bé</Text>

        {/* Nút bấm chuyển sang Login đã được đồng bộ UI */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Bắt đầu ngay</Text>
        </TouchableOpacity>
      </View>
      
      {/* Họa tiết trang trí ở dưới đáy (tùy chọn) */}
      <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2632/2632839.png' }} 
        style={styles.bottomDecoration} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fef9f3', // ĐỒNG BỘ: Nền kem sữa pastel
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBox: {
    backgroundColor: '#ffffff',
    padding: 35,
    borderRadius: 35, // Bo tròn cực mạnh
    alignItems: 'center',
    width: '85%',
    borderWidth: 2,
    borderColor: '#f0f4f8', // Viền mây nhạt
    // Bóng đổ màu hồng pastel
    shadowColor: '#ffb6c1', 
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 2,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 25,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ff8fab', // ĐỒNG BỘ: Hồng pastel đậm
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#5c7a8a', // ĐỒNG BỘ: Xanh xám dịu mắt
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#ff8fab', // ĐỒNG BỘ: Nút hồng phấn
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 35,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: -20,
    width: 150,
    height: 150,
    opacity: 0.5, // Làm mờ đi để làm nền
    zIndex: 1,
  }
});