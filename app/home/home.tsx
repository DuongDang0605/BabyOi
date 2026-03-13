import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';

export default function AppHomeScreen() {
  return (
    <View style={styles.mainContainer}>
      
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Gia đình bé Ốc 🐌</Text>
            <Text style={styles.name}>8 tháng tuổi</Text>
            <Text style={styles.syncStatus}>🟢 Bố và Mẹ đang đồng bộ</Text>
          </View>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} 
            style={styles.avatar} 
          />
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>💉 Lịch tiêm sắp tới</Text>
          <Text style={styles.alertSubtitle}>Mũi Sởi đơn (Lúc 9 tháng tuổi)</Text>
          <Text style={styles.alertDate}>Dự kiến: 15/04/2026</Text>
        </View>

        <Text style={styles.sectionTitle}>Chăm sóc bé</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridIcon}>📈</Text>
            <Text style={styles.gridText}>Biểu đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => router.push('/lichtiem/listlichtiem')}
          >
            <Text style={styles.gridIcon}>📖</Text>
            <Text style={styles.gridText}>Sổ tiêm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridIcon}>📸</Text>
            <Text style={styles.gridText}>Nhật ký</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridIcon}>📚</Text>
            <Text style={styles.gridText}>Cẩm nang</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Dành cho bé 8 tháng</Text>
        <View style={styles.affiliateCard}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png' }} 
            style={styles.productImage} 
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>Bánh ăn dặm hữu cơ</Text>
            <Text style={styles.productDesc}>Giúp bé tập nhai, an toàn tuyệt đối</Text>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Xem ưu đãi</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingAiButton}
        onPress={() => router.push('/AI/chatboxAI')}
      >
        <Text style={styles.floatingAiIcon}>✨</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  syncStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    fontWeight: '600',
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#a7e4f5',
    borderWidth: 2,
    borderColor: '#a7e4f5',
  },
  alertCard: {
    backgroundColor: '#a7e4f5',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005b7f',
    marginBottom: 8,
  },
  alertSubtitle: {
    fontSize: 15,
    color: '#00425c',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 14,
    color: '#005b7f',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#f8f9fa',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
  },
  affiliateCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eeeeee',
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 10,
  },
  buyButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  floatingAiButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#ff9c6e',
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d46b08',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6, 
  },
  floatingAiIcon: {
    fontSize: 30,
  },
});