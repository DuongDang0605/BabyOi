import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BabyRoutineDayResponse, getBabyRoutineHistory } from '../../lib/api';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

type ViewMode = 'month' | 'year';

function toDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31);
}

function addPeriod(date: Date, mode: ViewMode, amount: number) {
  const nextDate = new Date(date);
  if (mode === 'month') {
    nextDate.setMonth(nextDate.getMonth() + amount);
  } else {
    nextDate.setFullYear(nextDate.getFullYear() + amount);
  }
  return nextDate;
}

function formatDateLabel(dateParam: string) {
  const [year, month, day] = dateParam.split('-');
  return `${day}/${month}/${year}`;
}

function formatPeriodTitle(date: Date, mode: ViewMode) {
  if (mode === 'month') {
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  }
  return `Năm ${date.getFullYear()}`;
}

function findEntryTime(day: BabyRoutineDayResponse, type: string) {
  const entry = day.entries.find((item) => item.type === type);
  return entry?.actualTime || entry?.time || '--:--';
}

function summarizeDay(day: BabyRoutineDayResponse) {
  const total = day.entries.length;
  const completed = day.entries.filter((item) => item.completed).length;
  return { total, completed };
}

export default function RoutineHistoryScreen() {
  const [mode, setMode] = useState<ViewMode>('month');
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [days, setDays] = useState<BabyRoutineDayResponse[]>([]);
  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const period = useMemo(() => {
    const fromDate = mode === 'month' ? startOfMonth(anchorDate) : startOfYear(anchorDate);
    const toDate = mode === 'month' ? endOfMonth(anchorDate) : endOfYear(anchorDate);
    return {
      fromDate: toDateParam(fromDate),
      toDate: toDateParam(toDate),
      title: formatPeriodTitle(anchorDate, mode),
    };
  }, [anchorDate, mode]);

  const completedTotal = useMemo(
    () => days.reduce((sum, day) => sum + day.entries.filter((item) => item.completed).length, 0),
    [days]
  );
  const entryTotal = useMemo(
    () => days.reduce((sum, day) => sum + day.entries.length, 0),
    [days]
  );

  const loadHistory = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const profile = getSelectedProfile() || await hydrateSelectedProfile();
      if (!profile) {
        setDays([]);
        setProfileName('');
        setError('Vui lòng chọn hồ sơ bé trước khi xem lịch sử sinh hoạt.');
        return;
      }

      const data = await getBabyRoutineHistory(profile.id, {
        fromDate: period.fromDate,
        toDate: period.toDate,
      });
      setProfileName(data.profileName || profile.name);
      setDays(data.days || []);
    } catch (err) {
      setDays([]);
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử sinh hoạt của bé.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period.fromDate, period.toDate]);

  useEffect(() => {
    setExpandedDate(null);
    loadHistory();
  }, [loadHistory]);

  const renderDay = ({ item }: { item: BabyRoutineDayResponse }) => {
    const { completed, total } = summarizeDay(item);
    const expanded = expandedDate === item.routineDate;
    const visibleEntries = expanded ? item.entries : item.entries.slice(0, 3);

    return (
      <View style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View>
            <Text style={styles.dayDate}>{formatDateLabel(item.routineDate)}</Text>
            <Text style={styles.dayAge}>{item.ageGroup} · ngủ mục tiêu {item.sleepTargetMinHours}-{item.sleepTargetMaxHours} giờ</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{completed}/{total}</Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <View style={styles.quickPill}>
            <Ionicons name="sunny" size={15} color="#FF8FAB" />
            <Text style={styles.quickText}>Dậy {findEntryTime(item, 'WAKE')}</Text>
          </View>
          <View style={styles.quickPill}>
            <Ionicons name="moon" size={15} color="#5C7A8A" />
            <Text style={styles.quickText}>Ngủ {findEntryTime(item, 'SLEEP')}</Text>
          </View>
        </View>

        {visibleEntries.map((entry) => (
          <View key={entry.id} style={styles.entryRow}>
            <View style={[styles.entryDot, { backgroundColor: entry.completed ? '#4CAF50' : entry.color || '#FF8FAB' }]} />
            <Text style={styles.entryTime}>{entry.actualTime || entry.time}</Text>
            <Text style={[styles.entryName, entry.completed && styles.entryDone]} numberOfLines={1}>
              {entry.activity}
            </Text>
          </View>
        ))}

        <View style={styles.cardActions}>
          {item.entries.length > 3 && (
            <TouchableOpacity onPress={() => setExpandedDate(expanded ? null : item.routineDate)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{expanded ? 'Thu gọn' : `Xem thêm ${item.entries.length - 3} mục`}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/phattrien/daily-schedule', params: { date: item.routineDate } })}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Xem ngày</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={23} color="#5C7A8A" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Lịch sử sinh hoạt</Text>
            <Text style={styles.subtitle}>{profileName || 'BabyOi'} · {period.title}</Text>
          </View>
          <TouchableOpacity onPress={() => loadHistory(true)} style={styles.iconButton}>
            <Ionicons name="refresh" size={22} color="#5C7A8A" />
          </TouchableOpacity>
        </View>

        <View style={styles.modeTabs}>
          <TouchableOpacity
            onPress={() => setMode('month')}
            style={[styles.modeTab, mode === 'month' && styles.modeTabActive]}
          >
            <Text style={[styles.modeText, mode === 'month' && styles.modeTextActive]}>Theo tháng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('year')}
            style={[styles.modeTab, mode === 'year' && styles.modeTabActive]}
          >
            <Text style={[styles.modeText, mode === 'year' && styles.modeTextActive]}>Theo năm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodControls}>
          <TouchableOpacity onPress={() => setAnchorDate((current) => addPeriod(current, mode, -1))} style={styles.periodButton}>
            <Ionicons name="chevron-back" size={20} color="#5C7A8A" />
          </TouchableOpacity>
          <Text style={styles.periodText}>{period.title}</Text>
          <TouchableOpacity onPress={() => setAnchorDate((current) => addPeriod(current, mode, 1))} style={styles.periodButton}>
            <Ionicons name="chevron-forward" size={20} color="#5C7A8A" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <View>
          <Text style={styles.summaryLabel}>Tổng ngày hiển thị</Text>
          <Text style={styles.summaryValue}>{days.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Mục đã hoàn thành</Text>
          <Text style={styles.summaryValue}>{completedTotal}/{entryTotal}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải lịch sử sinh hoạt...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadHistory()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(item) => item.routineDate}
          renderItem={renderDay}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} tintColor="#FF8FAB" />}
          ListEmptyComponent={(
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>Chưa có lịch sinh hoạt trong khoảng thời gian này.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { backgroundColor: '#FFF', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 18, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 8 },
  topHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, color: '#5C7A8A', fontWeight: '900' },
  subtitle: { fontSize: 12, color: '#8FA4AF', fontWeight: '700', marginTop: 3 },
  modeTabs: { flexDirection: 'row', backgroundColor: '#F8F9FA', borderRadius: 18, padding: 4, marginTop: 18 },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center' },
  modeTabActive: { backgroundColor: '#FF8FAB' },
  modeText: { color: '#8FA4AF', fontWeight: '900' },
  modeTextActive: { color: '#FFF' },
  periodControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  periodButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF0F3', justifyContent: 'center', alignItems: 'center' },
  periodText: { color: '#5C7A8A', fontWeight: '900', fontSize: 16 },
  summaryBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 18, padding: 16, borderRadius: 18 },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#F1F3F5' },
  summaryLabel: { color: '#8FA4AF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  summaryValue: { color: '#FF8FAB', fontSize: 18, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  listContent: { padding: 20, paddingBottom: 40 },
  dayCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  dayDate: { color: '#5C7A8A', fontSize: 16, fontWeight: '900' },
  dayAge: { color: '#8FA4AF', fontSize: 11, fontWeight: '700', marginTop: 4 },
  progressBadge: { backgroundColor: '#E8F5E9', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  progressText: { color: '#4CAF50', fontWeight: '900', fontSize: 12 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 10 },
  quickPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F8F9FA', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  quickText: { color: '#5C7A8A', fontWeight: '800', fontSize: 11 },
  entryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  entryDot: { width: 9, height: 9, borderRadius: 5, marginRight: 9 },
  entryTime: { width: 48, color: '#5C7A8A', fontWeight: '900', fontSize: 12 },
  entryName: { flex: 1, color: '#333', fontWeight: '700', fontSize: 13 },
  entryDone: { color: '#ADB5BD', textDecorationLine: 'line-through' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  secondaryButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: '#F8F9FA' },
  secondaryButtonText: { color: '#5C7A8A', fontWeight: '900', fontSize: 12 },
  primaryButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: '#FF8FAB' },
  primaryButtonText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  stateBox: { alignItems: 'center', justifyContent: 'center', padding: 35 },
  stateText: { color: '#5C7A8A', fontWeight: '700', textAlign: 'center', marginTop: 10 },
  errorText: { color: '#D9485F', fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  retryButton: { marginTop: 14, backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
  retryButtonText: { color: '#FFF', fontWeight: '900' },
});
