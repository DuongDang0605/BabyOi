import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CustomHeader } from '../../components/common/CustomHeader';
import { FoodResponse, deleteRestrictedFood, getFoodDetail, getRestrictedFoods, resolveAssetUrl } from '../../lib/api';
import { getAuthSession, hydrateAuthSession } from '../../lib/auth-session';
import { getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

const LOCAL_RESTRICTED_IDS_KEY = 'babyoi_guest_restricted_food_ids';

async function readLocalRestrictedIds() {
  const raw = await AsyncStorage.getItem(LOCAL_RESTRICTED_IDS_KEY);
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

async function writeLocalRestrictedIds(ids: string[]) {
  await AsyncStorage.setItem(LOCAL_RESTRICTED_IDS_KEY, JSON.stringify(Array.from(new Set(ids))));
}

async function getCurrentProfileId() {
  const profile = getSelectedProfile() || await hydrateSelectedProfile();
  return profile?.id ?? null;
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

export default function RestrictedDishesScreen() {
  const [restrictedFoods, setRestrictedFoods] = useState<FoodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRestrictedFoods() {
      try {
        setLoading(true);
        setError(null);
        const session = getAuthSession() || await hydrateAuthSession();
        const profileId = session?.userId ? await getCurrentProfileId() : null;
        if (!session?.userId) {
          const localIds = await readLocalRestrictedIds();
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
            setRestrictedFoods(localFoods.filter((item): item is FoodResponse => item !== null));
          }
          return;
        }
        if (!profileId) {
          if (mounted) {
            setError('Vui lòng chọn hồ sơ để xem món hạn chế.');
          }
          return;
        }

        const data = await getRestrictedFoods(profileId);
        if (mounted) {
          setRestrictedFoods(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải món hạn chế.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRestrictedFoods();
    return () => {
      mounted = false;
    };
  }, []);

  const removeRestrictedFood = async (foodId: number) => {
    const session = getAuthSession() || await hydrateAuthSession();
    const profileId = session?.userId ? await getCurrentProfileId() : null;
    if (!session?.userId) {
      const nextFoods = restrictedFoods.filter((item) => item.id !== foodId);
      setRestrictedFoods(nextFoods);
      await writeLocalRestrictedIds(nextFoods.map((item) => String(item.id)));
      return;
    }
    if (!profileId) {
      setError('Vui lòng chọn hồ sơ để bỏ hạn chế món ăn.');
      return;
    }

    const previous = restrictedFoods;
    setRestrictedFoods((current) => current.filter((item) => item.id !== foodId));

    try {
      await deleteRestrictedFood(profileId, foodId);
    } catch (err) {
      setRestrictedFoods(previous);
      setError(err instanceof Error ? err.message : 'Không thể bỏ hạn chế món ăn.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Món Hạn Chế" />
      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải món hạn chế...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Ionicons name="warning-outline" size={26} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={restrictedFoods}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={() => (
            <View style={styles.stateBox}>
              <Ionicons name="eye-off-outline" size={28} color="#ABBEC8" />
              <Text style={styles.stateText}>Chưa có món hạn chế.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/dinhduong/recipe-detail', params: { id: item.id } })}>
              {item.imageUrl ? (
                <Image source={{ uri: resolveAssetUrl(item.imageUrl) }} style={styles.img} cachePolicy="disk" contentFit="cover" recyclingKey={`restricted-${item.id}`} />
              ) : (
                <View style={[styles.img, styles.placeholder]}>
                  <Ionicons name="image-outline" size={22} color="#FF8FAB" />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{foodDescription(item)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeRestrictedFood(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#ABBEC8" />
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
