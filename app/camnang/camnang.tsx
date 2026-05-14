import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HandbookCard } from '../../components/camnang/HandbookCard';

const HANDBOOK_POSTS = [
  {
    id: 'p1',
    category: 'Dinh dưỡng',
    title: 'Thực đơn ăn dặm BLW tuần đầu tiên cho bé 6 tháng',
    snippet: 'Bắt đầu ăn dặm tự chỉ huy (BLW) không khó như mẹ nghĩ. Dưới đây là gợi ý thực đơn 7 ngày giúp bé làm quen với thức ăn thô an toàn...',
    author: 'Admin Hương Trà',
    role: 'Chuyên gia Dinh dưỡng',
    date: '14/03/2026',
    image: 'https://images.unsplash.com/photo-1514050684125-9614f24ebcc6?q=80&w=500&auto=format&fit=crop',
    comments: 5,
  },
  {
    id: 'p2',
    category: 'Sức khỏe',
    title: 'Phân biệt sốt mọc răng và sốt do virus ở trẻ',
    snippet: 'Nhiều mẹ nhầm lẫn giữa việc con khóc do sưng nướu mọc răng và sốt do nhiễm khuẩn. Bài viết này sẽ giúp mẹ nhận biết 3 dấu hiệu cơ bản nhất.',
    author: 'Bác sĩ Minh Đức',
    role: 'Cố vấn Y tế',
    date: '12/03/2026',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=500&auto=format&fit=crop',
    comments: 89,
  },
  {
    id: 'p3',
    category: 'Giấc ngủ',
    title: 'Tuần khủng hoảng (Wonder Week) và cách giúp bé ngủ xuyên đêm',
    snippet: 'Wonder week không phải là "kẻ thù". Hãy áp dụng phương pháp EASY và tiếng ồn trắng để giúp bé vượt qua chu kỳ này nhẹ nhàng nhất.',
    author: 'Admin BabyOi',
    role: 'Staff',
    date: '10/03/2026',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=500&auto=format&fit=crop',
    comments: 12,
  },
];

export default function HandbookScreen() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Dinh dưỡng', 'Sức khỏe', 'Giấc ngủ', 'Mẹo vặt'];

  const filteredPosts = activeCategory === 'Tất cả'
    ? HANDBOOK_POSTS
    : HANDBOOK_POSTS.filter(p => p.category === activeCategory);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cẩm Nang</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#ff8fab" />
          </TouchableOpacity>
        </View>

        {/* --- CATEGORIES --- */}
        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catPill, activeCategory === cat ? styles.catPillActive : styles.catPillInactive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={activeCategory === cat ? styles.catTextActive : styles.catTextInactive}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- ARTICLE LIST --- */}
        {filteredPosts.map((post) => (
          <HandbookCard
            key={post.id}
            post={post}
            onCommentPress={() => router.push('/camnang/comment')}
            onSharePress={() => alert("Chia sẻ bài viết thành công!")}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
  backButton: { width: 45 },
  searchButton: { width: 45, alignItems: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  categoryWrapper: { marginBottom: 25, marginHorizontal: -5 },
  catPill: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, marginHorizontal: 5, borderWidth: 1.5 },
  catPillActive: { backgroundColor: '#ffb6c1', borderColor: '#ffb6c1' },
  catPillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8' },
  catTextActive: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  catTextInactive: { color: '#7a8c99', fontWeight: '600', fontSize: 14 },
});
