import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { createIllnessEvent, getIllnessEvent, updateIllnessEvent } from '../../lib/api';
import { getIllnessStatusCode, getIllnessStatusLabel, parseDisplayDateToIso, todayIsoDate, toDisplayDate } from '../../lib/health-format';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

export default function AddIllnessScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEditing = Boolean(editingId);
  const { showNotification } = useNotification();
  const [severity, setSeverity] = useState('Bình thường');
  const [illnessType, setIllnessType] = useState('');
  const [startAt, setStartAt] = useState(toDisplayDate(todayIsoDate()));
  const [endAt, setEndAt] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const severityLevels = useMemo(() => ['Nhẹ', 'Bình thường', 'Cần chú ý'], []);

  useEffect(() => {
    let mounted = true;

    async function loadEvent() {
      if (!editingId) {
        return;
      }

      try {
        const event = await getIllnessEvent(editingId);
        if (!mounted) {
          return;
        }
        setIllnessType(event.illnessType || '');
        setStartAt(toDisplayDate(event.startAt));
        setEndAt(event.endAt ? toDisplayDate(event.endAt) : '');
        setDescription(event.description || '');
        setSeverity(getIllnessStatusLabel(event.status, event.statusLabel));
      } catch (err) {
        showNotification({ type: 'error', title: 'Không thể tải ghi chép', message: err instanceof Error ? err.message : 'Vui lòng thử lại sau.' });
      }
    }

    loadEvent();
    return () => {
      mounted = false;
    };
  }, [editingId, showNotification]);

  const handleSave = async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    const isoStartAt = parseDisplayDateToIso(startAt);
    const isoEndAt = endAt.trim() ? parseDisplayDateToIso(endAt) : null;

    if (!profile?.id) {
      showNotification({ type: 'error', title: 'Chưa chọn hồ sơ', message: 'Vui lòng chọn hồ sơ trước khi ghi chép bệnh.' });
      return;
    }
    if (!illnessType.trim()) {
      showNotification({ type: 'error', title: 'Thiếu tên bệnh', message: 'Hãy nhập tên bệnh hoặc triệu chứng.' });
      return;
    }
    if (!isoStartAt || (endAt.trim() && !isoEndAt)) {
      showNotification({ type: 'error', title: 'Ngày không hợp lệ', message: 'Ngày cần theo định dạng DD/MM/YYYY.' });
      return;
    }

    const payload = {
      profileId: profile.id,
      startAt: isoStartAt,
      endAt: isoEndAt,
      illnessType: illnessType.trim(),
      status: getIllnessStatusCode(severity),
      description: description.trim() || null,
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateIllnessEvent(editingId, payload);
      } else {
        await createIllnessEvent(payload);
      }
      showNotification({
        type: 'success',
        title: isEditing ? 'Đã cập nhật ghi chép' : 'Đã lưu ghi chép',
        message: 'Dữ liệu bệnh án đã được cập nhật theo hồ sơ.',
      });
      router.back();
    } catch (err) {
      showNotification({ type: 'error', title: 'Không thể lưu', message: err instanceof Error ? err.message : 'Vui lòng thử lại sau.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Sửa Ghi Chép Bệnh' : 'Ghi Chép Bệnh'}</Text>
          <View style={{ width: 45 }} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên bệnh hoặc triệu chứng</Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="VD: Viêm họng, sốt mọc răng..."
            placeholderTextColor="#b0bec5"
            value={illnessType}
            onChangeText={setIllnessType}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TextInput style={styles.inputRounded} value={startAt} onChangeText={setStartAt} placeholder="DD/MM/YYYY" keyboardType="numbers-and-punctuation" />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TextInput style={styles.inputRounded} value={endAt} onChangeText={setEndAt} placeholder="Bỏ trống nếu chưa khỏi" keyboardType="numbers-and-punctuation" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mức độ nghiêm trọng</Text>
          <View style={styles.pillContainer}>
            {severityLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.pillButton, severity === level ? styles.pillActive : styles.pillInactive]}
                onPress={() => setSeverity(level)}
              >
                <Text style={severity === level ? styles.pillActiveText : styles.pillInactiveText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Chi tiết triệu chứng & thuốc</Text>
          <TextInput
            style={[styles.inputRounded, styles.textArea]}
            placeholder="Bé có sốt không? Đã dùng thuốc gì hoặc đi khám ở đâu chưa?"
            placeholderTextColor="#b0bec5"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.aiButton} onPress={() => router.push('/phattrien/AIquetbenhan')}>
          <Ionicons name="camera" size={20} color="#ff8fab" style={{ marginRight: 8 }} />
          <Text style={styles.aiButtonText}>AI thêm hồ sơ bằng hình ảnh</Text>
          <Ionicons name="sparkles" size={16} color="#ff8fab" style={{ marginLeft: 5, marginTop: -10 }} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} disabled={saving} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu ghi chép'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '800', color: '#5C7A8A', marginBottom: 10, marginLeft: 5 },
  inputRounded: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 20, fontSize: 15, color: '#333333', borderWidth: 2, borderColor: '#f0f4f8', elevation: 2, shadowColor: '#FFB6C1', shadowOpacity: 0.1 },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  pillContainer: { flexDirection: 'row', gap: 10 },
  pillButton: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center', borderWidth: 2 },
  pillActive: { backgroundColor: '#FFD166', borderColor: '#FFD166' },
  pillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8' },
  pillActiveText: { color: '#ffffff', fontWeight: '900', fontSize: 13 },
  pillInactiveText: { color: '#a0aab2', fontWeight: '700', fontSize: 13 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  aiButton: { flexDirection: 'row', backgroundColor: '#ffffff', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ff8fab', marginBottom: 12, shadowColor: '#ff8fab', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  aiButtonText: { color: '#ff8fab', fontSize: 16, fontWeight: '900' },
  saveButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: '#ff8fab', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 5 },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
});
