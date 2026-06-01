import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { createHealthRecord } from '../../lib/api';
import { parseDisplayDateToIso, todayIsoDate, toDisplayDate } from '../../lib/health-format';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

function parseNumber(value: string) {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function UpdateIndexScreen() {
  const { showNotification } = useNotification();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [recordDate, setRecordDate] = useState(toDisplayDate(todayIsoDate()));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile?.id) {
      showNotification({ type: 'error', title: 'Chưa chọn hồ sơ', message: 'Vui lòng chọn hồ sơ trước khi cập nhật chỉ số.' });
      return;
    }

    const isoRecordDate = parseDisplayDateToIso(recordDate);
    const payload = {
      profileId: profile.id,
      height: parseNumber(height),
      weight: parseNumber(weight),
      heartRate: parseNumber(heartRate),
      recordDate: isoRecordDate || '',
    };

    if (!isoRecordDate) {
      showNotification({ type: 'error', title: 'Ngày không hợp lệ', message: 'Ngày ghi nhận cần theo định dạng DD/MM/YYYY.' });
      return;
    }
    if (!payload.height && !payload.weight && !payload.heartRate) {
      showNotification({ type: 'error', title: 'Thiếu chỉ số', message: 'Hãy nhập ít nhất một chỉ số sức khỏe.' });
      return;
    }

    try {
      setSaving(true);
      await createHealthRecord(payload);
      showNotification({
        type: 'success',
        title: 'Cập nhật thành công',
        message: 'Chỉ số sức khỏe đã được lưu vào hồ sơ.',
      });
      router.back();
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Không thể lưu',
        message: err instanceof Error ? err.message : 'Vui lòng thử lại sau.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="close" size={28} color="#ff8fab" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cập Nhật Chỉ Số</Text>
            <View style={{ width: 45 }} />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#FF8FAB" />
            <Text style={styles.infoText}>
              Nhập chỉ số mới nhất để hệ thống theo dõi sức khỏe theo hồ sơ đang chọn.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày ghi nhận</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={recordDate}
                  onChangeText={setRecordDate}
                  placeholder="DD/MM/YYYY"
                  keyboardType="numbers-and-punctuation"
                />
                <Ionicons name="calendar-outline" size={18} color="#FFB6C1" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chiều cao (cm)</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="Ví dụ: 58" />
                <Text style={styles.unitText}>(cm)</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Ví dụ: 5.3" />
                <Text style={styles.unitText}>(kg)</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nhịp tim (lần/phút)</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={heartRate} onChangeText={setHeartRate} keyboardType="numeric" placeholder="Ví dụ: 110" />
                <Text style={styles.unitText}>(bpm)</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu chỉ số'}</Text>
            <Ionicons name="checkmark-circle" size={22} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Hủy bỏ</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollContent: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  infoBox: { flexDirection: 'row', backgroundColor: '#FFF0F3', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#FFE5EC' },
  infoText: { flex: 1, marginLeft: 10, color: '#FF8FAB', fontSize: 13, fontWeight: '700' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 16, fontWeight: '800', color: '#5C7A8A', marginLeft: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 2, borderColor: '#f0f4f8', paddingHorizontal: 15, height: 60, elevation: 2, shadowColor: '#FFB6C1', shadowOpacity: 0.1, shadowRadius: 4 },
  input: { flex: 1, fontSize: 18, fontWeight: '800', color: '#333' },
  unitText: { color: '#999', fontWeight: '700', fontSize: 14 },
  saveButton: { backgroundColor: '#98D8AA', height: 60, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40, elevation: 5, shadowColor: '#98D8AA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  cancelButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  cancelText: { color: '#AAA', fontWeight: '700', fontSize: 15 }
});
