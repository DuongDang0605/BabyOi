import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2;

interface Dish {
  id: string;
  name: string;
  desc: string;
  rating: number;
  image: string;
  tag: string;
}

interface DishCardProps {
  item: Dish;
  isRestricted: boolean;
  onPress: (item: Dish) => void;
  onToggleRestriction: (id: string) => void;
  onAdd?: (item: Dish) => void;
}

export const DishCard = ({ item, isRestricted, onPress, onToggleRestriction, onAdd }: DishCardProps) => {
  return (
    <View style={[styles.dishCard, isRestricted && styles.restrictedCardEffect]}>
      <TouchableOpacity
        disabled={isRestricted}
        onPress={() => onPress(item)}
      >
        <View style={styles.imageBox}>
          <Image source={{ uri: item.image }} style={[styles.dishImage, isRestricted && { opacity: 0.5 }]} />
          <View style={[styles.tagBadge, isRestricted && { backgroundColor: '#ABBEC8' }]}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.dishName, isRestricted && { color: '#ABBEC8' }]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.dishDesc} numberOfLines={2}>{item.desc}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.starRow}>
              <Ionicons name="star" size={10} color={!isRestricted ? "#FFB800" : "#E0E0E0"} />
              <Text style={[styles.ratingText, isRestricted && { color: '#ABBEC8' }]}>{item.rating}.0</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: isRestricted ? '#FF8FAB' : '#F0F2F5' }]}
                onPress={() => onToggleRestriction(item.id)}
              >
                <Ionicons name={isRestricted ? "refresh" : "remove"} size={18} color={isRestricted ? "white" : "#5C7A8A"} />
              </TouchableOpacity>

              {!isRestricted && (
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFB6C1', marginLeft: 8 }]}
                    onPress={() => onAdd?.(item)}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dishCard: { backgroundColor: '#FFF', width: cardWidth, borderRadius: 25, marginBottom: 20, elevation: 3, overflow: 'hidden' },
  imageBox: { height: 105 },
  dishImage: { width: '100%', height: '100%' },
  tagBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,143,171,0.9)', paddingHorizontal: 8, borderRadius: 8 },
  tagText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  infoBox: { padding: 12 },
  dishName: { fontSize: 13, fontWeight: '800', color: '#FF8FAB' },
  dishDesc: { fontSize: 10, color: '#5C7A8A', height: 28, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 10, fontWeight: 'bold', color: '#FFB800', marginLeft: 3 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  restrictedCardEffect: { opacity: 0.8, elevation: 0, borderWidth: 1, borderColor: '#F0F0F0' }
});
