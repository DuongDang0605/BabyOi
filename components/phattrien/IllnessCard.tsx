import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IllnessRecord {
  id: string;
  name: string;
  start: string;
  end: string;
  desc: string;
  month: string;
}

interface IllnessCardProps {
  item: IllnessRecord;
  onPressDetail: (item: IllnessRecord) => void;
}

export const IllnessCard = ({ item, onPressDetail }: IllnessCardProps) => {
  return (
    <View style={styles.illnessCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="medkit" size={18} color="#FFD166" />
          </View>
          <Text style={styles.illnessName}>{item.name}</Text>
        </View>
        <Text style={styles.monthLabel}>{item.month}</Text>
      </View>

      <View style={styles.timeBox}>
        <View style={styles.timeLine}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.timeText}>Từ: <Text style={styles.timeBold}>{item.start}</Text></Text>
          <Ionicons name="arrow-forward" size={12} color="#CCC" style={{marginHorizontal: 5}} />
          <Text style={styles.timeText}>Đến: <Text style={styles.timeBold}>{item.end}</Text></Text>
        </View>
      </View>

      <View style={styles.descContainer}>
        <Text style={styles.descText} numberOfLines={2}>
          <Text style={styles.descTitle}>Ghi chú: </Text>{item.desc}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.detailLink}
        onPress={() => onPressDetail(item)}
      >
        <Text style={styles.linkText}>Xem bệnh án chi tiết</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFB6C1" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  illnessCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#FFF0F3'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  nameGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF9EB', justifyContent: 'center', alignItems: 'center' },
  illnessName: { fontSize: 16, fontWeight: '800', color: '#333', flex: 1 },
  monthLabel: { fontSize: 11, color: '#AAA', fontWeight: '700' },
  timeBox: { backgroundColor: '#FDFDFD', padding: 8, borderRadius: 10, marginBottom: 10 },
  timeLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontSize: 12, color: '#777' },
  timeBold: { fontWeight: '700', color: '#5C7A8A' },
  descContainer: { marginBottom: 12 },
  descTitle: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' },
  descText: { fontSize: 13, color: '#666', lineHeight: 18 },
  detailLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10 },
  linkText: { fontSize: 12, fontWeight: '700', color: '#FFB6C1', marginRight: 4 },
});
