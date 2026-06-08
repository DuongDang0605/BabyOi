import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { LessonCard } from '../../components/ai/LessonCard';
import { getAiTeachingLessonsByProfile, type AiTeachingLessonResponse } from '../../lib/api';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const LESSON_ICON = 'https://cdn-icons-png.flaticon.com/512/2382/2382461.png';

type LessonItem = {
  id: string;
  title: string;
  status: string;
  time: string;
  note?: string;
  icon: string;
};

const mapProgressStatus = (status: number | null) => {
  if (status === 3) {
    return 'completed';
  }

  if (status === 2) {
    return 'in_progress';
  }

  return 'locked';
};

const formatLessonTime = (lesson: AiTeachingLessonResponse) => {
  if (lesson.progressStatus === 3) {
    return lesson.completedAt ? `Hoàn thành ngày ${lesson.completedAt}` : 'Đã hoàn thành';
  }

  if (lesson.progressStatus === 2) {
    const currentDay = lesson.currentDay ?? 1;
    const duration = lesson.recommendedDurationDays ?? 0;
    return duration > 0 ? `Đang học ngày ${currentDay}/${duration}` : `Đang học ngày ${currentDay}`;
  }

  const fromMonth = lesson.reasonableAgeFromMonth ?? 0;
  const toMonth = lesson.reasonableAgeToMonth ?? fromMonth;
  return `Gợi ý từ ${fromMonth} - ${toMonth} tháng`;
};

const mapLesson = (lesson: AiTeachingLessonResponse): LessonItem => ({
  id: String(lesson.id),
  title: lesson.lessonName,
  status: mapProgressStatus(lesson.progressStatus),
  time: formatLessonTime(lesson),
  note: lesson.progressNote || lesson.lessonNote || '',
  icon: lesson.iconUrl || LESSON_ICON,
});

export default function LessonListScreen() {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        const profile = getSelectedProfile() || (await hydrateSelectedProfile());

        if (!profile?.id) {
          setLessons([]);
          return;
        }

        const data = await getAiTeachingLessonsByProfile(profile.id);
        setLessons(data.map(mapLesson));
      } catch {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  const handleOpenEdit = (lesson: LessonItem) => {
    setEditingLesson(lesson);
    setEditStatus(lesson.status);
    setEditNote(lesson.note || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingLesson) {
      return;
    }

    setLessons(lessons.map(l => 
      l.id === editingLesson.id 
        ? { ...l, status: editStatus, note: editNote } 
        : l
    ));
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lộ trình của Ốc</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <LinearGradient colors={['#FFFFFF', '#FFF5F8', '#E9F8FD']} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image source={require('../../assets/images/avt.png')} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.summaryTitle}>Tiến độ tháng thứ 5</Text>
              <Text style={styles.summaryText}>Ốc đã hoàn thành 2 bài. Mẹ nhớ cập nhật biểu hiện của bé để AI theo dõi sát sao nhé!</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Lịch sử & Hiện tại</Text>
        
        <View style={styles.timelineContainer}>
          {loading ? (
            <ActivityIndicator color="#FF8FAB" style={{ marginTop: 24 }} />
          ) : lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isLast={index === lessons.length - 1}
                onEditPress={handleOpenEdit}
                onHistoryPress={() => router.push('/AI/lesson-history')}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có bài học phù hợp cho hồ sơ hiện tại.</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.aiAssessButton} onPress={() => router.push('/AI/edu-coaching')}>
          <Ionicons name="sparkles" size={22} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.aiAssessText}>AI Đánh giá chặng tiếp theo</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL CẬP NHẬT TRẠNG THÁI --- */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cập nhật bài học</Text>
            <Text style={styles.modalSubtitle}>{editingLesson?.title}</Text>

            <Text style={styles.label}>Trạng thái bé hiện tại:</Text>
            <View style={styles.statusGroup}>
              <TouchableOpacity 
                style={[styles.statusPill, editStatus === 'completed' && styles.pillCompleted]}
                onPress={() => setEditStatus('completed')}
              >
                <Text style={[styles.pillText, editStatus === 'completed' && {color: '#FFF'}]}>Tốt, đã thành thạo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusPill, editStatus === 'completed_with_note' && styles.pillWarning]}
                onPress={() => setEditStatus('completed_with_note')}
              >
                <Text style={[styles.pillText, editStatus === 'completed_with_note' && {color: '#FFF'}]}>Gặp khó khăn</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusPill, editStatus === 'in_progress' && styles.pillProgress]}
                onPress={() => setEditStatus('in_progress')}
              >
                <Text style={[styles.pillText, editStatus === 'in_progress' && {color: '#FFF'}]}>Quên, đang ôn lại</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Ghi chú cho AI:</Text>
            <TextInput 
              style={styles.textInput}
              multiline
              placeholder="VD: Dạo này bé tự lật nhưng hay bị kẹt tay..."
              value={editNote}
              onChangeText={setEditNote}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveText}>Lưu cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25, paddingHorizontal: 20 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  rightPlaceholder: { width: 45 },
  scrollContent: { paddingHorizontal: 20 },
  summaryCard: { padding: 20, borderRadius: 26, marginBottom: 25, borderWidth: 1.5, borderColor: '#FFE5EC', shadowColor: '#A7E4F5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 14, elevation: 4 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 5 },
  summaryText: { fontSize: 13, color: '#5C7A8A', lineHeight: 20, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15, marginLeft: 5 },
  timelineContainer: { paddingLeft: 10 },
  emptyText: { textAlign: 'center', color: '#8899AA', marginTop: 24, fontWeight: '700' },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#FEF9F3', borderTopWidth: 1, borderColor: '#F0F4F8' },
  aiAssessButton: { flexDirection: 'row', backgroundColor: '#FF8FAB', paddingVertical: 18, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FFB6C1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 12 },
  aiAssessText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', marginBottom: 5 },
  modalSubtitle: { fontSize: 15, color: '#5C7A8A', fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '800', color: '#333', marginBottom: 10, marginTop: 10 },
  statusGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusPill: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#F0F4F8', borderRadius: 20 },
  pillText: { fontSize: 13, fontWeight: '800', color: '#8899AA' },
  pillCompleted: { backgroundColor: '#4CAF50' },
  pillWarning: { backgroundColor: '#FF9800' },
  pillProgress: { backgroundColor: '#2196F3' },
  textInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F0F4F8', borderRadius: 15, padding: 15, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: '#333', marginTop: 5 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, gap: 10 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#F0F4F8' },
  cancelText: { color: '#8899AA', fontWeight: '800' },
  saveBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#FF8FAB' },
  saveText: { color: '#FFF', fontWeight: '900' }
});
