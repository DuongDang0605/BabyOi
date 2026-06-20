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
  return 'Bình thường';
}

export const HealthHistoryCard = ({ item, onPress }: HealthHistoryCardProps) => {
  const status = resolveStatus(item);
  const isGoodStatus = status === 'Bình thường';
  const accentColor = isGoodStatus ? '#98D8AA' : '#FF8FAB';

  return (
    <View style={[styles.historyCard, { borderLeftColor: accentColor }]}>
      <View style={[styles.decorCircle, { backgroundColor: isGoodStatus ? '#E8F9ED' : '#FFF0F3' }]} />
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={14} color={accentColor} />
          <Text style={styles.dateText}>{toDisplayMonth(item.recordDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isGoodStatus ? '#E8F5E9' : '#FFF0F3' }]}>
          <Text style={[styles.statusText, { color: isGoodStatus ? '#4CAF50' : '#FF8FAB' }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statItem, styles.weightTile]}>
          <Ionicons name="scale-outline" size={18} color="#98D8AA" style={styles.statIcon} />
          <Text style={styles.statLabel}>Cân nặng</Text>
          <Text style={styles.statValue}>{formatNullableNumber(item.weight)}<Text style={styles.unit}>kg</Text></Text>
        </View>

        <View style={[styles.statItem, styles.heightTile]}>
          <Ionicons name="body-outline" size={18} color="#3DB9D3" style={styles.statIcon} />
          <Text style={styles.statLabel}>Chiều cao</Text>
          <Text style={styles.statValue}>{formatNullableNumber(item.height)}<Text style={styles.unit}>cm</Text></Text>
        </View>

        <View style={[styles.statItem, styles.tdeeTile]}>
          <Ionicons name="flame-outline" size={18} color="#98D8AA" style={styles.statIcon} />
          <Text style={styles.statLabel}>TDEE</Text>
          <Text style={[styles.statValue, { color: '#A7E4F5' }]}>{formatNullableNumber(item.tdee, 0)}<Text style={styles.unit}>kcal</Text></Text>
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
    shadowOpacity: 0.14,
    shadowRadius: 10,
    borderLeftWidth: 5,
    overflow: 'hidden',
  },
  decorCircle: { position: 'absolute', width: 92, height: 92, borderRadius: 46, right: -28, top: -30 },
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
  statsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 8 },
  statItem: { flex: 1, alignItems: 'center', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 4 },
  weightTile: { backgroundColor: '#F1FBF4' },
  heightTile: { backgroundColor: '#EFFBFE' },
  tdeeTile: { backgroundColor: '#F1FBF4' },
  statIcon: { marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#333' },
  unit: { fontSize: 12, color: '#999', fontWeight: '600' },
  sickInfoBox: {
    backgroundColor: '#FFF9EB',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE8A8',
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
