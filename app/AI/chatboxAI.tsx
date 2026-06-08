import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ChatMessage } from '../../components/ai/ChatMessage';

export default function ChatBoxAIScreen() {
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Trợ Lý</Text>
        <Image source={require('../../assets/images/AI_chatBox_transparent.png')} style={styles.headerSticker} />
      </View>

      {/* 1. Chat Area */}
      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
        
        <ChatMessage
          isAi={true}
          text="Chào mẹ! Mẹ cần Trợ lý AI tư vấn về lịch tiêm phòng, tác dụng phụ của vắc-xin hay vấn đề sức khỏe nào của bé Ốc hôm nay không? 🧚‍♀️"
        />

        <ChatMessage
          isAi={false}
          text="Bé nhà mình sắp được 9 tháng, nghe nói có mũi Viêm não Nhật Bản. Mũi này tiêm loại nào tốt và có hay bị sốt không AI?"
        />

        <ChatMessage
          isAi={true}
          text={"Dạ thưa mẹ, bé Ốc sắp 9 tháng tuổi là thời điểm vàng để tiêm Viêm não Nhật Bản rồi ạ! 🌟\n\nHiện tại có loại Imojev (Thái Lan) rất tốt, chỉ cần tiêm 2 mũi (thay vì 3 mũi như loại Jevax cũ) và rất ít gây sốt. Tuy nhiên, một số bé trộm vía nhạy cảm có thể hơi hâm hấp ấm đầu trong 1-2 ngày đầu mẹ nhé.\n\nMẹ có muốn em thêm mũi Imojev này vào lịch \"Sắp tới\" của bé Ốc luôn không ạ? 🥰"}
          highlightText="thời điểm vàng"
          actionText="Thêm vào sổ tiêm"
          onActionPress={() => router.push('/lichtiem/themmuitiem')}
        />

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 2. Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={26} color="#b0bec5" />
        </TouchableOpacity>
        
        <TextInput 
          style={styles.textInput}
          placeholder="Hỏi AI về lịch tiêm..."
          placeholderTextColor="#999"
          multiline={true} 
        />

        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#ffffff" />
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
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5, zIndex: -1 },
  headerSticker: { width: 52, height: 52, resizeMode: 'contain' },
  chatArea: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  cameraButton: { padding: 8, marginRight: 5 },
  textInput: {
    flex: 1, 
    backgroundColor: '#f5f7f9',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 15,
    color: '#333333',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    backgroundColor: '#a3d9b1',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#a3d9b1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
});
