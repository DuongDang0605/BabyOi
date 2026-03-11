import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'; // Công cụ gọi xe "chuyển trang"

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2998/2998035.png' }} 
          style={styles.logo}
        />
        <Text style={styles.title}>BabyOi 👶</Text>
        <Text style={styles.subtitle}>Sổ tay dinh dưỡng cho mẹ và bé</Text>

        {/* Nút bấm đã được gài sẵn lệnh chuyển sang thư mục auth/login */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Bắt đầu ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#a7e4f5', // Xanh thiên thanh
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBox: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  button: {
    backgroundColor: '#a7e4f5',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});