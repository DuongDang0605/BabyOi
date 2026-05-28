import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
  createHandbookComment,
  getHandbookComments,
  getHandbookPost,
  resolveAssetUrl,
  type HandbookCommentResponse,
  type HandbookPostResponse,
} from '../../lib/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=900&auto=format&fit=crop';
const FALLBACK_AVATAR = 'https://cdn-icons-png.flaticon.com/512/1154/1154444.png';

function formatRelativeTime(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) {
    return `${minutes || 1} phút trước`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  return `${Math.floor(hours / 24)} ngày trước`;
}

function CommentItem({ comment, reply = false }: { comment: HandbookCommentResponse; reply?: boolean }) {
  const avatarUrl = resolveAssetUrl(comment.avatarUrl) || comment.avatarUrl || FALLBACK_AVATAR;

  return (
    <View style={reply ? styles.replyItem : styles.commentItem}>
      <Image source={{ uri: avatarUrl }} style={reply ? styles.replyAvatar : styles.avatar} />
      <View style={styles.commentContentWrapper}>
        <View style={reply ? styles.replyBubble : styles.commentBubble}>
          <Text style={styles.commentUser}>
            {comment.userName || 'Mẹ BabyOi'} {comment.adminReply ? <Ionicons name="checkmark-circle" size={14} color="#a3d9b1" /> : null}
          </Text>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
        <View style={styles.commentActions}>
          <Text style={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>
          <Text style={styles.actionText}>Yêu thích ({comment.likeCount ?? 0})</Text>
        </View>
      </View>
    </View>
  );
}

export default function CommentScreen() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const [post, setPost] = useState<HandbookPostResponse | null>(null);
  const [comments, setComments] = useState<HandbookCommentResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [postData, commentData] = await Promise.all([
        getHandbookPost(postId),
        getHandbookComments(postId),
      ]);
      setPost(postData);
      setComments(commentData);
    } catch {
      setPost(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async () => {
    if (!postId || !inputText.trim() || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await createHandbookComment(postId, { content: inputText.trim() });
      setInputText('');
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const imageUrl = resolveAssetUrl(post?.imageUrl) || post?.imageUrl || FALLBACK_IMAGE;
  const totalComments = comments.reduce((total, item) => total + 1 + (item.replies?.length ?? 0), 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bình Luận</Text>
          <View style={{ width: 45 }} />
        </View>

        {loading ? (
          <ActivityIndicator color="#ff8fab" style={{ marginTop: 40 }} />
        ) : post ? (
          <>
            <View style={styles.originalPostCard}>
              <View style={styles.postContextInfo}>
                <Text style={styles.postContextCategory}>{post.category}</Text>
                <Text style={styles.postContextTitle} numberOfLines={2}>{post.title}</Text>
              </View>
              <Image source={{ uri: imageUrl }} style={styles.postContextImage} />
            </View>

            {!!post.content && <Text style={styles.postContent}>{post.content}</Text>}

            <View style={styles.divider} />
            <Text style={styles.commentCountText}>{totalComments} bình luận</Text>

            {comments.length > 0 ? comments.map((comment) => (
              <View key={comment.id}>
                <CommentItem comment={comment} />
                {!!comment.replies?.length && (
                  <View style={styles.repliesWrapper}>
                    {comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} reply />)}
                  </View>
                )}
              </View>
            )) : (
              <Text style={styles.emptyText}>Chưa có bình luận. Mẹ là người đầu tiên chia sẻ nhé.</Text>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>Không tìm thấy bài viết.</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.inputArea}>
        <Image source={{ uri: FALLBACK_AVATAR }} style={styles.myAvatar} />
        <TextInput
          style={styles.textInput}
          placeholder="Viết bình luận của mẹ..."
          placeholderTextColor="#999"
          multiline
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim().length > 0 ? styles.sendButtonActive : styles.sendButtonInactive]}
          disabled={!inputText.trim() || submitting}
          onPress={handleSend}
        >
          {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="send" size={18} color="#ffffff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  scrollArea: { padding: 20 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },
  originalPostCard: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 12, borderRadius: 16, borderWidth: 1.5, borderColor: '#f0f4f8', alignItems: 'center' },
  postContextInfo: { flex: 1, paddingRight: 10 },
  postContextCategory: { fontSize: 12, fontWeight: '800', color: '#d46b08', marginBottom: 4 },
  postContextTitle: { fontSize: 14, fontWeight: '800', color: '#334455', lineHeight: 20 },
  postContextImage: { width: 64, height: 64, borderRadius: 10 },
  postContent: { marginTop: 16, fontSize: 14, color: '#5c7a8a', lineHeight: 23, fontWeight: '600' },
  divider: { height: 2, backgroundColor: '#f0f4f8', marginVertical: 20 },
  commentCountText: { fontSize: 16, fontWeight: '800', color: '#5c7a8a', marginBottom: 20 },
  commentItem: { flexDirection: 'row', marginBottom: 18 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#f0f4f8' },
  commentContentWrapper: { flex: 1 },
  commentBubble: { backgroundColor: '#ffffff', padding: 15, borderRadius: 20, borderTopLeftRadius: 5, borderWidth: 1.5, borderColor: '#f0f4f8' },
  commentUser: { fontSize: 14, fontWeight: '900', color: '#334455', marginBottom: 6 },
  commentText: { fontSize: 14, color: '#5c7a8a', lineHeight: 22 },
  commentActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 5, gap: 15 },
  commentTime: { fontSize: 12, color: '#a0aab2' },
  actionText: { fontSize: 13, fontWeight: '700', color: '#8899aa' },
  repliesWrapper: { marginLeft: 56, borderLeftWidth: 2, borderColor: '#f0f4f8', paddingLeft: 12, marginBottom: 18 },
  replyItem: { flexDirection: 'row', marginBottom: 15 },
  replyAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f4f8' },
  replyBubble: { backgroundColor: '#fafbfc', padding: 12, borderRadius: 18, borderTopLeftRadius: 5, borderWidth: 1, borderColor: '#f0f4f8' },
  emptyText: { color: '#8899aa', fontWeight: '800', textAlign: 'center', marginTop: 24 },
  inputArea: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 25 : 15, backgroundColor: '#ffffff', borderTopWidth: 1.5, borderColor: '#f0f4f8', alignItems: 'center' },
  myAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10, borderWidth: 1, borderColor: '#ffb6c1' },
  textInput: { flex: 1, backgroundColor: '#f5f7f9', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, paddingTop: 12, fontSize: 15, color: '#333333', maxHeight: 100, borderWidth: 1, borderColor: '#e2e8f0' },
  sendButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendButtonActive: { backgroundColor: '#ff8fab', shadowColor: '#ff8fab', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 2 },
  sendButtonInactive: { backgroundColor: '#e2e8f0' },
});
