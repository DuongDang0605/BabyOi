import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const FEATURE_ACCENTS = [
  { card: '#FFF1F6', gradient: ['#FFFFFF', '#FFEAF0'], dot: '#FF8FAB', foot: '#FFB6C1', border: '#FFD6E0' },
  { card: '#EFFBFF', gradient: ['#FFFFFF', '#DFF7FF'], dot: '#7BDCF2', foot: '#A7E4F5', border: '#D4F4FC' },
  { card: '#F0FFF6', gradient: ['#FFFFFF', '#E8F9ED'], dot: '#7ADFA2', foot: '#B8EFCF', border: '#D7F5E3' },
  { card: '#FFF8E8', gradient: ['#FFFFFF', '#FFF1C9'], dot: '#D8B56D', foot: '#EAD9B6', border: '#EFE0C6' },
] as const;

export const FeatureGrid = React.memo(({ title, features, onFeaturePress }: FeatureGridProps) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
      </View>
      <View style={styles.gridContainer}>
        {features.map((item, index) => {
          const accent = FEATURE_ACCENTS[index % FEATURE_ACCENTS.length];

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.gridItem, { backgroundColor: accent.card, borderColor: accent.border }]}
              onPress={() => onFeaturePress(item.route)}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={accent.gradient}
                style={styles.iconStage}
              >
                <View style={[styles.iconSpark, { backgroundColor: accent.dot }]} />
                <Image
                  source={item.icon}
                  style={styles.mainIcon}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  priority="high"
                />
              </LinearGradient>
              <Text style={styles.gridText}>{item.title}</Text>
              <View style={[styles.cardFoot, { backgroundColor: accent.foot }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB', marginRight: 10 },
  sectionLine: { flex: 1, height: 2, borderRadius: 2, backgroundColor: '#FFE1EA' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFF',
    minHeight: 134,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEAF0',
    overflow: 'hidden',
  },
  iconStage: {
    width: 88,
    height: 78,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconSpark: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB6C1',
  },
  mainIcon: { width: 78, height: 72 },
  gridText: { fontSize: 15, fontWeight: '800', color: '#5C7A8A' },
  cardFoot: { position: 'absolute', left: 18, right: 18, bottom: 0, height: 3, borderRadius: 3, backgroundColor: '#FFE1EA' },
});
