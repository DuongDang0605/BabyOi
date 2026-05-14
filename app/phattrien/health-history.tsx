import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HealthHistoryCard } from '../../components/phattrien/HealthHistoryCard';

const HEALTH_HISTORY_DATA = [
  { id: '1', date: '14/03/2024', weight: '5.3', height: '58', bmi: '15.8', sickCount: '2', status: 'Tăng trưởng tốt' },
  { id: '2', date: '14/02/2024', weight: '5.0', height: '56.5', bmi: '15.6', sickCount: '1', status: 'Bình thường' },
  { id: '3', date: '14/01/2024', weight: '4.6', height: '55', bmi: '15.2', sickCount: '0', status: 'Bình thường' },
  { id: '4', date: '14/12/2023', weight: '4.2', height: '53.5', bmi: '14.7', sickCount: '2', status: 'Cần chú ý' },
  { id: '5', date: '14/11/2023', weight: '3.9', height: '52', bmi: '14.4', sickCount: '0', status: 'Bình thường' },
];

export default function HealthHistoryScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={HEALTH_HISTORY_DATA}
        renderItem={({ item }) => (
          <HealthHistoryCard
            item={item}
            onPress={(rec) => router.push({ pathname: '/phattrien/health-detail', params: { date: rec.date } })}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Lịch Sử Sức Khỏe</Text>
              <View style={{ width: 45 }} />
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Nhật ký phát triển</Text>
              <Text style={styles.headerSub}>Tổng hợp sức khỏe bé qua các lần cập nhật</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  listContent: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  listHeader: { marginBottom: 20 },
  listHeaderTitle: { fontSize: 20, fontWeight: '900', color: '#5C7A8A' },
  headerSub: { fontSize: 13, color: '#999', fontWeight: '600', marginTop: 4 },
});
