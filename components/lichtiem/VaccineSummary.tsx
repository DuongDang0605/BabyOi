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
        <Text style={styles.summaryNumber}>{completedCount}</Text>
        <Text style={styles.summaryLabel}>Đã tiêm</Text>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryBox}>
        <Text style={[styles.summaryNumber, styles.upcomingNumber]}>{upcomingCount}</Text>
        <Text style={styles.summaryLabel}>Sắp tới</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '88%',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
  },
  sparklePink: {
    position: 'absolute',
    top: -22,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 143, 171, 0.12)',
  },
  sparkleYellow: {
    position: 'absolute',
    left: 22,
    bottom: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE9A8',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#EEF0F4',
    marginHorizontal: 8,
    marginVertical: 6,
  },
  summaryNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: '#5ABF7A',
    marginBottom: 3,
  },
  upcomingNumber: {
    color: '#FF9C6E',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5C7A8A',
  },
});
