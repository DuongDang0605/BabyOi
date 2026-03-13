import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppHomeScreen() {
  return (
    <View style={styles.mainContainer}>
      {/* Ẩn Header mặc định của Stack */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* --- Header: Thông tin bé --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Chào mẹ bé Ốc! ✨</Text>
            <Text style={styles.name}>8 tháng tuổi</Text>
          </View>
          <View style={styles.avatarFrame}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png' }} 
              style={styles.avatar} 
            />
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* --- Alert Card: Thông báo tiêm chủng --- */}
        <View style={styles.alertCard}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/9334/9334338.png' }} 
            style={styles.alertIconAnime}
          />
          <View style={styles.alertTextContent}>
            <Text style={styles.alertTitle}>Lịch tiêm nhắc bé</Text>
            <Text style={styles.alertSubtitle}>Mũi Sởi đơn (Lúc 9 tháng)</Text>
            <View style={styles.alertDateBadge}>
                <Text style={styles.alertDateText}>Còn 30 ngày nữa mẹ nhé!</Text>
            </View>
          </View>
        </View>

        {/* --- Section Header: Góc của bé yêu --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Góc của bé yêu 🧸</Text>
          <TouchableOpacity 
            style={styles.listButton}
            activeOpacity={0.7}
          >
            <Text style={styles.listButtonText}>Xem tất cả</Text>
            <Ionicons name="grid-outline" size={14} color="#FF8FAB" />
          </TouchableOpacity>
        </View>
        
        {/* --- Grid Menu: 4 chức năng chính --- */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem}>
            <Image 
              source={{ uri:'https://png.pngtree.com/element_our/png_detail/20181205/health-sign-vector-icon-png_260808.jpg' }} 
              style={styles.mainIcon}
            />
            <Text style={styles.gridText}>Phát triển</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => router.push('/lichtiem/listlichtiem')}
          >
            <Image 
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/004/256/068/non_2x/vaccine-icon-medicine-1-vector.jpg' }} 
              style={styles.mainIcon}
            />
            <Text style={styles.gridText}>Sổ tiêm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}
            onPress={() => router.push('/dinhduong/listdoan')}>
            <Image 
              source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyM-d0xIGJgj4Bdg8OubgrFz-DY01YHsvIYQ&s' }} 
              style={styles.mainIcon}
            />
            <Text style={styles.gridText}>Dinh dưỡng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/10052/10052984.png' }} 
              style={styles.mainIcon}
            />
            <Text style={styles.gridText}>Nhật ký</Text>
          </TouchableOpacity>
        </View>

        {/* --- Tip Box: Lời nhắn dễ thương --- */}
        <View style={styles.tipCard}>
           <Image 
             source={{ uri: 'https://cdn-icons-png.flaticon.com/512/461/461141.png' }} 
             style={styles.tipSticker}
           />
           <Text style={styles.tipText}>Mẹ ơi, hôm nay bé đã biết "ê a" theo tiếng mẹ gọi rồi đấy!</Text>
        </View>

        {/* Khoảng trống cuối để không bị che bởi nút AI */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- Floating AI Button --- */}
      <TouchableOpacity 
        style={styles.floatingAiButton}
        activeOpacity={0.9}
        onPress={() => router.push('/AI/chatboxAI')}
      >
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8652/8652230.png' }} 
          style={styles.aiIconAnime}
        />
        <Text style={styles.aiLabel}>Hỏi AI</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FEF9F3', // Màu nền kem sữa
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: '#5C7A8A',
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF8FAB',
  },
  avatarFrame: {
    position: 'relative',
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: '#FFB6C1',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: '#FEF9F3',
  },
  alertCard: {
    backgroundColor: '#FFB6C1',
    padding: 18,
    borderRadius: 30,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  alertIconAnime: {
    width: 55,
    height: 55,
    marginRight: 15,
  },
  alertTextContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 6,
  },
  alertDateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  alertDateText: {
    fontSize: 12,
    color: '#FF8FAB',
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF8FAB',
  },
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFE5EC',
  },
  listButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF8FAB',
    marginRight: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 25,
    borderRadius: 35,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainIcon: {
    width: 70,
    height: 70,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  gridText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5C7A8A',
  },
  tipCard: {
    backgroundColor: '#E8F9ED', 
    padding: 18,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C1F0D0',
  },
  tipSticker: {
    width: 45,
    height: 45,
    marginRight: 15,
  },
  tipText: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  floatingAiButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FFB6C1',
    paddingHorizontal: 25,
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  aiIconAnime: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  aiLabel: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
});