import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ApiError, createVaccineRecord, getVaccineTypes, updateVaccineRecord, type VaccineTypeResponse } from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

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

const normalizeSearchText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

const filterVaccineTypes = (items: VaccineTypeResponse[], query: string) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => normalizeSearchText(`${item.name} ${item.description ?? ''}`).includes(normalizedQuery));
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

  const routeProfileId = Array.isArray(profileId) ? profileId[0] : profileId;
  const isConfirmMode = mode === 'confirm';
  const parsedRecordId = Array.isArray(recordId) ? recordId[0] : recordId;
  const parsedVaccineTypeId = Number.isFinite(Number(routeVaccineTypeId)) ? Number(routeVaccineTypeId) : null;
  const lockedVaccineName = typeof vaccineName === 'string' ? vaccineName : '';
  const defaultInjectionDate = typeof routeInjectionDate === 'string' ? formatApiDateToDisplay(routeInjectionDate) : '';

  const [vaccineTypes, setVaccineTypes] = useState<VaccineTypeResponse[]>([]);
  const [effectiveProfileId, setEffectiveProfileId] = useState<string | null>(routeProfileId ?? null);
  const [allVaccineTypes, setAllVaccineTypes] = useState<VaccineTypeResponse[] | null>(null);
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

  useEffect(() => {
    let mounted = true;

    async function resolveProfileId() {
      if (routeProfileId) {
        setEffectiveProfileId(routeProfileId);
        return;
      }

      const profile = getSelectedProfile() || (await hydrateSelectedProfile());
      if (mounted) {
        setEffectiveProfileId(profile?.id ? String(profile.id) : null);
      }
    }

    resolveProfileId();

    return () => {
      mounted = false;
    };
  }, [routeProfileId]);

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

  const loadVaccineTypes = async () => {
    if (allVaccineTypes) {
      return allVaccineTypes;
    }

    const data = await getVaccineTypes();
    setAllVaccineTypes(data);
    return data;
  };

  const searchVaccines = async (query: string) => {
    setSearchText(query);
    setVaccineTypeId(null);

    if (query.trim().length === 0) {
      setVaccineTypes([]);
      setShowDropdown(false);
      return;
    }

    try {
      setLoading(true);
      setShowDropdown(true);
      const data = await getVaccineTypes(query);

      if (data.length > 0) {
        setVaccineTypes(data);
        return;
      }

      const fallbackData = await loadVaccineTypes();
      setVaccineTypes(filterVaccineTypes(fallbackData, query));
    } catch {
      try {
        const fallbackData = await loadVaccineTypes();
        setVaccineTypes(filterVaccineTypes(fallbackData, query));
      } catch {
        setVaccineTypes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!effectiveProfileId || !vaccineTypeId) {
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
      profileId: Number(effectiveProfileId),
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
        router.replace({
          pathname: '/lichtiem/listlichtiem',
          params: {
            profileId: effectiveProfileId,
            refreshAt: Date.now().toString(),
          },
        });
        return;
      }

      await createVaccineRecord(request);
      showNotification({
        type: 'success',
        title: 'Thêm mũi tiêm thành công',
        message: 'Lịch tiêm đã được lưu vào sổ tiêm chủng.',
      });
      router.replace({
        pathname: '/lichtiem/listlichtiem',
        params: {
          profileId: effectiveProfileId,
          refreshAt: Date.now().toString(),
        },
      });
    } catch (error) {
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
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentMint} />
      <View pointerEvents="none" style={styles.backgroundSparkle}>
        <Ionicons name="sparkles" size={22} color="#FFD36E" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea} keyboardShouldPersistTaps="handled">
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerSparkle}>✦</Text>
            <Text style={styles.headerTitle}>{isConfirmMode ? 'Xác nhận đã tiêm' : 'Thêm Mũi Tiêm'}</Text>
            <Text style={styles.headerSubtitle}>{isConfirmMode ? 'Hoàn tất thông tin mũi tiêm của bé' : 'Lưu lịch và ghi chú chăm sóc bé'}</Text>
          </View>
          <View style={styles.headerGhostButton}>
            <Ionicons name={isConfirmMode ? 'checkmark-circle' : 'medical'} size={21} color={isConfirmMode ? '#5ABF7A' : '#FF8FAB'} />
          </View>
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
          <LinearGradient colors={['#FF8FAB', '#FFB86C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveButtonGradient}>
            <Ionicons name="heart" size={21} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Lưu vào Sổ Tiêm</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  scrollArea: { padding: 20 },
  backgroundAccentTop: {
    position: 'absolute',
    top: 58,
    left: -42,
    width: 154,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 182, 193, 0.18)',
    transform: [{ rotate: '-18deg' }],
  },
  backgroundAccentMint: {
    position: 'absolute',
    top: 498,
    right: -48,
    width: 150,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(184, 239, 207, 0.24)',
    transform: [{ rotate: '18deg' }],
  },
  backgroundSparkle: {
    position: 'absolute',
    top: 118,
    left: 32,
    opacity: 0.78,
    transform: [{ rotate: '-12deg' }],
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 42,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerSparkle: {
    position: 'absolute',
    left: '19%',
    top: 0,
    color: '#FFD8E5',
    fontSize: 14,
    fontWeight: '900',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '900',
    color: '#FF8FAB',
  },
  headerSubtitle: {
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  headerGhostButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  inputGroup: { marginBottom: 23 },
  label: { fontSize: 15, fontWeight: '900', color: '#5C7A8A', marginBottom: 10, marginLeft: 5 },
  labelSticker: { fontSize: 18 },
  inputRounded: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 22,
    fontSize: 15,
    color: '#334455',
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
    fontWeight: '700',
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
    paddingRight: 10,
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 15,
    color: '#334455',
    fontWeight: '700',
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
  inputActive: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderColor: '#A7E4F5' },
  dropdownBox: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#A7E4F5', borderTopWidth: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', elevation: 4 },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  dropdownText: { fontSize: 15, color: '#334455', marginBottom: 4 },
  dropdownSubtext: { fontSize: 13, color: '#8899aa', fontStyle: 'italic' },
  lockedVaccineBox: {
    backgroundColor: '#FFF8E8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFE6BA',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  lockedVaccineText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5C7A8A',
  },
  locationDropdownBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#A7E4F5',
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
    borderBottomColor: '#F0F4F8',
  },
  locationDropdownText: {
    fontSize: 15,
    color: '#334455',
  },
  confirmStatusBox: {
    backgroundColor: '#E8F9ED',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#D7F5E3',
  },
  confirmStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2e7d32',
  },
  textBold: { fontWeight: '900', color: '#FF8FAB' },
  textArea: { height: 100, textAlignVertical: 'top', borderRadius: 20 },
  pillContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  pillButton: { flex: 1, paddingVertical: 14, borderRadius: 22, alignItems: 'center', borderWidth: 1 },
  pillActive: { backgroundColor: '#E8F9ED', borderColor: '#B8EFCF', marginRight: 10 },
  pillActiveText: { color: '#2E7D32', fontWeight: '900', fontSize: 15 },
  pillInactive: { backgroundColor: '#FFFFFF', borderColor: '#FFE5EC', marginLeft: 10 },
  pillInactiveText: { color: '#8A96A3', fontWeight: '800', fontSize: 15 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  saveButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900', marginLeft: 8 },
});
