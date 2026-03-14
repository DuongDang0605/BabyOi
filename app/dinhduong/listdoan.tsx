import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

interface Dish {
  id: string;
  name: string;
  desc: string;
  rating: number;
  image: string;
  tag: string;
}

const DISHES: Dish[] = [
  { 
    id: '1', 
    name: 'Salad Ức Gà Áp Chảo', 
    desc: 'Giàu đạm, ít béo giúp mẹ hồi dáng và chắc khỏe.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop',
    tag: 'Cho Mẹ'
  },
  { 
    id: '2', 
    name: 'Cháo Cá Hồi Măng Tây', 
    desc: 'DHA từ cá hồi giúp bé thông minh qua sữa mẹ.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=500&auto=format&fit=crop',
    tag: 'Cho Mẹ'
  },
  { 
    id: '3', 
    name: 'Canh Rong Biển Đậu Hũ', 
    desc: 'Thanh nhiệt, lợi sữa và cực kỳ nhẹ bụng.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500&auto=format&fit=crop',
    tag: 'Cho Mẹ'
  },
  { 
    id: '4', 
    name: 'Súp Bí Đỏ Kem Tươi', 
    desc: 'Vị ngọt dịu, dễ nuốt, bổ sung Vitamin A cho mắt bé.', 
    rating: 5, 
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=500&auto=format&fit=crop',
    tag: 'Cho Bé'
  },
  { 
    id: '5', 
    name: 'Bơ Nghiền Trứng Chần', 
    desc: 'Chất béo tốt hỗ trợ bé tăng cân và phát triển não bộ.', 
    rating: 4, 
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500&auto=format&fit=crop',
    tag: 'Cho Bé'
  },
];

export default function ChooseDishScreen() {
  const renderItem = ({ item }: { item: Dish }) => (
    <TouchableOpacity 
      style={styles.dishCard} 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/dinhduong/analyze-dish", params: { name: item.name } })}
    >
      <View style={styles.imageBox}>
        <Image source={{ uri: item.image }} style={styles.dishImage} />
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
        <View style={styles.favIcon}>
          <Ionicons name="heart" size={16} color="#FF8FAB" />
        </View>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.dishDesc} numberOfLines={2}>{item.desc}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.starRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="star" size={10} color={i < item.rating ? "#FFB800" : "#FFE5EC"} />
            ))}
          </View>
          <View style={styles.plusBtn}>
            <Ionicons name="add" size={18} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={DISHES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            {/* --- HEADER CHUẨN ĐỒNG BỘ GỘP VỚI SEARCH --- */}
            <View style={styles.headerPinkBg}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thực Đơn Healthy</Text>
                <View style={{ width: 45 }} />
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#FF8FAB" />
                <TextInput 
                  placeholder="Tìm món ngon cho mẹ và bé..." 
                  style={styles.searchInput} 
                  placeholderTextColor="#FFB6C1" 
                />
              </View>
            </View>

            {/* --- CỤM NÚT ĐIỀU HƯỚNG --- */}
            <View style={styles.navigationSection}>
              <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => router.push('/dinhduong/favorite-dishes')}
              >
                <View style={[styles.navIconBg, { backgroundColor: '#FF8FAB' }]}>
                  <Ionicons name="heart" size={20} color="#FFF" />
                </View>
                <Text style={styles.navButtonText}>Món ăn yêu thích</Text>
                <Ionicons name="chevron-forward" size={18} color="#FF8FAB" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                  style={[styles.navButton, { marginTop: 12 }]} 
                  onPress={() => router.push('/dinhduong/meal-plan')} 
              >
                <View style={[styles.navIconBg, { backgroundColor: '#FF8FAB' }]}>
                  <Ionicons name="calendar" size={20} color="#FFF" />
                </View>
                <Text style={styles.navButtonText}>Meal Plan của mẹ</Text>
                <Ionicons name="chevron-forward" size={18} color="#FF8FAB" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  
  /* --- HEADER CHUẨN ĐỒNG BỘ --- */
  headerPinkBg: {
    backgroundColor: '#FFB6C1', 
    paddingTop: 10, // Thêm đệm phía trên để đẩy nội dung xuống
    paddingBottom: 25,
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50, // Tăng từ 40 lên 50 để né camera notch sâu hơn
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 45, 
  },
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF', 
    letterSpacing: 0.5,
  },
  searchContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 50,
    marginHorizontal: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#5C7A8A' },
  
  navigationSection: { paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.15,
  },
  navIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#FF8FAB',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5C7A8A',
    marginLeft: 25,
    marginBottom: 15,
  },

  listPadding: { paddingBottom: 30 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  dishCard: { 
    backgroundColor: '#FFF', 
    width: cardWidth, 
    borderRadius: 30, 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#FFB6C1', 
    shadowOpacity: 0.15, 
    shadowRadius: 8 
  },
  imageBox: { height: 120, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  dishImage: { width: '100%', height: '100%' },
  tagBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255, 143, 171, 0.9)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tagText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  favIcon: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', padding: 5, borderRadius: 15 },
  infoBox: { padding: 12 },
  dishName: { fontSize: 14, fontWeight: '900', color: '#FF8FAB' },
  dishDesc: { fontSize: 10, color: '#5C7A8A', marginVertical: 6, height: 30, lineHeight: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  starRow: { flexDirection: 'row' },
  plusBtn: { backgroundColor: '#FFB6C1', borderRadius: 8, padding: 3 },
});