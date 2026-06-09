import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Vaccine {
  id: string;
  name: string;
  desc: string;
  status: 'upcoming' | 'completed' | 'oral_completed';
  date: string;
  vaccineTypeId?: number | string;
  injectionDate?: string;
  location?: string;
  cost?: string;
  note?: string;
}

interface VaccineCardProps {
  vaccine: Vaccine;
  onConfirmPress?: (vaccine: Vaccine) => void;
  onCancelPress?: (vaccine: Vaccine) => void;
}

const getDoneLabel = (status: Vaccine['status']) => status === 'oral_completed' ? 'Đã uống' : 'Đã tiêm';

const formatVaccineDate = (value?: string) => {
  if (!value) {
    return '';
  }

  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}-${month}-${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};

export const VaccineCard = ({ vaccine, onConfirmPress, onCancelPress }: VaccineCardProps) => {
  const isUpcoming = vaccine.status === 'upcoming';
  const displayDate = formatVaccineDate(vaccine.date);

  return (
    <View style={[styles.vaccineCard, isUpcoming && styles.upcomingCard]}>
      <View style={styles.cardGlowPink} />
      <View style={styles.cardGlowMint} />

      <View style={styles.cardHeader}>
        <View style={[styles.iconStage, isUpcoming ? styles.upcomingIconStage : styles.doneIconStage]}>
          <Ionicons
            name={isUpcoming ? 'calendar-outline' : 'shield-checkmark'}
            size={24}
            color={isUpcoming ? '#FF9C6E' : '#5ABF7A'}
          />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.vaccineName}>{vaccine.name}</Text>
          <Text style={styles.vaccineDesc} numberOfLines={2}>{vaccine.desc}</Text>
        </View>

        <LinearGradient
          colors={isUpcoming ? ['#FFF1C9', '#FFE6EE'] : ['#E8F9ED', '#EAFBFF']}
          style={styles.statusBadge}
        >
          <Ionicons
            name={isUpcoming ? 'time-outline' : 'checkmark-circle'}
            size={13}
            color={isUpcoming ? '#D46B08' : '#2E7D32'}
          />
          <Text style={[styles.statusText, isUpcoming ? styles.statusTextUpcoming : styles.statusTextDone]}>
            {isUpcoming ? 'Sắp tới' : getDoneLabel(vaccine.status)}
          </Text>
        </LinearGradient>
      </View>

      {!isUpcoming ? (
        <View style={styles.detailBox}>
          {vaccine.location ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#FF8FAB" />
              <Text style={styles.detailLabel}>Nơi tiêm</Text>
              <Text style={styles.detailValue}>{vaccine.location}</Text>
            </View>
          ) : null}
          {vaccine.cost ? (
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color="#5EC9E8" />
              <Text style={styles.detailLabel}>Chi phí</Text>
              <Text style={styles.detailValue}>{vaccine.cost}</Text>
            </View>
          ) : null}
          {vaccine.note ? (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#B55CCB" />
              <Text style={styles.detailLabel}>Ghi chú</Text>
              <Text style={styles.detailValue}>{vaccine.note}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.dateRow}>
        <View style={[styles.dateIconBubble, isUpcoming ? styles.dateUpcomingBubble : styles.dateDoneBubble]}>
          <Ionicons
            name={isUpcoming ? 'calendar-clear-outline' : 'heart'}
            size={15}
            color={isUpcoming ? '#FF9C6E' : '#FF8FAB'}
          />
        </View>
        <Text style={styles.dateText}>
          {isUpcoming ? `Dự kiến: ${displayDate}` : `Hoàn thành ngày: ${displayDate}`}
        </Text>
      </View>

      {isUpcoming ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => onConfirmPress?.(vaccine)}
            activeOpacity={0.86}
          >
            <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Xác nhận đã tiêm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancelPress?.(vaccine)}
            activeOpacity={0.86}
          >
            <Ionicons name="close-circle-outline" size={17} color="#F05F78" />
            <Text style={styles.cancelButtonText}>Hủy lịch</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  vaccineCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.17,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
  },
  upcomingCard: {
    borderColor: '#FFE6BA',
    backgroundColor: 'rgba(255,252,245,0.94)',
  },
  cardGlowPink: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255, 143, 171, 0.1)',
  },
  cardGlowMint: {
    position: 'absolute',
    left: -28,
    bottom: -30,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(184, 239, 207, 0.14)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  iconStage: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  upcomingIconStage: {
    backgroundColor: '#FFF1C9',
  },
  doneIconStage: {
    backgroundColor: '#E8F9ED',
  },
  titleBlock: {
    flex: 1,
    paddingRight: 8,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#334455',
    lineHeight: 21,
  },
  vaccineDesc: {
    fontSize: 13,
    color: '#6F7D8A',
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 100,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
  },
  statusTextUpcoming: {
    color: '#D46B08',
  },
  statusTextDone: {
    color: '#2E7D32',
  },
  detailBox: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7A8C99',
    width: 62,
    fontWeight: '900',
    marginLeft: 7,
  },
  detailValue: {
    fontSize: 12,
    color: '#334455',
    flex: 1,
    fontWeight: '700',
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,249,243,0.82)',
    padding: 10,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FFF0F4',
  },
  dateIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateUpcomingBubble: {
    backgroundColor: '#FFF1C9',
  },
  dateDoneBubble: {
    backgroundColor: '#FFE5EC',
  },
  dateText: {
    flex: 1,
    fontSize: 13,
    color: '#5C7A8A',
    fontWeight: '900',
  },
  actionRow: {
    marginTop: 13,
    gap: 9,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  confirmButton: {
    backgroundColor: '#5ABF7A',
    shadowColor: '#5ABF7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    marginLeft: 6,
  },
  cancelButton: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFD8E5',
  },
  cancelButtonText: {
    color: '#F05F78',
    fontWeight: '900',
    fontSize: 14,
    marginLeft: 6,
  },
});
