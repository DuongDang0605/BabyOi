import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ChatMessage } from '../../components/ai/ChatMessage';
import {
  deleteAiChatConversation,
  getAiChatConversations,
  getAiChatMessages,
  sendAiChatMessage,
  type AiChatMessageResponse,
  type ProfileResponse,
} from '../../lib/api';
import { hydrateSelectedProfile } from '../../lib/profile-session';

type DisplayMessage = Pick<AiChatMessageResponse, 'sender' | 'message'> & {
  id: string;
};

const GREETING = 'Chào mẹ! Trợ lý AI BabyOi có thể hỗ trợ về dinh dưỡng, tăng trưởng, tiêm chủng và chăm sóc sức khỏe mẹ & bé. Mẹ muốn hỏi điều gì hôm nay?';

type SuggestedPrompt = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  question: string;
};

function getNutritionPrompts(profile: ProfileResponse | null): SuggestedPrompt[] {
  if (profile?.profileType?.toUpperCase() === 'MOTHER') {
    return [
      {
        icon: 'flame-outline',
        label: 'Calo mỗi ngày',
        question: 'Dựa trên BMI, mức vận động và TDEE gần nhất trong hồ sơ, tôi nên ăn bao nhiêu calo mỗi ngày?',
      },
      {
        icon: 'restaurant-outline',
        label: 'Cân đối khẩu phần',
        question: 'Tôi nên cân đối chất đạm, tinh bột, chất béo và rau trong khẩu phần hằng ngày như thế nào?',
      },
      {
        icon: 'scale-outline',
        label: 'Kiểm soát cân nặng',
        question: 'Dựa trên chỉ số sức khỏe gần nhất, tôi nên điều chỉnh chế độ ăn thế nào để kiểm soát cân nặng an toàn?',
      },
      {
        icon: 'nutrition-outline',
        label: 'Thực đơn đủ chất',
        question: 'Gợi ý cho tôi một số nhóm thực phẩm để xây dựng thực đơn đủ chất và phù hợp với nhu cầu năng lượng.',
      },
    ];
  }

  if (profile?.profileType?.toUpperCase() === 'CHILD') {
    return [
      {
        icon: 'restaurant-outline',
        label: 'Ăn theo độ tuổi',
        question: 'Dựa trên độ tuổi hiện tại, bé nên ăn gì và chia bao nhiêu bữa trong ngày?',
      },
      {
        icon: 'scale-outline',
        label: 'Khẩu phần của bé',
        question: 'Dựa trên cân nặng, chiều cao và chỉ số sức khỏe gần nhất, khẩu phần của bé nên được điều chỉnh thế nào?',
      },
      {
        icon: 'leaf-outline',
        label: 'Thực phẩm giàu chất',
        question: 'Gợi ý các thực phẩm giàu sắt, đạm và vitamin phù hợp với độ tuổi của bé.',
      },
      {
        icon: 'happy-outline',
        label: 'Bé biếng ăn',
        question: 'Bé biếng ăn thì nên chia bữa và kết hợp thực phẩm như thế nào để bảo đảm dinh dưỡng?',
      },
    ];
  }

  return [
    {
      icon: 'restaurant-outline',
      label: 'Khẩu phần đủ chất',
      question: 'Một khẩu phần ăn đủ chất nên cân đối các nhóm thực phẩm như thế nào?',
    },
    {
      icon: 'flame-outline',
      label: 'Nhu cầu năng lượng',
      question: 'BMI, BMR và TDEE có ý nghĩa gì khi xây dựng chế độ dinh dưỡng?',
    },
    {
      icon: 'nutrition-outline',
      label: 'Gợi ý thực phẩm',
      question: 'Gợi ý các nhóm thực phẩm giàu đạm, sắt, vitamin và chất xơ.',
    },
  ];
}

export default function ChatBoxAIScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>(() => getNutritionPrompts(null));
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    let active = true;

    const loadLatestConversation = async () => {
      try {
        const profile = await hydrateSelectedProfile();
        if (!active) return;
        const selectedProfileId = profile?.id ?? null;
        setProfileId(selectedProfileId);
        setSuggestedPrompts(getNutritionPrompts(profile));

        if (selectedProfileId == null) {
          Alert.alert('Chưa chọn hồ sơ', 'Vui lòng chọn hồ sơ mẹ hoặc bé trước khi sử dụng Trợ lý AI.');
          return;
        }

        const conversations = await getAiChatConversations(selectedProfileId);
        if (!active || conversations.length === 0) return;

        const latest = conversations[0];
        const history = await getAiChatMessages(latest.conversationId);
        if (!active) return;

        setConversationId(latest.conversationId);
        setMessages(history.map((item) => ({
          id: String(item.id),
          sender: item.sender,
          message: item.message,
        })));
      } catch {
        if (active) {
          Alert.alert('Không tải được hội thoại', 'Mẹ vẫn có thể bắt đầu một cuộc trò chuyện mới.');
        }
      } finally {
        if (active) setLoadingHistory(false);
      }
    };

    void loadLatestConversation();
    return () => {
      active = false;
    };
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const startNewConversation = useCallback(() => {
    if (!conversationId && messages.length === 0) return;

    Alert.alert('Bắt đầu cuộc trò chuyện mới?', 'Hội thoại hiện tại vẫn được lưu trong lịch sử.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bắt đầu mới',
        onPress: () => {
          setConversationId(null);
          setMessages([]);
          setInput('');
        },
      },
    ]);
  }, [conversationId, messages.length]);

  const removeCurrentConversation = useCallback(() => {
    if (!conversationId) return;

    Alert.alert('Xóa cuộc trò chuyện?', 'Nội dung hội thoại này sẽ bị xóa khỏi lịch sử.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAiChatConversation(conversationId);
            setConversationId(null);
            setMessages([]);
          } catch {
            Alert.alert('Chưa thể xóa', 'Mẹ vui lòng thử lại sau nhé.');
          }
        },
      },
    ]);
  }, [conversationId]);

  const sendMessage = useCallback(async (suggestedQuestion?: string) => {
    const message = (suggestedQuestion ?? input).trim();
    if (!message || sending) return;
    if (profileId == null) {
      Alert.alert('Chưa chọn hồ sơ', 'Vui lòng chọn hồ sơ trước để AI tư vấn đúng thông tin.');
      return;
    }

    const optimisticId = `local-${Date.now()}`;
    setInput('');
    setSending(true);
    setMessages((current) => [...current, { id: optimisticId, sender: 'USER', message }]);

    try {
      const response = await sendAiChatMessage({
        message,
        profileId,
        conversationId,
      });
      setConversationId(response.conversationId);
      setMessages((current) => [...current, {
        id: `assistant-${Date.now()}`,
        sender: 'ASSISTANT',
        message: response.botReply || response.answer,
      }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể kết nối đến trợ lý AI.';
      setMessages((current) => current.filter((item) => item.id !== optimisticId));
      setInput(message);
      Alert.alert('AI chưa thể trả lời', `${errorMessage}\n\nMẹ thử gửi lại sau nhé.`);
    } finally {
      setSending(false);
    }
  }, [conversationId, input, profileId, sending]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={27} color="#ff8fab" />
        </TouchableOpacity>
        <View style={styles.titleGroup}>
          <Text style={styles.headerTitle}>Trợ lý AI</Text>
          <Text style={styles.headerSubtitle}>BabyOi Agentic RAG</Text>
        </View>
        <View style={styles.headerActions}>
          {conversationId ? (
            <TouchableOpacity onPress={removeCurrentConversation} style={styles.smallHeaderButton}>
              <Ionicons name="trash-outline" size={21} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={startNewConversation} style={styles.smallHeaderButton}>
            <Ionicons name="create-outline" size={22} color="#ff8fab" />
          </TouchableOpacity>
          <Image source={require('../../assets/images/AI_chatBox_transparent.png')} style={styles.headerSticker} />
        </View>
      </View>

      {loadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ff8fab" />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? <ChatMessage isAi text={GREETING} /> : null}
          {messages.length === 0 ? (
            <View style={styles.promptSection}>
              <Text style={styles.promptTitle}>Gợi ý câu hỏi dinh dưỡng</Text>
              <Text style={styles.promptSubtitle}>Chọn một câu để AI tư vấn theo hồ sơ và chỉ số sức khỏe gần nhất.</Text>
              <View style={styles.promptGrid}>
                {suggestedPrompts.map((prompt) => (
                  <TouchableOpacity
                    key={prompt.label}
                    style={styles.promptChip}
                    disabled={sending}
                    onPress={() => void sendMessage(prompt.question)}
                  >
                    <Ionicons name={prompt.icon} size={18} color="#e97f9d" />
                    <Text style={styles.promptChipText}>{prompt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
          {messages.map((item) => (
            <ChatMessage
              key={item.id}
              isAi={item.sender.toUpperCase() === 'ASSISTANT'}
              text={item.message}
            />
          ))}
          {sending ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator size="small" color="#7bbf90" />
              <Text style={styles.thinkingText}>Trợ lý AI đang suy nghĩ...</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Hỏi AI về mẹ và bé..."
          placeholderTextColor="#999"
          multiline
          maxLength={2000}
          value={input}
          onChangeText={setInput}
          editable={!sending}
          onSubmitEditing={() => void sendMessage()}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
          disabled={!input.trim() || sending}
          onPress={() => void sendMessage()}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef9f3' },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fffdf9',
    borderBottomWidth: 1,
    borderBottomColor: '#f6e9e7',
  },
  headerButton: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  titleGroup: { position: 'absolute', left: 60, right: 130, alignItems: 'center', bottom: 13 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.3 },
  headerSubtitle: { marginTop: 1, fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  smallHeaderButton: { width: 34, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerSticker: { width: 46, height: 46, resizeMode: 'contain' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { color: '#64748b', fontSize: 14 },
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  promptSection: {
    marginLeft: 56,
    marginBottom: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff8fa',
    borderWidth: 1,
    borderColor: '#f8dce5',
  },
  promptTitle: { color: '#c85d7d', fontSize: 14, fontWeight: '900' },
  promptSubtitle: { color: '#7b8794', fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 11 },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3c9d6',
  },
  promptChipText: { color: '#72515c', fontSize: 12, fontWeight: '800' },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 58, marginBottom: 16, gap: 9 },
  thinkingText: { color: '#7b8794', fontSize: 13, fontStyle: 'italic' },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5f7f9',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333333',
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    backgroundColor: '#98d8aa',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#98d8aa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: { backgroundColor: '#cbd5e1', shadowOpacity: 0 },
});
