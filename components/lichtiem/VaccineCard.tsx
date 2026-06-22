import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Vaccine {
  id: string;
  name: string;
  desc: string;
  status: 'upcoming' | 'completed' | 'oral_completed' | 'disease';
  date: string;
  vaccineTypeId?: number | string;
  injectionDate?: string;
  location?: string;
  cost?: string;
  note?: string;
  progressText?: string;
  doseHistory?: string[];
  warnings?: string[];
  isStopped?: boolean;
  canConfirmDose?: boolean;
}

interface VaccineCardProps {
  vaccine: Vaccine;
  onConfirmPress?: (vaccine: Vaccine) => void;
  onCancelPress?: (vaccine: Vaccine) => void;
  onDetailPress?: (vaccine: Vaccine) => void;
  onSchedulePress?: (vaccine: Vaccine) => void;
  onStopPress?: (vaccine: Vaccine) => void;
  onResumePress?: (vaccine: Vaccine) => void;
}

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

const getBadgeText = (status: Vaccine['status']) => {
  if (status === 'upcoming') {
    return 'Sắp tới';
  }
  return status === 'oral_completed' ? 'Đã uống' : 'Đã tiêm';
};

export const VaccineCard = ({
  vaccine,
  onConfirmPress,
  onCancelPress,
  onDetailPress,
  onSchedulePress,
  onStopPress,
  onResumePress,
}: VaccineCardProps) => {
  const isUpcoming = vaccine.status === 'upcoming';
  const isDisease = vaccine.status === 'disease';
  const isStopped = Boolean(vaccine.isStopped);
  const isActive = (isUpcoming || isDisease) && !isStopped;
  const displayDate = formatVaccineDate(vaccine.date);

  return (
    <View style={[styles.vaccineCard, isActive && styles.upcomingCard, isStopped && styles.stoppedCard]}>
      <View style={styles.cardGlowPink} />
      <View style={styles.cardGlowMint} />

      <View style={styles.cardHeader}>
        <View style={[styles.iconStage, isActive ? styles.upcomingIconStage : styles.doneIconStage]}>
          <Ionicons
            name={isStopped ? 'pause-circle-outline' : isDisease ? 'medical-outline' : isUpcoming ? 'calendar-outline' : 'shield-checkmark'}
            size={24}
            color={isStopped ? '#7A8C99' : isActive ? '#FF9C6E' : '#5ABF7A'}
          />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.vaccineName}>{vaccine.name}</Text>
          <Text style={styles.vaccineDesc} numberOfLines={2}>{vaccine.desc}</Text>
        </View>

        {isDisease ? (
          <TouchableOpacity
            style={styles.headerDetailButton}
            onPress={() => onDetailPress?.(vaccine)}
            activeOpacity={0.86}
          >
            <Ionicons name="information-circle-outline" size={13} color="#5C7A8A" />
            <Text style={styles.headerDetailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        ) : (
          <LinearGradient
            colors={isActive ? ['#FFF1C9', '#FFE6EE'] : ['#E8F9ED', '#EAFBFF']}
            style={styles.statusBadge}
          >
            <Ionicons
              name={isUpcoming ? 'time-outline' : 'checkmark-circle'}
              size={13}
              color={isActive ? '#D46B08' : '#2E7D32'}
            />
            <Text style={[styles.statusText, isActive ? styles.statusTextUpcoming : styles.statusTextDone]}>
              {getBadgeText(vaccine.status)}
            </Text>
          </LinearGradient>
        )}
      </View>

      {vaccine.progressText || vaccine.doseHistory?.length || vaccine.warnings?.length ? (
        <View style={[styles.progressBox, isStopped && styles.stoppedProgressBox]}>
          {vaccine.progressText ? (
            <View style={styles.progressHeaderRow}>
              <Ionicons name="analytics-outline" size={15} color={isStopped ? '#7A8C99' : '#5EC9E8'} />
              <Text style={styles.progressText}>{vaccine.progressText}</Text>
            </View>
          ) : null}
          {vaccine.doseHistory?.slice(0, 4).map((line) => (
            <View key={line} style={styles.doseLine}>
              <View style={styles.doseDot} />
              <Text style={styles.doseText}>{line}</Text>
            </View>
          ))}
          {vaccine.warnings?.slice(0, 2).map((warning) => (
            <View key={warning} style={styles.warningLine}>
              <Ionicons name={isStopped ? 'pause-circle-outline' : 'alert-circle-outline'} size={14} color={isStopped ? '#7A8C99' : '#D46B08'} />
              <Text style={[styles.warningText, isStopped && styles.stoppedWarningText]}>{warning}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!isUpcoming && !isDisease ? (
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
        <View style={[styles.dateIconBubble, isActive ? styles.dateUpcomingBubble : styles.dateDoneBubble]}>
          <Ionicons
            name={isStopped ? 'pause-outline' : isDisease ? 'calendar-number-outline' : isUpcoming ? 'calendar-clear-outline' : 'heart'}
            size={15}
            color={isStopped ? '#7A8C99' : isActive ? '#FF9C6E' : '#FF8FAB'}
          />
        </View>
        <Text style={styles.dateText}>
          {isDisease
            ? isStopped ? 'Đã dừng lịch tiêm bệnh này' : displayDate ? `Mũi tiếp theo: ${displayDate}` : 'Chưa có mũi sắp tới'
            : isUpcoming ? `Dự kiến: ${displayDate}` : `Hoàn thành ngày: ${displayDate}`}
        </Text>
      </View>

      {isDisease ? (
        <View style={styles.actionRow}>
          {!isStopped && vaccine.canConfirmDose ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => onConfirmPress?.(vaccine)}
              activeOpacity={0.86}
            >
              <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Xác nhận mũi tiêm</Text>
            </TouchableOpacity>
          ) : null}

          {!isStopped ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.scheduleButton]}
              onPress={() => onSchedulePress?.(vaccine)}
              activeOpacity={0.86}
            >
              <Ionicons name="calendar-outline" size={17} color="#5C7A8A" />
              <Text style={styles.scheduleButtonText}>Thay đổi lịch tiêm</Text>
            </TouchableOpacity>
          ) : null}

          {!isStopped ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={() => onStopPress?.(vaccine)}
              activeOpacity={0.86}
            >
              <Ionicons name="pause-circle-outline" size={17} color="#F05F78" />
              <Text style={styles.stopButtonText}>Dừng tiêm</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={() => onResumePress?.(vaccine)}
              activeOpacity={0.86}
            >
              <Ionicons name="play-circle-outline" size={17} color="#FFFFFF" />
              <Text style={styles.resumeButtonText}>Tiêm lại</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isUpcoming ? (
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
  stoppedCard: {
    borderColor: '#E2EAF0',
    backgroundColor: 'rgba(248,250,251,0.94)',
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
    maxWidth: 104,
  },
  headerDetailButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDF5FB',
  },
  headerDetailButtonText: {
    color: '#5C7A8A',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
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
  progressBox: {
    backgroundColor: 'rgba(239, 251, 255, 0.72)',
    padding: 11,
    borderRadius: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDF5FB',
  },
  stoppedProgressBox: {
    backgroundColor: 'rgba(244, 248, 250, 0.78)',
    borderColor: '#E2EAF0',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  progressText: {
    flex: 1,
    marginLeft: 7,
    color: '#334455',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },
  doseLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  doseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5ABF7A',
    marginTop: 6,
    marginRight: 8,
  },
  doseText: {
    flex: 1,
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  warningLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 7,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 190, 118, 0.28)',
  },
  warningText: {
    flex: 1,
    marginLeft: 6,
    color: '#9A5A00',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  stoppedWarningText: {
    color: '#7A8C99',
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
  scheduleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDF5FB',
  },
  scheduleButtonText: {
    color: '#5C7A8A',
    fontWeight: '900',
    fontSize: 14,
    marginLeft: 6,
  },
  stopButton: {
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFD8E5',
  },
  stopButtonText: {
    color: '#F05F78',
    fontWeight: '900',
    fontSize: 14,
    marginLeft: 6,
  },
  resumeButton: {
    backgroundColor: '#5ABF7A',
    shadowColor: '#5ABF7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    marginLeft: 6,
  },
});
