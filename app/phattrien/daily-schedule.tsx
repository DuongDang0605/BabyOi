import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScheduleItem } from '../../components/phattrien/ScheduleItem';

const { width } = Dimensions.get('window');

const TIME_GAPS: any = {
  1: 30,  // Từ Dậy -> Bú sữa: 30p
  2: 90,  // Từ Bú sữa -> Ngủ giấc 1: 90p
  3: 150, // Từ Ngủ giấc 1 -> Ăn dặm: 150p
  4: 120, // Từ Ăn dặm -> Ngủ giấc 2: 120p
  5: 150, // Từ Ngủ giấc 2 -> Bú chiều: 150p
  6: 180, // Từ Bú chiều -> Ngủ đêm: 180p
};

export default function FullSmartBabySchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [schedule, setSchedule] = useState<any[]>([]);

  const daysInWeek = [
    { label: 'Th 2', date: 23 }, { label: 'Th 3', date: 24 }, { label: 'Th 4', date: 25 },
    { label: 'Th 5', date: 26 }, { label: 'Th 6', date: 27 }, { label: 'Th 7', date: 28 }, { label: 'CN', date: 29 }
  ];

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

  const addMinutes = (timeStr: string, mins: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + mins);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleToggleComplete = (index: number) => {
    const newSchedule = [...schedule];
    const isNowDone = !newSchedule[index].isDone;

    if (isNowDone) {
      const now = new Date();
      const actualTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      newSchedule[index].isDone = true;
      newSchedule[index].time = actualTime;
      newSchedule[index].note = `Hoàn thành lúc ${actualTime}`;

      for (let i = index + 1; i < newSchedule.length; i++) {
        const gap = TIME_GAPS[i] || 120;
        newSchedule[i].time = addMinutes(newSchedule[i - 1].time, gap);
        newSchedule[i].note = "AI đã điều chỉnh theo thực tế";
      }
    } else {
      newSchedule[index].isDone = false;
    }
    setSchedule(newSchedule);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={styles.calendarHeader}>
        <View style={styles.topHeader}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#5C7A8A" />
           </TouchableOpacity>
           <Text style={styles.monthText}>Tháng 3, 2026</Text>
           <View style={{ width: 40 }} />
        </View>
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
        
        <View style={styles.aiInsights}>
          <View style={styles.aiRow}>
            <View style={{flex: 1}}>
              <Text style={styles.aiTitle}>Smart Update ✨</Text>
              <Text style={styles.aiSub}>Chạm vào mục để hoàn thành. AI sẽ tự động lùi lịch nếu bé thức/ngủ muộn hơn dự kiến.</Text>
            </View>
          </View>
        </View>

        <View style={styles.timelineContainer}>
          {schedule.map((item, index) => (
            <ScheduleItem
                key={item.id}
                item={item}
                isLast={index === schedule.length - 1}
                onToggle={() => handleToggleComplete(index)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
  calendarHeader: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 8 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  dateList: { paddingLeft: 20 },
  dateItem: { width: 58, height: 75, backgroundColor: '#F8F9FA', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F1F3F5' },
  dateItemSelected: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB', elevation: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', color: '#ADB5BD', marginBottom: 5 },
  dateNumber: { fontSize: 19, fontWeight: '900', color: '#5C7A8A' },
  aiInsights: { backgroundColor: '#FFF0F3', padding: 18, borderRadius: 25, marginTop: 15, marginHorizontal: 5 },
  aiRow: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB' },
  aiSub: { fontSize: 12, color: '#FF8FAB', marginTop: 4, lineHeight: 17, opacity: 0.8 },
  timelineContainer: { marginTop: 30, paddingHorizontal: 5 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, backgroundColor: '#FF8FAB', borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});
