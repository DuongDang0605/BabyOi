import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Doctor {
  id: string;
  name: string;
  address: string;
  price: number;
  avatar: string;
  desc?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
  variant?: 'mini' | 'large';
}

export const DoctorCard = ({ doctor, onPress, variant = 'large' }: DoctorCardProps) => {
  if (variant === 'mini') {
    return (
      <TouchableOpacity style={styles.doctorRow} onPress={() => onPress(doctor)}>
        <Image source={{ uri: doctor.avatar }} style={styles.avatarMini} />
        <View style={{ flex: 1 }}>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docSub} numberOfLines={1}>
            <Ionicons name="location" /> {doctor.address}
          </Text>
        </View>
        <Text style={styles.priceTag}>{doctor.price / 1000}k</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.doctorCardLarge} onPress={() => onPress(doctor)}>
      <Image source={{ uri: doctor.avatar }} style={styles.avatarLarge} />
      <View style={{ flex: 1 }}>
        <Text style={styles.docName}>{doctor.name}</Text>
        <Text style={styles.docSub}>
          <Ionicons name="location" color="#FF8FAB" /> {doctor.address}
        </Text>
        <Text style={styles.priceTagSmall}>Phí cọc: {doctor.price.toLocaleString()}đ</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2
  },
  doctorCardLarge: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    gap: 15,
    alignItems: 'center',
    elevation: 2
  },
  avatarMini: { width: 45, height: 45, borderRadius: 22, marginRight: 10 },
  avatarLarge: { width: 70, height: 70, borderRadius: 35 },
  docName: { fontSize: 16, fontWeight: '900', color: '#333' },
  docSub: { fontSize: 11, color: '#999', marginTop: 2 },
  priceTag: { fontWeight: '900', color: '#FF8FAB', fontSize: 14 },
  priceTagSmall: { fontSize: 12, fontWeight: '800', color: '#FF8FAB', marginTop: 5 },
});
