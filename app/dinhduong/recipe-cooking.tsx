import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const totalSteps = cookingSteps.length || 0;

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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.banner} />
            ) : (
              <View style={[styles.banner, styles.bannerPlaceholder]}>
                <Ionicons name="image-outline" size={34} color="#FF8FAB" />
                <Text style={styles.placeholderText}>Thiếu ảnh món trong DB</Text>
              </View>
            )}
            <LinearGradient
              colors={['rgba(255,143,171,0.1)', 'rgba(255,182,193,0.24)', 'rgba(254,249,243,0.98)']}
              style={styles.heroGradient}
            />
            <View style={styles.heroInfo}>
              <View style={styles.heroBadge}>
                <Ionicons name="restaurant-outline" size={15} color="#FF8FAB" />
                <Text style={styles.heroBadgeText}>{totalSteps > 0 ? `${totalSteps} bước` : 'Công thức'}</Text>
              </View>
              <Text style={styles.heroTitle}>{food.name}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <Text style={styles.tag}>Cách chế biến</Text>
                <Text style={styles.title}>{food.name}</Text>
              </View>
              <View style={styles.titleIcon}>
                <Ionicons name="nutrition-outline" size={24} color="#FFF" />
              </View>
            </View>
            <Text style={styles.subTitle}>Làm theo từng bước để món giữ đúng độ mềm và vị tự nhiên.</Text>

            <View style={styles.tipPanel}>
              <View style={styles.tipIcon}>
                <Ionicons name="sparkles" size={18} color="#FF8FAB" />
              </View>
              <View style={styles.tipTextWrap}>
                <Text style={styles.tipTitle}>Gợi ý nhỏ</Text>
                <Text style={styles.tipText}>Chuẩn bị nguyên liệu trước khi nấu để các bước mềm, đều và dễ theo dõi hơn.</Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              <View style={[styles.infoChip, styles.pinkChip]}>
                <Ionicons name="list-outline" size={16} color="#FF8FAB" />
                <Text style={styles.infoChipText}>{totalSteps || 1} mục</Text>
              </View>
              <View style={[styles.infoChip, styles.blueChip]}>
                <Ionicons name="water-outline" size={16} color="#45AFC8" />
                <Text style={[styles.infoChipText, styles.blueChipText]}>Mềm vị</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {cookingSteps.length > 0 ? cookingSteps.map((step, index) => {
              const isPink = index % 2 === 0;
              const accentColor = isPink ? '#FF8FAB' : '#A7E4F5';
              const softBg = isPink ? '#FFF0F5' : '#E9F8FD';
              const titleColor = isPink ? '#FF8FAB' : '#45AFC8';

              return (
                <View key={`${step.title}-${index}`} style={styles.stepBox}>
                  <View style={styles.timelineCol}>
                    <View style={[styles.timelineLine, index === cookingSteps.length - 1 && styles.timelineLineLast]} />
                    <View style={[styles.stepNum, { backgroundColor: accentColor }]}>
                      <Text style={styles.numText}>{index + 1}</Text>
                    </View>
                  </View>
                  <View style={[styles.stepInfo, { borderColor: accentColor, shadowColor: accentColor }]}>
                    <View style={[styles.stepAccent, { backgroundColor: accentColor }]} />
                    <View style={styles.stepHead}>
                      <View style={[styles.stepIcon, { backgroundColor: softBg }]}>
                        <Ionicons name={isPink ? 'restaurant-outline' : 'leaf-outline'} size={17} color={titleColor} />
                      </View>
                      <Text style={[styles.stepTitle, { color: titleColor }]}>{step.title}</Text>
                    </View>
                    <Text style={styles.stepTxt}>{step.content}</Text>
                  </View>
                </View>
              );
            }) : (
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
  scrollContent: { paddingBottom: 24 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  stateText: { marginTop: 10, color: '#5C7A8A', fontWeight: '800', textAlign: 'center' },
  backBtn: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, marginLeft: 15, marginTop: 10, elevation: 4, shadowColor: '#FFB6C1', shadowOpacity: 0.18, shadowRadius: 8 },
  hero: { height: 310, backgroundColor: '#FFE5EC', overflow: 'hidden' },
  banner: { width: '100%', height: '100%' },
  bannerPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F8' },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroInfo: { position: 'absolute', left: 24, right: 24, bottom: 46 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: '#FFE5EC' },
  heroBadgeText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginLeft: 6 },
  heroTitle: { color: '#FF8FAB', fontSize: 28, fontWeight: '900', lineHeight: 34, marginTop: 10, maxWidth: '92%' },
  placeholderText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginTop: 8 },
  card: { backgroundColor: '#FEF9F3', marginTop: -38, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 24, paddingBottom: 45, borderTopWidth: 3, borderColor: '#A7E4F5' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleCopy: { flex: 1 },
  titleIcon: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#FFB6C1', justifyContent: 'center', alignItems: 'center', marginLeft: 12, borderWidth: 3, borderColor: '#FFF' },
  tag: { alignSelf: 'flex-start', backgroundColor: '#FFE5EC', color: '#FF8FAB', fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', color: '#FF8FAB', lineHeight: 30 },
  subTitle: { color: '#7D95A1', fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 6 },
  tipPanel: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 22, padding: 14, marginTop: 18, borderWidth: 1.5, borderColor: '#FFE5EC', elevation: 2, shadowColor: '#FFB6C1', shadowOpacity: 0.08, shadowRadius: 8 },
  tipIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipTextWrap: { flex: 1 },
  tipTitle: { color: '#FF8FAB', fontSize: 13, fontWeight: '900', marginBottom: 3 },
  tipText: { color: '#5C7A8A', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  chipRow: { flexDirection: 'row', marginTop: 14 },
  infoChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginRight: 10, borderWidth: 1.5 },
  pinkChip: { backgroundColor: '#FFF0F5', borderColor: '#FFE5EC' },
  blueChip: { backgroundColor: '#E9F8FD', borderColor: '#A7E4F5' },
  infoChipText: { color: '#FF8FAB', fontSize: 12, fontWeight: '900', marginLeft: 6 },
  blueChipText: { color: '#45AFC8' },
  divider: { height: 1, backgroundColor: '#FFE5EC', marginTop: 20, marginBottom: 22 },
  stepBox: { flexDirection: 'row', marginBottom: 18 },
  timelineCol: { width: 38, alignItems: 'center', position: 'relative' },
  timelineLine: { position: 'absolute', top: 36, bottom: -18, width: 2, backgroundColor: '#FFDCE5' },
  timelineLineLast: { display: 'none' },
  stepNum: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 3 },
  numText: { color: '#FFF', fontWeight: '900' },
  stepInfo: { flex: 1, marginLeft: 8, backgroundColor: '#FFF', padding: 16, borderRadius: 20, elevation: 3, borderWidth: 1.5, shadowOpacity: 0.12, shadowRadius: 8, overflow: 'hidden' },
  stepAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  stepIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  stepTitle: { flex: 1, fontSize: 16, fontWeight: '900' },
  stepTxt: { fontSize: 14, color: '#5C7A8A', lineHeight: 21, fontWeight: '600' },
  emptyBox: { backgroundColor: '#FFF', borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FFE5EC' },
});
