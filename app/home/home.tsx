import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';

export default function AppHomeScreen() {
  return (
    <>
      {/* Ẩn thanh Header mặc định có chữ home/home */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header: Thể hiện Core Value (Sự kết nối gia đình) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Gia đình bé Ốc 🐌</Text>
            <Text style={styles.name}>Tháng thứ 8</Text>
            <Text style={styles.syncStatus}>🟢 Bố và Mẹ đang đồng bộ</Text>
          </View>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3593/3593455.png' }} 
            style={styles.avatar} 
          />
        </View>

        {/* 2. Thẻ Cảnh báo (Actual Product - Theo dõi y tế) */}
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>💉 Lịch tiêm sắp tới</Text>
          <Text style={styles.alertSubtitle}>Mũi Sởi đơn (Lúc 9 tháng tuổi)</Text>
          <Text style={styles.alertDate}>Dự kiến: 15/04/2026</Text>
        </View>

        {/* 3. Lưới Tính năng cốt lõi (Actual Product) */}
        <Text style={styles.sectionTitle}>Chăm sóc bé</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridIcon}>📈</Text>
            <Text style={styles.gridText}>Biểu đồ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
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

        {/* 4. Banner Tính năng Premium (Augmented Product - AI) */}
        <TouchableOpacity style={styles.aiBanner}>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>✨ AI Trợ lý Dinh dưỡng</Text>
            <Text style={styles.aiDesc}>Chụp ảnh nguyên liệu, nhận ngay thực đơn ăn dặm cho bé 8 tháng.</Text>
          </View>
          <Text style={styles.aiButton}>Hỏi ngay</Text>
        </TouchableOpacity>

        {/* 5. Gợi ý mua sắm (Augmented Product - Affiliate) */}
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

        {/* Khoảng trống dưới cùng để vuốt không bị lẹm */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#4CAF50', // Màu xanh lá báo hiệu đang đồng bộ
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
    flexWrap: 'wrap', // Tự động rớt dòng
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  gridItem: {
    width: '47%', // 2 cột, mỗi cột chiếm 47%
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
  aiBanner: {
    backgroundColor: '#fff7e6', // Màu cam nhạt nổi bật
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ffd591',
  },
  aiContent: {
    flex: 1,
    marginRight: 10,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d46b08',
    marginBottom: 5,
  },
  aiDesc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  aiButton: {
    backgroundColor: '#ff9c6e',
    color: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    fontWeight: 'bold',
    overflow: 'hidden',
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
});