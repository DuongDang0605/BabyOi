import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  babyName: string;
  babyAge: string;
  avatarSource: any;
  onAvatarPress: () => void;
  unreadCount?: number;
  onNotificationPress?: () => void;
}

export const HomeHeader = ({ babyName, babyAge, avatarSource, onAvatarPress, unreadCount = 0, onNotificationPress }: HomeHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.copyBlock}>
        <Text style={styles.greeting}>Chào mẹ {babyName}! ✨</Text>
        <Text style={styles.name}>{babyAge}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.bellButton} onPress={onNotificationPress} activeOpacity={0.85}>
          <Ionicons name="notifications-outline" size={24} color="#FF8FAB" />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarFrame} onPress={onAvatarPress} activeOpacity={0.8}>
          <LinearGradient colors={['#FF8FAB', '#FFE1EA']} style={styles.avatarRing}>
            <Image source={avatarSource} style={styles.avatar} />
          </LinearGradient>
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 25,
  },
  copyBlock: { flex: 1, paddingRight: 10 },
  greeting: { fontSize: 16, color: '#5C7A8A', fontWeight: '700' },
  name: { fontSize: 28, fontWeight: '900', color: '#FF8FAB', lineHeight: 34 },
  avatarRing: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#FFF' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FEF9F3',
  },
  avatarFrame: { position: 'relative' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE1EA',
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5C8A',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
