import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AlertCardProps {
  title: string;
  subtitle: string;
  badgeText: string;
}

export const AlertCard = ({ title, subtitle, badgeText }: AlertCardProps) => {
  return (
    <View style={styles.alertCard}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/9334/9334338.png' }}
        style={styles.alertIconAnime}
      />
      <View style={styles.alertTextContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertSubtitle}>{subtitle}</Text>
        <View style={styles.alertDateBadge}>
          <Text style={styles.alertDateText}>{badgeText}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: '#FFB6C1',
    padding: 18,
    borderRadius: 30,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5
  },
  alertIconAnime: { width: 50, height: 50, marginRight: 12 },
  alertTextContent: { flex: 1 },
  alertTitle: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  alertSubtitle: { fontSize: 13, color: '#FFF', marginBottom: 5 },
  alertDateBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  alertDateText: { fontSize: 11, color: '#FF8FAB', fontWeight: '900' },
});
