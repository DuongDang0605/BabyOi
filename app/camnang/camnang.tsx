import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// DỮ LIỆU GIẢ LẬP: Các bài viết từ Admin/Staff
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Cẩm Nang</Text>
          
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#ff8fab" />
          </TouchableOpacity>
        </View>

        {/* --- THANH PHÂN LOẠI (CATEGORIES) --- */}
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

        {/* --- DANH SÁCH BÀI VIẾT --- */}
        {HANDBOOK_POSTS.map((post) => (
          <View key={post.id} style={styles.articleCard}>
            
            {/* Ảnh cover của bài viết */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: post.image }} style={styles.coverImage} />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{post.category}</Text>
              </View>
            </View>

            {/* Thông tin tác giả & Tiêu đề */}
            <View style={styles.cardContent}>
              <View style={styles.authorRow}>
                <View style={styles.authorAvatar}>
                  <FontAwesome5 name="user-md" size={14} color="#fff" />
                </View>
                <View>
                  <Text style={styles.authorName}>{post.author} <Text style={styles.authorRole}>• {post.role}</Text></Text>
                  <Text style={styles.postDate}>{post.date}</Text>
                </View>
              </View>

              <Text style={styles.articleTitle}>{post.title}</Text>
              <Text style={styles.articleSnippet} numberOfLines={2}>{post.snippet}</Text>
            </View>

            {/* THANH TƯƠNG TÁC: Bình luận & Chia sẻ */}
            <View style={styles.interactionBar}>
              
              <TouchableOpacity 
                style={styles.interactionBtn}
                onPress={() => {
                  // Mở sang trang Bình luận (bạn nhớ check lại đường dẫn cho khớp với tên file của bạn nhé)
                  router.push('/camnang/comment'); 
                  
                  // Nâng cao: Sau này nếu muốn truyền ID bài viết sang để tải data thật, bạn dùng dòng này:
                  // router.push({ pathname: '/camnang/binh-luan', params: { id: post.id } });
                }}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#5c7a8a" />
                <Text style={styles.interactionText}>Bình luận ({post.comments})</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.interactionBtn}
                onPress={() => {
                  alert("Đang gọi API mở Facebook/Zalo để chia sẻ bài viết này...");
                }}
              >
                <Ionicons name="share-social-outline" size={22} color="#ff8fab" />
                <Text style={[styles.interactionText, { color: '#ff8fab' }]}>Chia sẻ</Text>
              </TouchableOpacity>

            </View>

          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollArea: {
    padding: 20, // Chuẩn layout đồng bộ
  },
  /* --- HEADER CHUẨN --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
    width: 45, 
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: 5,
    width: 45, 
  },
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
  },
  /* --- THANH PHÂN LOẠI (CATEGORIES) --- */
  categoryWrapper: {
    marginBottom: 25,
    marginHorizontal: -5, // Bù trừ nhẹ để vuốt trông mượt hơn
  },
  catPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1.5,
  },
  catPillActive: {
    backgroundColor: '#ffb6c1',
    borderColor: '#ffb6c1',
  },
  catPillInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f4f8',
  },
  catTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  catTextInactive: {
    color: '#7a8c99',
    fontWeight: '600',
    fontSize: 14,
  },
  /* --- BÀI VIẾT (ARTICLE CARD) --- */
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden', // Quan trọng để ảnh không tràn ra ngoài viền bo tròn
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#d46b08',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 18,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ff9c6e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334455',
  },
  authorRole: {
    fontSize: 12,
    color: '#a3d9b1',
    fontWeight: '700',
  },
  postDate: {
    fontSize: 12,
    color: '#8899aa',
    marginTop: 2,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleSnippet: {
    fontSize: 14,
    color: '#5c7a8a',
    lineHeight: 22,
  },
  /* --- THANH TƯƠNG TÁC --- */
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    borderTopWidth: 1.5,
    borderTopColor: '#f0f4f8',
    paddingVertical: 12,
    backgroundColor: '#fafbfc',
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  interactionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5c7a8a',
    marginLeft: 8, 
  },
});