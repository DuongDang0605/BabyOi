import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AiPlannerCardProps {
  onPress: () => void;
}

export const AiPlannerCard = ({ onPress }: AiPlannerCardProps) => {
  return (
    <TouchableOpacity style={styles.aiPlannerBox} onPress={onPress}>
      <View style={styles.aiInfo}>
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>AI SMART</Text>
        </View>
        <Text style={styles.aiTitle}>Trợ Lý Lên Lịch Ăn</Text>
        <Text style={styles.aiSub}>Tự động thiết kế thực đơn khoa học cho 7 ngày</Text>
      </View>
      <View style={styles.aiIconBg}>
        <Ionicons name="sparkles" size={28} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  aiPlannerBox: {
    backgroundColor: '#FF8FAB',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8
  },
  aiInfo: { flex: 1 },
  aiTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6
  },
  aiTagText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  aiTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  aiSub: { color: '#FFF', fontSize: 11, fontWeight: '500', opacity: 0.9, marginTop: 2 },
  aiIconBg: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
});
