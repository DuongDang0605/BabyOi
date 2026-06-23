import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScheduleItemProps {
  item: {
    id: number;
    time: string;
    actualTime?: string | null;
    activity: string;
    icon: any;
    color: string;
    note: string;
    isDone: boolean;
  };
  isLast: boolean;
  onToggle: () => void;
  onEditTime?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  deleteLoading?: boolean;
  children?: React.ReactNode;
}

export const ScheduleItem = ({ item, isLast, onToggle, onEditTime, onDelete, onAdd, deleteLoading, children }: ScheduleItemProps) => {
  const displayTime = item.isDone && item.actualTime ? item.actualTime : item.time;
  const actionItems = [
    item.isDone && onEditTime
      ? { key: 'edit', label: 'Sửa giờ', icon: 'time-outline' as const, tone: 'default' as const, action: onEditTime }
      : null,
    onAdd
      ? { key: 'add', label: 'Thêm', icon: 'add-circle-outline' as const, tone: 'default' as const, action: onAdd }
      : null,
    onDelete
      ? { key: 'delete', label: deleteLoading ? 'Đang xóa...' : 'Xóa', icon: 'trash-outline' as const, tone: 'danger' as const, action: onDelete }
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.timelineBlock}>
      <View style={styles.timelineItem}>
        <View style={styles.timeBox}>
          <Text style={[styles.timeText, item.isDone && styles.textMuted]}>{displayTime}</Text>
        </View>

        <View style={styles.lineWrapper}>
          <View style={[styles.dot, { backgroundColor: item.isDone ? '#4CAF50' : item.color }]} />
          {!isLast && <View style={styles.verticalLine} />}
        </View>

        <TouchableOpacity
          style={[styles.activityCard, item.isDone && styles.cardDone]}
          onPress={item.isDone ? undefined : onToggle}
          activeOpacity={0.7}
          disabled={item.isDone}
        >
          <View style={[styles.iconBox, { backgroundColor: item.isDone ? '#E8F5E9' : item.color + '15' }]}>
            <Ionicons name={item.icon} size={22} color={item.isDone ? '#4CAF50' : item.color} />
          </View>

          <View style={styles.activityInfo}>
            <Text style={[styles.activityName, item.isDone && styles.textDone]}>{item.activity}</Text>
            <Text style={styles.activityNote} numberOfLines={1}>{item.note}</Text>
          </View>

          <View style={[styles.checkCircle, item.isDone && styles.checkCircleActive]}>
            {item.isDone && <Ionicons name="checkmark" size={14} color="#FFF" />}
          </View>
        </TouchableOpacity>
      </View>

      {actionItems.length ? (
        <View style={styles.actionBar}>
          {actionItems.map((action) => (
            <TouchableOpacity
              key={action!.key}
              style={[styles.actionButton, action!.tone === 'danger' && styles.dangerButton]}
              onPress={action!.action}
              disabled={action!.key === 'delete' && deleteLoading}
              activeOpacity={0.7}
            >
              <Ionicons name={action!.icon} size={15} color={action!.tone === 'danger' ? '#D9485F' : '#5C7A8A'} />
              <Text style={[styles.actionButtonText, action!.tone === 'danger' && styles.dangerButtonText]}>
                {action!.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  textMuted: { color: '#ADB5BD' },
  timelineBlock: { marginBottom: 22 },
  timelineItem: { flexDirection: 'row' },
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
  actionBar: { marginLeft: 90, marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  actionButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D9EEFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  actionButtonText: { color: '#5C7A8A', fontSize: 12, fontWeight: '900' },
  dangerButton: { borderColor: '#FFD6DE', backgroundColor: '#FFF8FA' },
  dangerButtonText: { color: '#D9485F' },
});
