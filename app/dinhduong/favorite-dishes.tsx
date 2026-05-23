import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CustomHeader } from '../../components/common/CustomHeader';
import { FoodResponse, deleteFavoriteFood, getFavoriteFoods, getFoodDetail, resolveAssetUrl } from '../../lib/api';
import { getAuthSession, hydrateAuthSession } from '../../lib/auth-session';

const LOCAL_FAVORITE_IDS_KEY = 'babyoi_guest_favorite_food_ids';

async function readLocalFavoriteIds() {
  const raw = await AsyncStorage.getItem(LOCAL_FAVORITE_IDS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function writeLocalFavoriteIds(ids: string[]) {
  await AsyncStorage.setItem(LOCAL_FAVORITE_IDS_KEY, JSON.stringify(Array.from(new Set(ids))));
}

function foodDescription(item: FoodResponse) {
  const nutrition = item.nutrition;
  if (!nutrition) {
    return item.recommendation?.advice || 'Xem chi tiết món ăn.';
  }

  const calories = nutrition.totalCalories != null ? `${Math.round(nutrition.totalCalories)} ${nutrition.totalCaloriesUnit || 'kcal'}` : null;
  const protein = nutrition.totalProtein != null ? `${nutrition.totalProtein.toFixed(1)} ${nutrition.totalProteinUnit || 'g'} đạm` : null;
  return [calories, protein].filter(Boolean).join(' • ') || 'Xem chi tiết dinh dưỡng.';
}

export default function FavoriteDishesScreen() {
  const [favorites, setFavorites] = useState<FoodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        setLoading(true);
        setError(null);
        const session = getAuthSession() || await hydrateAuthSession();
        if (!session?.userId) {
          const localIds = await readLocalFavoriteIds();
          const localFoods = await Promise.all(
            localIds.map(async (id) => {
              try {
                return await getFoodDetail(id);
              } catch {
                return null;
              }
            })
          );

          if (mounted) {
            setFavorites(localFoods.filter((item): item is FoodResponse => item !== null));
          }
          return;
        }

        const data = await getFavoriteFoods(session.userId);
        if (mounted) {
          setFavorites(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải món yêu thích.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFavorites();
    return () => {
      mounted = false;
    };
  }, []);

  const removeFavorite = async (foodId: number) => {
    const session = getAuthSession() || await hydrateAuthSession();
    if (!session?.userId) {
      const nextFavorites = favorites.filter((item) => item.id !== foodId);
      setFavorites(nextFavorites);
      await writeLocalFavoriteIds(nextFavorites.map((item) => String(item.id)));
      return;
    }

    const previous = favorites;
    setFavorites((current) => current.filter((item) => item.id !== foodId));

    try {
      await deleteFavoriteFood(session.userId, foodId);
    } catch (err) {
      setFavorites(previous);
      setError(err instanceof Error ? err.message : 'Không thể xóa món yêu thích.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Món Yêu Thích" />
      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải món yêu thích...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={26} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={() => (
            <View style={styles.stateBox}>
              <Ionicons name="heart-outline" size={28} color="#FFB6C1" />
              <Text style={styles.stateText}>Chưa có món yêu thích.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/dinhduong/recipe-detail', params: { id: item.id } })}>
              {item.imageUrl ? (
                <Image source={{ uri: resolveAssetUrl(item.imageUrl) }} style={styles.img} />
              ) : (
                <View style={[styles.img, styles.placeholder]}>
                  <Ionicons name="image-outline" size={22} color="#FF8FAB" />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{foodDescription(item)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFavorite(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#FFB6C1" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 2 },
  img: { width: 70, height: 70, borderRadius: 15 },
  placeholder: { backgroundColor: '#FFF5F8', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: '900', color: '#5C7A8A' },
  desc: { fontSize: 12, color: '#999', marginVertical: 4, lineHeight: 17 },
  stateBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { color: '#5C7A8A', fontWeight: '800', textAlign: 'center', marginTop: 10 },
});
