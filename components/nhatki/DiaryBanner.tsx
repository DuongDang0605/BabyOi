import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface DiaryBannerProps {
  babyName: string;
  babyAge: string;
  avatarUrl: string;
}

export const DiaryBanner = ({ babyName, babyAge, avatarUrl }: DiaryBannerProps) => {
  return (
    <View style={styles.welcomeBanner}>
      <View style={styles.avatarBorder}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.babyAvatar}
        />
      </View>
      <View style={styles.bannerInfo}>
        <Text style={styles.babyName}>{babyName}</Text>
        <Text style={styles.babyAge}>📅 {babyAge}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 25,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    padding: 3,
  },
  babyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  bannerInfo: {
    marginLeft: 15,
  },
  babyName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334455',
  },
  babyAge: {
    fontSize: 14,
    color: '#5c7a8a',
    fontWeight: '600',
    marginTop: 2,
  },
});
