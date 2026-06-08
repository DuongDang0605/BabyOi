import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface DiaryPost {
  id: string;
  date: string;
  age: string;
  title: string;
  content: string;
  image?: string | null;
  milestone?: string | null;
}

interface DiaryCardProps {
  post: DiaryPost;
  isLast: boolean;
  onEdit: (post: DiaryPost) => void;
  onShare: (post: DiaryPost) => void;
  onDelete?: (post: DiaryPost) => void;
}

export const DiaryCard = ({ post, isLast, onEdit, onShare, onDelete }: DiaryCardProps) => {
  const [day, month, year] = post.date.split('/');

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineColumn}>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineLine} />}
        <Text style={styles.timelineDay}>{day || post.date}</Text>
        <Text style={styles.timelineMonth}>{month ? `${month}/${year}` : ''}</Text>
        <View style={styles.timelineHeart}>
          <Ionicons name="heart" size={13} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.diaryCard}>
        <View style={styles.cardHeader}>
          {post.milestone ? (
            <LinearGradient colors={['#FFF1C8', '#FFE6EE']} style={styles.milestoneBadge}>
              <Ionicons name="ribbon" size={15} color="#E6A100" />
              <Text style={styles.milestoneText}>{post.milestone}</Text>
            </LinearGradient>
          ) : (
            <View />
          )}
          <View style={styles.timeMenu}>
            <Ionicons name="time-outline" size={14} color="#9AA5AF" />
            <Text style={styles.timeText}>09:35 AM</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color="#202D3A" />
          </View>
        </View>

        {post.image ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: post.image }} style={styles.postImage} />
            <LinearGradient colors={['transparent', 'rgba(255,143,171,0.18)']} style={styles.imageShade} />
            <View style={styles.pageBadge}>
              <Text style={styles.pageBadgeText}>1/6</Text>
            </View>
            <View style={styles.imageSparkle}>
              <Ionicons name="sparkles" size={17} color="#FFFFFF" />
            </View>
          </View>
        ) : null}

        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postAge}>{post.age}</Text>
          <Text style={styles.postText}>{post.content}</Text>
        </View>

        <View style={styles.interactionBar}>
          <View style={styles.cuteMetric}>
              <Ionicons name="heart" size={15} color="#FF8FAB" />
            <Text style={styles.metricText}>24</Text>
          </View>
          <View style={styles.cuteMetric}>
            <Ionicons name="chatbubble-ellipses-outline" size={15} color="#7C8792" />
            <Text style={styles.metricText}>5</Text>
          </View>

          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.actionCircle, styles.editBtn]} onPress={() => onEdit(post)}>
              <FontAwesome5 name="edit" size={15} color="#348CA8" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCircle, styles.shareBtn]} onPress={() => onShare(post)}>
              <Ionicons name="share-outline" size={18} color="#B55CCB" />
            </TouchableOpacity>

            {onDelete ? (
              <TouchableOpacity style={[styles.actionCircle, styles.deleteBtn]} onPress={() => onDelete(post)}>
                <Ionicons name="trash-outline" size={18} color="#F05F78" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineColumn: {
    width: 66,
    alignItems: 'center',
    paddingTop: 14,
  },
  timelineDot: {
    position: 'absolute',
    top: 20,
    left: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF8FAB',
  },
  timelineLine: {
    position: 'absolute',
    left: 8,
    top: 34,
    bottom: -26,
    width: 1.5,
    backgroundColor: '#FFD8E5',
  },
  timelineDay: {
    color: '#202D3A',
    fontSize: 16,
    fontWeight: '900',
  },
  timelineMonth: {
    color: '#A6AEB8',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  timelineHeart: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#FFB4C8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    borderWidth: 3,
    borderColor: '#FEF9F3',
  },
  diaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 9,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    maxWidth: '50%',
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#C07400',
    marginLeft: 5,
  },
  timeMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    color: '#8A96A3',
    fontSize: 11,
    fontWeight: '800',
  },
  imageWrap: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF7EE',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
  },
  pageBadge: {
    position: 'absolute',
    right: 11,
    top: 11,
    backgroundColor: 'rgba(30,48,68,0.7)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  imageSparkle: {
    position: 'absolute',
    left: 16,
    bottom: 14,
  },
  postContent: {
    paddingHorizontal: 8,
    paddingBottom: 9,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334455',
    marginBottom: 3,
  },
  postAge: {
    fontSize: 12,
    color: '#9AA5AF',
    fontWeight: '700',
    marginBottom: 3,
  },
  postText: {
    fontSize: 14,
    color: '#526577',
    lineHeight: 20,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 5,
  },
  cuteMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8FA',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  metricText: {
    color: '#475766',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },
  actionGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#EAFBFF',
  },
  shareBtn: {
    backgroundColor: '#FFF1FF',
  },
  deleteBtn: {
    backgroundColor: '#FFECEF',
  },
});
