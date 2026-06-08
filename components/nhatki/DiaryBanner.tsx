import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface DiaryBannerProps {
  babyName: string;
  babyAge: string;
  avatarUrl: string;
  memoryCount: number;
}

export const DiaryBanner = ({ babyName, babyAge, avatarUrl, memoryCount }: DiaryBannerProps) => {
  return (
    <View style={styles.welcomeBanner}>
      <View style={styles.sparkleLeft} />
      <View style={styles.sparkleRight} />

      <View style={styles.avatarWrap}>
        <LinearGradient colors={['#FFE5EC', '#FFFFFF', '#E9F8FD']} style={styles.avatarBorder}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.babyAvatar}
          />
        </LinearGradient>
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={18} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.bannerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.babyName}>{babyName}</Text>
          <Ionicons name="create-outline" size={17} color="#FF8FAB" />
        </View>
        <View style={styles.ageRow}>
          <Text style={styles.babyAge}>{babyAge}</Text>
          <Ionicons name="heart" size={12} color="#FF8FAB" />
        </View>
        <View style={styles.bannerChip}>
          <Ionicons name="sparkles" size={13} color="#FF8FAB" />
          <Text style={styles.bannerChipText}>Dòng thời gian yêu thương</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, styles.memoryIcon]}>
              <Ionicons name="calendar-outline" size={19} color="#FF8FAB" />
            </View>
            <View>
              <Text style={styles.statValue}>{memoryCount}</Text>
              <Text style={styles.statLabel}>Kỷ niệm</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statIcon, styles.timelineIcon]}>
              <Ionicons name="sparkles-outline" size={20} color="#5EC9E8" />
            </View>
            <View>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Dòng thời gian</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.decoration}>
        <Ionicons name="heart" size={34} color="#FF9DBA" />
        <Ionicons name="sparkles" size={18} color="#FFD36E" style={styles.decorationSparkle} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 18,
    borderRadius: 30,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 6,
  },
  sparkleLeft: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE5EC',
    left: 100,
    top: 18,
  },
  sparkleRight: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE9A8',
    right: 28,
    top: 34,
  },
  avatarWrap: {
    width: 104,
    height: 104,
    marginRight: 18,
  },
  avatarBorder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 4,
  },
  babyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 7,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8FAB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  bannerInfo: {
    flex: 1,
    paddingRight: 28,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  babyName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#334455',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  babyAge: {
    fontSize: 15,
    color: '#5C7A8A',
    fontWeight: '800',
  },
  bannerChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 9,
  },
  bannerChipText: {
    color: '#705F44',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
  },
  statCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3EDF1',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  memoryIcon: { backgroundColor: '#FFE5EC' },
  timelineIcon: { backgroundColor: '#EAFBFF' },
  statValue: {
    color: '#202D3A',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6F7D8A',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EEF0F4',
    marginHorizontal: 12,
  },
  decoration: {
    position: 'absolute',
    right: 19,
    top: 44,
  },
  decorationSparkle: {
    position: 'absolute',
    right: 36,
    top: -18,
  },
});
