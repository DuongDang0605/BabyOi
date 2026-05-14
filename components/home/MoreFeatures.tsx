import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FeatureItem {
  id: string;
  title: string;
  icon: any;
  route: string;
}

interface MoreFeaturesProps {
  title: string;
  features: FeatureItem[];
  onFeaturePress: (route: string) => void;
}

export const MoreFeatures = ({ title, features, onFeaturePress }: MoreFeaturesProps) => {
  return (
    <View>
      <Text style={[styles.sectionTitle, { marginTop: 10 }]}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {features.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.slideItem}
            onPress={() => onFeaturePress(item.route)}
          >
            <View style={styles.slideIconCircle}>
              <Image source={item.icon} style={styles.slideIcon} />
            </View>
            <Text style={styles.slideText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', marginBottom: 15 },
  horizontalScrollContent: { paddingRight: 20, paddingBottom: 10 },
  slideItem: { width: 100, alignItems: 'center', marginRight: 15 },
  slideIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    borderWidth: 1,
    borderColor: '#f0f4f8'
  },
  slideIcon: { width: 40, height: 40, resizeMode: 'contain' },
  slideText: { fontSize: 12, fontWeight: '700', color: '#5C7A8A', textAlign: 'center' },
});
