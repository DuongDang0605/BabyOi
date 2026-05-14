import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DiaryBanner } from '../../components/nhatki/DiaryBanner';
import { DiaryCard } from '../../components/nhatki/DiaryCard';

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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhật Ký Bé Ốc</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#ff8fab" />
          </TouchableOpacity>
        </View>

        <DiaryBanner
          babyName="Bé Ốc (Gia Bảo)"
          babyAge="8 tháng 14 ngày tuổi"
          avatarUrl="https://cdn-icons-png.flaticon.com/512/1154/1154444.png"
        />

        {/* --- TIMELINE FEED --- */}
        {DIARY_POSTS.map((post, index) => (
          <DiaryCard
            key={post.id}
            post={post}
            isLast={index === DIARY_POSTS.length - 1}
            onEdit={(p) => console.log("Edit post", p.id)}
            onShare={(p) => alert("Chia sẻ khoảnh khắc của bé!")}
          />
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- FLOATING BUTTON --- */}
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
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { width: 45 },
  searchButton: { width: 45, alignItems: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  addButton: { backgroundColor: '#ff8fab', flexDirection: 'row', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  addButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900' },
});
