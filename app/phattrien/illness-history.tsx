import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { IllnessEventResponse } from '../../lib/api';
import { deleteIllnessEvent, getIllnessEvents } from '../../lib/api';
import { getFilterParams, getIllnessStatusLabel, toDisplayDate, toDisplayMonth, type HealthFilterMode } from '../../lib/health-format';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const FILTERS: { label: string; value: HealthFilterMode }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Hôm nay', value: 'day' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Năm nay', value: 'year' },
];

const SHOW_ILLNESS_QR_EXPORT = false;

export default function IllnessHistoryScreen() {
  const [isQrModalVisible, setQrModalVisible] = useState(false);
  const [filterMode, setFilterMode] = useState<HealthFilterMode>('all');
  const [events, setEvents] = useState<IllnessEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTime, setFilterTime] = useState('1_week');
  const [filterSeverity, setFilterSeverity] = useState('attention');
  const [includeDiet, setIncludeDiet] = useState(false);

  const loadEvents = useCallback(async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile?.id) {
      setError('Vui lòng chọn hồ sơ trước khi xem lịch sử bệnh.');
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getIllnessEvents(profile.id, getFilterParams(filterMode));
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử bệnh.');
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  useFocusEffect(useCallback(() => {
    loadEvents();
  }, [loadEvents]));

  const attentionCount = useMemo(() => events.filter((item) => item.status === 3).length, [events]);

  const handleGenerateQR = () => {
    setQrModalVisible(false);
    router.push('/phattrien/AItrichxuatbenhan');
  };

  const handleDelete = (item: IllnessEventResponse) => {
    Alert.alert('Xóa đợt bệnh', `Bạn muốn xóa ghi chép "${item.illnessType}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteIllnessEvent(item.id);
          loadEvents();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: IllnessEventResponse }) => {
    const [year, month] = item.startAt.split('-');
    return (
      <View style={styles.illnessCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nameGroup}>
            <View style={styles.iconCircle}>
              <Ionicons name="medkit" size={18} color="#FFD166" />
            </View>
            <Text style={styles.illnessName}>{item.illnessType}</Text>
          </View>
          <Text style={styles.monthLabel}>{toDisplayMonth(item.startAt)}</Text>
        </View>

        <View style={styles.timeBox}>
          <View style={styles.timeLine}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.timeText}>Từ: <Text style={styles.timeBold}>{toDisplayDate(item.startAt)}</Text></Text>
            <Ionicons name="arrow-forward" size={12} color="#CCC" style={{ marginHorizontal: 5 }} />
            <Text style={styles.timeText}>Đến: <Text style={styles.timeBold}>{toDisplayDate(item.endAt)}</Text></Text>
          </View>
        </View>

        <View style={styles.descContainer}>
          <Text style={styles.descText} numberOfLines={2}>
            <Text style={styles.descTitle}>{getIllnessStatusLabel(item.status, item.statusLabel)}: </Text>{item.description || 'Chưa có ghi chú chi tiết.'}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailLink}
            onPress={() => router.push({ pathname: '/phattrien/health-detail', params: { month, year } })}
          >
            <Text style={styles.linkText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFB6C1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconAction} onPress={() => router.push({ pathname: '/phattrien/thembenhmoi', params: { id: item.id } })}>
            <Ionicons name="create-outline" size={18} color="#5C7A8A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconAction} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={18} color="#FF8FAB" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderState = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải lịch sử bệnh...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={26} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadEvents}>
            <Text style={styles.retryText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.stateBox}>
        <Ionicons name="checkmark-circle-outline" size={28} color="#98D8AA" />
        <Text style={styles.stateText}>Chưa có đợt bệnh nào trong khoảng thời gian này.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderState}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Lịch Sử Bị Bệnh</Text>
              <View style={{ width: 45 }} />
            </View>

            <View style={styles.statsOverview}>
              <View style={styles.statsGlow} />
              <View style={styles.statMini}>
                <Ionicons name="folder-open-outline" size={18} color="#FF8FAB" />
                <Text style={styles.statMiniNum}>{events.length}</Text>
                <Text style={styles.statMiniLabel}>Tổng đợt bệnh</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statMini}>
                <Ionicons name="alert-circle-outline" size={18} color={attentionCount > 0 ? '#FF8FAB' : '#98D8AA'} />
                <Text style={[styles.statMiniNum, { color: attentionCount > 0 ? '#FF8FAB' : '#98D8AA' }]}>{attentionCount}</Text>
                <Text style={styles.statMiniLabel}>Cần chú ý</Text>
              </View>
            </View>

            <View style={styles.actionButtonGroup}>
              <TouchableOpacity style={styles.addNewButton} onPress={() => router.push('/phattrien/thembenhmoi')}>
                <Ionicons name="add-circle" size={24} color="#ffffff" />
                <Text style={styles.addNewButtonText}>Thêm hồ sơ bệnh</Text>
              </TouchableOpacity>

              {SHOW_ILLNESS_QR_EXPORT && (
                <TouchableOpacity style={styles.qrExportButton} onPress={() => setQrModalVisible(true)}>
                  <Ionicons name="qr-code-outline" size={22} color="#2196F3" />
                  <Text style={styles.qrExportText}>Tạo QR Bệnh án</Text>
                  <Ionicons name="sparkles" size={16} color="#2196F3" style={styles.sparkleIcon} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              {FILTERS.map((filter) => {
                const selected = filterMode === filter.value;
                return (
                  <TouchableOpacity key={filter.value} style={[styles.filterChip, selected && styles.filterChipActive]} onPress={() => setFilterMode(filter.value)}>
                    <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{filter.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Danh sách các đợt bệnh</Text>
          </View>
        )}
      />

      {SHOW_ILLNESS_QR_EXPORT && (
        <Modal visible={isQrModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Tuỳ chỉnh dữ liệu QR</Text>
                <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color="#E0E0E0" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Chọn thông tin muốn trích xuất cho bác sĩ xem</Text>

              <Text style={styles.filterLabel}>1. Khoảng thời gian:</Text>
              <View style={styles.modalFilterRow}>
                {[
                  ['1_week', '1 Tuần'],
                  ['1_month', '1 Tháng'],
                  ['all', 'Tất cả'],
                ].map(([value, label]) => (
                  <TouchableOpacity key={value} style={[styles.filterPill, filterTime === value && styles.filterPillActive]} onPress={() => setFilterTime(value)}>
                    <Text style={[styles.filterPillText, filterTime === value && styles.filterPillTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>2. Mức độ bệnh lý:</Text>
              <View style={styles.modalFilterRow}>
                {[
                  ['attention', 'Chỉ cần chú ý'],
                  ['all', 'Mọi mức độ'],
                ].map(([value, label]) => (
                  <TouchableOpacity key={value} style={[styles.filterPill, filterSeverity === value && styles.filterPillActiveWarning]} onPress={() => setFilterSeverity(value)}>
                    <Text style={[styles.filterPillText, filterSeverity === value && styles.filterPillTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>3. Thông tin bổ sung:</Text>
              <TouchableOpacity style={[styles.toggleBox, includeDiet && styles.toggleBoxActive]} onPress={() => setIncludeDiet(!includeDiet)} activeOpacity={0.8}>
                <View style={[styles.checkbox, includeDiet && styles.checkboxActive]}>
                  {includeDiet && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.toggleTitle}>Đính kèm chế độ dinh dưỡng</Text>
                  <Text style={styles.toggleSub}>Trích xuất thực đơn 3 ngày gần nhất</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateQR}>
                <Ionicons name="qr-code" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.generateBtnText}>Tạo mã QR ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7EE' },
  listContent: { padding: 20, paddingBottom: 60 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  statsOverview: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 24, marginBottom: 20, elevation: 3, shadowColor: '#FFB6C1', shadowOpacity: 0.14, shadowRadius: 12, alignItems: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: '#FFE5EC' },
  statsGlow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, right: -48, top: -42, backgroundColor: '#E9F8FD' },
  statMini: { flex: 1, alignItems: 'center' },
  statMiniNum: { fontSize: 20, fontWeight: '900', color: '#FF8FAB' },
  statMiniLabel: { fontSize: 11, color: '#999', fontWeight: '600', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: '#F0F0F0' },
  actionButtonGroup: { marginBottom: 18 },
  addNewButton: { backgroundColor: '#FF8FAB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 22, marginBottom: 10, elevation: 4, shadowColor: '#FF8FAB', shadowOpacity: 0.32, shadowRadius: 8 },
  addNewButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800', marginLeft: 8 },
  qrExportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 22, backgroundColor: '#EFFBFE', borderWidth: 1.5, borderColor: '#A7E4F5' },
  qrExportText: { color: '#2196F3', fontSize: 15, fontWeight: '800', marginHorizontal: 8 },
  sparkleIcon: { marginTop: -10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  filterChip: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#FFE5EC', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, shadowColor: '#FFB6C1', shadowOpacity: 0.08, shadowRadius: 5, elevation: 1 },
  filterChipActive: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
  filterChipText: { color: '#5C7A8A', fontSize: 12, fontWeight: '800' },
  filterChipTextActive: { color: '#FFF' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15, marginLeft: 5 },
  illnessCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#FFD166', shadowOpacity: 0.13, shadowRadius: 8, borderWidth: 1.5, borderColor: '#FFF0F3', borderLeftWidth: 5, borderLeftColor: '#FFD166' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  nameGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF3D5', justifyContent: 'center', alignItems: 'center' },
  illnessName: { fontSize: 16, fontWeight: '800', color: '#333', flex: 1 },
  monthLabel: { fontSize: 11, color: '#AAA', fontWeight: '700' },
  timeBox: { backgroundColor: '#EFFBFE', padding: 9, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#DDF5FB' },
  timeLine: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  timeText: { fontSize: 12, color: '#777' },
  timeBold: { fontWeight: '700', color: '#5C7A8A' },
  descContainer: { marginBottom: 12 },
  descTitle: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' },
  descText: { fontSize: 13, color: '#666', lineHeight: 18 },
  cardActions: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10 },
  detailLink: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  linkText: { fontSize: 12, fontWeight: '700', color: '#FFB6C1', marginRight: 4 },
  iconAction: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFF8FA', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 45, paddingHorizontal: 20 },
  stateText: { color: '#5C7A8A', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  retryBtn: { backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, marginTop: 12 },
  retryText: { color: '#FFF', fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#2196F3' },
  modalSubtitle: { fontSize: 13, color: '#8899AA', fontWeight: '600', marginBottom: 20 },
  filterLabel: { fontSize: 15, fontWeight: '800', color: '#333', marginBottom: 10, marginTop: 10 },
  modalFilterRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  filterPill: { backgroundColor: '#F0F4F8', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  filterPillActive: { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
  filterPillActiveWarning: { backgroundColor: '#FFF3E0', borderColor: '#FF9800' },
  filterPillText: { fontSize: 13, fontWeight: '700', color: '#8899AA' },
  filterPillTextActive: { color: '#2196F3' },
  toggleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#E0E0E0', marginTop: 5 },
  toggleBoxActive: { backgroundColor: '#E8F9ED', borderColor: '#4CAF50' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CCC', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  toggleTitle: { fontSize: 14, fontWeight: '800', color: '#333' },
  toggleSub: { fontSize: 12, color: '#8899AA', marginTop: 2 },
  generateBtn: { flexDirection: 'row', backgroundColor: '#2196F3', paddingVertical: 16, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 25, elevation: 3 },
  generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
