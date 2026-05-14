import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface VaccineSummaryProps {
  completedCount: number;
  upcomingCount: number;
}

export const VaccineSummary = ({ completedCount, upcomingCount }: VaccineSummaryProps) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryNumber}>{completedCount}</Text>
        <Text style={styles.summaryLabel}>Đã tiêm</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryBox}>
        <Text style={[styles.summaryNumber, { color: '#ff9c6e' }]}>{upcomingCount}</Text>
        <Text style={styles.summaryLabel}>Sắp tới</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryBox: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 2, backgroundColor: '#fef0f4', marginHorizontal: 15 },
  summaryNumber: { fontSize: 32, fontWeight: '900', color: '#a3d9b1', marginBottom: 5 },
  summaryLabel: { fontSize: 14, fontWeight: '600', color: '#5c7a8a' },
});
