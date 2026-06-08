import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface VaccineSummaryProps {
  completedCount: number;
  upcomingCount: number;
}

export const VaccineSummary = ({ completedCount, upcomingCount }: VaccineSummaryProps) => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF8FA', '#EFFBFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.summaryCard}
    >
      <View style={styles.sparklePink} />
      <View style={styles.sparkleYellow} />

      <View style={styles.summaryBox}>
        <View style={[styles.iconBubble, styles.doneBubble]}>
          <Ionicons name="shield-checkmark" size={22} color="#5ABF7A" />
        </View>
        <Text style={styles.summaryNumber}>{completedCount}</Text>
        <Text style={styles.summaryLabel}>Đã tiêm</Text>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryBox}>
        <View style={[styles.iconBubble, styles.upcomingBubble]}>
          <Ionicons name="calendar-outline" size={22} color="#FF9C6E" />
        </View>
        <Text style={[styles.summaryNumber, styles.upcomingNumber]}>{upcomingCount}</Text>
        <Text style={styles.summaryLabel}>Sắp tới</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 5,
    overflow: 'hidden',
  },
  sparklePink: {
    position: 'absolute',
    top: -18,
    right: 38,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 143, 171, 0.12)',
  },
  sparkleYellow: {
    position: 'absolute',
    left: 24,
    bottom: 20,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFE9A8',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doneBubble: {
    backgroundColor: '#E8F9ED',
  },
  upcomingBubble: {
    backgroundColor: '#FFF1C9',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#EEF0F4',
    marginHorizontal: 14,
  },
  summaryNumber: {
    fontSize: 31,
    fontWeight: '900',
    color: '#5ABF7A',
    marginBottom: 2,
  },
  upcomingNumber: {
    color: '#FF9C6E',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#5C7A8A',
  },
});
