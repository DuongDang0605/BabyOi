import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// 1. DỮ LIỆU FULL 7 NGÀY TRONG TUẦN
const WEEKLY_DATA: any = {
  'Th 2': [
    { time: '07:00', activity: 'Bú sữa & Thức dậy', icon: 'sunny', color: '#FFB6C1', note: '180ml sữa công thức' },
    { time: '09:00', activity: 'Ngủ sáng', icon: 'bed', color: '#A7E4F5', note: 'Ngủ khoảng 1 tiếng' },
    { time: '11:30', activity: 'Ăn dặm (Bữa chính)', icon: 'restaurant', color: '#FF8FAB', note: 'Cháo rây rau củ' },
    { time: '15:00', activity: 'Vui chơi tại nhà', icon: 'football', color: '#FFD166', note: 'Tập bò và cầm nắm' },
    { time: '20:00', activity: 'Bú đêm & Đi ngủ', icon: 'star', color: '#5C7A8A', note: 'Vệ sinh nướu trước khi ngủ' },
  ],
  'Th 3': [
    { time: '07:30', activity: 'Bú sữa sáng', icon: 'sunny', color: '#FFB6C1', note: '200ml sữa' },
    { time: '10:00', activity: 'Đi tiêm chủng', icon: 'medkit', color: '#FF8FAB', note: 'Kiểm tra sức khỏe định kỳ' },
    { time: '12:30', activity: 'Ăn trưa', icon: 'restaurant', color: '#FFD166', note: 'Súp bí đỏ thịt bằm' },
    { time: '18:00', activity: 'Tắm bé', icon: 'water', color: '#A7E4F5', note: 'Tắm nước ấm thảo dược' },
    { time: '20:00', activity: 'Đi ngủ', icon: 'moon', color: '#5C7A8A', note: 'Nghe nhạc sóng não' },
  ],
  'Th 4': [
    { time: '07:00', activity: 'Bú sữa', icon: 'sunny', color: '#FFB6C1', note: '180ml sữa' },
    { time: '09:00', activity: 'Học Flashcard', icon: 'book', color: '#FF8FAB', note: 'Nhận biết màu sắc' },
    { time: '12:00', activity: 'Ăn dặm', icon: 'restaurant', color: '#FFD166', note: 'Cháo cá hồi' },
    { time: '16:00', activity: 'Ăn xế', icon: 'ice-cream', color: '#FFB6C1', note: 'Sữa chua hoặc trái cây' },
    { time: '20:30', activity: 'Ngủ đêm', icon: 'star', color: '#5C7A8A', note: 'Bú thêm 120ml sữa' },
  ],
  'Th 5': [
    { time: '07:00', activity: 'Thức dậy', icon: 'sunny', color: '#FFB6C1', note: 'Bú 180ml sữa' },
    { time: '10:00', activity: 'Tắm nắng', icon: 'partly-sunny', color: '#FFD166', note: 'Dạo quanh ban công' },
    { time: '11:30', activity: 'Ăn dặm', icon: 'restaurant', color: '#FF8FAB', note: 'Cháo lươn rau ngót' },
    { time: '14:00', activity: 'Ngủ trưa', icon: 'bed', color: '#A7E4F5', note: 'Ngủ 1.5 - 2 tiếng' },
    { time: '19:00', activity: 'Đọc truyện cùng bố', icon: 'library', color: '#FFB6C1', note: 'Truyện tranh Ehon' },
  ],
  'Th 6': [
    { time: '07:30', activity: 'Bú sữa sáng', icon: 'sunny', color: '#FFB6C1', note: '210ml sữa' },
    { time: '09:00', activity: 'Học bơi thủy liệu', icon: 'water', color: '#A7E4F5', note: 'Vận động dưới nước' },
    { time: '12:00', activity: 'Ăn dặm', icon: 'restaurant', color: '#FF8FAB', note: 'Bột ăn dặm vị gà' },
    { time: '18:30', activity: 'Massage cho bé', icon: 'body', color: '#FFB6C1', note: 'Giúp bé ngủ sâu hơn' },
    { time: '20:00', activity: 'Đi ngủ', icon: 'moon', color: '#5C7A8A', note: 'Chúc bé ngủ ngon' },
  ],
  // THỨ 7
  'Th 7': [
    { time: '08:00', activity: 'Dậy muộn cuối tuần', icon: 'sunny', color: '#FFB6C1', note: 'Bú 200ml sữa' },
    { time: '10:30', activity: 'Đi siêu thị cùng mẹ', icon: 'cart', color: '#FFD166', note: 'Ngồi xe đẩy ngắm nhìn' },
    { time: '13:00', activity: 'Ăn trưa bên ngoài', icon: 'restaurant', color: '#FF8FAB', note: 'Cháo tôm khoai tây mang theo' },
    { time: '17:00', activity: 'Sang thăm ông bà', icon: 'people', color: '#A7E4F5', note: 'Vui chơi cùng gia đình' },
    { time: '21:00', activity: 'Ngủ muộn một chút', icon: 'star', color: '#5C7A8A', note: 'Bú 180ml sữa' },
  ],
  // CHỦ NHẬT
  'CN': [
    { time: '07:00', activity: 'Bú sữa sáng', icon: 'sunny', color: '#FFB6C1', note: '180ml sữa' },
    { time: '09:30', activity: 'Đi dạo công viên', icon: 'leaf', color: '#FFD166', note: 'Hít thở không khí trong lành' },
    { time: '12:00', activity: 'Ăn trưa tại nhà', icon: 'restaurant', color: '#FF8FAB', note: 'Bún gạo xào rau củ' },
    { time: '16:00', activity: 'Bữa phụ trái cây', icon: 'fast-food', color: '#FFB6C1', note: 'Bơ và chuối nghiền' },
    { time: '20:00', activity: 'Ngủ sớm', icon: 'moon', color: '#5C7A8A', note: 'Chuẩn bị cho tuần mới' },
  ],
};

const DAYS_OF_WEEK = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

export default function DailyScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState('Th 2');
  const currentSchedule = WEEKLY_DATA[selectedDay];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerTitle: "Lịch Sinh Hoạt Của Bé",
        headerStyle: { backgroundColor: '#FFB6C1' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '900' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- PHẦN 1: THANH LỊCH NGANG (CALENDAR STRIP) --- */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Lịch trình tuần này</Text>
            <Ionicons name="calendar-outline" size={20} color="#FFB6C1" />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
            {DAYS_OF_WEEK.map((day, index) => {
              const isSelected = selectedDay === day;
              return (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dayCard, isSelected && styles.selectedDayCard]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>{day}</Text>
                  <Text style={[styles.dayNumber, isSelected && styles.selectedDayText]}>{11 + index}</Text>
                  {isSelected && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* --- PHẦN 2: CHI TIẾT THEO NGÀY --- */}
        <View style={styles.detailHeader}>
          <View>
             <Text style={styles.detailTitle}>Chi tiết {selectedDay}</Text>
             <Text style={styles.detailSub}>Có {currentSchedule.length} hoạt động trong ngày</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
             <Ionicons name="create-outline" size={18} color="#FF8FAB" />
             <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
        </View>

        {/* --- PHẦN 3: TIMELINE --- */}
        <View style={styles.timelineContainer}>
          {currentSchedule.map((item: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              {/* Cột thời gian */}
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              
              {/* Đường kẻ dọc */}
              <View style={styles.lineWrapper}>
                <View style={[styles.lineDot, { backgroundColor: item.color }]} />
                {index !== currentSchedule.length - 1 && <View style={styles.verticalLine} />}
              </View>

              {/* Nội dung hoạt động */}
              <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={20} color="white" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{item.activity}</Text>
                  <Text style={styles.activityNote}>{item.note}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FFE5EC" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContent: { padding: 20 },

  // Calendar
  calendarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  calendarTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  weekRow: { gap: 12, paddingRight: 20 },
  dayCard: {
    width: 55,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  selectedDayCard: {
    backgroundColor: '#FFB6C1',
    elevation: 5,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.3,
  },
  dayName: { fontSize: 11, fontWeight: '700', color: '#AAA', marginBottom: 8 },
  dayNumber: { fontSize: 16, fontWeight: '900', color: '#5C7A8A' },
  selectedDayText: { color: '#FFF' },
  activeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFF', marginTop: 8 },

  // Timeline
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  detailTitle: { fontSize: 20, fontWeight: '900', color: '#5C7A8A' },
  detailSub: { fontSize: 12, color: '#999', fontWeight: '600', marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  editBtnText: { color: '#FF8FAB', fontWeight: '800', fontSize: 13, marginLeft: 4 },

  timelineContainer: { paddingLeft: 0 },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timeBox: { width: 50, justifyContent: 'center' },
  timeText: { fontSize: 13, fontWeight: '800', color: '#5C7A8A' },
  
  lineWrapper: { width: 30, alignItems: 'center' },
  lineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 18, borderWidth: 2, borderColor: '#FFF', elevation: 2 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#FFE5EC', marginVertical: 4 },

  activityCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 22,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.05,
  },
  iconBox: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { marginLeft: 15, flex: 1 },
  activityName: { fontSize: 15, fontWeight: '800', color: '#333' },
  activityNote: { fontSize: 12, color: '#999', marginTop: 4, fontWeight: '600' },
});