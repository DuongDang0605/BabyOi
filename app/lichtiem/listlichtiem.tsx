import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { VaccineCard } from '../../components/lichtiem/VaccineCard';
import { VaccineSummary } from '../../components/lichtiem/VaccineSummary';

const UPCOMING_VACCINES = [
  {
    id: 'u1',
    name: 'Viêm não Nhật Bản (Imojev)',
    desc: 'Mũi 1. Phòng bệnh Viêm não Nhật Bản. Chỉ định tiêm mốc 9 tháng tuổi.',
    status: 'upcoming' as const,
    date: '15/04/2026 (Tháng tới)',
  }
];

const COMPLETED_VACCINES = [
  {
    id: 'c1',
    name: 'Phế cầu (Synflorix)',
    desc: 'Mũi 2. Phòng các bệnh do phế cầu khuẩn (Viêm phổi, viêm màng não).',
    status: 'completed' as const,
    date: '10/02/2026',
    location: 'VNVC Sơn Tây',
    cost: '1.045.000đ',
    note: 'Bé trộm vía ngoan, tối về chỉ hơi ấm đầu không quấy khóc.'
  },
  {
    id: 'c2',
    name: 'Rota virus (Rotarix)',
    desc: 'Liều 2. Phòng tiêu chảy cấp do Rota virus.',
    status: 'oral_completed' as const,
    date: '15/12/2025',
    location: 'Trạm Y tế Phường',
    cost: 'Miễn phí (TCMR)',
    note: 'Thuốc ngọt bé rất thích uống.'
  }
];

export default function VaccineScheduleScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sổ Tiêm Chủng</Text>
        </View>

        {/* --- SUMMARY --- */}
        <VaccineSummary completedCount={4} upcomingCount={4} />

        {/* --- UPCOMING SECTION --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⏳ Sắp tới</Text>
          <TouchableOpacity onPress={() => router.push('/lichtiem/danhsachchuatiem')}>
            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
          </TouchableOpacity>
        </View>
        
        {UPCOMING_VACCINES.map(item => (
          <VaccineCard
            key={item.id}
            vaccine={item}
            onBookPress={() => router.push('/lichtiem/datlichtiem')}
          />
        ))}

        {/* --- COMPLETED SECTION --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✅ Đã hoàn thành</Text>
          <TouchableOpacity onPress={() => router.push('/lichtiem/danhsachdatiem')}>
            <Text style={styles.seeAllText}>Xem tất cả ➔</Text>
          </TouchableOpacity>
        </View>

        {COMPLETED_VACCINES.map(item => (
          <VaccineCard key={item.id} vaccine={item} />
        ))}

        <View style={{ height: 120 }} /> 
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/lichtiem/themmuitiem')}
        >
          <Text style={styles.addButtonText}>✨ + Thêm mũi tiêm mới</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { width: 45 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5, zIndex: -1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#5c7a8a' },
  seeAllText: { fontSize: 14, fontWeight: 'bold', color: '#ff8fab' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, backgroundColor: 'rgba(254, 249, 243, 0.95)' },
  addButton: { backgroundColor: '#ff8fab', paddingVertical: 16, borderRadius: 30, alignItems: 'center', elevation: 5 },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
});
