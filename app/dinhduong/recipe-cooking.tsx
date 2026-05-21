import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FoodResponse, getFoodDetail, resolveAssetUrl } from '../../lib/api';

function splitCookingSteps(cookingWay?: string | null) {
  if (!cookingWay) {
    return [];
  }

  const matches = cookingWay.match(/Bước\s+\d+:[\s\S]*?(?=\s*Bước\s+\d+:|$)/g);
  if (!matches) {
    return [{ title: 'Cách nấu', content: cookingWay.trim() }];
  }

  return matches.map((step, index) => {
    const cleaned = step.trim();
    const [rawTitle, ...contentParts] = cleaned.split(':');
    return {
      title: rawTitle || `Bước ${index + 1}`,
      content: contentParts.join(':').trim(),
    };
  });
}

export default function RecipeCookingScreen() {
  const params = useLocalSearchParams<{ id?: string; image?: string }>();
  const [food, setFood] = useState<FoodResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!params.id) {
        setError('Thiếu mã món ăn.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getFoodDetail(params.id);
        if (mounted) {
          setFood(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải công thức.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const imageUri = resolveAssetUrl(food?.imageUrl);
  const cookingSteps = useMemo(() => splitCookingSteps(food?.recommendation?.cookingWay), [food?.recommendation?.cookingWay]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: '', headerTransparent: true, headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#FF8FAB" /></TouchableOpacity>
      )}} />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#FF8FAB" />
          <Text style={styles.stateText}>Đang tải cách chế biến...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="warning-outline" size={28} color="#FF8FAB" />
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : food ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.banner} />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <Ionicons name="image-outline" size={34} color="#FF8FAB" />
              <Text style={styles.placeholderText}>Thiếu ảnh món trong DB</Text>
            </View>
          )}
          <View style={styles.card}>
            <Text style={styles.tag}>Cách chế biến</Text>
            <Text style={styles.title}>{food.name}</Text>
            <Text style={styles.subTitle}>Làm theo từng bước để món giữ đúng độ mềm và vị tự nhiên.</Text>

            <View style={styles.divider} />

            {cookingSteps.length > 0 ? cookingSteps.map((step, index) => (
              <View key={`${step.title}-${index}`} style={styles.stepBox}>
                <View style={styles.stepNum}><Text style={styles.numText}>{index + 1}</Text></View>
                <View style={styles.stepInfo}>
                  <View style={styles.stepHead}><Ionicons name="restaurant-outline" size={18} color="#FF8FAB" /><Text style={styles.stepTitle}>{step.title}</Text></View>
                  <Text style={styles.stepTxt}>{step.content}</Text>
                </View>
              </View>
            )) : (
              <View style={styles.emptyBox}>
                <Ionicons name="document-text-outline" size={24} color="#ABBEC8" />
                <Text style={styles.stateText}>Chưa có cách chế biến cho món này.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { marginTop: 10, color: '#5C7A8A', fontWeight: '800', textAlign: 'center' },
  backBtn: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, marginLeft: 15, marginTop: 10 },
  banner: { width: '100%', height: 250 },
  bannerPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F8' },
  placeholderText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginTop: 8 },
  card: { backgroundColor: '#FEF9F3', marginTop: -30, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 45 },
  tag: { alignSelf: 'flex-start', backgroundColor: '#FFE5EC', color: '#FF8FAB', fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#FF8FAB', lineHeight: 30 },
  subTitle: { color: '#7D95A1', fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 6 },
  divider: { height: 1, backgroundColor: '#FFE5EC', marginVertical: 20 },
  stepBox: { flexDirection: 'row', marginBottom: 16 },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFB6C1', justifyContent: 'center', alignItems: 'center' },
  numText: { color: '#FFF', fontWeight: '900' },
  stepInfo: { flex: 1, marginLeft: 15, backgroundColor: '#FFF', padding: 15, borderRadius: 15, elevation: 2 },
  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#FF8FAB', marginLeft: 8 },
  stepTxt: { fontSize: 14, color: '#5C7A8A', lineHeight: 20 },
  emptyBox: { backgroundColor: '#FFF', borderRadius: 18, padding: 20, alignItems: 'center' },
});