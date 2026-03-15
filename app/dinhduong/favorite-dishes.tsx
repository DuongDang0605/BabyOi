import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Dish {
  id: string;
  name: string;
  desc: string;
  image: string;
  calories: number;
  tag: string;
}

export default function FavoriteDishesScreen() {
  const [favorites, setFavorites] = useState<Dish[]>([
    { id: '1', name: 'Salad Ức Gà Áp Chảo', desc: 'Giàu đạm, hỗ trợ mẹ hồi dáng.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', calories: 350, tag: 'Cho Mẹ' },
    { id: '2', name: 'Cháo Cá Hồi Măng Tây', desc: 'DHA tốt cho trí não của bé.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500', calories: 420, tag: 'Cho Bé' },
    { id: '3', name: 'Canh Rong Biển Đậu Hũ', desc: 'Thanh mát, lợi sữa cho mẹ.', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', calories: 180, tag: 'Cho Mẹ' },
    { id: '4', name: 'Súp Bí Đỏ Kem Tươi', desc: 'Vitamin A cho đôi mắt bé sáng.', image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=500', calories: 250, tag: 'Cho Bé' },
    { id: '5', name: 'Bơ Nghiền Trứng Chần', desc: 'Chất béo tốt cho sự phát triển.', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500', calories: 310, tag: 'Cho Bé' },
    { id: '6', name: 'Tôm Rim Tỏi Đen', desc: 'Tăng sức đề kháng cho gia đình.', image: 'https://images.unsplash.com/photo-1559743393-3249a2d8d8e0?w=500', calories: 290, tag: 'Cho Mẹ' },
    { id: '7', name: 'Mì Ý Sốt Bò Bằm', desc: 'Bữa trưa năng lượng cho bé.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500', calories: 450, tag: 'Cho Bé' },
    { id: '8', name: 'Cá Tuyết Hấp Gừng', desc: 'Ít béo, giàu khoáng chất cho mẹ.', image: 'https://images.unsplash.com/photo-1534604973900-c41ab4c5d4b0?w=500', calories: 220, tag: 'Cho Mẹ' },
    { id: '9', name: 'Sinh Tố Chuối Yến Mạch', desc: 'Bữa phụ nhanh gọn, giàu xơ.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', calories: 280, tag: 'Cho Bé' },
    { id: '10', name: 'Thịt Viên Sốt Cà Chua', desc: 'Mềm, dễ nhai, bé nào cũng mê.', image: 'https://images.unsplash.com/photo-1529042410759-bc8264164741?w=500', calories: 380, tag: 'Cho Bé' },
  ]);

  const [showAIModal, setShowAIModal] = useState(false);
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    if (showAIModal) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setTimeout(() => {
            setShowAIModal(false);
            router.push('/dinhduong/meal-plan'); 
          }, 500);
        }
      });
    }
  }, [showAIModal]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity 
      style={styles.favCard}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: "/dinhduong/analyze-dish", params: { name: item.name } })}
    >
      <Image source={{ uri: item.image }} style={styles.favImage} />
      <View style={styles.infoContainer}>
        <View style={styles.tagRow}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishDesc} numberOfLines={1}>{item.desc}</Text>
        <View style={styles.statsRow}>
          <Ionicons name="flame-outline" size={14} color="#FF8FAB" />
          <Text style={styles.statsText}>{item.calories} kcal</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.removeBtn}>
        <Ionicons name="heart" size={24} color="#FF8FAB" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Món Yêu Thích</Text>
              
              <View style={{ width: 45 }} />
            </View>

            {/* --- AI SECTION --- */}
            <View style={styles.aiSection}>
              <TouchableOpacity 
                style={styles.aiButton}
                activeOpacity={0.8}
                onPress={() => setShowAIModal(true)}
              >
                <View style={styles.aiIconCircle}>
                  <Ionicons name="sparkles" size={20} color="#FFF" />
                </View>
                <View style={styles.aiTextContent}>
                  <Text style={styles.aiBtnTitle}>AI Build lịch ăn uống</Text>
                  <Text style={styles.aiBtnSub}>Lên thực đơn 7 ngày từ món yêu thích</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.listSectionTitle}>Danh sách của mẹ</Text>
          </View>
        )}
      />

      {/* --- CUSTOM BEAUTIFUL MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showAIModal}
        onRequestClose={() => setShowAIModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Ionicons name="color-wand" size={40} color="#FF8FAB" />
            </View>
            
            <Text style={styles.modalTitle}>Đang khởi tạo thực đơn...</Text>
            <Text style={styles.modalSub}>
              AI đang phân tích dinh dưỡng để thiết lập lộ trình ăn uống tối ưu cho 7 ngày tới.
            </Text>

            <View style={styles.loadingBarContainer}>
              <Animated.View style={[styles.loadingBarActive, { width: progressWidth }]} />
            </View>

            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setShowAIModal(false)}
            >
              <Text style={styles.closeModalText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  
 /* --- HEADER CHUẨN ĐỒNG BỘ - ĐÃ TĂNG KHOẢNG CÁCH --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 65, // Tăng lên 65 để đảm bảo né mọi loại Notch/Dynamic Island
    marginBottom: 20,
    paddingHorizontal: 0,
    paddingTop: 5, // Thêm đệm nhẹ phía trên chữ
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 45, 
    height: 45, // Tạo khung bấm rộng hơn cho dễ thao tác
  },
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
  },

  aiSection: { paddingVertical: 10, marginBottom: 15 },
  aiButton: {
    backgroundColor: '#FF8FAB',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#FF8FAB',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  aiIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  aiTextContent: { flex: 1 },
  aiBtnTitle: { color: '#FFF', fontSize: 17, fontWeight: '900' },
  aiBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', marginTop: 2 },

  listSectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15 },
  listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
  
  favCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 25, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: 'center', 
    elevation: 4, 
    shadowColor: '#FFB6C1', 
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: '#f0f4f8'
  },
  favImage: { width: 85, height: 85, borderRadius: 20 },
  infoContainer: { flex: 1, marginLeft: 15 },
  tagRow: { backgroundColor: '#FFF0F3', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  tagText: { color: '#FF8FAB', fontSize: 9, fontWeight: '800' },
  dishName: { fontSize: 16, fontWeight: '900', color: '#5C7A8A' },
  dishDesc: { fontSize: 12, color: '#999', marginVertical: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontSize: 12, color: '#FF8FAB', fontWeight: '700', marginLeft: 4 },
  removeBtn: { padding: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 35, padding: 25, alignItems: 'center', elevation: 20 },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: -60, borderWidth: 5, borderColor: '#FEF9F3' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', textAlign: 'center', marginBottom: 10 },
  modalSub: { fontSize: 14, color: '#5C7A8A', textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  loadingBarContainer: { width: '100%', height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden', marginBottom: 25 },
  loadingBarActive: { height: '100%', backgroundColor: '#FFB6C1', borderRadius: 4 },
  closeModalBtn: { backgroundColor: '#FFB6C1', paddingHorizontal: 35, paddingVertical: 12, borderRadius: 25, width: '100%', alignItems: 'center' },
  closeModalText: { color: '#FFF', fontWeight: '900', fontSize: 14 }
});