import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Clinic {
  id: string;
  name: string;
  address: string;
  distance: number;
  price: string;
  hasDiscount: boolean;
  discountText?: string;
}

interface ClinicCardProps {
  clinic: Clinic;
  onSelect: (clinic: Clinic) => void;
}

export const ClinicCard = ({ clinic, onSelect }: ClinicCardProps) => {
  return (
    <View style={styles.clinicCard}>
      <View style={styles.clinicInfo}>
        <View style={styles.clinicNameRow}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          {clinic.hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{clinic.discountText}</Text>
            </View>
          )}
        </View>

        <Text style={styles.clinicAddress}>{clinic.address}</Text>

        <View style={styles.clinicMetaRow}>
          <Text style={styles.distance}>🚗 Cách {clinic.distance} km</Text>
          <Text style={styles.clinicCardPrice}>{clinic.price}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => onSelect(clinic)}
      >
        <Text style={styles.selectButtonText}>Chọn</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  clinicCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.1,
  },
  clinicInfo: { flex: 1, paddingRight: 10 },
  clinicNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
  clinicName: { fontSize: 16, fontWeight: '900', color: '#333333', marginRight: 8 },
  discountBadge: { backgroundColor: '#ffe08a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginTop: 2 },
  discountBadgeText: { fontSize: 11, fontWeight: '900', color: '#d46b08' },
  clinicAddress: { fontSize: 13, color: '#8899aa', marginBottom: 10, lineHeight: 18, fontWeight: '600' },
  clinicMetaRow: { flexDirection: 'row', alignItems: 'center' },
  distance: { fontSize: 12, color: '#2e7d32', fontWeight: '800', marginRight: 15 },
  clinicCardPrice: { fontSize: 14, fontWeight: '900', color: '#ff8fab' },
  selectButton: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  selectButtonText: { color: '#ffffff', fontWeight: '900', fontSize: 14 },
});
