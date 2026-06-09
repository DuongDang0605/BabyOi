import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const MORE_ACCENTS = [
  ['#FFFFFF', '#FFF3F7'],
  ['#FFFFFF', '#EFFBFF'],
  ['#FFFFFF', '#F0FFF6'],
  ['#FFFFFF', '#FFF8E8'],
] as const;

export const MoreFeatures = React.memo(({ title, features, onFeaturePress }: MoreFeaturesProps) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionPill} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {features.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.slideItem}
            onPress={() => onFeaturePress(item.route)}
            activeOpacity={0.84}
          >
            <LinearGradient colors={MORE_ACCENTS[index % MORE_ACCENTS.length]} style={styles.slideIconCircle}>
              <Image
                source={item.icon}
                style={styles.slideIcon}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </LinearGradient>
            <Text style={styles.slideText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', marginRight: 10 },
  sectionPill: { width: 42, height: 8, borderRadius: 8, backgroundColor: '#FFE1EA' },
  horizontalScrollContent: { paddingRight: 20, paddingBottom: 12 },
  slideItem: { width: 100, alignItems: 'center', marginRight: 15 },
  slideIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAF0'
  },
  slideIcon: { width: 40, height: 40 },
  slideText: { fontSize: 12, fontWeight: '700', color: '#5C7A8A', textAlign: 'center' },
});
