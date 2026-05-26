import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ApiError, createVaccineRecord, getVaccineTypes, updateVaccineRecord, type VaccineTypeResponse } from '../../lib/api';
import { useNotification } from '../../lib/notification';

const pad = (value: number) => String(value).padStart(2, '0');

const parseDisplayDate = (value: string): Date | null => {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, dayRaw, monthRaw, yearRaw] = match;
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const formatDisplayDate = (date: Date) => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
const formatApiDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};
const formatApiDateToDisplay = (value: string) => {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return '';
  }

  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
};

const LOCATION_SUGGESTIONS = [
  'VNVC Sơn Tây',
  'VNVC Hà Nội',
  'Bệnh viện Nhi Đồng 1',
  'Bệnh viện Nhi Đồng 2',
  'Phòng khám tư',
  'Trạm y tế xã',
  'Khoa Nhi',
  'Cơ sở y tế tư nhân',
];

const TABLE_STATUS = {
  SUCCESS: 3,
  PENDING: -1,
  CANCELED: -2,
};

export default function AddVaccineScreen() {
  const { profileId, mode, recordId, vaccineTypeId: routeVaccineTypeId, vaccineName, injectionDate: routeInjectionDate } = useLocalSearchParams();
  const { showNotification } = useNotification();

  const parsedProfileId = Array.isArray(profileId) ? profileId[0] : profileId;
  const isConfirmMode = mode === 'confirm';
  const parsedRecordId = Array.isArray(recordId) ? recordId[0] : recordId;
  const parsedVaccineTypeId = Number.isFinite(Number(routeVaccineTypeId)) ? Number(routeVaccineTypeId) : null;
  const lockedVaccineName = typeof vaccineName === 'string' ? vaccineName : '';
  const defaultInjectionDate = typeof routeInjectionDate === 'string' ? formatApiDateToDisplay(routeInjectionDate) : '';

  const [vaccineTypes, setVaccineTypes] = useState<VaccineTypeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [vaccineTypeId, setVaccineTypeId] = useState<number | null>(isConfirmMode ? parsedVaccineTypeId : null);
  const [injectionDate, setInjectionDate] = useState(isConfirmMode ? defaultInjectionDate : '');
  const [dateError, setDateError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState(isConfirmMode ? 3 : -1);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [price, setPrice] = useState('');

  const isCompleted = status === 3;
  const filteredLocationSuggestions = LOCATION_SUGGESTIONS.filter((item) => {
    if (!location.trim()) {
      return true;
    }

    return item.toLowerCase().includes(location.trim().toLowerCase());
  }).slice(0, 5);

  const handleDateInputChange = (value: string) => {
    const formattedValue = formatDateInput(value);
    setInjectionDate(formattedValue);

    if (formattedValue.trim() === '') {
      setDateError('');
      return;
    }

    const parsedDate = parseDisplayDate(formattedValue);
    setDateError(parsedDate ? '' : 'Ngày không hợp lệ. Nhập theo định dạng dd-mm-yyyy.');
  };

  const handleDatePickerChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (!selectedDate) {
      return;
    }

    setInjectionDate(formatDisplayDate(selectedDate));
    setDateError('');
  };

  useEffect(() => {
    if (!isConfirmMode) {
      return;
    }

    setVaccineTypeId(parsedVaccineTypeId);
    setInjectionDate(defaultInjectionDate);
    setStatus(3);
    setSearchText(lockedVaccineName);
  }, [defaultInjectionDate, isConfirmMode, lockedVaccineName, parsedVaccineTypeId]);

  const searchVaccines = async (query: string) => {
    setSearchText(query);

    if (query.trim().length === 0) {
      setVaccineTypes([]);
      setShowDropdown(false);
      return;
    }

    try {
      setLoading(true);
      setShowDropdown(true);
      const data = await getVaccineTypes(query);
      setVaccineTypes(data);
    } catch (error) {
      console.error('Lỗi tìm kiếm vắc-xin:', error);
      setVaccineTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsedProfileId || !vaccineTypeId) {
      showNotification({
        type: 'warning',
        title: 'Thiếu thông tin',
        message: 'Vui lòng chọn hồ sơ và loại vắc-xin.',
      });
      return;
    }

    if (injectionDate.trim() === '') {
      setDateError('Vui lòng nhập ngày tiêm hoặc ngày dự kiến.');
      return;
    }

    const parsedDate = parseDisplayDate(injectionDate);
    if (!parsedDate) {
      setDateError('Ngày không hợp lệ. Nhập theo định dạng dd-mm-yyyy.');
      return;
    }

    if (isConfirmMode && !parsedRecordId) {
      showNotification({
        type: 'error',
        title: 'Không tìm thấy lịch tiêm',
        message: 'Không thể xác nhận vì lịch tiêm không hợp lệ.',
      });
      return;
    }

    const normalizedPrice = price.trim() === '' ? undefined : Number(price.replace(/[^0-9]/g, ''));

    const request = {
      profileId: Number(parsedProfileId),
      vaccineTypeId,
      injectionDate: formatApiDate(parsedDate),
      note: note.trim() || undefined,
      status: isCompleted ? TABLE_STATUS.SUCCESS : TABLE_STATUS.PENDING,
      ...(isCompleted
        ? {
            location: location.trim() || undefined,
            price: Number.isFinite(normalizedPrice) ? normalizedPrice : undefined,
          }
        : {}),
    };

    try {
      if (isConfirmMode) {
        await updateVaccineRecord(parsedRecordId!, request);
        showNotification({
          type: 'success',
          title: 'Xác nhận thành công',
          message: 'Mũi tiêm đã được cập nhật và đã chuyển sang trạng thái đã tiêm.',
        });
        router.replace('/lichtiem/listlichtiem');
        return;
      }

      await createVaccineRecord(request);
      showNotification({
        type: 'success',
        title: 'Thêm mũi tiêm thành công',
        message: 'Lịch tiêm đã được lưu vào sổ tiêm chủng.',
      });
      router.back();
    } catch (error) {
      console.error('Lỗi lưu mũi tiêm:', error);

      const backendMessage = error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Không thể lưu mũi tiêm. Vui lòng thử lại.';

      showNotification({
        type: 'error',
        title: 'Lưu thất bại',
        message: backendMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea} keyboardShouldPersistTaps="handled">
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isConfirmMode ? 'Xác nhận đã tiêm' : 'Thêm Mũi Tiêm'}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>💉 </Text> {isConfirmMode ? 'Tên vắc-xin' : 'Tên vắc-xin / Bệnh phòng ngừa'}
          </Text>

          {isConfirmMode ? (
            <View style={styles.lockedVaccineBox}>
              <Text style={styles.lockedVaccineText}>{lockedVaccineName || 'Không có tên vắc-xin'}</Text>
            </View>
          ) : (
            <View style={styles.dropdownWrapper}>
              <TextInput
                style={[styles.inputRounded, showDropdown && styles.inputActive]}
                placeholder="Nhập tên vắc-xin (VD: soi, viem gan...)"
                placeholderTextColor="#b0bec5"
                value={searchText}
                onChangeText={searchVaccines}
                onFocus={() => {
                  if (searchText.length > 0) {
                    setShowDropdown(true);
                  }
                }}
              />

              {showDropdown && (
                <View style={styles.dropdownBox}>
                  {loading ? (
                    <ActivityIndicator color="#ff8fab" style={{ margin: 15 }} />
                  ) : vaccineTypes.length > 0 ? (
                    vaccineTypes.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setVaccineTypeId(item.id);
                          setSearchText(item.name);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>
                          💉 <Text style={styles.textBold}>{item.name}</Text>
                        </Text>
                        <Text style={styles.dropdownSubtext}>{item.description || 'Không có mô tả'}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownSubtext}>Không tìm thấy vắc-xin nào phù hợp</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📅 </Text> Ngày tiêm (hoặc dự kiến)
          </Text>

          <View style={styles.dateInputRow}>
            <TextInput
              style={styles.dateInput}
              placeholder="dd-mm-yyyy"
              placeholderTextColor="#b0bec5"
              value={injectionDate}
              onChangeText={handleDateInputChange}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={10}
            />

            <TouchableOpacity
              style={styles.dateIconButton}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel="Chọn ngày bằng lịch"
            >
              <Ionicons name="calendar-outline" size={22} color="#ff8fab" />
            </TouchableOpacity>
          </View>

          {dateError ? <Text style={styles.dateErrorText}>{dateError}</Text> : null}

          {showDatePicker ? (
            <DateTimePicker
              value={parseDisplayDate(injectionDate) ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDatePickerChange}
            />
          ) : null}
        </View>

        {isCompleted && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelSticker}>📍 </Text> Địa điểm tiêm
              </Text>

              <View style={styles.dropdownWrapper}>
                <TextInput
                  style={[styles.inputRounded, showLocationDropdown && styles.inputActive]}
                  placeholder="VD: VNVC Sơn Tây..."
                  placeholderTextColor="#b0bec5"
                  value={location}
                  onChangeText={(value) => {
                    setLocation(value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                />

                {showLocationDropdown && filteredLocationSuggestions.length > 0 && (
                  <View style={styles.locationDropdownBox}>
                    {filteredLocationSuggestions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.locationDropdownItem}
                        onPress={() => {
                          setLocation(item);
                          setShowLocationDropdown(false);
                        }}
                      >
                        <Text style={styles.locationDropdownText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Text style={styles.labelSticker}>💰 </Text> Chi phí (VNĐ)
              </Text>
              <TextInput
                style={styles.inputRounded}
                placeholder="VD: 1.045.000"
                placeholderTextColor="#b0bec5"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>⭐ </Text> Trạng thái
          </Text>

          {isConfirmMode ? (
            <View style={styles.confirmStatusBox}>
              <Text style={styles.confirmStatusText}>Đã tiêm ✅</Text>
            </View>
          ) : (
            <View style={styles.pillContainer}>
              <TouchableOpacity
                style={[styles.pillButton, status === 3 ? styles.pillActive : styles.pillInactive]}
                onPress={() => setStatus(3)}
              >
                <Text style={status === 3 ? styles.pillActiveText : styles.pillInactiveText}>Đã tiêm ✅</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pillButton, status === -1 ? styles.pillActive : styles.pillInactive]}
                onPress={() => setStatus(-1)}
              >
                <Text style={status === -1 ? styles.pillActiveText : styles.pillInactiveText}>Sắp tới ⏳</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Text style={styles.labelSticker}>📝 </Text> Ghi chú của mẹ
          </Text>
          <TextInput
            style={[styles.inputRounded, styles.textArea]}
            placeholder="VD: Bé hơi sốt nhẹ vào buổi tối..."
            placeholderTextColor="#b0bec5"
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💖 Lưu vào Sổ Tiêm</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 30 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5, zIndex: -1 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: '700', color: '#5c7a8a', marginBottom: 10, marginLeft: 5 },
  labelSticker: { fontSize: 18 },
  inputRounded: { backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, fontSize: 16, color: '#333333', borderWidth: 2, borderColor: '#f0f4f8', elevation: 3 },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    elevation: 3,
    paddingRight: 10,
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333333',
  },
  dateIconButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateErrorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 5,
    fontWeight: '600',
  },
  dropdownWrapper: { zIndex: 10 },
  inputActive: { borderBottomLeftRadius: 5, borderBottomRightRadius: 5, borderColor: '#a7e4f5' },
  dropdownBox: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#a7e4f5', borderTopWidth: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', elevation: 4 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f4f8' },
  dropdownText: { fontSize: 15, color: '#333333', marginBottom: 4 },
  dropdownSubtext: { fontSize: 13, color: '#8899aa', fontStyle: 'italic' },
  lockedVaccineBox: {
    backgroundColor: '#fffaf3',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ffd59e',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  lockedVaccineText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5c7a8a',
  },
  locationDropdownBox: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#a7e4f5',
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  locationDropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  locationDropdownText: {
    fontSize: 15,
    color: '#333333',
  },
  confirmStatusBox: {
    backgroundColor: '#e7f8ee',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: '#a7e4b8',
  },
  confirmStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2e7d32',
  },
  textBold: { fontWeight: 'bold', color: '#ff8fab' },
  textArea: { height: 100, textAlignVertical: 'top', borderRadius: 20 },
  pillContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  pillButton: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', borderWidth: 2 },
  pillActive: { backgroundColor: '#c1f0d0', borderColor: '#a3d9b1', marginRight: 10 },
  pillActiveText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 15 },
  pillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8', marginLeft: 10 },
  pillInactiveText: { color: '#a0aab2', fontWeight: '600', fontSize: 15 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.9)' },
  saveButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 },
  saveButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
