import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FeatureItem {
  id: string;
  title: string;
  icon: any;
  route: string;
}

interface FeatureGridProps {
  title: string;
  features: FeatureItem[];
  onFeaturePress: (route: string) => void;
}

export const FeatureGrid = ({ title, features, onFeaturePress }: FeatureGridProps) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.gridContainer}>
        {features.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gridItem}
            onPress={() => onFeaturePress(item.route)}
          >
            <Image source={item.icon} style={styles.mainIcon} />
            <Text style={styles.gridText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', marginBottom: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFF',
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#A7E4F5',
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: '#f0f4f8'
  },
  mainIcon: { width: 60, height: 60, marginBottom: 8, resizeMode: 'contain' },
  gridText: { fontSize: 15, fontWeight: '800', color: '#5C7A8A' },
});
