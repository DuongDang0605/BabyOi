import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

export default function ChatBoxAIScreen() {
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Tắt Header mặc định */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER ĐỒNG BỘ --- */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Trợ Lý</Text>
        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.headerSticker} />
      </View>

      {/* 1. Khu vực hiển thị tin nhắn */}
      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
        
        {/* Tin nhắn chào hỏi của AI (Bên trái) */}
        <View style={styles.messageWrapper_AI}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.aiAvatar} />
          <View style={styles.bubble_AI}>
            <Text style={styles.text_AI}>
              Chào mẹ! Mẹ cần Trợ lý AI tư vấn về lịch tiêm phòng, tác dụng phụ của vắc-xin hay vấn đề sức khỏe nào của bé Ốc hôm nay không? 🧚‍♀️
            </Text>
          </View>
        </View>

        {/* Tin nhắn của Người dùng (Bên phải - Đã đổi thành câu hỏi về vắc-xin) */}
        <View style={styles.messageWrapper_User}>
          <View style={styles.bubble_User}>
            <Text style={styles.text_User}>
              Bé nhà mình sắp được 9 tháng, nghe nói có mũi Viêm não Nhật Bản. Mũi này tiêm loại nào tốt và có hay bị sốt không AI?
            </Text>
          </View>
        </View>

        {/* Tin nhắn tư vấn của AI (Bên trái) */}
        <View style={styles.messageWrapper_AI}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.aiAvatar} />
          <View style={styles.bubble_AI}>
            <Text style={styles.text_AI}>
              Dạ thưa mẹ, bé Ốc sắp 9 tháng tuổi là <Text style={styles.textHighlight}>thời điểm vàng</Text> để tiêm Viêm não Nhật Bản rồi ạ! 🌟{'\n\n'}
              Hiện tại có loại <Text style={styles.textHighlight}>Imojev (Thái Lan)</Text> rất tốt, chỉ cần tiêm 2 mũi (thay vì 3 mũi như loại Jevax cũ) và rất ít gây sốt. Tuy nhiên, một số bé trộm vía nhạy cảm có thể hơi hâm hấp ấm đầu trong 1-2 ngày đầu mẹ nhé.{'\n\n'}
              Mẹ có muốn em thêm mũi Imojev này vào lịch "Sắp tới" của bé Ốc luôn không ạ? 🥰
            </Text>

            {/* Nút thao tác nhanh của AI (Gợi ý thêm luôn vào sổ) */}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/lichtiem/themmuitiem')}
            >
              <Text style={styles.quickActionText}>👉 Thêm vào sổ tiêm</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 2. Khu vực nhập tin nhắn (Dưới cùng) */}
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

        {/* Nút gửi màu xanh baby dễ thương */}
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3', // Nền kem pastel 
  },
  /* --- HEADER --- */
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
    width: 45,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab', 
    letterSpacing: 0.5,
    zIndex: -1,
  },
  headerSticker: {
    width: 40,
    height: 40,
  },
  /* --- CHAT AREA --- */
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  messageWrapper_AI: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end', 
    paddingRight: 50, // Tránh tràn viền phải
  },
  aiAvatar: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 19,
    backgroundColor: '#ffffff',
  },
  bubble_AI: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 5, // Vát góc đuôi bong bóng
    borderWidth: 1.5,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text_AI: {
    fontSize: 15,
    color: '#445566',
    lineHeight: 23,
  },
  textHighlight: {
    fontWeight: 'bold',
    color: '#d46b08',
  },
  quickActionButton: {
    marginTop: 15,
    backgroundColor: '#fffcf5', // Nền vàng nhạt
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#ffe08a', // Viền vàng đậm hơn chút
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d46b08',
  },
  /* --- USER MESSAGE --- */
  messageWrapper_User: {
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    marginBottom: 20,
    paddingLeft: 50, 
  },
  bubble_User: {
    backgroundColor: '#ffb6c1', // Bong bóng hồng phấn
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 5,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  text_User: {
    fontSize: 15,
    color: '#ffffff', // Chữ trắng nổi bật trên nền hồng
    lineHeight: 22,
    fontWeight: '600',
  },
  /* --- INPUT AREA --- */
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
  cameraButton: {
    padding: 8,
    marginRight: 5,
  },
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
    backgroundColor: '#a3d9b1', // Nút gửi màu xanh lá pastel
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