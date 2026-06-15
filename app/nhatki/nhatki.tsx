import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { DiaryBanner } from '../../components/nhatki/DiaryBanner';
import { DiaryCard, type DiaryPost } from '../../components/nhatki/DiaryCard';
import type { DiaryEntryResponse, ProfileResponse } from '../../lib/api';
import { deleteDiaryEntry, getDiaryEntries, resolveAssetUrl, resolveOptimizedAssetUrl } from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { ensureCurrentUserSelectedProfile } from '../../lib/profile-session';

const DEFAULT_AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/1154/1154444.png';
type DateFilterTarget = 'start' | 'end';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseProfileDate(dateOfBirth?: string | null) {
  const value = dateOfBirth?.trim() ?? '';
  const usDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (usDate) {
    return new Date(Number(usDate[3]), Number(usDate[1]) - 1, Number(usDate[2]));
  }
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }
  return new Date(Number.NaN);
}

function parseIsoDate(dateValue?: string | null) {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateValue?.trim() ?? '');
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }
  return new Date(Number.NaN);
}

function toDisplayDate(isoDate: string) {
  const date = parseIsoDate(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function parseDisplayDate(dateValue: string) {
  const displayDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateValue.trim());
  if (displayDate) {
    return new Date(Number(displayDate[3]), Number(displayDate[2]) - 1, Number(displayDate[1]));
  }
  return parseIsoDate(dateValue);
}

function formatDisplayDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function normalizeDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function validateDateRange(startDateText: string, endDateText: string) {
  const startDate = startDateText ? parseDisplayDate(startDateText) : null;
  const endDate = endDateText ? parseDisplayDate(endDateText) : null;

  if (startDateText && (startDateText.length < 10 || !startDate || Number.isNaN(startDate.getTime()))) {
    return 'Ngày bắt đầu không hợp lệ. Nhập theo DD/MM/YYYY.';
  }
  if (endDateText && (endDateText.length < 10 || !endDate || Number.isNaN(endDate.getTime()))) {
    return 'Ngày kết thúc không hợp lệ. Nhập theo DD/MM/YYYY.';
  }
  if (startDate && endDate && startOfDay(startDate).getTime() > startOfDay(endDate).getTime()) {
    return 'Ngày bắt đầu không được sau ngày kết thúc.';
  }
  return null;
}

function isPostInDateRange(post: DiaryPost, startDateText: string, endDateText: string) {
  const postDate = parseDisplayDate(post.date);
  if (Number.isNaN(postDate.getTime())) {
    return true;
  }

  const startDate = startDateText && startDateText.length === 10 ? parseDisplayDate(startDateText) : null;
  const endDate = endDateText && endDateText.length === 10 ? parseDisplayDate(endDateText) : null;
  const target = startOfDay(postDate).getTime();

  if (startDate && !Number.isNaN(startDate.getTime()) && target < startOfDay(startDate).getTime()) {
    return false;
  }
  if (endDate && !Number.isNaN(endDate.getTime()) && target > startOfDay(endDate).getTime()) {
    return false;
  }
  return true;
}

function formatAgeAt(profile: ProfileResponse | null, isoDate?: string | null) {
  const dob = parseProfileDate(profile?.dateOfBirth);
  const target = parseIsoDate(isoDate);
  if (!profile || Number.isNaN(dob.getTime()) || Number.isNaN(target.getTime())) {
    return 'Theo hồ sơ đang chọn';
  }

  const days = Math.max(0, Math.floor((startOfDay(target).getTime() - startOfDay(dob).getTime()) / 86400000));
  const monthAdjustment = target.getDate() < dob.getDate() ? 1 : 0;
  const months = Math.max(0, (target.getFullYear() - dob.getFullYear()) * 12 + target.getMonth() - dob.getMonth() - monthAdjustment);

  if (months === 0) {
    return `${days} ngày tuổi`;
  }
  if (months < 24) {
    const monthStart = new Date(dob.getFullYear(), dob.getMonth() + months, dob.getDate());
    const remainingDays = Math.max(0, Math.floor((startOfDay(target).getTime() - startOfDay(monthStart).getTime()) / 86400000));
    return remainingDays > 0 ? `${months} tháng ${remainingDays} ngày` : `${months} tháng tuổi`;
  }
  return `${Math.floor(months / 12)} tuổi`;
}

function mapDiaryPost(entry: DiaryEntryResponse, profile: ProfileResponse | null): DiaryPost {
  const optimizedImage = entry.imageUrl ? resolveOptimizedAssetUrl(entry.imageUrl, 'cooking') : null;
  return {
    id: String(entry.id),
    date: toDisplayDate(entry.entryDate),
    age: formatAgeAt(profile, entry.entryDate),
    title: entry.title,
    content: entry.content,
    image: optimizedImage || resolveAssetUrl(entry.imageUrl),
    milestone: entry.milestone,
  };
}

export default function BabyDiaryScreen() {
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [posts, setPosts] = useState<DiaryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startDateText, setStartDateText] = useState('');
  const [endDateText, setEndDateText] = useState('');
  const [dateFilterError, setDateFilterError] = useState<string | null>(null);
  const [visibleDatePicker, setVisibleDatePicker] = useState<DateFilterTarget | null>(null);

  const loadDiary = useCallback(async () => {
    const selectedProfile = await ensureCurrentUserSelectedProfile();
    setProfile(selectedProfile);

    if (!selectedProfile?.id) {
      setPosts([]);
      setError('Vui lòng chọn hồ sơ trước khi xem nhật ký.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDiaryEntries(selectedProfile.id, { search: searchText.trim() || undefined });
      setPosts(data.map((entry) => mapDiaryPost(entry, selectedProfile)));
    } catch (err) {
      setPosts([]);
      setError(err instanceof Error ? err.message : 'Không thể tải nhật ký.');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useFocusEffect(useCallback(() => {
    loadDiary();
  }, [loadDiary]));

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => isPostInDateRange(post, startDateText, endDateText));
  }, [endDateText, posts, startDateText]);

  const hasDateFilter = Boolean(startDateText || endDateText);

  const updateDateFilter = (target: DateFilterTarget, value: string) => {
    const formattedValue = normalizeDateInput(value);
    const nextStartDate = target === 'start' ? formattedValue : startDateText;
    const nextEndDate = target === 'end' ? formattedValue : endDateText;

    if (target === 'start') {
      setStartDateText(formattedValue);
    } else {
      setEndDateText(formattedValue);
    }
    setDateFilterError(validateDateRange(nextStartDate, nextEndDate));
  };

  const handleDatePickerChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    const target = visibleDatePicker;
    setVisibleDatePicker(null);

    if (!target || !selectedDate) {
      return;
    }

    const formattedValue = formatDisplayDate(selectedDate);
    const nextStartDate = target === 'start' ? formattedValue : startDateText;
    const nextEndDate = target === 'end' ? formattedValue : endDateText;

    if (target === 'start') {
      setStartDateText(formattedValue);
    } else {
      setEndDateText(formattedValue);
    }
    setDateFilterError(validateDateRange(nextStartDate, nextEndDate));
  };

  const clearDateFilter = () => {
    setStartDateText('');
    setEndDateText('');
    setDateFilterError(null);
  };

  const handleDelete = (post: DiaryPost) => {
    Alert.alert(
      'Xóa nhật ký',
      'Khoảnh khắc này sẽ được xóa khỏi dòng thời gian của bé.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiaryEntry(post.id);
              showNotification({ type: 'success', title: 'Đã xóa nhật ký' });
              await loadDiary();
            } catch (err) {
              showNotification({ type: 'error', title: 'Không thể xóa', message: err instanceof Error ? err.message : 'Vui lòng thử lại sau.' });
            }
          },
        },
      ]
    );
  };

  const renderState = () => {
    if (loading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải nhật ký...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={28} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadDiary}>
            <Text style={styles.retryText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    const emptyText = posts.length > 0
      ? 'Chưa có khoảnh khắc nào trong khoảng thời gian này.'
      : 'Chưa có khoảnh khắc nào. Mẹ lưu kỷ niệm đầu tiên cho bé nhé.';

    return (
      <View style={styles.stateBox}>
        <Ionicons name="book-outline" size={28} color="#A7E4F5" />
        <Text style={styles.stateText}>{emptyText}</Text>
      </View>
    );
  };

  const avatarUrl = resolveAssetUrl(profile?.imageUrl) || DEFAULT_AVATAR_URL;
  const profileName = profile?.name ? `${profile.name}` : 'Bé yêu';
  const profileAge = formatAgeAt(profile, new Date().toISOString().slice(0, 10));
  const currentPickerText = visibleDatePicker === 'start' ? startDateText : endDateText;
  const parsedPickerDate = currentPickerText ? parseDisplayDate(currentPickerText) : null;
  const pickerDateValue = parsedPickerDate && !Number.isNaN(parsedPickerDate.getTime()) ? parsedPickerDate : new Date();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
              </TouchableOpacity>
              <View style={styles.headerCopy}>
                <Text style={styles.headerTitle}>Nhật Ký của Bé</Text>
                <Text style={styles.headerSubtitle}>Lưu lại từng khoảnh khắc lớn lên</Text>
              </View>
              <TouchableOpacity style={styles.searchButton} onPress={() => setSearchVisible((visible) => !visible)}>
                <Ionicons name={searchVisible ? 'close' : 'search'} size={23} color="#FF8FAB" />
              </TouchableOpacity>
            </View>

            {searchVisible ? (
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#ff8fab" />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Tìm theo tiêu đề, nội dung, cột mốc..."
                  placeholderTextColor="#B0BEC5"
                  style={styles.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={loadDiary}
                />
              </View>
            ) : null}

            <DiaryBanner
              babyName={profileName}
              babyAge={profileAge}
              avatarUrl={avatarUrl}
              memoryCount={posts.length}
            />

            <View style={styles.timeFilterCard}>
              <View style={styles.timeFilterHeader}>
                <Ionicons name="calendar-outline" size={18} color="#FF8FAB" />
                <Text style={styles.timeFilterTitle}>Lọc theo thời gian</Text>
                {hasDateFilter ? (
                  <TouchableOpacity style={styles.clearDateFilterButton} onPress={clearDateFilter}>
                    <Text style={styles.clearDateFilterText}>Xóa lọc</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.dateFilterRow}>
                <View style={styles.dateField}>
                  <Text style={styles.dateFieldLabel}>Từ ngày</Text>
                  <View style={styles.dateInputBox}>
                    <TextInput
                      value={startDateText}
                      onChangeText={(value) => updateDateFilter('start', value)}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#B7C3CB"
                      keyboardType="number-pad"
                      maxLength={10}
                      style={styles.dateInput}
                    />
                    <TouchableOpacity style={styles.datePickerButton} onPress={() => setVisibleDatePicker('start')}>
                      <Ionicons name="calendar-outline" size={18} color="#FF8FAB" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.dateField}>
                  <Text style={styles.dateFieldLabel}>Đến ngày</Text>
                  <View style={styles.dateInputBox}>
                    <TextInput
                      value={endDateText}
                      onChangeText={(value) => updateDateFilter('end', value)}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#B7C3CB"
                      keyboardType="number-pad"
                      maxLength={10}
                      style={styles.dateInput}
                    />
                    <TouchableOpacity style={styles.datePickerButton} onPress={() => setVisibleDatePicker('end')}>
                      <Ionicons name="calendar-outline" size={18} color="#FF8FAB" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              {dateFilterError ? <Text style={styles.dateFilterError}>{dateFilterError}</Text> : null}
              {visibleDatePicker ? (
                <DateTimePicker
                  value={pickerDateValue}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDatePickerChange}
                />
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={renderState}
        renderItem={({ item, index }) => (
          <DiaryCard
            post={item}
            isLast={index === filteredPosts.length - 1}
            onEdit={(post) => router.push({ pathname: '/nhatki/themnhatki', params: { id: post.id } })}
            onShare={() => Alert.alert('Chia sẻ', 'Tính năng chia sẻ sẽ được mở rộng sau khi mẹ chọn kênh chia sẻ.')}
            onDelete={handleDelete}
          />
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/nhatki/themnhatki')}
        >
          <LinearGradient colors={['#FF8FAB', '#FFB86C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addButtonGradient}>
            <Ionicons name="camera" size={24} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Lưu khoảnh khắc</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  listContent: { padding: 20, paddingBottom: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 42, marginBottom: 18 },
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
  searchButton: {
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
  headerCopy: { flex: 1, alignItems: 'center' },
  headerTitle: { textAlign: 'center', fontSize: 24, fontWeight: '900', color: '#FF8FAB' },
  headerSubtitle: { color: '#5C7A8A', fontSize: 12, fontWeight: '800', marginTop: 3 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 22, borderWidth: 1.5, borderColor: '#FFE5EC', paddingHorizontal: 14, marginBottom: 16, shadowColor: '#FF8FAB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 2 },
  searchInput: { flex: 1, paddingVertical: 12, paddingLeft: 8, color: '#334455', fontSize: 14, fontWeight: '700' },
  timeFilterCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE6EE',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  timeFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeFilterTitle: {
    color: '#5C7A8A',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 7,
  },
  clearDateFilterButton: {
    marginLeft: 'auto',
    backgroundColor: '#FFF0F5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearDateFilterText: {
    color: '#FF8FAB',
    fontSize: 11,
    fontWeight: '900',
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateField: {
    flex: 1,
    minWidth: 0,
  },
  dateFieldLabel: {
    color: '#7B8794',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 6,
    marginLeft: 2,
  },
  dateInputBox: {
    minHeight: 44,
    borderRadius: 17,
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#FFE5EC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  dateInput: {
    flex: 1,
    color: '#334455',
    fontSize: 13,
    fontWeight: '900',
    paddingVertical: 10,
  },
  datePickerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateFilterError: {
    color: '#F05F78',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
    lineHeight: 16,
  },
  stateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 45, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 26, borderWidth: 1, borderColor: '#FFE5EC' },
  stateText: { color: '#5C7A8A', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10, lineHeight: 19 },
  retryBtn: { backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, marginTop: 12 },
  retryText: { color: '#FFF', fontWeight: '900' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  addButton: { borderRadius: 30, overflow: 'hidden', shadowColor: '#FF8FAB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 5 },
  addButtonGradient: { flexDirection: 'row', paddingVertical: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '900' },
});
