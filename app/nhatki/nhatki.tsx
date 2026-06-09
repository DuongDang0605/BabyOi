import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { DiaryBanner } from '../../components/nhatki/DiaryBanner';
import { DiaryCard, type DiaryPost } from '../../components/nhatki/DiaryCard';
import type { DiaryEntryResponse, ProfileResponse } from '../../lib/api';
import { deleteDiaryEntry, getDiaryEntries, resolveAssetUrl, resolveOptimizedAssetUrl } from '../../lib/api';
import { useNotification } from '../../lib/notification';
import { ensureCurrentUserSelectedProfile } from '../../lib/profile-session';

const DEFAULT_AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/1154/1154444.png';
type DiaryFilter = 'all' | 'milestone' | 'timeline';

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
  const [activeFilter, setActiveFilter] = useState<DiaryFilter>('all');

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
    if (activeFilter === 'milestone') {
      return posts.filter((post) => post.milestone);
    }
    if (activeFilter === 'timeline') {
      return posts.filter((post) => !post.milestone);
    }
    return posts;
  }, [activeFilter, posts]);

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
    const emptyText = activeFilter === 'milestone'
      ? 'Chưa có kỷ niệm nào. Mẹ đánh dấu cột mốc khi lưu khoảnh khắc nhé.'
      : activeFilter === 'timeline'
        ? 'Chưa có bài thường nào trong dòng thời gian.'
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

            <View style={styles.filterBar}>
              <TouchableOpacity style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]} onPress={() => setActiveFilter('all')}>
                <Ionicons name="calendar-outline" size={17} color={activeFilter === 'all' ? '#FF8FAB' : '#7B8794'} />
                <Text style={activeFilter === 'all' ? styles.filterTextActive : styles.filterText}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterTab, activeFilter === 'milestone' && styles.filterTabActive]} onPress={() => setActiveFilter('milestone')}>
                <Ionicons name="star-outline" size={17} color={activeFilter === 'milestone' ? '#FF8FAB' : '#7B8794'} />
                <Text style={activeFilter === 'milestone' ? styles.filterTextActive : styles.filterText}>Kỷ niệm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterTab, activeFilter === 'timeline' && styles.filterTabActive]} onPress={() => setActiveFilter('timeline')}>
                <Ionicons name="sparkles-outline" size={17} color={activeFilter === 'timeline' ? '#FF8FAB' : '#7B8794'} />
                <Text style={activeFilter === 'timeline' ? styles.filterTextActive : styles.filterText}>Dòng thời gian</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterSettings}>
                <Ionicons name="options-outline" size={19} color="#202D3A" />
              </TouchableOpacity>
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
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 23,
    padding: 7,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE6EE',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginRight: 4,
  },
  filterTabActive: {
    backgroundColor: '#FFE5EC',
  },
  filterText: {
    color: '#7B8794',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },
  filterTextActive: {
    color: '#FF8FAB',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },
  filterSettings: {
    marginLeft: 'auto',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9D5DE',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2,
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
