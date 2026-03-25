import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
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

const INITIAL_LESSONS = [
  {
    id: '1',
    title: 'Tập Lật (Roll Over)',
    status: 'completed', 
    time: 'Hoàn thành trong 7 ngày',
    note: '',
    iconName: 'accessibility', // Icon hình người vươn tay
    iconColor: '#FF9800', // Màu cam
  },
  {
    id: '2',
    title: 'Nằm sấp (Tummy Time)',
    status: 'completed_with_note', 
    time: 'Hoàn thành trong 14 ngày',
    note: 'Bé hay khóc ré lên sau 2 phút, mẹ phải bế vỗ.',
    iconName: 'fitness', // Icon tập thể dục
    iconColor: '#E91E63', // Màu hồng đậm
  },
  {
    id: '3',
    title: 'Rèn ngủ ngày (Nap Drill)',
    status: 'in_progress', 
    time: 'Đang học ngày 3/7',
    note: '',
    iconName: 'moon', // Icon mặt trăng
    iconColor: '#2196F3', // Màu xanh dương
  },
  {
    id: '4',
    title: 'Ăn dặm (Khởi động)',
    status: 'locked', 
    time: 'Cần vượt qua Cổng kiểm tra',
    note: '',
    iconName: 'restaurant', // Icon nĩa và dao
    iconColor: '#4CAF50', // Màu xanh lá
  }
];

export default function LessonListScreen() {
  // Đưa dữ liệu vào State để có thể cập nhật
  const [lessons, setLessons] = useState(INITIAL_LESSONS);
  
  // Các state quản lý việc Edit (Cập nhật)
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');

  // Mở bảng cập nhật
  const handleOpenEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setEditStatus(lesson.status);
    setEditNote(lesson.note || '');
    setEditModalVisible(true);
  };

  // Lưu lại cập nhật
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
            <View key={lesson.id} style={styles.lessonRow}>
              
              <View style={styles.timelineLine}>
                <View style={[
                  styles.dot, 
                  lesson.status === 'completed' ? styles.dotCompleted :
                  lesson.status === 'completed_with_note' ? styles.dotWarning :
                  lesson.status === 'in_progress' ? styles.dotProgress : styles.dotLocked
                ]} />
                {index !== lessons.length - 1 && <View style={styles.line} />}
              </View>

              <View style={[styles.lessonCard, lesson.status === 'locked' && styles.lessonCardLocked]}>
             <View style={styles.lessonHeader}>
                  <View style={[styles.iconBg, lesson.status === 'locked' && { backgroundColor: '#F0F4F8' }]}>
                    {/* --- ĐÃ THAY BẰNG IONICONS SIÊU ỔN ĐỊNH --- */}
                    <Ionicons 
                      name={lesson.iconName as any} 
                      size={24} 
                      color={lesson.status === 'locked' ? '#B0BEC5' : lesson.iconColor} 
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.lessonTitle, lesson.status === 'locked' && { color: '#B0BEC5' }]}>{lesson.title}</Text>
                    <Text style={styles.lessonTime}>{lesson.time}</Text>
                  </View>
                  
                  {/* Trạng thái Icon */}
                  {lesson.status === 'completed' && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
                  {lesson.status === 'completed_with_note' && <Ionicons name="warning" size={24} color="#FF9800" />}
                  {lesson.status === 'in_progress' && <ActivityIndicator size="small" color="#2196F3" />}
                  {lesson.status === 'locked' && <Ionicons name="lock-closed" size={24} color="#B0BEC5" />}

                 {/* --- KHU VỰC NÚT BẤM (Sửa & Lịch sử) --- */}
                  {lesson.status !== 'locked' && (
                    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                      {/* Nút Xem Lịch Sử */}
                      <TouchableOpacity 
                        style={[styles.editBtn, { backgroundColor: '#E3F2FD', marginRight: 8 }]} 
                        onPress={() => router.push('/AI/lesson-history')}
                      >
                        <Ionicons name="time-outline" size={18} color="#2196F3" />
                      </TouchableOpacity>

                      {/* Nút Cập nhật (Sửa) */}
                      <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenEdit(lesson)}>
                        <Ionicons name="pencil" size={18} color="#FF8FAB" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Ghi chú */}
                {lesson.note ? (
                  <View style={styles.noteBox}>
                    <Ionicons name="document-text-outline" size={16} color="#FF9800" style={{ marginRight: 5 }} />
                    <Text style={styles.noteText}>Ghi chú: {lesson.note}</Text>
                  </View>
                ) : null}
              </View>

            </View>
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
  // ... Các style cũ giữ nguyên ...
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
  lessonRow: { flexDirection: 'row', marginBottom: 15 },
  timelineLine: { width: 30, alignItems: 'center', marginRight: 10 },
  dot: { width: 14, height: 14, borderRadius: 7, zIndex: 1 },
  dotCompleted: { backgroundColor: '#4CAF50', borderWidth: 3, borderColor: '#E8F9ED' },
  dotWarning: { backgroundColor: '#FF9800', borderWidth: 3, borderColor: '#FFF3E0' },
  dotProgress: { backgroundColor: '#2196F3', borderWidth: 3, borderColor: '#E3F2FD' },
  dotLocked: { backgroundColor: '#B0BEC5', borderWidth: 3, borderColor: '#F0F4F8' },
  line: { flex: 1, width: 2, backgroundColor: '#E0E0E0', marginTop: -5, marginBottom: -15 },

  lessonCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, elevation: 2 },
  lessonCardLocked: { backgroundColor: '#F9FAFB', elevation: 0, borderWidth: 1, borderColor: '#F0F4F8' },
  lessonHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center' },
  lessonIcon: { width: 28, height: 28 },
  lessonTitle: { fontSize: 15, fontWeight: '800', color: '#333', marginBottom: 3 },
  lessonTime: { fontSize: 12, color: '#8899AA', fontWeight: '600' },
  noteBox: { marginTop: 12, padding: 10, backgroundColor: '#FFF3E0', borderRadius: 10, flexDirection: 'row', alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 18, fontWeight: '600' },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#FEF9F3', borderTopWidth: 1, borderColor: '#F0F4F8' },
  aiAssessButton: { flexDirection: 'row', backgroundColor: '#FF8FAB', paddingVertical: 18, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  aiAssessText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  // --- STYLE MỚI CHO EDIT ---
  editBtn: { marginLeft: 15, padding: 8, backgroundColor: '#FFF0F5', borderRadius: 12 },
  
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