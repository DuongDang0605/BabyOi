import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DIARY_POSTS = [
  {
    id: '1',
    date: '12/03/2026',
    age: '8 tháng 12 ngày',
    title: 'Ốc bắt đầu tập bò rồi! 🏃‍♂️',
    content: 'Hôm nay con đã biết chống tay và đẩy người về phía trước một đoạn ngắn. Cả nhà vỗ tay cổ vũ con quá trời luôn.',
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=500&auto=format&fit=crop',
    milestone: 'Cột mốc mới',
  },
  {
    id: '2',
    date: '01/03/2026',
    age: '8 tháng 1 ngày',
    title: 'Bé Ốc tròn 8 tháng tuổi 🎂',
    content: 'Con đã nặng 8.5kg rồi, trộm vía con ăn giỏi ngủ ngoan. Mẹ làm cho con món cháo cá hồi cà rốt con thích mê.',
    image: 'https://images.unsplash.com/photo-1544126592-807daf21565c?q=80&w=500&auto=format&fit=crop',
    milestone: 'Sinh nhật tháng',
  },
  {
    id: '3',
    date: '15/02/2026',
    age: '7 tháng 15 ngày',
    title: 'Chiếc răng đầu tiên 🦷',
    content: 'Ốc bị sốt nhẹ 2 hôm, hóa ra là để nhú lên một cái mầm trắng nhỏ xíu ở hàm dưới. Thương con quá đi.',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=500&auto=format&fit=crop',
    milestone: 'Mọc răng',
  },
];

export default function BabyDiaryScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* BAO TOÀN BỘ BẰNG SCROLLVIEW NHƯ SỔ TIÊM */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER CHUẨN ĐỒNG BỘ NẰM TRONG SCROLLVIEW --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Nhật Ký Bé Ốc</Text>
          
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#ff8fab" />
          </TouchableOpacity>
        </View>

        {/* Banner tóm tắt đầu trang */}
        <View style={styles.welcomeBanner}>
          <View style={styles.avatarBorder}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1154/1154444.png' }} 
              style={styles.babyAvatar} 
            />
          </View>
          <View style={styles.bannerInfo}>
            <Text style={styles.babyName}>Bé Ốc (Gia Bảo)</Text>
            <Text style={styles.babyAge}>📅 8 tháng 14 ngày tuổi</Text>
          </View>
        </View>

        {/* --- TIMELINE FEED --- */}
        {DIARY_POSTS.map((post, index) => (
          <View key={post.id} style={styles.diaryCard}>
            <View style={styles.timelinePoint} />
            {index !== DIARY_POSTS.length - 1 && <View style={styles.timelineLine} />}

            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.postDate}>{post.date}</Text>
                <Text style={styles.postAge}>{post.age}</Text>
              </View>
              <View style={styles.milestoneBadge}>
                <Text style={styles.milestoneText}>✨ {post.milestone}</Text>
              </View>
            </View>

            <Image source={{ uri: post.image }} style={styles.postImage} />

            <View style={styles.postContent}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postText}>{post.content}</Text>
            </View>

            {/* Thanh tương tác: Chỉnh sửa & Chia sẻ */}
            <View style={styles.interactionBar}>
              
              <TouchableOpacity 
                style={styles.interactionBtn}
                onPress={() => {
                  console.log("Mở trang chỉnh sửa cho bài đăng: ", post.id);
                }}
              >
                <FontAwesome5 name="edit" size={18} color="#5c7a8a" />
                <Text style={styles.interactionText}>Chỉnh sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.interactionBtn}
                onPress={() => {
                  alert("Đang chuẩn bị hình ảnh để chia sẻ lên Facebook/Zalo...");
                }}
              >
                <Ionicons name="share-social-outline" size={21} color="#ff8fab" />
                <Text style={[styles.interactionText, { color: '#ff8fab' }]}>Chia sẻ</Text>
              </TouchableOpacity>

            </View>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- NÚT THÊM NHẬT KÝ (FLOATING BUTTON) --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/nhatki/themnhatki')}
        >
          <Ionicons name="camera" size={24} color="#ffffff" style={{marginRight: 8}} />
          <Text style={styles.addButtonText}>Lưu khoảnh khắc</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollArea: {
    padding: 20
  },
  /* --- HEADER CHUẨN ĐỒNG BỘ --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25, // Đổi từ 20 thành 25 cho giống hệt file gốc
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
    flex: 1, // Điền đầy khoảng trống ở giữa
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab',
    letterSpacing: 0.5,
  },
  /* --- BANNER --- */
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 25,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    padding: 3,
  },
  babyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  bannerInfo: {
    marginLeft: 15,
  },
  babyName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334455',
  },
  babyAge: {
    fontSize: 14,
    color: '#5c7a8a',
    fontWeight: '600',
    marginTop: 2,
  },
  /* --- DIARY CARD --- */
  diaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  timelinePoint: {
    position: 'absolute',
    left: -12,
    top: 30,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffb6c1',
    borderWidth: 3,
    borderColor: '#fef9f3',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: -6,
    top: 40,
    width: 2,
    height: '110%',
    backgroundColor: '#ffb6c1',
    opacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334455',
  },
  postAge: {
    fontSize: 12,
    color: '#8899aa',
    fontWeight: '600',
  },
  milestoneBadge: {
    backgroundColor: '#fff0cb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d46b08',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  postContent: {
    marginBottom: 15,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#334455',
    marginBottom: 5,
  },
  postText: {
    fontSize: 14,
    color: '#5c7a8a',
    lineHeight: 20,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    borderTopWidth: 1.5,
    borderTopColor: '#f0f4f8',
    paddingTop: 15,
    marginTop: 10,
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  actionIcon: {
    width: 22,
    height: 22,
  },
  interactionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5c7a8a',
    marginLeft: 8, 
  },
  /* --- BOTTOM BAR --- */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
    backgroundColor: 'rgba(254, 249, 243, 0.95)',
  },
  addButton: {
    backgroundColor: '#ff8fab',
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff8fab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
});