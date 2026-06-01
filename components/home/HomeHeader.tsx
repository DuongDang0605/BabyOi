import { Ionicons } from '@expo/vector-icons';
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
      <View>
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
          <Image source={avatarSource} style={styles.avatar} />
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
    marginBottom: 25
  },
  greeting: { fontSize: 16, color: '#5C7A8A', fontWeight: '600' },
  name: { fontSize: 28, fontWeight: '900', color: '#FF8FAB' },
  avatar: { width: 65, height: 65, borderRadius: 33, borderWidth: 3, borderColor: '#FFB6C1' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FEF9F3'
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
