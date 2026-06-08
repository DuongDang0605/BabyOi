import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HandbookPost {
  id: string;
  category: string;
  title: string;
  snippet: string;
  author: string;
  role: string;
  date: string;
  image: string;
  comments: number;
}

interface HandbookCardProps {
  post: HandbookPost;
  onCommentPress: (post: HandbookPost) => void;
  onSharePress: (post: HandbookPost) => void;
  onPress?: (post: HandbookPost) => void;
}

export const HandbookCard = ({ post, onCommentPress, onSharePress, onPress }: HandbookCardProps) => {
  return (
    <TouchableOpacity
        style={styles.articleCard}
        activeOpacity={0.9}
        onPress={() => onPress?.(post)}
    >
      {/* Ảnh cover của bài viết */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.image }} style={styles.coverImage} />
        <LinearGradient colors={['transparent', 'rgba(51,68,85,0.52)']} style={styles.imageShade} />
        <View style={styles.categoryBadge}>
          <Ionicons name="sparkles" size={12} color="#FF8FAB" />
          <Text style={styles.categoryBadgeText}>{post.category}</Text>
        </View>
      </View>

      {/* Thông tin tác giả & Tiêu đề */}
      <View style={styles.cardContent}>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <FontAwesome5 name="user-md" size={14} color="#fff" />
          </View>
          <View>
            <Text style={styles.authorName}>{post.author} <Text style={styles.authorRole}>• {post.role}</Text></Text>
            <Text style={styles.postDate}>{post.date}</Text>
          </View>
        </View>

        <Text style={styles.articleTitle}>{post.title}</Text>
        <Text style={styles.articleSnippet} numberOfLines={2}>{post.snippet}</Text>
      </View>

      {/* THANH TƯƠNG TÁC */}
      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => onCommentPress(post)}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#5c7a8a" />
          <Text style={styles.interactionText}>Bình luận ({post.comments})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => onSharePress(post)}
        >
          <Ionicons name="share-social-outline" size={22} color="#ff8fab" />
          <Text style={[styles.interactionText, { color: '#ff8fab' }]}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1.5,
    borderColor: '#FFE5EC',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadgeText: {
    color: '#d46b08',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cardContent: {
    padding: 18,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF8FAB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334455',
  },
  authorRole: {
    fontSize: 12,
    color: '#a3d9b1',
    fontWeight: '700',
  },
  postDate: {
    fontSize: 12,
    color: '#8899aa',
    marginTop: 2,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleSnippet: {
    fontSize: 14,
    color: '#5c7a8a',
    lineHeight: 22,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1.5,
    borderTopColor: '#f0f4f8',
    paddingVertical: 12,
    backgroundColor: '#FFF8FA',
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  interactionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5c7a8a',
    marginLeft: 8,
  },
});
