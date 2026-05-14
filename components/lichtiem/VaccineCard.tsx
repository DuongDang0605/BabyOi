import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Vaccine {
  id: string;
  name: string;
  desc: string;
  status: 'upcoming' | 'completed' | 'oral_completed';
  date: string;
  location?: string;
  cost?: string;
  note?: string;
}

interface VaccineCardProps {
  vaccine: Vaccine;
  onPress?: (vaccine: Vaccine) => void;
  onBookPress?: (vaccine: Vaccine) => void;
}

export const VaccineCard = ({ vaccine, onPress, onBookPress }: VaccineCardProps) => {
  const isUpcoming = vaccine.status === 'upcoming';

  const getStatusBadge = () => {
    if (vaccine.status === 'upcoming') {
      return (
        <View style={styles.statusBadge_Upcoming}>
          <Text style={styles.statusText_Upcoming}>Sắp tới</Text>
        </View>
      );
    }
    return (
      <View style={styles.statusBadge_Done}>
        <Text style={styles.statusText_Done}>
          {vaccine.status === 'oral_completed' ? 'Đã uống' : 'Đã tiêm'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.vaccineCard, isUpcoming && styles.upcomingCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.vaccineName}>{vaccine.name}</Text>
        {getStatusBadge()}
      </View>

      <Text style={styles.vaccineDesc}>{vaccine.desc}</Text>

      {!isUpcoming && (
        <View style={styles.detailBox}>
          {vaccine.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Nơi tiêm:</Text>
              <Text style={styles.detailValue}>{vaccine.location}</Text>
            </View>
          )}
          {vaccine.cost && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💰 Chi phí:</Text>
              <Text style={styles.detailValue}>{vaccine.cost}</Text>
            </View>
          )}
          {vaccine.note && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📝 Ghi chú:</Text>
              <Text style={styles.detailValue}>{vaccine.note}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.dateRow}>
        <Text style={styles.dateIcon}>{isUpcoming ? '📅' : '💖'}</Text>
        <Text style={styles.dateText}>
          {isUpcoming ? `Dự kiến: ${vaccine.date}` : `Hoàn thành ngày: ${vaccine.date}`}
        </Text>
      </View>

      {isUpcoming && onBookPress && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => onBookPress(vaccine)}
        >
          <Text style={styles.bookButtonText}>💉 Đặt lịch tiêm ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  vaccineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  upcomingCard: {
    borderColor: '#ffe08a',
    backgroundColor: '#fffcf5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaccineName: { fontSize: 16, fontWeight: '800', color: '#333333', flex: 1 },
  statusBadge_Upcoming: { backgroundColor: '#fff0cb', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15 },
  statusText_Upcoming: { color: '#d46b08', fontSize: 12, fontWeight: 'bold' },
  statusBadge_Done: { backgroundColor: '#eafaf1', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15 },
  statusText_Done: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold' },
  vaccineDesc: { fontSize: 14, color: '#666666', marginBottom: 15, lineHeight: 22 },
  detailBox: { backgroundColor: '#f8fdfa', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eafaf1' },
  detailRow: { flexDirection: 'row', marginBottom: 6 },
  detailLabel: { fontSize: 13, color: '#7a8c99', width: 75, fontWeight: '600' },
  detailValue: { fontSize: 13, color: '#334455', flex: 1, fontWeight: '700' },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef9f3', padding: 12, borderRadius: 12 },
  dateIcon: { marginRight: 8, fontSize: 14 },
  dateText: { fontSize: 14, color: '#5c7a8a', fontWeight: '600' },
  bookButton: { backgroundColor: '#ff9c6e', paddingVertical: 12, borderRadius: 15, alignItems: 'center', marginTop: 15, elevation: 2 },
  bookButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
});
