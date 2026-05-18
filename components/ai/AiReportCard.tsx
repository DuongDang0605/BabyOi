import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AiReportCardProps {
  type: 'success' | 'warning';
  title: string;
  greeting: string;
  content: React.ReactNode;
  actionTitle: string;
  buttonText: string;
  onButtonPress?: () => void;
}

export const AiReportCard = ({
  type,
  title,
  greeting,
  content,
  actionTitle,
  buttonText,
  onButtonPress
}: AiReportCardProps) => {
  const isSuccess = type === 'success';
  const themeColor = isSuccess ? '#FF8FAB' : '#4CAF50';
  const bgColor = isSuccess ? '#FFF0F5' : '#E8F9ED';

  return (
    <View style={[styles.reportCard, { borderColor: bgColor }]}>
      <Text style={styles.aiGreeting}>{greeting}</Text>
      <View style={styles.contentContainer}>
        {content}
      </View>

      <View style={[styles.actionBox, { backgroundColor: bgColor }]}>
        <Text style={[styles.actionTitle, { color: themeColor }]}>{actionTitle}</Text>
        <TouchableOpacity
          style={[styles.courseButton, { backgroundColor: themeColor }]}
          onPress={onButtonPress}
        >
          <Text style={styles.courseText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reportCard: {
    backgroundColor: '#FFF',
    padding: 25,
    borderRadius: 25,
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  aiGreeting: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 15 },
  contentContainer: { marginBottom: 15 },
  actionBox: { padding: 15, borderRadius: 15, marginTop: 10 },
  actionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  courseButton: { padding: 15, borderRadius: 15, alignItems: 'center' },
  courseText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
