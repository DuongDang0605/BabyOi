import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FavoriteDishesScreen() {
  const [favorites, setFavorites] = useState([
    { id: '1', name: 'Salad Ức Gà', desc: 'Hỗ trợ mẹ hồi dáng.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', calories: 350 },
    { id: '2', name: 'Cháo Cá Hồi', desc: 'DHA cho bé.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500', calories: 420 },
  ]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "Món Yêu Thích", headerTintColor: '#FF8FAB' }} />
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
              <Text style={styles.calo}>{item.calories} kcal</Text>
            </View>
            <TouchableOpacity onPress={() => setFavorites(prev => prev.filter(f => f.id !== item.id))}>
              <Ionicons name="trash-outline" size={22} color="#FFB6C1" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 2 },
  img: { width: 70, height: 70, borderRadius: 15 },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: '900', color: '#5C7A8A' },
  desc: { fontSize: 12, color: '#999', marginVertical: 4 },
  calo: { fontSize: 12, color: '#FF8FAB', fontWeight: '700' }
});