import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DiaryPost {
  id: string;
  date: string;
  age: string;
  title: string;
  content: string;
  image: string;
  milestone: string;
}

interface DiaryCardProps {
  post: DiaryPost;
  isLast: boolean;
  onEdit: (post: DiaryPost) => void;
  onShare: (post: DiaryPost) => void;
}

export const DiaryCard = ({ post, isLast, onEdit, onShare }: DiaryCardProps) => {
  return (
    <View style={styles.diaryCard}>
      <View style={styles.timelinePoint} />
      {!isLast && <View style={styles.timelineLine} />}

      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.postDate}>{post.date}</Text>
          <Text style={styles.postAge}>{post.age}</Text>
        </View>
        <View style={styles.milestoneBadge}>
          <Text style={styles.milestoneText}>✨ {post.milestone}</Text>
        </View>
      </View>

      <Image source={{ uri: post.image }} style={styles.postImage} />

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postText}>{post.content}</Text>
      </View>

      {/* Thanh tương tác: Chỉnh sửa & Chia sẻ */}
      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => onEdit(post)}
        >
          <FontAwesome5 name="edit" size={18} color="#5c7a8a" />
          <Text style={styles.interactionText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => onShare(post)}
        >
          <Ionicons name="share-social-outline" size={21} color="#ff8fab" />
          <Text style={[styles.interactionText, { color: '#ff8fab' }]}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  diaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  timelinePoint: {
    position: 'absolute',
    left: -12,
    top: 30,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffb6c1',
    borderWidth: 3,
    borderColor: '#fef9f3',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: -6,
    top: 40,
    width: 2,
    height: '110%',
    backgroundColor: '#ffb6c1',
    opacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334455',
  },
  postAge: {
    fontSize: 12,
    color: '#8899aa',
    fontWeight: '600',
  },
  milestoneBadge: {
    backgroundColor: '#fff0cb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d46b08',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  postContent: {
    marginBottom: 15,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#334455',
    marginBottom: 5,
  },
  postText: {
    fontSize: 14,
    color: '#5c7a8a',
    lineHeight: 20,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1.5,
    borderTopColor: '#f0f4f8',
    paddingTop: 15,
    marginTop: 10,
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
