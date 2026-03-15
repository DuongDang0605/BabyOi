import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// DỮ LIỆU: Đã bổ sung isAdmin cho TẤT CẢ các object để đồng nhất cấu trúc, tránh crash
const COMMENTS_DATA = [
  {
    id: 'c1',
    user: 'Mẹ Mít',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
    time: '2 giờ trước',
    content: 'Cảm ơn admin, bài viết rất hữu ích ạ! Bé nhà mình 6 tháng bắt đầu ăn dặm BLW mà mẹ lóng ngóng quá.',
    likes: 12,
    isLiked: false,
    isAdmin: false, 
    replies: [] 
  },
  {
    id: 'c2',
    user: 'Mẹ Ken',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
    time: '4 giờ trước',
    content: 'Cho mình hỏi lúc bắt đầu bé có hay bị oẹ không ạ? Ken nhà mình cắn miếng cà rốt to xong oẹ làm cả nhà hết hồn luôn 😭',
    likes: 5,
    isLiked: true,
    isAdmin: false, 
    replies: [ 
      {
        id: 'r1',
        user: 'Admin Hương Trà',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
        time: '3 giờ trước',
        content: 'Mẹ Ken ơi, phản xạ oẹ (gag reflex) ở giai đoạn đầu là rất bình thường để bé tự bảo vệ đường thở nhé. Mẹ cứ bình tĩnh quan sát ạ! 🥰',
        likes: 24,
        isAdmin: true, 
        isLiked: false,
      },
      {
        id: 'r2',
        user: 'Mẹ Ken',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        time: '1 giờ trước',
        content: 'Dạ vâng, cảm ơn admin đã tư vấn. Để mình yên tâm cho bé tập tiếp chứ xót ruột quá.',
        likes: 2,
        isAdmin: false, 
        isLiked: false,
      }
    ]
  },
  {
    id: 'c3',
    user: 'Mẹ Bún',
    avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140049.png',
    time: '30 phút trước',
    content: 'Lưu ngay thực đơn này lại. Mai đi chợ mua đồ về nấu cho Bún luôn 😋',
    likes: 1,
    isLiked: false,
    isAdmin: false, 
    replies: []
  },
];

export default function CommentScreen() {
  const [inputText, setInputText] = useState('');

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- BAO TOÀN BỘ BẰNG SCROLLVIEW CHUẨN FORM --- */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        
        {/* --- HEADER CHUẨN ĐƯỢC CHUYỂN VÀO TRONG SCROLLVIEW --- */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Bình Luận</Text>
          
          <View style={{ width: 45 }} />
        </View>

        {/* --- BÀI VIẾT GỐC THU NHỎ --- */}
        <View style={styles.originalPostCard}>
          <View style={styles.postContextInfo}>
            <Text style={styles.postContextCategory}>Dinh dưỡng</Text>
            <Text style={styles.postContextTitle} numberOfLines={2}>
              Thực đơn ăn dặm BLW tuần đầu tiên cho bé 6 tháng
            </Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1514050684125-9614f24ebcc6?q=80&w=200&auto=format&fit=crop' }} 
            style={styles.postContextImage} 
          />
        </View>

        <View style={styles.divider} />

        {/* --- DANH SÁCH BÌNH LUẬN --- */}
        <Text style={styles.commentCountText}>5 bình luận</Text>

        {COMMENTS_DATA.map((comment) => (
          <View key={comment.id}>
            {/* 1. BÌNH LUẬN CHÍNH (TO) */}
            <View style={[styles.commentItem, comment.replies.length > 0 && { marginBottom: 15 }]}>
              <Image source={{ uri: comment.avatar }} style={styles.avatar} />
              <View style={styles.commentContentWrapper}>
                <View style={styles.commentBubble}>
                  <View style={styles.commentHeader}>
                    {/* SỬ DỤNG TOÁN TỬ 3 NGÔI ? : null ĐỂ TRÁNH LỖI */}
                    <Text style={styles.commentUser}>
                      {comment.user} {comment.isAdmin ? <Ionicons name="checkmark-circle" size={14} color="#a3d9b1" /> : null}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>

                {/* Hành động của bình luận chính */}
                <View style={styles.commentActions}>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>Trả lời</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={[styles.actionText, comment.isLiked && styles.actionTextLiked]}>
                      {comment.isLiked ? 'Đã yêu thích' : 'Yêu thích'} ({comment.likes})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 2. CÁC BÌNH LUẬN TRẢ LỜI (NHỎ HƠN & THỤT LỀ) */}
            {comment.replies && comment.replies.length > 0 && (
              <View style={styles.repliesWrapper}>
                {comment.replies.map((reply) => (
                  <View key={reply.id} style={styles.replyItem}>
                    <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                    <View style={styles.commentContentWrapper}>
                      
                      <View style={styles.replyBubble}>
                        <View style={styles.commentHeader}>
                          {/* SỬ DỤNG TOÁN TỬ 3 NGÔI ? : null ĐỂ TRÁNH LỖI */}
                          <Text style={styles.commentUser}>
                            {reply.user} {reply.isAdmin ? <Ionicons name="checkmark-circle" size={14} color="#a3d9b1" /> : null}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{reply.content}</Text>
                      </View>

                      {/* Hành động của bình luận trả lời */}
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTime}>{reply.time}</Text>
                        <TouchableOpacity style={styles.actionBtn}>
                          <Text style={styles.actionText}>Trả lời</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                          <Text style={[styles.actionText, reply.isLiked && styles.actionTextLiked]}>
                            {reply.isLiked ? 'Đã yêu thích' : 'Yêu thích'} ({reply.likes})
                          </Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- KHU VỰC GÕ BÌNH LUẬN --- */}
      <View style={styles.inputArea}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1154/1154444.png' }} 
          style={styles.myAvatar} 
        />
        <TextInput 
          style={styles.textInput}
          placeholder="Viết bình luận của mẹ..."
          placeholderTextColor="#999"
          multiline={true}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim().length > 0 ? styles.sendButtonActive : styles.sendButtonInactive]}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollArea: {
    padding: 20, // CHUẨN: PADDING 4 PHÍA NHƯ SỔ TIÊM
  },
  /* --- HEADER CHUẨN --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25, // Đổi thành 25 cho đồng bộ
    // Đã xóa paddingHorizontal thừa
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
    width: 45, 
  },
  headerTitle: {
    flex: 1, 
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
  },
  /* --- BÀI VIẾT GỐC THU NHỎ --- */
  originalPostCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f0f4f8',
    alignItems: 'center',
  },
  postContextInfo: {
    flex: 1,
    paddingRight: 10,
  },
  postContextCategory: {
    fontSize: 12,
    fontWeight: '800',
    color: '#d46b08',
    marginBottom: 4,
  },
  postContextTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334455',
    lineHeight: 20,
  },
  postContextImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  divider: {
    height: 2,
    backgroundColor: '#f0f4f8',
    marginVertical: 20,
  },
  commentCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5c7a8a',
    marginBottom: 20,
  },
  /* --- DANH SÁCH BÌNH LUẬN --- */
  commentItem: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f0f4f8',
  },
  commentContentWrapper: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 20,
    borderTopLeftRadius: 5,
    borderWidth: 1.5,
    borderColor: '#f0f4f8',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '900',
    color: '#334455',
  },
  commentText: {
    fontSize: 14,
    color: '#5c7a8a',
    lineHeight: 22,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 5,
  },
  commentTime: {
    fontSize: 12,
    color: '#a0aab2',
    marginRight: 15,
  },
  actionBtn: {
    marginRight: 15,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8899aa',
  },
  actionTextLiked: {
    color: '#ff8fab', 
  },
  /* --- BÌNH LUẬN TRẢ LỜI (REPLY) --- */
  repliesWrapper: {
    marginLeft: 56, 
    borderLeftWidth: 2, 
    borderColor: '#f0f4f8',
    paddingLeft: 12, 
    marginBottom: 25,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  replyAvatar: {
    width: 32, 
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  replyBubble: {
    backgroundColor: '#fafbfc', 
    padding: 12,
    borderRadius: 18,
    borderTopLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  /* --- KHU VỰC NHẬP BÌNH LUẬN --- */
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1.5,
    borderColor: '#f0f4f8',
    alignItems: 'center',
  },
  myAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ffb6c1',
  },
  textInput: {
    flex: 1, 
    backgroundColor: '#f5f7f9',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingTop: 12, 
    fontSize: 15,
    color: '#333333',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonActive: {
    backgroundColor: '#ff8fab', 
    shadowColor: '#ff8fab',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonInactive: {
    backgroundColor: '#e2e8f0', 
  },
});