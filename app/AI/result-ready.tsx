import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function ResultReadyScreen() {
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
          <Ionicons name="sparkles" size={28} color="#FF8FAB" />
          <Text style={styles.title}>Báo Cáo Phân Tích AI</Text>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.aiGreeting}>Chào mẹ, AI BabyOi đã có kết quả! ✨</Text>
          <Text style={styles.aiParagraph}>
            Dựa trên dữ liệu mẹ vừa cung cấp, kết hợp với việc Ốc đã đạt <Text style={{fontWeight: 'bold', color: '#FF8FAB'}}>7.5kg (vượt chuẩn 10%)</Text> vào tuần trước, hệ cơ xương của bé đang phát triển cực kỳ xuất sắc.
          </Text>
          <Text style={styles.aiParagraph}>
            Khả năng giữ cổ thẳng và việc mất đi phản xạ nhè lưỡi cho thấy hệ tiêu hóa và phản xạ nuốt của Ốc <Text style={{fontWeight: 'bold', color: '#FF8FAB'}}>đã hoàn toàn đủ điều kiện</Text> để bắt đầu xử lý thức ăn đặc.
          </Text>
          
          <View style={styles.actionBox}>
            <Text style={styles.actionTitle}>AI đã mở khóa giáo trình cho Ốc:</Text>
            <TouchableOpacity style={styles.courseButton}>
              <Text style={styles.courseText}>► Bắt đầu: Ăn dặm BLW Ngày 1</Text>
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
  reportCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 25, borderWidth: 2, borderColor: '#FFF0F5', elevation: 5 },
  aiGreeting: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 15 },
  aiParagraph: { fontSize: 15, color: '#5C7A8A', lineHeight: 24, marginBottom: 15 },
  actionBox: { backgroundColor: '#FFF0F5', padding: 15, borderRadius: 15, marginTop: 10 },
  actionTitle: { fontSize: 14, fontWeight: '700', color: '#FF8FAB', marginBottom: 10 },
  courseButton: { backgroundColor: '#FF8FAB', padding: 15, borderRadius: 15, alignItems: 'center' },
  courseText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});