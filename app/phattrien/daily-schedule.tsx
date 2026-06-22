import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ScheduleItem } from '../../components/phattrien/ScheduleItem';
import {
  analyzeBabyRoutine,
  applyBabyRoutineNextDayAdjustment,
  BabyRoutineAiAnalysisResponse,
  BabyRoutineDayResponse,
  BabyRoutineEntryResponse,
  createBabyRoutineEntry,
  deleteBabyRoutineEntry,
  getBabyRoutineDay,
  updateBabyRoutineEntryCompletion,
} from '../../lib/api';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

type RoutineItem = BabyRoutineEntryResponse & {
  icon: string;
  color: string;
  note: string;
  isDone: boolean;
};

function toDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateParam(value?: string | string[] | null) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (!rawValue) {
    return new Date();
  }
  const [year, month, day] = rawValue.split('-').map(Number);
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
}

function toTimeParam(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getMonday(date: Date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
}

function buildWeekDays(date: Date) {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, index) => {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + index);
    return {
      label: index === 6 ? 'CN' : `Th ${index + 2}`,
      date: nextDate,
      dateParam: toDateParam(nextDate),
    };
  });
}

function mapRoutineItem(item: BabyRoutineEntryResponse): RoutineItem {
  return {
    ...item,
    icon: item.icon || 'calendar',
    color: item.color || '#FF8FAB',
    note: item.note || 'BabyOi sẽ cập nhật theo dữ liệu thực tế của bé.',
    isDone: item.completed,
  };
}

function formatAnalysisMessage(analysis: BabyRoutineAiAnalysisResponse) {
  const lines = [analysis.summary];

  if (analysis.highlights?.length) {
    lines.push('', 'Điểm đang ổn:', ...analysis.highlights.map((item) => `- ${item}`));
  }
  if (analysis.warnings?.length) {
    lines.push('', 'Cần lưu ý:', ...analysis.warnings.map((item) => `- ${item}`));
  }
  if (analysis.suggestions?.length) {
    lines.push('', 'Gợi ý tiếp theo:', ...analysis.suggestions.map((item) => `- ${item}`));
  }
  if (analysis.disclaimer) {
    lines.push('', analysis.disclaimer);
  }

  return lines.join('\n');
}

function formatDateTimeLabel(value?: string | null) {
  if (!value) {
    return '--:--';
  }
  const [datePart, timePart] = value.split(' ');
  if (!datePart || !timePart) {
    return value;
  }
  const [, month, day] = datePart.split('-');
  return `${timePart} (${day}/${month})`;
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return '';
  }
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}

function formatDuration(minutes?: number | null) {
  if (minutes == null) {
    return '';
  }
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  const value = `${hours > 0 ? `${hours} giờ` : ''}${hours > 0 && mins > 0 ? ' ' : ''}${mins > 0 ? `${mins} phút` : ''}` || '0 phút';
  return minutes >= 0 ? `Còn khoảng ${value} đến mốc bé dễ dậy nhất` : `Đã qua mốc bé dễ dậy nhất ${value}`;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

function getTimeDigits(value?: string | null) {
  return (value ?? '').replace(/\D/g, '').slice(0, 4);
}

function formatTimeDigits(digits: string) {
  const value = getTimeDigits(digits);
  if (value.length <= 2) {
    return value;
  }
  if (value.length === 3) {
    return `${value.slice(0, 1)}:${value.slice(1)}`;
  }
  return `${value.slice(0, 2)}:${value.slice(2)}`;
}

function digitsToTime(digits: string) {
  const value = getTimeDigits(digits);
  if (value.length !== 3 && value.length !== 4) {
    return null;
  }
  const normalized = value.length === 3 ? `0${value}` : value;
  const hour = Number(normalized.slice(0, 2));
  const minute = Number(normalized.slice(2));
  if (hour > 23 || minute > 59) {
    return null;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function timeToMinutes(value?: string | null) {
  if (!value || !isValidTime(value)) {
    return null;
  }
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

function effectiveTime(item?: RoutineItem | null) {
  return item?.actualTime || item?.time || null;
}

function sortRoutineItems(items: RoutineItem[]) {
  return [...items].sort((left, right) => {
    const leftMinutes = timeToMinutes(left.time) ?? Number.MAX_SAFE_INTEGER;
    const rightMinutes = timeToMinutes(right.time) ?? Number.MAX_SAFE_INTEGER;
    if (leftMinutes !== rightMinutes) {
      return leftMinutes - rightMinutes;
    }
    return left.id - right.id;
  });
}

function isChildProfile(profile: { profileType?: string | null } | null | undefined) {
  return profile?.profileType === 'CHILD';
}

export default function FullSmartBabySchedule() {
  const params = useLocalSearchParams<{ date?: string }>();
  const routeDate = useMemo(() => parseDateParam(params.date), [params.date]);
  const [selectedDate, setSelectedDate] = useState(routeDate);
  const [routineDay, setRoutineDay] = useState<BabyRoutineDayResponse | null>(null);
  const [schedule, setSchedule] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEntryId, setSavingEntryId] = useState<number | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [adjustingTomorrow, setAdjustingTomorrow] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editTimeDigits, setEditTimeDigits] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [addingAfterIndex, setAddingAfterIndex] = useState<number | null>(null);
  const [addTimeDigits, setAddTimeDigits] = useState('');
  const [addActivity, setAddActivity] = useState('');
  const [addNote, setAddNote] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollYRef = useRef(0);
  const timelineTopRef = useRef(0);
  const itemOffsetsRef = useRef<Record<number, number>>({});

  useEffect(() => {
    setSelectedDate(routeDate);
  }, [routeDate]);

  const selectedDateParam = toDateParam(selectedDate);
  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);
  const routineCompleted = !!routineDay?.entries?.length && routineDay.entries.every((entry) => entry.completed);

  const rememberScrollPosition = useCallback(() => {
    const y = scrollYRef.current;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
    });
  }, []);

  const scrollToScheduleIndex = useCallback((index: number) => {
    const item = schedule[index];
    if (!item) {
      return;
    }
    const offset = itemOffsetsRef.current[item.id];
    if (offset == null) {
      return;
    }
    scrollRef.current?.scrollTo({
      y: Math.max(0, timelineTopRef.current + offset - 18),
      animated: true,
    });
  }, [schedule]);

  const handleJumpToLatestProgress = useCallback(() => {
    if (!schedule.length) {
      return;
    }
    if (schedule.every((item) => item.completed)) {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      router.push({ pathname: '/phattrien/daily-schedule', params: { date: toDateParam(nextDate) } });
      return;
    }
    const latestCompletedIndex = schedule.reduce(
      (latestIndex, item, index) => (item.completed ? index : latestIndex),
      -1
    );
    const nextIndex = latestCompletedIndex >= 0
      ? latestCompletedIndex
      : schedule.findIndex((item) => !item.completed);
    scrollToScheduleIndex(nextIndex);
  }, [schedule, scrollToScheduleIndex, selectedDate]);

  const loadRoutine = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError('');
    }

    try {
      const profile = getSelectedProfile() || await hydrateSelectedProfile();
      if (!profile) {
        setRoutineDay(null);
        setSchedule([]);
        setError('Vui lòng chọn hồ sơ bé trước khi xem lịch sinh hoạt.');
        return;
      }

      if (!isChildProfile(profile)) {
        setRoutineDay(null);
        setSchedule([]);
        setError('Lịch sinh hoạt chỉ áp dụng cho hồ sơ bé. Hồ sơ mẹ không cần thiết lập lịch sinh hoạt.');
        return;
      }

      const data = await getBabyRoutineDay(profile.id, selectedDateParam);
      setRoutineDay(data);
      setSchedule(sortRoutineItems((data.entries || []).map(mapRoutineItem)));
    } catch (err) {
      if (showLoading) {
        setRoutineDay(null);
        setSchedule([]);
        setError(err instanceof Error ? err.message : 'Không thể tải lịch sinh hoạt của bé.');
      } else {
        Alert.alert('BabyOi', err instanceof Error ? err.message : 'Không thể làm mới lịch sinh hoạt.');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [selectedDateParam]);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const handleToggleComplete = async (item: RoutineItem) => {
    if (savingEntryId) {
      return;
    }
    if (item.completed) {
      return;
    }

    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile) {
      Alert.alert('BabyOi', 'Vui lòng chọn hồ sơ bé trước khi cập nhật lịch sinh hoạt.');
      return;
    }

    const todayParam = toDateParam(new Date());
    if (selectedDateParam > todayParam) {
      try {
        const todayRoutine = await getBabyRoutineDay(profile.id, todayParam);
        const todayCompleted = !!todayRoutine.entries?.length && todayRoutine.entries.every((entry) => entry.completed);
        if (!todayCompleted) {
          Alert.alert('Đậu sức khỏe', 'Cần hoàn thành toàn bộ lịch hôm nay trước khi tích lịch ngày tiếp theo.');
          return;
        }
      } catch (err) {
        Alert.alert('BabyOi', err instanceof Error ? err.message : 'Không thể kiểm tra lịch hôm nay.');
        return;
      }
    }

    setSavingEntryId(item.id);
    try {
      const updated = await updateBabyRoutineEntryCompletion(item.id, {
        completed: true,
        actualTime: toTimeParam(new Date()),
      });

      setSchedule((current) => current.map((entry) => (
        entry.id === updated.id ? mapRoutineItem(updated) : entry
      )));
      setRoutineDay((current) => current
        ? {
            ...current,
            entries: current.entries.map((entry) => (entry.id === updated.id ? updated : entry)),
          }
        : current);
      rememberScrollPosition();
    } catch (err) {
      Alert.alert('BabyOi', err instanceof Error ? err.message : 'Không thể cập nhật lịch sinh hoạt.');
    } finally {
      setSavingEntryId(null);
    }
  };

  const openEditTime = (item: RoutineItem) => {
    setAddingAfterIndex(null);
    setEditingEntryId(item.id);
    setEditTimeDigits(getTimeDigits(item.actualTime || item.time));
  };

  const closeEditTime = () => {
    if (editSaving) {
      return;
    }
    setEditingEntryId(null);
    setEditTimeDigits('');
  };

  const handleSaveEditTime = async () => {
    const editingItem = schedule.find((item) => item.id === editingEntryId);
    const actualTime = digitsToTime(editTimeDigits);
    if (!editingItem) {
      return;
    }
    if (!actualTime) {
      Alert.alert('BabyOi', 'Hãy nhập giờ bằng số, ví dụ 730 hoặc 0730.');
      return;
    }

    const itemIndex = schedule.findIndex((item) => item.id === editingItem.id);
    const previousItem = itemIndex > 0 ? schedule[itemIndex - 1] : null;
    const previousMinutes = timeToMinutes(effectiveTime(previousItem));
    const actualMinutes = timeToMinutes(actualTime);
    if (previousMinutes != null && actualMinutes != null && actualMinutes <= previousMinutes) {
      Alert.alert('BabyOi', 'Vui lòng cập nhật lịch trình theo đúng lịch.');
      return;
    }

    setEditSaving(true);
    try {
      const updated = await updateBabyRoutineEntryCompletion(editingItem.id, {
        completed: true,
        actualTime,
      });
      setSchedule((current) => current.map((entry) => (
        entry.id === updated.id ? mapRoutineItem(updated) : entry
      )));
      setRoutineDay((current) => current
        ? {
            ...current,
            entries: current.entries.map((entry) => (entry.id === updated.id ? updated : entry)),
          }
        : current);
      setEditingEntryId(null);
      setEditTimeDigits('');
      rememberScrollPosition();
    } catch (err) {
      Alert.alert('BabyOi', err instanceof Error ? err.message : 'Không thể sửa giờ hoàn thành.');
    } finally {
      setEditSaving(false);
    }
  };

  const openAddEntry = (afterIndex: number) => {
    setEditingEntryId(null);
    setAddingAfterIndex(afterIndex);
    setAddTimeDigits('');
    setAddActivity('');
    setAddNote('');
  };

  const closeAddEntry = () => {
    if (addSaving) {
      return;
    }
    setAddingAfterIndex(null);
    setAddTimeDigits('');
    setAddActivity('');
    setAddNote('');
  };

  const handleSaveAddEntry = async () => {
    if (addingAfterIndex === null) {
      return;
    }
    const plannedTime = digitsToTime(addTimeDigits);
    if (!plannedTime) {
      Alert.alert('BabyOi', 'Hãy nhập giờ bằng số, ví dụ 930 hoặc 0930.');
      return;
    }
    const activity = addActivity.trim();
    if (!activity) {
      Alert.alert('BabyOi', 'Hãy nhập tên lịch sinh hoạt.');
      return;
    }

    const previousItem = addingAfterIndex >= 0 ? schedule[addingAfterIndex] : null;
    const nextItem = addingAfterIndex + 1 < schedule.length ? schedule[addingAfterIndex + 1] : null;
    const plannedMinutes = timeToMinutes(plannedTime);
    const previousMinutes = timeToMinutes(effectiveTime(previousItem));
    const nextMinutes = timeToMinutes(effectiveTime(nextItem));
    if (previousMinutes != null && plannedMinutes != null && plannedMinutes <= previousMinutes) {
      Alert.alert('BabyOi', 'Vui lòng cập nhật lịch trình theo đúng lịch.');
      return;
    }
    if (nextMinutes != null && plannedMinutes != null && plannedMinutes >= nextMinutes) {
      Alert.alert('BabyOi', 'Vui lòng cập nhật lịch trình theo đúng lịch.');
      return;
    }

    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile) {
      Alert.alert('BabyOi', 'Vui lòng chọn hồ sơ bé trước khi thêm lịch sinh hoạt.');
      return;
    }

    setAddSaving(true);
    try {
      const created = await createBabyRoutineEntry(profile.id, {
        routineDate: selectedDateParam,
        plannedTime,
        activity,
        note: addNote.trim() || null,
        type: 'CUSTOM',
        icon: 'calendar',
        color: '#FF8FAB',
      });
      setSchedule((current) => sortRoutineItems([...current, mapRoutineItem(created)]));
      setRoutineDay((current) => current
        ? {
            ...current,
            entries: sortRoutineItems([...current.entries.map(mapRoutineItem), mapRoutineItem(created)]).map((entry) => ({
              id: entry.id,
              profileId: entry.profileId,
              routineDate: entry.routineDate,
              type: entry.type,
              time: entry.time,
              actualTime: entry.actualTime,
              activity: entry.activity,
              note: entry.note,
              icon: entry.icon,
              color: entry.color,
              completed: entry.completed,
              source: entry.source,
            })),
          }
        : current);
      setAddingAfterIndex(null);
      setAddTimeDigits('');
      setAddActivity('');
      setAddNote('');
      rememberScrollPosition();
    } catch (err) {
      Alert.alert('BabyOi', err instanceof Error ? err.message : 'Không thể thêm lịch sinh hoạt.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleDeleteEntry = (item: RoutineItem) => {
    if (deletingEntryId) {
      return;
    }

    Alert.alert(
      'Xóa lịch sinh hoạt',
      `Bạn muốn xóa lịch "${item.activity}" lúc ${effectiveTime(item)}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setDeletingEntryId(item.id);
            try {
              await deleteBabyRoutineEntry(item.id);
              setSchedule((current) => current.filter((entry) => entry.id !== item.id));
              setRoutineDay((current) => current
                ? {
                    ...current,
                    entries: current.entries.filter((entry) => entry.id !== item.id),
                  }
                : current);
              if (editingEntryId === item.id) {
                setEditingEntryId(null);
                setEditTimeDigits('');
              }
              rememberScrollPosition();
            } catch (err) {
              Alert.alert('BabyOi', err instanceof Error ? err.message : 'Không thể xóa lịch sinh hoạt.');
            } finally {
              setDeletingEntryId(null);
            }
          },
        },
      ]
    );
  };

  const handleAiForecast = async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile) {
      Alert.alert('BabyOi', 'Vui lòng chọn hồ sơ bé trước khi yêu cầu Đậu sức khỏe phân tích.');
      return;
    }

    setAiLoading(true);
    try {
      const analysis = await analyzeBabyRoutine(profile.id, selectedDateParam);
      Alert.alert(analysis.title || 'Đậu sức khỏe nhận xét lịch sinh hoạt', formatAnalysisMessage(analysis));
    } catch (err) {
      Alert.alert('Đậu sức khỏe', err instanceof Error ? err.message : 'Đậu sức khỏe chưa thể phân tích lịch lúc này.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyTomorrowAdjustment = async () => {
    const profile = getSelectedProfile() || await hydrateSelectedProfile();
    if (!profile) {
      Alert.alert('BabyOi', 'Vui lòng chọn hồ sơ bé trước khi cập nhật lịch ngày mai.');
      return;
    }
    if (!routineCompleted) {
      Alert.alert('Đậu sức khỏe', 'Cần hoàn thành toàn bộ lịch hôm nay trước khi cập nhật lịch ngày mai.');
      return;
    }

    setAdjustingTomorrow(true);
    try {
      const tomorrowRoutine = await applyBabyRoutineNextDayAdjustment(profile.id, selectedDateParam);
      Alert.alert(
        'Đậu sức khỏe',
        `Đã cập nhật lịch ngày mai (${formatDateLabel(tomorrowRoutine.routineDate)}) theo giờ sinh hoạt thực tế của bé.`,
        [
          { text: 'Ở lại', style: 'cancel' },
          {
            text: 'Xem ngày mai',
            onPress: () => router.push({ pathname: '/phattrien/daily-schedule', params: { date: tomorrowRoutine.routineDate } }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Đậu sức khỏe', err instanceof Error ? err.message : 'Không thể cập nhật lịch ngày mai lúc này.');
    } finally {
      setAdjustingTomorrow(false);
    }
  };

  const renderTimeInput = (digits: string, onChange: (value: string) => void) => (
    <View style={styles.maskedTimeBox}>
      <TextInput
        value={formatTimeDigits(digits)}
        onChangeText={(value) => onChange(getTimeDigits(value))}
        placeholder="--:--"
        keyboardType="number-pad"
        maxLength={5}
        style={styles.maskedTimeInput}
      />
    </View>
  );

  const renderEditPanel = (item: RoutineItem) => (
    <View style={styles.inlineForm}>
      <Text style={styles.inlineFormTitle}>Cập nhật thời gian hoàn thành</Text>
      <Text style={styles.inlineFormSub}>Chỉ cần nhập số, ví dụ 730 sẽ thành 07:30.</Text>
      {renderTimeInput(editTimeDigits, setEditTimeDigits)}
      <View style={styles.inlineActions}>
        <TouchableOpacity style={styles.inlineCancelButton} onPress={closeEditTime} disabled={editSaving}>
          <Text style={styles.inlineCancelText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inlineSaveButton} onPress={handleSaveEditTime} disabled={editSaving}>
          {editSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.inlineSaveText}>Lưu thời gian</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddPanel = (afterIndex: number) => {
    const previousItem = afterIndex >= 0 ? schedule[afterIndex] : null;
    const nextItem = afterIndex + 1 < schedule.length ? schedule[afterIndex + 1] : null;
    return (
      <View style={styles.inlineForm}>
        <Text style={styles.inlineFormTitle}>Thêm lịch sinh hoạt</Text>
        <Text style={styles.inlineFormSub}>
          {previousItem && nextItem
            ? `Giờ cần nằm giữa ${effectiveTime(previousItem)} và ${effectiveTime(nextItem)}.`
            : previousItem
              ? `Giờ cần sau ${effectiveTime(previousItem)}.`
              : 'Nhập giờ cho lịch mới.'}
        </Text>
        {renderTimeInput(addTimeDigits, setAddTimeDigits)}
        <TextInput
          value={addActivity}
          onChangeText={setAddActivity}
          placeholder="Tên lịch sinh hoạt"
          style={styles.inlineTextInput}
        />
        <TextInput
          value={addNote}
          onChangeText={setAddNote}
          placeholder="Ghi chú (không bắt buộc)"
          style={[styles.inlineTextInput, styles.inlineNoteInput]}
          multiline
        />
        <View style={styles.inlineActions}>
          <TouchableOpacity style={styles.inlineCancelButton} onPress={closeAddEntry} disabled={addSaving}>
            <Text style={styles.inlineCancelText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inlineSaveButton} onPress={handleSaveAddEntry} disabled={addSaving}>
            {addSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.inlineSaveText}>Thêm lịch</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.calendarHeader}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5C7A8A" />
          </TouchableOpacity>
          <Text style={styles.monthText}>Tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/phattrien/routine-history')} style={styles.backButton}>
              <Ionicons name="calendar-outline" size={22} color="#5C7A8A" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => loadRoutine()} style={styles.backButton}>
              <Ionicons name="refresh" size={22} color="#5C7A8A" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
          {weekDays.map((day) => {
            const selected = day.dateParam === selectedDateParam;
            return (
              <TouchableOpacity
                key={day.dateParam}
                onPress={() => setSelectedDate(day.date)}
                style={[styles.dateItem, selected && styles.dateItemSelected]}
              >
                <Text style={[styles.dateLabel, selected && styles.textWhite]}>{day.label}</Text>
                <Text style={[styles.dateNumber, selected && styles.textWhite]}>{day.date.getDate()}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(event) => {
          scrollYRef.current = event.nativeEvent.contentOffset.y;
        }}
      >
        <TouchableOpacity style={styles.aiInsights} onPress={handleJumpToLatestProgress} activeOpacity={0.85}>
          <View style={styles.aiRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Đậu sức khỏe</Text>
              <Text style={styles.aiSub}>
                {routineDay
                  ? `${routineDay.profileName} ${routineDay.profileAgeMonths} tháng (${routineDay.ageGroup}). Mục tiêu ngủ ${routineDay.sleepTargetMinHours}-${routineDay.sleepTargetMaxHours} giờ/ngày.`
                  : 'BabyOi sẽ tạo lịch thật theo hồ sơ và độ tuổi của bé.'}
              </Text>
              {!!routineDay?.aiInsight?.summary && (
                <Text style={styles.aiBody}>{routineDay.aiInsight.summary}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {!!routineDay?.sleepPrediction && (
          <View style={styles.predictionBox}>
            <View style={styles.predictionHeader}>
              <View style={styles.predictionIcon}>
                <Ionicons name="moon" size={20} color="#5C7A8A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.predictionTitle}>Dự đoán giờ bé có thể dậy trong đêm</Text>
                <Text style={styles.predictionSub}>
                  Dựa trên giờ bé ngủ lúc {formatDateTimeLabel(routineDay.sleepPrediction.sleepStartDateTime)}
                </Text>
              </View>
            </View>

            <View style={styles.predictionGrid}>
              <View style={styles.predictionMetric}>
                <Text style={styles.predictionLabel}>Có thể dậy từ</Text>
                <Text style={styles.predictionValue}>{formatDateTimeLabel(routineDay.sleepPrediction.earliestWakeDateTime)}</Text>
              </View>
              <View style={styles.predictionMetric}>
                <Text style={styles.predictionLabel}>Dễ dậy nhất</Text>
                <Text style={styles.predictionValue}>{formatDateTimeLabel(routineDay.sleepPrediction.likelyWakeDateTime)}</Text>
              </View>
              <View style={styles.predictionMetric}>
                <Text style={styles.predictionLabel}>Có thể dậy đến</Text>
                <Text style={styles.predictionValue}>{formatDateTimeLabel(routineDay.sleepPrediction.latestWakeDateTime)}</Text>
              </View>
            </View>

            <Text style={styles.predictionCountdown}>
              {formatDuration(routineDay.sleepPrediction.minutesUntilLikelyWake)}
            </Text>
            <Text style={styles.predictionExplain}>{routineDay.sleepPrediction.explanation}</Text>

            <TouchableOpacity
              style={[
                styles.applyTomorrowButton,
                (!routineCompleted || adjustingTomorrow) && styles.applyTomorrowButtonDisabled,
              ]}
              onPress={handleApplyTomorrowAdjustment}
              disabled={!routineCompleted || adjustingTomorrow}
            >
              {adjustingTomorrow ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="calendar" size={18} color="#FFF" />
                  <Text style={styles.applyTomorrowButtonText}>
                    {routineCompleted ? 'Cập nhật lịch ngày mai' : 'Hoàn thành hôm nay để cập nhật ngày mai'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!!routineDay.sleepPrediction.nightEvents?.length && (
              <View style={styles.nightPlanBox}>
                <Text style={styles.nightPlanTitle}>Các mốc bé có thể dậy trong đêm</Text>
                {routineDay.sleepPrediction.nightEvents.map((event, index) => (
                  <View key={`${event.type}-${index}`} style={styles.nightEventRow}>
                    <View style={styles.nightEventDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nightEventTitle}>{event.label}</Text>
                      <Text style={styles.nightEventTime}>
                        Dễ xảy ra nhất: {formatDateTimeLabel(event.likelyDateTime)}
                      </Text>
                      <Text style={styles.nightEventRange}>
                        Có thể xảy ra trong khoảng {formatDateTimeLabel(event.earliestDateTime)} - {formatDateTimeLabel(event.latestDateTime)}
                      </Text>
                      <Text style={styles.nightEventNote}>{event.note}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#FF8FAB" />
            <Text style={styles.stateText}>Đang tải lịch sinh hoạt thật của bé...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadRoutine()}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={styles.timelineContainer}
            onLayout={(event) => {
              timelineTopRef.current = event.nativeEvent.layout.y;
            }}
          >
            {schedule.map((item, index) => (
              <View
                key={item.id}
                onLayout={(event) => {
                  itemOffsetsRef.current[item.id] = event.nativeEvent.layout.y;
                }}
              >
                <ScheduleItem
                  item={item}
                  isLast={index === schedule.length - 1}
                  onToggle={() => handleToggleComplete(item)}
                  onEditTime={item.completed ? () => openEditTime(item) : undefined}
                  onDelete={() => handleDeleteEntry(item)}
                  onAdd={() => openAddEntry(index)}
                  deleteLoading={deletingEntryId === item.id}
                >
                  {editingEntryId === item.id ? renderEditPanel(item) : null}
                  {addingAfterIndex === index ? renderAddPanel(index) : null}
                </ScheduleItem>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, aiLoading && styles.fabDisabled]}
        onPress={handleAiForecast}
        disabled={aiLoading}
      >
        {aiLoading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="sparkles" size={24} color="#FFF" />}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContent: { padding: 20 },
  textWhite: { color: '#FFF' },
  calendarHeader: { backgroundColor: '#FFF', paddingTop: 50, paddingBottom: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 8 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' },
  monthText: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#5C7A8A' },
  dateList: { paddingLeft: 20 },
  dateItem: { width: 58, height: 75, backgroundColor: '#F8F9FA', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#F1F3F5' },
  dateItemSelected: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB', elevation: 4 },
  dateLabel: { fontSize: 11, fontWeight: '700', color: '#ADB5BD', marginBottom: 5 },
  dateNumber: { fontSize: 19, fontWeight: '900', color: '#5C7A8A' },
  aiInsights: { backgroundColor: '#FFF0F3', padding: 18, borderRadius: 25, marginTop: 15, marginHorizontal: 5 },
  aiRow: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB' },
  aiSub: { fontSize: 12, color: '#FF8FAB', marginTop: 4, lineHeight: 17, opacity: 0.9 },
  aiBody: { fontSize: 13, color: '#5C7A8A', marginTop: 10, lineHeight: 19, fontWeight: '700' },
  predictionBox: { backgroundColor: '#EEF7FF', padding: 16, borderRadius: 18, marginTop: 15, marginHorizontal: 5 },
  predictionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  predictionIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#D9EEFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  predictionTitle: { fontSize: 15, fontWeight: '900', color: '#5C7A8A' },
  predictionSub: { fontSize: 12, color: '#6B8796', marginTop: 3, fontWeight: '700' },
  predictionGrid: { flexDirection: 'row', gap: 8 },
  predictionMetric: { flex: 1, backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 13 },
  predictionLabel: { fontSize: 10, color: '#8FA4AF', fontWeight: '800', marginBottom: 5 },
  predictionValue: { fontSize: 12, color: '#5C7A8A', fontWeight: '900' },
  predictionCountdown: { fontSize: 13, color: '#FF8FAB', fontWeight: '900', marginTop: 12 },
  predictionExplain: { fontSize: 12, color: '#6B8796', lineHeight: 18, marginTop: 6 },
  applyTomorrowButton: { marginTop: 14, backgroundColor: '#FF8FAB', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  applyTomorrowButtonDisabled: { opacity: 0.55 },
  applyTomorrowButtonText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  nightPlanBox: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#D9EEFF' },
  nightPlanTitle: { fontSize: 13, color: '#5C7A8A', fontWeight: '900', marginBottom: 10 },
  nightEventRow: { flexDirection: 'row', marginBottom: 12 },
  nightEventDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#74C0FC', marginTop: 6, marginRight: 10 },
  nightEventTitle: { fontSize: 13, color: '#5C7A8A', fontWeight: '900' },
  nightEventTime: { fontSize: 12, color: '#FF8FAB', fontWeight: '900', marginTop: 3 },
  nightEventRange: { fontSize: 11, color: '#6B8796', fontWeight: '700', marginTop: 2 },
  nightEventNote: { fontSize: 11, color: '#7C8E96', lineHeight: 16, marginTop: 3 },
  timelineContainer: { marginTop: 30, paddingHorizontal: 5 },
  inlineForm: { marginLeft: 90, marginTop: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FFE5EC', borderRadius: 18, padding: 14 },
  inlineFormTitle: { color: '#5C7A8A', fontSize: 14, fontWeight: '900' },
  inlineFormSub: { color: '#8FA4AF', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 3, marginBottom: 10 },
  maskedTimeBox: { borderWidth: 1, borderColor: '#FFE5EC', borderRadius: 16, backgroundColor: '#FEF9F3', marginBottom: 10 },
  maskedTimeInput: { minHeight: 48, paddingHorizontal: 14, color: '#5C7A8A', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  inlineTextInput: { minHeight: 46, borderWidth: 1, borderColor: '#EEF1F4', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, color: '#344955', fontSize: 13, fontWeight: '800', backgroundColor: '#FBFCFD', marginTop: 8 },
  inlineNoteInput: { minHeight: 70, textAlignVertical: 'top' },
  inlineActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  inlineCancelButton: { flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: '#F1F3F5', alignItems: 'center', justifyContent: 'center' },
  inlineCancelText: { color: '#5C7A8A', fontWeight: '900' },
  inlineSaveButton: { flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: '#FF8FAB', alignItems: 'center', justifyContent: 'center' },
  inlineSaveText: { color: '#FFF', fontWeight: '900' },
  completedEditBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginTop: 8 },
  completedEditTitle: { color: '#5C7A8A', fontSize: 15, fontWeight: '900' },
  completedEditSub: { color: '#8FA4AF', fontSize: 12, fontWeight: '700', lineHeight: 17, marginTop: 4, marginBottom: 10 },
  completedEditButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
  completedEditIcon: { width: 36, height: 36, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  completedEditName: { color: '#333', fontSize: 13, fontWeight: '900' },
  completedEditTime: { color: '#8FA4AF', fontSize: 12, fontWeight: '700', marginTop: 2 },
  stateBox: { alignItems: 'center', paddingVertical: 45, paddingHorizontal: 20 },
  stateText: { marginTop: 12, color: '#5C7A8A', fontWeight: '700', textAlign: 'center' },
  errorText: { color: '#D9485F', fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  retryButton: { marginTop: 14, backgroundColor: '#FF8FAB', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18 },
  retryButtonText: { color: '#FFF', fontWeight: '900' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, backgroundColor: '#FF8FAB', borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabDisabled: { opacity: 0.75 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 },
  editModal: { backgroundColor: '#FFF', borderRadius: 22, padding: 20 },
  editModalTitle: { color: '#5C7A8A', fontSize: 18, fontWeight: '900' },
  editModalSub: { color: '#8FA4AF', fontSize: 13, fontWeight: '700', marginTop: 4 },
  timeInput: { marginTop: 16, borderWidth: 1, borderColor: '#FFE5EC', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, color: '#5C7A8A', fontSize: 22, fontWeight: '900', textAlign: 'center', backgroundColor: '#FEF9F3' },
  editHint: { marginTop: 8, color: '#8FA4AF', fontSize: 12, fontWeight: '700' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelEditButton: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: '#F1F3F5', alignItems: 'center' },
  cancelEditText: { color: '#5C7A8A', fontWeight: '900' },
  saveEditButton: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: '#FF8FAB', alignItems: 'center' },
  saveEditText: { color: '#FFF', fontWeight: '900' },
});
