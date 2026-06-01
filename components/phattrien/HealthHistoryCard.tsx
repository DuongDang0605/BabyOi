import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { HealthRecordResponse } from '../../lib/api';
import { formatNullableNumber, toDisplayMonth } from '../../lib/health-format';

interface HealthHistoryCardProps {
  item: HealthRecordResponse;
  onPress: (item: HealthRecordResponse) => void;
}

function resolveStatus(item: HealthRecordResponse) {
  const illnessCount = item.illnessCount || 0;
  if (illnessCount >= 2) {
    return 'Cần chú ý';
  }
  if (item.bmi != null && (item.bmi < 14 || item.bmi > 19)) {
    return 'Theo dõi thêm';
  }
  return 'Bình thường';
}

export const HealthHistoryCard = ({ item, onPress }: HealthHistoryCardProps) => {
  const status = resolveStatus(item);
  const isGoodStatus = status === 'Bình thường';

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={14} color="#FF8FAB" />
          <Text style={styles.dateText}>{toDisplayMonth(item.recordDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isGoodStatus ? '#E8F5E9' : '#FFF0F3' }]}>
          <Text style={[styles.statusText, { color: isGoodStatus ? '#4CAF50' : '#FF8FAB' }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cân nặng</Text>
          <Text style={styles.statValue}>{formatNullableNumber(item.weight)}<Text style={styles.unit}>kg</Text></Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Chiều cao</Text>
          <Text style={styles.statValue}>{formatNullableNumber(item.height)}<Text style={styles.unit}>cm</Text></Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>BMI</Text>
          <Text style={[styles.statValue, { color: '#A7E4F5' }]}>{formatNullableNumber(item.bmi)}</Text>
        </View>
      </View>

      <View style={styles.sickInfoBox}>
        <Ionicons name="medkit" size={16} color={(item.illnessCount || 0) === 0 ? '#98D8AA' : '#FFD166'} />
        <Text style={styles.sickText}>
          Số đợt bệnh trong kỳ: <Text style={styles.sickBold}>{item.illnessCount || 0} đợt</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.detailBtn}
        activeOpacity={0.6}
        onPress={() => onPress(item)}
      >
        <Text style={styles.detailBtnText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFB6C1" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 10
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 14, fontWeight: '800', color: '#5C7A8A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 10 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#333' },
  unit: { fontSize: 12, color: '#999', fontWeight: '600' },
  divider: { width: 1, height: 30, backgroundColor: '#EEE' },
  sickInfoBox: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  sickText: { fontSize: 12, color: '#666', fontWeight: '600' },
  sickBold: { color: '#5C7A8A', fontWeight: '800' },
  detailBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5'
  },
  detailBtnText: { fontSize: 13, fontWeight: '700', color: '#FFB6C1', marginRight: 5 }
});
