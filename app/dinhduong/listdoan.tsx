import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

const DISHES = [
  { id: 'b1', name: 'Súp Bí Đỏ Nghiền (6m+)', desc: 'Mịn màng, giàu Vitamin A cho bé.', rating: 5, image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b2', name: 'Cháo Cá Hồi (8m+)', desc: 'Giàu Omega-3 và DHA phát triển trí não.', rating: 5, image: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b3', name: 'Bơ Nghiền Sữa (6m+)', desc: 'Chất béo tốt và cực kỳ dễ tiêu hóa.', rating: 5, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b4', name: 'Yến Mạch Chuối (7m+)', desc: 'Năng lượng dồi dào cho bé tập bò.', rating: 4, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b5', name: 'Khoai Lang Tím (6m+)', desc: 'Nhiều chất xơ giúp bé nhuận tràng.', rating: 5, image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b6', name: 'Cháo Gà Hạt Sen (10m+)', desc: 'Giúp bé ngủ ngon và bổ sung đạm.', rating: 5, image: 'https://images.unsplash.com/photo-1594759074641-67a6a0ec2ee5?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b7', name: 'Đậu Hũ Rau Ngót (8m+)', desc: 'Thanh mát và giàu sắt cho bé.', rating: 4, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b8', name: 'Súp Cà Rốt Su Su (6m+)', desc: 'Vị ngọt thanh tự nhiên từ rau củ.', rating: 5, image: 'https://images.unsplash.com/photo-1547592166-23ac45714b5a?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b9', name: 'Lòng Đỏ Trứng (7m+)', desc: 'Bổ sung Lecithin và chất béo quý.', rating: 5, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b10', name: 'Táo Hấp Nghiền (6m+)', desc: 'Giàu Vitamin C tăng đề kháng.', rating: 5, image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=500', tag: 'Cho Bé' },
  { id: 'm1', name: 'Salad Ức Gà', desc: 'Giàu đạm, ít béo giúp mẹ hồi dáng.', rating: 5, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', tag: 'Cho Mẹ' },
  { id: 'm2', name: 'Canh Rong Biển', desc: 'Thanh mát, lợi sữa và bổ sung i-ốt.', rating: 5, image: 'https://images.unsplash.com/photo-1547592166-23ac45714b5a?q=80&w=500', tag: 'Cho Mẹ' },
];

export default function ListDoAnScreen() {
  const [activeTab, setActiveTab] = useState<'Mẹ' | 'Bé'>('Bé');
  const [restrictedIds, setRestrictedIds] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const filteredDishes = useMemo(() => {
    return DISHES.filter(d => d.tag.includes(activeTab) && !restrictedIds.includes(d.id));
  }, [activeTab, restrictedIds]);

  const restrictedDishes = useMemo(() => {
    return DISHES.filter(d => d.tag.includes(activeTab) && restrictedIds.includes(d.id));
  }, [activeTab, restrictedIds]);

  const toggleRestriction = (id: string) => {
    setRestrictedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const scrollToRestricted = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderDishCard = (item: any, isRestricted: boolean) => (
    <View style={[styles.dishCard, isRestricted && styles.restrictedCardEffect]}>
      <View style={styles.imageBox}>
        <Image source={{ uri: item.image }} style={[styles.dishImage, isRestricted && { opacity: 0.6 }]} />
        <View style={[styles.tagBadge, isRestricted && { backgroundColor: '#ABBEC8' }]}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>
      <View style={styles.infoBox}>
        <Text style={[styles.dishName, isRestricted && { color: '#ABBEC8' }]} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.dishDesc} numberOfLines={2}>{item.desc}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity onPress={() => toggleRestriction(item.id)}>
            <Ionicons 
              name={isRestricted ? "refresh-circle" : "remove-circle-outline"} 
              size={24} 
              color={isRestricted ? "#FF8FAB" : "#ABBEC8"} 
            />
          </TouchableOpacity>
          <View style={styles.starRow}>
             <Ionicons name="star" size={10} color={isRestricted ? "#E0E0E0" : "#FFB800"} />
             <Text style={[styles.ratingText, isRestricted && { color: '#ABBEC8' }]}>{item.rating}.0</Text>
          </View>
          {!isRestricted && (
            <View style={styles.plusBtn}><Ionicons name="add" size={18} color="white" /></View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        ref={flatListRef}
        data={filteredDishes}
        renderItem={({ item }) => renderDishCard(item, false)}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.headerPinkBg}>
              <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#FFF" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Dinh Dưỡng</Text>
                <TouchableOpacity><Ionicons name="sparkles" size={26} color="#FFF" /></TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#FF8FAB" />
                <TextInput placeholder="Tìm món ngon..." style={styles.searchInput} />
              </View>
              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'Mẹ' && styles.tabBtnActive]} onPress={() => setActiveTab('Mẹ')}>
                  <Text style={[styles.tabText, activeTab === 'Mẹ' && styles.tabTextActive]}>Cho Mẹ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'Bé' && styles.tabBtnActive]} onPress={() => setActiveTab('Bé')}>
                  <Text style={[styles.tabText, activeTab === 'Bé' && styles.tabTextActive]}>Cho Bé</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.navSection}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push({pathname: '/dinhduong/WeeklyView', params: {target: activeTab}})}>
                <View style={[styles.iconCircle, {backgroundColor: activeTab === 'Mẹ' ? '#FF8FAB' : '#89CFF0'}]}><Ionicons name={activeTab === 'Mẹ' ? "person" : "body"} size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Lịch của {activeTab}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}><View style={[styles.iconCircle, {backgroundColor: '#FFB6C1'}]}><Ionicons name="heart" size={20} color="#FFF" /></View><Text style={styles.navBtnText}>Yêu thích</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={scrollToRestricted}><View style={[styles.iconCircle, {backgroundColor: '#ABBEC8'}]}><Ionicons name="eye-off" size={20} color="#FFF" /></View><Text style={styles.navBtnText}>Hạn chế</Text></TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Gợi ý thực đơn {activeTab}</Text>
          </View>
        )}
        ListFooterComponent={() => (
           <View style={styles.restrictedSection}>
             {restrictedDishes.length > 0 && (
               <>
                 <View style={styles.divider} />
                 <Text style={styles.sectionTitleRestricted}>Danh sách món đã hạn chế</Text>
                 <View style={styles.restrictedGrid}>
                    {restrictedDishes.map(item => (
                      <View key={item.id} style={styles.gridItem}>
                        {renderDishCard(item, true)}
                      </View>
                    ))}
                 </View>
               </>
             )}
             <View style={{ height: 100 }} />
           </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  headerPinkBg: { backgroundColor: '#FFB6C1', paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  customHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 15, paddingHorizontal: 20, justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', paddingHorizontal: 15, height: 45, marginHorizontal: 20, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '700', color: '#5C7A8A' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 40, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 15, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#FFF' },
  tabText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  tabTextActive: { color: '#FF8FAB' },
  navSection: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  navBtn: { alignItems: 'center', width: '30%' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 3 },
  navBtnText: { fontSize: 12, fontWeight: '800', color: '#5C7A8A' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginLeft: 25, marginBottom: 15 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  dishCard: { backgroundColor: '#FFF', width: cardWidth, borderRadius: 25, marginBottom: 20, elevation: 3 },
  imageBox: { height: 100, borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
  dishImage: { width: '100%', height: '100%' },
  tagBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,143,171,0.9)', paddingHorizontal: 8, borderRadius: 8 },
  tagText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  infoBox: { padding: 10 },
  dishName: { fontSize: 13, fontWeight: '800', color: '#FF8FAB' },
  dishDesc: { fontSize: 10, color: '#5C7A8A', height: 28, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 10, fontWeight: 'bold', color: '#FFB800', marginLeft: 3 },
  plusBtn: { backgroundColor: '#FFB6C1', borderRadius: 8, padding: 2 },
  
  // Restricted Styles
  restrictedSection: { marginTop: 30 },
  divider: { height: 2, backgroundColor: '#FFE5EC', marginHorizontal: 40, marginBottom: 25 },
  sectionTitleRestricted: { fontSize: 18, fontWeight: '900', color: '#ABBEC8', marginLeft: 25, marginBottom: 20 },
  restrictedGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between' },
  gridItem: { width: cardWidth },
  restrictedCardEffect: { elevation: 0, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FAFAFA' }
});