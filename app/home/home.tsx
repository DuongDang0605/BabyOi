import { Stack, router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const MAIN_FEATURES = [
  { id: '1', title: 'Phát triển', icon: 'https://png.pngtree.com/element_our/png_detail/20181205/health-sign-vector-icon-png_260808.jpg', route: '/phattrien/growth-charts' },
  { id: '2', title: 'Sổ tiêm', icon: 'https://static.vecteezy.com/system/resources/previews/004/256/068/non_2x/vaccine-icon-medicine-1-vector.jpg', route: '/lichtiem/listlichtiem' },
  { id: '3', title: 'Dinh dưỡng', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyM-d0xIGJgj4Bdg8OubgrFz-DY01YHsvIYQ&s', route: '/dinhduong/listdoan' },
  { id: '4', title: 'Nhật ký', icon: 'https://cdn-icons-png.flaticon.com/512/10052/10052984.png', route: '/nhatki/nhatki' },
];

const MORE_FEATURES = [
  { id: '5', title: 'Cửa hàng', icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png', route: '#' },
  { id: '6', title: 'Cẩm nang', icon: 'https://cdn-icons-png.flaticon.com/512/3306/3306613.png', route: '/camnang/camnang' }, // Đã thêm đường dẫn
  { id: '7', title: 'Đặt lịch khám', icon: 'https://cdn-icons-png.flaticon.com/512/3144/3144467.png', route: '/datlich/doctor-booking' },
];

export default function AppHomeScreen() {
  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* --- Header --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Chào mẹ bé Ốc! ✨</Text>
            <Text style={styles.name}>8 tháng tuổi</Text>
          </View>
          <View style={styles.avatarFrame}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png' }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* --- Alert Card --- */}
        <View style={styles.alertCard}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/9334/9334338.png' }} style={styles.alertIconAnime} />
          <View style={styles.alertTextContent}>
            <Text style={styles.alertTitle}>Lịch tiêm nhắc bé</Text>
            <Text style={styles.alertSubtitle}>Mũi Sởi đơn (Lúc 9 tháng)</Text>
            <View style={styles.alertDateBadge}>
              <Text style={styles.alertDateText}>Còn 30 ngày nữa!</Text>
            </View>
          </View>
        </View>

        {/* --- PHẦN 1: 4 CHỨC NĂNG CHÍNH --- */}
        <Text style={styles.sectionTitle}>Chăm sóc bé 🧸</Text>
        <View style={styles.gridContainer}>
          {MAIN_FEATURES.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              onPress={() => item.route !== '#' && router.push(item.route as any)}
            >
              <Image source={{ uri: item.icon }} style={styles.mainIcon} />
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- PHẦN 2: TIỆN ÍCH THÊM (ĐÃ SỬA LỖI BẤM) --- */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Tiện ích thêm ✨</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {MORE_FEATURES.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.slideItem}
              // THÊM DÒNG NÀY ĐỂ BẤM ĐƯỢC:
              onPress={() => item.route !== '#' && router.push(item.route as any)}
            >
              <View style={styles.slideIconCircle}>
                <Image source={{ uri: item.icon }} style={styles.slideIcon} />
              </View>
              <Text style={styles.slideText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- Tip Box --- */}
        <View style={styles.tipCard}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.tipSticker} />
            <Text style={styles.tipText}>Mẹ ơi, bé đang vào giai đoạn tập bò, mẹ nhớ che các ổ điện nhé!</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- Floating AI Button --- */}
      <TouchableOpacity style={styles.floatingAiButton} onPress={() => router.push('/AI/chatboxAI')}>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8652/8652230.png' }} style={styles.aiIconAnime} />
        <Text style={styles.aiLabel}>Hỏi AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContainer: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 25 },
  greeting: { fontSize: 16, color: '#5C7A8A', fontWeight: '600' },
  name: { fontSize: 28, fontWeight: '900', color: '#FF8FAB' },
  avatar: { width: 65, height: 65, borderRadius: 33, borderWidth: 3, borderColor: '#FFB6C1' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#2E7D32', borderWidth: 2, borderColor: '#FEF9F3' },
  avatarFrame: { position: 'relative' },

  alertCard: { backgroundColor: '#FFB6C1', padding: 18, borderRadius: 30, marginBottom: 25, flexDirection: 'row', alignItems: 'center' },
  alertIconAnime: { width: 50, height: 50, marginRight: 12 },
  alertTextContent: { flex: 1 },
  alertTitle: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  alertSubtitle: { fontSize: 13, color: '#FFF', marginBottom: 5 },
  alertDateBadge: { backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  alertDateText: { fontSize: 11, color: '#FF8FAB', fontWeight: '900' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', marginBottom: 15 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: { 
    width: '47%', 
    backgroundColor: '#FFF', 
    paddingVertical: 20, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#A7E4F5',
    shadowOpacity: 0.1,
  },
  mainIcon: { width: 60, height: 60, marginBottom: 8, resizeMode: 'contain' },
  gridText: { fontSize: 15, fontWeight: '800', color: '#5C7A8A' },

  horizontalScrollContent: { paddingRight: 20, paddingBottom: 10 },
  slideItem: { width: 100, alignItems: 'center', marginRight: 15 },
  slideIconCircle: { 
    width: 70, 
    height: 70, 
    borderRadius: 25, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05
  },
  slideIcon: { width: 40, height: 40, resizeMode: 'contain' },
  slideText: { fontSize: 12, fontWeight: '700', color: '#5C7A8A', textAlign: 'center' },

  tipCard: { backgroundColor: '#E8F9ED', padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  tipSticker: { width: 40, height: 40, marginRight: 12 },
  tipText: { flex: 1, fontSize: 13, color: '#2E7D32', fontWeight: '600' },

  floatingAiButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#FFB6C1', paddingHorizontal: 20, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  aiIconAnime: { width: 30, height: 30, marginRight: 8 },
  aiLabel: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});