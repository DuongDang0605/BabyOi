import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * CẤU HÌNH KHOẢNG CÁCH THỜI GIAN (PHÚT) GIỮA CÁC HOẠT ĐỘNG
 * Đây là linh hồn của AI: Mỗi khi một mốc xong, mốc kế tiếp sẽ + thêm số phút này.
 */
const TIME_GAPS: any = {
  1: 30,  // Từ Dậy -> Bú sữa: 30p
  2: 90,  // Từ Bú sữa -> Ngủ giấc 1: 90p
  3: 150, // Từ Ngủ giấc 1 -> Ăn dặm: 150p (bao gồm cả thời gian ngủ 1.5h)
  4: 120, // Từ Ăn dặm -> Ngủ giấc 2: 120p
  5: 150, // Từ Ngủ giấc 2 -> Bú chiều: 150p
  6: 180, // Từ Bú chiều -> Ngủ đêm: 180p
};

export default function FullSmartBabySchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [schedule, setSchedule] = useState<any[]>([]);

  // Giả lập danh sách ngày trong tuần
  const daysInWeek = [
    { label: 'Th 2', date: 23 }, { label: 'Th 3', date: 24 }, { label: 'Th 4', date: 25 },
    { label: 'Th 5', date: 26 }, { label: 'Th 6', date: 27 }, { label: 'Th 7', date: 28 }, { label: 'CN', date: 29 }
  ];

  // Khởi tạo dữ liệu
  useEffect(() => {
    const baseData = [
      { id: 1, type: 'WAKE', time: '07:00', activity: 'Bé thức dậy', icon: 'sunny', color: '#FFB6C1', note: 'Vệ sinh buổi sáng' },
      { id: 2, type: 'MILK', time: '07:30', activity: 'Cữ sữa sáng', icon: 'water', color: '#A7E4F5', note: '210ml sữa' },
      { id: 3, type: 'NAP', time: '09:00', activity: 'Giấc ngủ 1', icon: 'bed', color: '#74C0FC', note: 'AI dự báo' },
      { id: 4, type: 'EAT', time: '11:30', activity: 'Ăn dặm chính', icon: 'restaurant', color: '#FF8FAB', note: 'Cháo rây/Bột' },
      { id: 5, type: 'NAP', time: '14:00', activity: 'Giấc ngủ 2', icon: 'bed', color: '#74C0FC', note: 'AI dự báo' },
      { id: 6, type: 'MILK', time: '16:30', activity: 'Cữ sữa chiều', icon: 'water', color: '#A7E4F5', note: '180ml sữa' },
      { id: 7, type: 'SLEEP', time: '19:30', activity: 'Ngủ đêm', icon: 'moon', color: '#5C7A8A', note: 'Chúc bé ngủ ngon' },
    ];
    setSchedule(baseData.map(item => ({ ...item, isDone: false })));
  }, [selectedDate]);

  // Hàm hỗ trợ cộng phút
  const addMinutes = (timeStr: string, mins: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + mins);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  /**
   * HÀM QUAN TRỌNG NHẤT: Xử lý tích hoàn thành và tính lại toàn bộ lịch
   */
  const handleToggleComplete = (index: number) => {
    const newSchedule = [...schedule];
    const isNowDone = !newSchedule[index].isDone;

    if (isNowDone) {
      // 1. Cập nhật thời gian thực tế lúc bấm nút
      const now = new Date();
      const actualTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      newSchedule[index].isDone = true;
      newSchedule[index].time = actualTime;
      newSchedule[index].note = `Hoàn thành lúc ${actualTime}`;

      // 2. AI: Tự động tính lại giờ cho TOÀN BỘ các mục phía sau
      for (let i = index + 1; i < newSchedule.length; i++) {
        const gap = TIME_GAPS[i] || 120; // Lấy gap cấu hình
        newSchedule[i].time = addMinutes(newSchedule[i - 1].time, gap);
        newSchedule[i].note = "AI đã điều chỉnh theo thực tế";
      }
    } else {
      // Nếu bỏ tích, chỉ đơn giản là đổi trạng thái
      newSchedule[index].isDone = false;
    }

    setSchedule(newSchedule);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- PHẦN 1: QUYỂN LỊCH (DATE PICKER) --- */}
      <View style={styles.calendarHeader}>
        <Text style={styles.monthText}>Tháng 3, 2026</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
          {daysInWeek.map((d, i) => (
            <TouchableOpacity 
              key={i} 
              onPress={() => setSelectedDate(d.date)}
              style={[styles.dateItem, selectedDate === d.date && styles.dateItemSelected]}
            >
              <Text style={[styles.dateLabel, selectedDate === d.date && styles.textWhite]}>{d.label}</Text>
              <Text style={[styles.dateNumber, selectedDate === d.date && styles.textWhite]}>{d.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- PHẦN 2: AI STATUS --- */}
        <View style={styles.aiInsights}>
          <View style={styles.aiRow}>
            <View style={{flex: 1}}>
              <Text style={styles.aiTitle}>Smart Update ✨</Text>
              <Text style={styles.aiSub}>Chạm vào mục để hoàn thành. AI sẽ tự động lùi lịch nếu bé thức/ngủ muộn hơn dự kiến.</Text>
            </View>
          </View>
        </View>

        {/* --- PHẦN 3: TIMELINE CHI TIẾT --- */}
        <View style={styles.timelineContainer}>
          {schedule.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              {/* Giờ */}
              <View style={styles.timeBox}>
                <Text style={[styles.timeText, item.isDone && styles.textMuted]}>{item.time}</Text>
              </View>

              {/* Đường line */}
              <View style={styles.lineWrapper}>
                <View style={[styles.dot, { backgroundColor: item.isDone ? '#4CAF50' : item.color }]} />
                {index !== schedule.length - 1 && <View style={styles.verticalLine} />}
              </View>

              {/* Card hoạt động */}
              <TouchableOpacity 
                style={[styles.activityCard, item.isDone && styles.cardDone]}
                onPress={() => handleToggleComplete(index)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: item.isDone ? '#E8F5E9' : item.color + '15' }]}>
                  <Ionicons name={item.icon} size={22} color={item.isDone ? '#4CAF50' : item.color} />
                </View>
                
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityName, item.isDone && styles.textDone]}>{item.activity}</Text>
                  <Text style={styles.activityNote} numberOfLines={1}>{item.note}</Text>
                </View>

                {/* NÚT HOÀN THÀNH */}
                <View style={[styles.checkCircle, item.isDone && styles.checkCircleActive]}>
                  {item.isDone && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB: Dự báo ngày mai */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => Alert.alert("AI Forecast", "Hôm nay bé sinh hoạt rất tốt. Ngày mai bé nên tiếp tục dậy lúc 07:00 để duy trì nhịp sinh học.")}
      >
        <Ionicons name="sparkles" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContent: { padding: 20 },
  textWhite: { color: '#FFF' },
  textMuted: { color: '#ADB5BD' },

  /* Calendar */
  calendarHeader: { backgroundColor: '#FFF', paddingTop: 55, paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 8, shadowColor: '#000', shadowOpacity: 0.05 },
  monthText: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', textAlign: 'center', marginBottom: 20 },
  dateList: { paddingLeft: 20 },
  dateItem: { width: 58, height: 75, backgroundColor: '#F8F9FA', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F1F3F5' },
  dateItemSelected: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB', elevation: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', color: '#ADB5BD', marginBottom: 5 },
  dateNumber: { fontSize: 19, fontWeight: '900', color: '#5C7A8A' },

  /* AI Insight Card */
  aiInsights: { backgroundColor: '#FFF0F3', padding: 18, borderRadius: 25, marginTop: 15, marginHorizontal: 5 },
  aiRow: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB' },
  aiSub: { fontSize: 12, color: '#FF8FAB', marginTop: 4, lineHeight: 17, opacity: 0.8 },

  /* Timeline */
  timelineContainer: { marginTop: 30, paddingHorizontal: 5 },
  timelineItem: { flexDirection: 'row', marginBottom: 22 },
  timeBox: { width: 55, paddingTop: 18 },
  timeText: { fontSize: 14, fontWeight: '900', color: '#5C7A8A' },
  lineWrapper: { width: 35, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 22, zIndex: 1, borderWidth: 3, borderColor: '#FFF', elevation: 2 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#FFE5EC', position: 'absolute', top: 35, bottom: -28 },

  /* Activity Card */
  activityCard: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', padding: 18, borderRadius: 25, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.04 },
  cardDone: { backgroundColor: '#F1F3F5', elevation: 0, opacity: 0.8 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, marginLeft: 15 },
  activityName: { fontSize: 16, fontWeight: '800', color: '#333' },
  textDone: { textDecorationLine: 'line-through', color: '#ADB5BD' },
  activityNote: { fontSize: 12, color: '#999', marginTop: 4 },
  
  /* Checkbox */
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderColor: '#FFB6C1', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkCircleActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },

  /* FAB */
  fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, backgroundColor: '#FF8FAB', borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#FF8FAB', shadowOpacity: 0.4 }
});