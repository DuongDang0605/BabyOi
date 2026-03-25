import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function ResultWaitScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#5C7A8A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 20 }}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={28} color="#4CAF50" />
          <Text style={[styles.title, { color: '#4CAF50' }]}>Phân Tích & Khuyến Nghị AI</Text>
        </View>

        <View style={[styles.reportCard, { borderColor: '#E8F9ED' }]}>
          <Text style={styles.aiGreeting}>Mẹ đừng vội, Ốc cần thêm thời gian! 🌱</Text>
          <Text style={styles.aiParagraph}>
            Qua phân tích, hệ cơ cổ của Ốc đang trong giai đoạn hoàn thiện. Phản xạ nhè lưỡi vẫn còn là cơ chế tự nhiên để <Text style={{fontWeight: 'bold', color: '#4CAF50'}}>bảo vệ dạ dày bé khỏi thức ăn đặc</Text> lúc này.
          </Text>
          <Text style={styles.aiParagraph}>
            Theo chuẩn y khoa, ép bé ăn sớm lúc này có thể gây nguy cơ hóc dị vật và quá tải hệ tiêu hóa. Mẹ hãy đợi thêm 1-2 tuần nữa để AI đánh giá lại nhé. 
          </Text>
          
          <View style={[styles.actionBox, { backgroundColor: '#E8F9ED' }]}>
            <Text style={[styles.actionTitle, { color: '#2E7D32' }]}>Giáo trình thay thế tuần này:</Text>
            <TouchableOpacity style={[styles.courseButton, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.courseText}>► Tập Tummy Time cứng cổ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { marginTop: 60, paddingHorizontal: 20, alignItems: 'flex-end' },
  backButton: { padding: 10, backgroundColor: '#FFF', borderRadius: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#FF8FAB', marginLeft: 10 },
  reportCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 25, borderWidth: 2, elevation: 5 },
  aiGreeting: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 15 },
  aiParagraph: { fontSize: 15, color: '#5C7A8A', lineHeight: 24, marginBottom: 15 },
  actionBox: { padding: 15, borderRadius: 15, marginTop: 10 },
  actionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  courseButton: { padding: 15, borderRadius: 15, alignItems: 'center' },
  courseText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});