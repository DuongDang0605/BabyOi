import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileInfoProps {
  name: string;
  dob: string;
  gender: string;
  avatarSource: any;
  onEditPress: () => void;
  showEditBadge?: boolean;
}

export const ProfileInfo = ({ name, dob, gender, avatarSource, onEditPress, showEditBadge = true }: ProfileInfoProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarBorder}>
          <Image source={avatarSource} style={styles.avatar} />
        </View>
        {showEditBadge && (
          <TouchableOpacity style={styles.editBadge} onPress={onEditPress}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.name}>{name}</Text>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#FF8FAB" />
          <Text style={styles.detailText}>{dob}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <Ionicons name={gender === 'Nam' ? 'male' : 'female'} size={16} color="#A7E4F5" />
          <Text style={styles.detailText}>{gender}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFF',
    elevation: 5,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF8FAB',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: '#334455',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C7A8A',
  },
  divider: {
    width: 1,
    height: 15,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
});
