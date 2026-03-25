import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dữ liệu giả lập (Mock Data) lịch sử các lần mẹ sửa trạng thái
const HISTORY_LOGS = [
  {
    id: 'log1',
    lessonName: 'Tập Lật (Roll Over)',
    date: 'Hôm nay, 09:00',
    oldStatus: 'Tốt, đã thành thạo',
    newStatus: 'Quên, đang ôn lại',
    note: 'Mặc áo khoác mùa đông dày quá nên bé bị kẹt tay, hay cáu gắt không chịu lật nữa.',
    type: 'regression', // Thoái lui (chậm đi)
  },
  {
    id: 'log2',
    lessonName: 'Nằm sấp (Tummy Time)',
    date: 'Hôm qua, 15:30',
    oldStatus: 'Gặp khó khăn',
    newStatus: 'Tốt, đã thành thạo',
    note: 'Nay mẹ dùng đồ chơi xúc xắc vẩy vẩy phía trước, bé đã ngóc đầu được 3 phút liền mà không khóc!',
    type: 'progress', // Tiến bộ
  },
  {
    id: 'log3',
    lessonName: 'Tập Lật (Roll Over)',
    date: 'Tuần trước, 10:15',
    oldStatus: 'Đang học',
    newStatus: 'Tốt, đã thành thạo',
    note: 'Bé đã tự lật từ ngửa sang sấp mượt mà.',
    type: 'progress',
  }
];

export default function LessonHistoryScreen() {
  const getStatusColor = (status: string) => {
    if (status.includes('thành thạo')) return '#4CAF50';
    if (status.includes('khó khăn')) return '#FF9800';
    if (status.includes('ôn lại') || status.includes('Đang học')) return '#2196F3';
    return '#8899AA';
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#5C7A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử thay đổi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#2196F3" style={{ marginRight: 10 }} />
          <Text style={styles.infoText}>
            Dữ liệu này giúp BabyOi AI phân tích các giai đoạn "khủng hoảng ngủ/phát triển" (Wonder Weeks) của bé.
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {HISTORY_LOGS.map((log, index) => (
            <View key={log.id} style={styles.logRow}>
              
              {/* Trục thời gian (Cột bên trái) */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timeDot, log.type === 'progress' ? styles.dotProgress : styles.dotRegression]}>
                  <Ionicons 
                    name={log.type === 'progress' ? "trending-up" : "trending-down"} 
                    size={12} 
                    color="#FFF" 
                  />
                </View>
                {index !== HISTORY_LOGS.length - 1 && <View style={styles.timeLine} />}
              </View>

              {/* Thẻ Nội dung Lịch sử */}
              <View style={styles.logCard}>
                <Text style={styles.logDate}>{log.date}</Text>
                <Text style={styles.lessonName}>{log.lessonName}</Text>
                
                <View style={styles.statusChangeBox}>
                  <Text style={[styles.statusText, { color: getStatusColor(log.oldStatus) }]}>{log.oldStatus}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#8899AA" style={{ marginHorizontal: 8 }} />
                  <Text style={[styles.statusText, { color: getStatusColor(log.newStatus) }]}>{log.newStatus}</Text>
                </View>

                {log.note && (
                  <View style={styles.noteBox}>
                    <Ionicons name="pencil-outline" size={14} color="#5C7A8A" style={{ marginRight: 5 }} />
                    <Text style={styles.noteText}>"{log.note}"</Text>
                  </View>
                )}
              </View>

            </View>
          ))}
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB' },
  scrollContent: { paddingHorizontal: 20 },
  
  infoBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 15, borderRadius: 15, marginBottom: 25, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 13, color: '#1565C0', lineHeight: 20, fontWeight: '600' },

  timelineContainer: { paddingLeft: 10 },
  logRow: { flexDirection: 'row', marginBottom: 20 },
  
  timelineLeft: { width: 30, alignItems: 'center', marginRight: 15 },
  timeDot: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 1, borderWidth: 2, borderColor: '#FFF' },
  dotProgress: { backgroundColor: '#4CAF50' }, // Tiến lên màu xanh
  dotRegression: { backgroundColor: '#FF9800' }, // Đi lùi màu cam
  timeLine: { flex: 1, width: 2, backgroundColor: '#D9E2EC', marginTop: -5, marginBottom: -25 },

  logCard: { flex: 1, backgroundColor: '#FFF', padding: 18, borderRadius: 20, elevation: 3, shadowColor: '#A7E4F5', shadowOpacity: 0.1, shadowRadius: 5 },
  logDate: { fontSize: 12, color: '#8899AA', fontWeight: '800', marginBottom: 5 },
  lessonName: { fontSize: 16, fontWeight: '900', color: '#333', marginBottom: 12 },
  
  statusChangeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F8', padding: 10, borderRadius: 12, marginBottom: 12, flexWrap: 'wrap' },
  statusText: { fontSize: 13, fontWeight: '800' },
  
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 },
  noteText: { flex: 1, fontSize: 14, color: '#5C7A8A', fontStyle: 'italic', lineHeight: 20 }
});