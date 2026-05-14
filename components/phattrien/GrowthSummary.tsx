import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface SummaryItem {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface GrowthSummaryProps {
  weight: number;
  height: number;
  bmi: number;
}

export const GrowthSummary = ({ weight, height, bmi }: GrowthSummaryProps) => {
  const data: SummaryItem[] = [
    { label: 'Cân nặng', value: weight, unit: 'kg', icon: 'speedometer-outline', color: '#FF8FAB' },
    { label: 'Chiều cao', value: height, unit: 'cm', icon: 'resize-outline', color: '#FFD166' },
    { label: 'Chỉ số BMI', value: bmi, icon: 'bar-chart-outline', color: '#A7E4F5' },
  ];

  return (
    <View style={styles.summaryGrid}>
      {data.map((item, index) => (
        <View key={index} style={[styles.summaryCard, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={18} color="#FFF" />
          <Text style={styles.cardValue}>
            {item.value}
            {item.unit && <Text style={styles.cardUnit}>{item.unit}</Text>}
          </Text>
          <Text style={styles.cardLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: {
    width: (width - 60) / 3,
    padding: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1
  },
  cardValue: { fontSize: 16, fontWeight: '900', color: '#FFF', marginTop: 8 },
  cardUnit: { fontSize: 10, fontWeight: '600' },
  cardLabel: { fontSize: 10, color: '#FFF', fontWeight: '700', marginTop: 4 },
});
