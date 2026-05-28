import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { HandbookCard } from '../../components/camnang/HandbookCard';
import { getHandbookCategories, getHandbookPosts, resolveAssetUrl, type HandbookPostResponse } from '../../lib/api';

const ALL_CATEGORY = 'Tất cả';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=900&auto=format&fit=crop';

function formatPostDate(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function mapPost(post: HandbookPostResponse) {
  return {
    id: String(post.id),
    category: post.category,
    title: post.title,
    snippet: post.snippet || post.content || '',
    author: post.authorName || 'BabyOi',
    role: post.authorRole || 'Cẩm nang',
    date: formatPostDate(post.publishedAt),
    image: resolveAssetUrl(post.imageUrl) || post.imageUrl || FALLBACK_IMAGE,
    comments: post.commentCount ?? 0,
  };
}

export default function HandbookScreen() {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [posts, setPosts] = useState<HandbookPostResponse[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHandbook = useCallback(async () => {
    try {
      setLoading(true);
      const [categoryData, postData] = await Promise.all([
        getHandbookCategories(),
        getHandbookPosts({
          category: activeCategory === ALL_CATEGORY ? undefined : activeCategory,
          search: searchText,
        }),
      ]);

      setCategories([ALL_CATEGORY, ...categoryData.filter((item) => item && item !== ALL_CATEGORY)]);
      setPosts(postData);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchText]);

  useEffect(() => {
    loadHandbook();
  }, [loadHandbook]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cẩm Nang</Text>
          <TouchableOpacity style={styles.searchButton} onPress={loadHandbook}>
            <Ionicons name="search" size={24} color="#ff8fab" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#7a8c99" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài viết cẩm nang..."
            placeholderTextColor="#a0aab2"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={loadHandbook}
          />
        </View>

        <View style={styles.categoryWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, activeCategory === cat ? styles.catPillActive : styles.catPillInactive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={activeCategory === cat ? styles.catTextActive : styles.catTextInactive}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator color="#ff8fab" style={{ marginTop: 30 }} />
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const mappedPost = mapPost(post);
            return (
              <HandbookCard
                key={post.id}
                post={mappedPost}
                onCommentPress={() => router.push({ pathname: '/camnang/comment', params: { postId: post.id } })}
                onSharePress={() => Alert.alert('Chia sẻ', 'Đã sẵn sàng chia sẻ bài viết này.')}
                onPress={() => router.push({ pathname: '/camnang/comment', params: { postId: post.id } })}
              />
            );
          })
        ) : (
          <Text style={styles.emptyText}>Chưa có bài viết phù hợp.</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
  backButton: { width: 45 },
  searchButton: { width: 45, alignItems: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 18, borderWidth: 1.5, borderColor: '#f0f4f8', paddingHorizontal: 14, marginBottom: 16 },
  searchInput: { flex: 1, paddingVertical: 11, paddingHorizontal: 8, color: '#334455', fontWeight: '700' },
  categoryWrapper: { marginBottom: 25, marginHorizontal: -5 },
  catPill: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, marginHorizontal: 5, borderWidth: 1.5 },
  catPillActive: { backgroundColor: '#ffb6c1', borderColor: '#ffb6c1' },
  catPillInactive: { backgroundColor: '#ffffff', borderColor: '#f0f4f8' },
  catTextActive: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  catTextInactive: { color: '#7a8c99', fontWeight: '600', fontSize: 14 },
  emptyText: { color: '#8899aa', fontWeight: '800', textAlign: 'center', marginTop: 30 },
});
