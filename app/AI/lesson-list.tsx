import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
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

// Dữ liệu gốc
const INITIAL_LESSONS = [
  {
    id: '1',
    title: 'Tập Lật (Roll Over)',
    status: 'completed', 
    time: 'Hoàn thành trong 7 ngày',
    note: '',
    icon: 'https://cdn-icons-png.flaticon.com/512/8280/8280846.png',
  },
  {
    id: '2',
    title: 'Nằm sấp (Tummy Time)',
    status: 'completed_with_note', 
    time: 'Hoàn thành trong 14 ngày',
    note: 'Bé hay khóc ré lên sau 2 phút, mẹ phải bế vỗ.',
    icon: 'https://cdn-icons-png.flaticon.com/512/2382/2382461.png',
  },
  {
    id: '3',
    title: 'Rèn ngủ ngày (Nap Drill)',
    status: 'in_progress', 
    time: 'Đang học ngày 3/7',
    note: '',
    icon: 'https://cdn-icons-png.flaticon.com/512/3094/3094851.png',
  },
  {
    id: '4',
    title: 'Ăn dặm (Khởi động)',
    status: 'locked', 
    time: 'Cần vượt qua Cổng kiểm tra',
    note: '',
    icon: 'https://cdn-icons-png.flaticon.com/512/2722/2722527.png',
  }
];

export default function LessonListScreen() {
  const [lessons, setLessons] = useState(INITIAL_LESSONS);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleOpenEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setEditStatus(lesson.status);
    setEditNote(lesson.note || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    setLessons(lessons.map(l => 
      l.id === editingLesson.id 
        ? { ...l, status: editStatus, note: editNote } 
        : l
    ));
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
          <Ionicons name="home-outline" size={24} color="#5C7A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lộ trình của Ốc</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image source={require('../../assets/images/avt.png')} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.summaryTitle}>Tiến độ tháng thứ 5</Text>
              <Text style={styles.summaryText}>Ốc đã hoàn thành 2 bài. Mẹ nhớ cập nhật biểu hiện của bé để AI theo dõi sát sao nhé!</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Lịch sử & Hiện tại</Text>
        
        <View style={styles.timelineContainer}>
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isLast={index === lessons.length - 1}
              onEditPress={handleOpenEdit}
              onHistoryPress={() => router.push('/AI/lesson-history')}
            />
          ))}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB' },
  scrollContent: { paddingHorizontal: 20 },
  summaryCard: { backgroundColor: '#FFF0F5', padding: 20, borderRadius: 25, marginBottom: 25, borderWidth: 1, borderColor: '#FFB6C1' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#FFF' },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 5 },
  summaryText: { fontSize: 13, color: '#5C7A8A', lineHeight: 20, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15, marginLeft: 5 },
  timelineContainer: { paddingLeft: 10 },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#FEF9F3', borderTopWidth: 1, borderColor: '#F0F4F8' },
  aiAssessButton: { flexDirection: 'row', backgroundColor: '#FF8FAB', paddingVertical: 18, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
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
