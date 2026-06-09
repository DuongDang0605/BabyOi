import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AlertCardProps {
  title: string;
  subtitle: string;
  badgeText: string;
}

export const AlertCard = ({ title, subtitle, badgeText }: AlertCardProps) => {
  return (
    <LinearGradient
      colors={['#FF8FAB', '#FFB6C1', '#FFE1EA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.alertCard}
    >
      <View style={styles.alertGlowTop} />
      <View style={styles.alertGlowMint} />
      <View style={styles.alertGlowYellow} />
      <View style={styles.alertIconWrap}>
        <Image
          source={require('../../assets/images/AI_nurse_transparent.png')}
          style={styles.alertIconAnime}
        />
      </View>
      <View style={styles.alertTextContent}>
        <Text style={styles.alertEyebrow}>Nhắc lịch hôm nay</Text>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertSubtitle} numberOfLines={2}>{subtitle}</Text>
        <View style={styles.alertDateBadge}>
          <Text style={styles.alertDateText}>{badgeText}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    padding: 18,
    borderRadius: 30,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 5
  },
  alertGlowTop: {
    position: 'absolute',
    top: -28,
    right: 18,
    width: 120,
    height: 70,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '-16deg' }],
  },
  alertGlowMint: {
    position: 'absolute',
    bottom: -26,
    left: 70,
    width: 98,
    height: 58,
    borderRadius: 28,
    backgroundColor: 'rgba(184,239,207,0.28)',
    transform: [{ rotate: '12deg' }],
  },
  alertGlowYellow: {
    position: 'absolute',
    top: 14,
    right: 12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFE08A',
  },
  alertIconWrap: {
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  alertIconAnime: { width: 82, height: 82, resizeMode: 'contain' },
  alertTextContent: { flex: 1 },
  alertEyebrow: { fontSize: 11, color: '#FFF', fontWeight: '900', opacity: 0.86, marginBottom: 3, textTransform: 'uppercase' },
  alertTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', lineHeight: 23 },
  alertSubtitle: { fontSize: 13, color: '#FFF', marginTop: 2, marginBottom: 7, fontWeight: '700', opacity: 0.95 },
  alertDateBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  alertDateText: { fontSize: 11, color: '#FF8FAB', fontWeight: '900' },
});
