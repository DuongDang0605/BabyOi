import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeHeaderProps {
  babyName: string;
  babyAge: string;
  avatarSource: any;
  onAvatarPress: () => void;
}

export const HomeHeader = ({ babyName, babyAge, avatarSource, onAvatarPress }: HomeHeaderProps) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Chào mẹ {babyName}! ✨</Text>
        <Text style={styles.name}>{babyAge}</Text>
      </View>

      <TouchableOpacity style={styles.avatarFrame} onPress={onAvatarPress} activeOpacity={0.8}>
        <Image source={avatarSource} style={styles.avatar} />
        <View style={styles.onlineDot} />
      </TouchableOpacity>
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
});
