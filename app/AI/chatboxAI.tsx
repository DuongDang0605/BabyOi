import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Stack } from 'expo-router';

export default function ChatBoxAIScreen() {
  return (
    // Dùng KeyboardAvoidingView để tự động đẩy khung chat lên khi bàn phím xuất hiện
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header của khung Chat */}
      <Stack.Screen options={{ title: 'AI Trợ lý', headerBackTitle: 'Đóng' }} />

      {/* 1. Khu vực hiển thị tin nhắn */}
      <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
        
        {/* Tin nhắn của AI (Bên trái) */}
        <View style={styles.messageWrapper_AI}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.aiAvatar} />
          <View style={styles.bubble_AI}>
            <Text style={styles.text_AI}>Chào mẹ! Mẹ cần tư vấn thực đơn ăn dặm hay muốn phân tích thành phần dinh dưỡng món nào cho bé Ốc hôm nay không? 😊</Text>
          </View>
        </View>

        {/* Tin nhắn của Người dùng (Bên phải) */}
        <View style={styles.messageWrapper_User}>
          <View style={styles.bubble_User}>
            <Text style={styles.text_User}>Trong tủ lạnh đang có cà rốt và cá hồi, nấu món gì ăn dặm cho bé 8 tháng được nhỉ?</Text>
          </View>
        </View>

        {/* Tin nhắn phản hồi của AI (Bên trái) */}
        <View style={styles.messageWrapper_AI}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.aiAvatar} />
          <View style={styles.bubble_AI}>
            <Text style={styles.text_AI}>Tuyệt vời quá! Mẹ có thể làm món **Cháo cá hồi cà rốt** nhé.{'\n\n'}Cá hồi giàu Omega-3 giúp phát triển trí não, còn cà rốt cung cấp Vitamin A rất tốt cho mắt của bé. Bé 8 tháng mẹ nhớ tán nhuyễn vừa phải để bé tập nhai nhé! 🥕🐟</Text>
          </View>
        </View>

      </ScrollView>

      {/* 2. Khu vực nhập tin nhắn (Dưới cùng) */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.cameraButton}>
          <Text style={styles.cameraIcon}>📷</Text>
        </TouchableOpacity>
        
        <TextInput 
          style={styles.textInput}
          placeholder="Hỏi AI về dinh dưỡng..."
          placeholderTextColor="#999"
          multiline={true} // Cho phép gõ nhiều dòng
        />

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Màu xám nhạt làm nền để tin nhắn nổi bật
  },
  chatArea: {
    flex: 1,
    padding: 15,
  },
  // -- Tin nhắn của AI --
  messageWrapper_AI: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end', // Cho avatar nằm ngang hàng với dòng cuối cùng của bong bóng
    paddingRight: 60, // Ép bong bóng không được tràn hết sang phải
  },
  aiAvatar: {
    width: 35,
    height: 35,
    marginRight: 10,
    borderRadius: 17.5,
  },
  bubble_AI: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 20,
    borderBottomLeftRadius: 5, // Vát góc dưới cùng bên trái cho giống đuôi bong bóng
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  text_AI: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  // -- Tin nhắn của Người dùng --
  messageWrapper_User: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Đẩy toàn bộ sang sát mép phải
    marginBottom: 20,
    paddingLeft: 60, // Ép bong bóng không tràn hết sang trái
  },
  bubble_User: {
    backgroundColor: '#a7e4f5', // Bong bóng màu xanh chủ đạo của app
    padding: 15,
    borderRadius: 20,
    borderBottomRightRadius: 5, // Vát đuôi bên phải
  },
  text_User: {
    fontSize: 15,
    color: '#00425c', // Chữ xanh đậm để dễ đọc trên nền xanh nhạt
    lineHeight: 22,
  },
  // -- Khu vực nhập liệu --
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 25, // Tạo khoảng trống an toàn cho các dòng điện thoại tai thỏ/vuốt
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#eeeeee',
    alignItems: 'center',
  },
  cameraButton: {
    padding: 10,
  },
  cameraIcon: {
    fontSize: 24,
  },
  textInput: {
    flex: 1, // Tự động dãn ra chiếm hết khoảng trống giữa 2 nút
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100, // Khống chế độ cao khi gõ quá dài
  },
  sendButton: {
    padding: 10,
    marginLeft: 5,
  },
  sendIcon: {
    fontSize: 24,
    color: '#ff9c6e', // Màu cam đồng bộ với nút nổi AI
  },
});