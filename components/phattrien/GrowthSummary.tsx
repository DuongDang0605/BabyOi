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
  weight: number | string;
  height: number | string;
  tdee: number | string;
  energyLabel?: string;
}

export const GrowthSummary = ({ weight, height, tdee, energyLabel = 'TDEE' }: GrowthSummaryProps) => {
  const data: SummaryItem[] = [
    { label: 'Cân nặng', value: weight, unit: 'kg', icon: 'scale-outline', color: '#98D8AA' },
    { label: 'Chiều cao', value: height, unit: 'cm', icon: 'body-outline', color: '#FFD166' },
    { label: energyLabel, value: tdee, unit: 'kcal', icon: 'flame-outline', color: '#A7E4F5' },
  ];

  return (
    <View style={styles.summaryGrid}>
      {data.map((item, index) => (
        <View key={index} style={[styles.summaryCard, { backgroundColor: item.color, shadowColor: item.color }]}>
          <View style={styles.iconHalo}>
            <Ionicons name={item.icon} size={18} color="#FFF" />
          </View>
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
    shadowOpacity: 0.22,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  iconHalo: { width: 32, height: 32, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center' },
  cardValue: { fontSize: 16, fontWeight: '900', color: '#FFF', marginTop: 8 },
  cardUnit: { fontSize: 10, fontWeight: '600' },
  cardLabel: { fontSize: 10, color: '#FFF', fontWeight: '700', marginTop: 4 },
});
