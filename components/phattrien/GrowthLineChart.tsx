import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get('window');

interface GrowthLineChartProps {
  data: any;
  title: string;
}

export const GrowthLineChart = ({ data, title }: GrowthLineChartProps) => {
  return (
    <View style={styles.chartSection}>
      <View style={styles.chartAccent} />
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#98D8AA' }]} /><Text style={styles.legendText}>Cân nặng</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#FFD166' }]} /><Text style={styles.legendText}>Chiều cao</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#C1F0D0' }]} /><Text style={styles.legendText}>BMI</Text></View>
      </View>
      <LineChart
        data={data}
        width={width - 50}
        height={200}
        chartConfig={{
          backgroundColor: "#FFF8FA",
          backgroundGradientFrom: "#FFF8FA",
          backgroundGradientTo: "#F6FDFF",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
          labelColor: (opacity = 1) => `#5C7A8A`,
          propsForDots: { r: "5", strokeWidth: "2", stroke: "#FFF" },
          propsForBackgroundLines: { stroke: "#F0F0F0" }
        }}
        bezier
        withVerticalLines={false}
        style={styles.chartStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartSection: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 15,
    elevation: 5,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFE5EC',
    overflow: 'hidden',
  },
  chartAccent: { position: 'absolute', right: -34, top: -36, width: 112, height: 112, borderRadius: 56, backgroundColor: '#E9F8FD' },
  chartTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 10 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 11, fontWeight: '700', color: '#5C7A8A' },
  chartStyle: { borderRadius: 16, marginLeft: -15 },
});
