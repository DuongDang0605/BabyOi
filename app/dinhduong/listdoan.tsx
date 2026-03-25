import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

const DISHES = [
  { id: 'b1', name: 'Súp Bí Đỏ Nghiền (6m+)', desc: 'Mịn màng, giàu Vitamin A cho bé.', rating: 5, image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b2', name: 'Cháo Cá Hồi (8m+)', desc: 'Giàu Omega-3 phát triển trí não.', rating: 5, image: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b3', name: 'Bơ Nghiền Sữa (6m+)', desc: 'Chất béo tốt và cực kỳ dễ tiêu hóa.', rating: 5, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b4', name: 'Yến Mạch Chuối (7m+)', desc: 'Năng lượng dồi dào cho bé tập bò.', rating: 4, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b5', name: 'Khoai Lang Tím (6m+)', desc: 'Nhiều chất xơ giúp bé nhuận tràng.', rating: 5, image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=500', tag: 'Cho Bé' },
  { id: 'b6', name: 'Cháo Gà Hạt Sen (10m+)', desc: 'Giúp bé ngủ ngon và bổ sung đạm.', rating: 5, image: 'https://images.unsplash.com/photo-1594759074641-67a6a0ec2ee5?q=80&w=500', tag: 'Cho Bé' },
  { id: 'm1', name: 'Salad Ức Gà', desc: 'Giàu đạm cho mẹ hồi dáng.', rating: 5, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500', tag: 'Cho Mẹ' },
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

  const renderDishCard = (item: any, isRestricted: boolean) => (
    <View style={[styles.dishCard, isRestricted && styles.restrictedCardEffect]}>
      <TouchableOpacity 
        disabled={isRestricted}
        onPress={() => router.push({ pathname: "/dinhduong/analyze-dish", params: { id: item.id, name: item.name, image: item.image } })}
      >
        <View style={styles.imageBox}>
          <Image source={{ uri: item.image }} style={[styles.dishImage, isRestricted && { opacity: 0.5 }]} />
          <View style={[styles.tagBadge, isRestricted && { backgroundColor: '#ABBEC8' }]}><Text style={styles.tagText}>{item.tag}</Text></View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.dishName, isRestricted && { color: '#ABBEC8' }]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.dishDesc} numberOfLines={2}>{item.desc}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.starRow}>
              <Ionicons name="star" size={10} color={!isRestricted ? "#FFB800" : "#E0E0E0"} />
              <Text style={[styles.ratingText, isRestricted && { color: '#ABBEC8' }]}>{item.rating}.0</Text>
            </View>

            <View style={styles.actionButtons}>
              {/* Nút Hạn chế / Hoàn tác */}
              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: isRestricted ? '#FF8FAB' : '#F0F2F5' }]} 
                onPress={() => toggleRestriction(item.id)}
              >
                <Ionicons name={isRestricted ? "refresh" : "remove"} size={18} color={isRestricted ? "white" : "#5C7A8A"} />
              </TouchableOpacity>

              {!isRestricted && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFB6C1', marginLeft: 8 }]}>
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
                <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="#FFF" /></TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#FF8FAB" />
                <TextInput placeholder="Tìm món ngon..." style={styles.searchInput} />
              </View>
              <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'Mẹ' && styles.tabBtnActive]} onPress={() => setActiveTab('Mẹ')}><Text style={[styles.tabText, activeTab === 'Mẹ' && styles.tabTextActive]}>Cho Mẹ</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'Bé' && styles.tabBtnActive]} onPress={() => setActiveTab('Bé')}><Text style={[styles.tabText, activeTab === 'Bé' && styles.tabTextActive]}>Cho Bé</Text></TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.aiPlannerBox} onPress={() => router.push('/dinhduong/ai-planner')}>
              <View style={styles.aiInfo}>
                <View style={styles.aiTag}><Text style={styles.aiTagText}>AI SMART</Text></View>
                <Text style={styles.aiTitle}>Trợ Lý Lên Lịch Ăn</Text>
                <Text style={styles.aiSub}>Tự động thiết kế thực đơn khoa học cho 7 ngày</Text>
              </View>
              <View style={styles.aiIconBg}><Ionicons name="sparkles" size={28} color="#FFF" /></View>
            </TouchableOpacity>

            <View style={styles.navSection}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push({pathname: '/dinhduong/WeeklyView', params: {target: activeTab}})}>
                <View style={[styles.iconCircle, {backgroundColor: activeTab === 'Mẹ' ? '#FF8FAB' : '#89CFF0'}]}><Ionicons name={activeTab === 'Mẹ' ? "person" : "body"} size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Lịch ăn</Text>
              </TouchableOpacity>
              
              {/* NÚT YÊU THÍCH ĐÃ SỬA ĐƯỜNG DẪN */}
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/dinhduong/favorite-dishes')}>
                <View style={[styles.iconCircle, {backgroundColor: '#FFB6C1'}]}><Ionicons name="heart" size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Yêu thích</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navBtn} onPress={() => flatListRef.current?.scrollToEnd()}>
                <View style={[styles.iconCircle, {backgroundColor: '#ABBEC8'}]}><Ionicons name="eye-off" size={20} color="#FFF" /></View>
                <Text style={styles.navBtnText}>Hạn chế</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Gợi ý cho {activeTab}</Text>
          </View>
        )}
        ListFooterComponent={() => (
           <View style={styles.restrictedSection}>
             {restrictedDishes.length > 0 && (
               <>
                 <View style={styles.divider} />
                 <Text style={styles.restrictedSectionTitle}>Món ăn đã hạn chế</Text>
                 <View style={styles.restrictedGrid}>
                   {restrictedDishes.map(item => (
                     <View key={item.id} style={styles.gridItem}>{renderDishCard(item, true)}</View>
                   ))}
                 </View>
               </>
             )}
             <View style={{ height: 60 }} />
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
  aiPlannerBox: { backgroundColor: '#FF8FAB', marginHorizontal: 20, marginTop: 20, borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 8 },
  aiInfo: { flex: 1 },
  aiTag: { backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 6 },
  aiTagText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  aiTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  aiSub: { color: '#FFF', fontSize: 11, fontWeight: '500', opacity: 0.9, marginTop: 2 },
  aiIconBg: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  navSection: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  navBtn: { alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 3 },
  navBtnText: { fontSize: 11, fontWeight: '800', color: '#5C7A8A' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginLeft: 25, marginBottom: 15 },
  row: { justifyContent: 'space-between', paddingHorizontal: 20 },
  dishCard: { backgroundColor: '#FFF', width: cardWidth, borderRadius: 25, marginBottom: 20, elevation: 3, overflow: 'hidden' },
  imageBox: { height: 105 },
  dishImage: { width: '100%', height: '100%' },
  tagBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,143,171,0.9)', paddingHorizontal: 8, borderRadius: 8 },
  tagText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  infoBox: { padding: 12 },
  dishName: { fontSize: 13, fontWeight: '800', color: '#FF8FAB' },
  dishDesc: { fontSize: 10, color: '#5C7A8A', height: 28, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 10, fontWeight: 'bold', color: '#FFB800', marginLeft: 3 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  restrictedSection: { marginTop: 20 },
  divider: { height: 2, backgroundColor: '#FFE5EC', marginHorizontal: 40, marginBottom: 20 },
  restrictedSectionTitle: { fontSize: 16, fontWeight: '900', color: '#ABBEC8', marginLeft: 25, marginBottom: 15 },
  restrictedGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between' },
  gridItem: { width: cardWidth },
  restrictedCardEffect: { opacity: 0.8, elevation: 0, borderWidth: 1, borderColor: '#F0F0F0' }
});