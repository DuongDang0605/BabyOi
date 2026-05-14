import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScheduleItemProps {
  item: {
    id: number;
    time: string;
    activity: string;
    icon: any;
    color: string;
    note: string;
    isDone: boolean;
  };
  isLast: boolean;
  onToggle: () => void;
}

export const ScheduleItem = ({ item, isLast, onToggle }: ScheduleItemProps) => {
  return (
    <View style={styles.timelineItem}>
      {/* Giờ */}
      <View style={styles.timeBox}>
        <Text style={[styles.timeText, item.isDone && styles.textMuted]}>{item.time}</Text>
      </View>

      {/* Đường line */}
      <View style={styles.lineWrapper}>
        <View style={[styles.dot, { backgroundColor: item.isDone ? '#4CAF50' : item.color }]} />
        {!isLast && <View style={styles.verticalLine} />}
      </View>

      {/* Card hoạt động */}
      <TouchableOpacity
        style={[styles.activityCard, item.isDone && styles.cardDone]}
        onPress={onToggle}
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
  );
};

const styles = StyleSheet.create({
  textMuted: { color: '#ADB5BD' },
  timelineItem: { flexDirection: 'row', marginBottom: 22 },
  timeBox: { width: 55, paddingTop: 18 },
  timeText: { fontSize: 14, fontWeight: '900', color: '#5C7A8A' },
  lineWrapper: { width: 35, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 22, zIndex: 1, borderWidth: 3, borderColor: '#FFF', elevation: 2 },
  verticalLine: { width: 2, flex: 1, backgroundColor: '#FFE5EC', position: 'absolute', top: 35, bottom: -28 },
  activityCard: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', padding: 18, borderRadius: 25, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.04 },
  cardDone: { backgroundColor: '#F1F3F5', elevation: 0, opacity: 0.8 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, marginLeft: 15 },
  activityName: { fontSize: 16, fontWeight: '800', color: '#333' },
  textDone: { textDecorationLine: 'line-through', color: '#ADB5BD' },
  activityNote: { fontSize: 12, color: '#999', marginTop: 4 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderColor: '#FFB6C1', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkCircleActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
});
