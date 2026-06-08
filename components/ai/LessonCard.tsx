import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Lesson {
  id: string;
  title: string;
  status: string;
  time: string;
  note?: string;
  icon: string;
}

interface LessonCardProps {
  lesson: Lesson;
  isLast: boolean;
  onEditPress: (lesson: Lesson) => void;
  onHistoryPress: (lesson: Lesson) => void;
}

export const LessonCard = ({ lesson, isLast, onEditPress, onHistoryPress }: LessonCardProps) => {
  const isLocked = lesson.status === 'locked';

  return (
    <View style={styles.lessonRow}>
      {/* Timeline part */}
      <View style={styles.timelineLine}>
        <View style={[
          styles.dot,
          lesson.status === 'completed' ? styles.dotCompleted :
          lesson.status === 'completed_with_note' ? styles.dotWarning :
          lesson.status === 'in_progress' ? styles.dotProgress : styles.dotLocked
        ]} />
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Card part */}
      <View style={[styles.lessonCard, isLocked && styles.lessonCardLocked]}>
        {!isLocked && (
          <View style={styles.cardSparkle}>
            <Ionicons name="sparkles" size={14} color="#FFD166" />
          </View>
        )}
        <View style={styles.lessonHeader}>
          <View style={[styles.iconBg, isLocked && { backgroundColor: '#F0F4F8' }]}>
            <Image
              source={{ uri: lesson.icon }}
              style={[styles.lessonIcon, isLocked && { opacity: 0.3 }]}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.lessonTitle, isLocked && { color: '#B0BEC5' }]}>
              {lesson.title}
            </Text>
            <Text style={styles.lessonTime}>{lesson.time}</Text>
          </View>

          {/* Status Icon */}
          {lesson.status === 'completed' && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
          {lesson.status === 'completed_with_note' && <Ionicons name="warning" size={24} color="#FFD166" />}
          {lesson.status === 'in_progress' && <ActivityIndicator size="small" color="#A7E4F5" />}
          {lesson.status === 'locked' && <Ionicons name="lock-closed" size={24} color="#B0BEC5" />}

          {/* Action Buttons */}
          {!isLocked && (
            <View style={{ flexDirection: 'row', marginLeft: 10 }}>
              <TouchableOpacity
                style={[styles.editBtn, styles.historyBtn]}
                onPress={() => onHistoryPress(lesson)}
              >
                <Ionicons name="time-outline" size={18} color="#5C7A8A" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.editBtn} onPress={() => onEditPress(lesson)}>
                <Ionicons name="pencil" size={18} color="#FF8FAB" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Note Box */}
        {lesson.note ? (
          <View style={styles.noteBox}>
            <Ionicons name="document-text-outline" size={16} color="#FF8FAB" style={{ marginRight: 5 }} />
            <Text style={styles.noteText}>Ghi chú: {lesson.note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  lessonRow: { flexDirection: 'row', marginBottom: 15 },
  timelineLine: { width: 30, alignItems: 'center', marginRight: 10 },
  dot: { width: 14, height: 14, borderRadius: 7, zIndex: 1 },
  dotCompleted: { backgroundColor: '#4CAF50', borderWidth: 3, borderColor: '#E8F9ED' },
  dotWarning: { backgroundColor: '#FFD166', borderWidth: 3, borderColor: '#FFF9EC' },
  dotProgress: { backgroundColor: '#A7E4F5', borderWidth: 3, borderColor: '#E9F8FD' },
  dotLocked: { backgroundColor: '#B0BEC5', borderWidth: 3, borderColor: '#F0F4F8' },
  line: { flex: 1, width: 2, backgroundColor: '#FFE5EC', marginTop: -5, marginBottom: -15 },
  lessonCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 22, elevation: 3, borderWidth: 1.5, borderColor: '#FFE5EC', shadowColor: '#A7E4F5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12 },
  lessonCardLocked: { backgroundColor: '#F9FAFB', elevation: 0, borderWidth: 1, borderColor: '#F0F4F8' },
  cardSparkle: { position: 'absolute', right: 12, top: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF9EC', alignItems: 'center', justifyContent: 'center' },
  lessonHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFF5F8', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE5EC' },
  lessonIcon: { width: 28, height: 28 },
  lessonTitle: { fontSize: 15, fontWeight: '800', color: '#334455', marginBottom: 3, paddingRight: 6 },
  lessonTime: { fontSize: 12, color: '#5C7A8A', fontWeight: '600' },
  noteBox: { marginTop: 12, padding: 10, backgroundColor: '#FFF8FA', borderRadius: 14, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#FFE5EC' },
  noteText: { flex: 1, fontSize: 13, color: '#5C7A8A', lineHeight: 18, fontWeight: '600' },
  editBtn: { padding: 8, backgroundColor: '#FFF0F5', borderRadius: 12 },
  historyBtn: { backgroundColor: '#E9F8FD', marginRight: 8 },
});
