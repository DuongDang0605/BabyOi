import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Luồng: ĐỐI TƯỢNG -> MỤC TIÊU HIỆN TẠI -> NGUỒN DỮ LIỆU -> NHẬP BMI (nếu mới) -> MỤC TIÊU TƯƠNG LAI -> KẾT QUẢ
type Step = 'WHO' | 'CURRENT_GOAL' | 'DATA_SOURCE' | 'INPUT_METRICS' | 'FUTURE_GOAL' | 'RESULT';

export default function AIPlannerScreen() {
  const [step, setStep] = useState<Step>('WHO');
  const [target, setTarget] =    useState<'Mẹ' | 'Bé' | ''>('');
  const [currentGoal, setCurrentGoal] = useState(''); // Mục tiêu loại hình thực đơn
  const [futureGoal, setFutureGoal] = useState('');   // Mục tiêu con số mong muốn
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Chào Mẹ! Mẹ muốn con lên lịch ăn cho Mẹ hay cho Bé yêu ạ?' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const addMessage = (text: string, type: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now(), type, text }]);
  };

  const handleAction = (opt: string) => {
    addMessage(opt, 'user');

    if (step === 'WHO') {
      setTarget(opt === 'Cho Mẹ' ? 'Mẹ' : 'Bé');
      setTimeout(() => {
        addMessage(`Mẹ chọn mục tiêu sức khỏe hiện tại cho ${opt === 'Cho Mẹ' ? 'Mẹ' : 'Bé'} nhé:`, 'bot');
        setStep('CURRENT_GOAL');
      }, 600);
    } 
    
    else if (step === 'CURRENT_GOAL') {
      setCurrentGoal(opt);
      setTimeout(() => {
        addMessage(`Để tính toán Calo cho mục tiêu "${opt}", Mẹ muốn dùng dữ liệu BMI cũ (từ mục Sức khỏe) hay nhập số đo mới nhất?`, 'bot');
        setStep('DATA_SOURCE');
      }, 600);
    }

    else if (step === 'DATA_SOURCE') {
      if (opt === 'Nhập mới') {
        setTimeout(() => {
          addMessage("Mẹ nhập Chiều cao (cm) và Cân nặng (kg) mới nhất nhé. VD: 160 52", 'bot');
          setStep('INPUT_METRICS');
        }, 600);
      } else {
        askFutureGoal(); // Dùng dữ liệu cũ -> Hỏi mục tiêu tương lai luôn
      }
    }

    else if (step === 'FUTURE_GOAL') {
      setFutureGoal(opt);
      genResult(opt);
    }
  };

  const askFutureGoal = () => {
    setTimeout(() => {
      addMessage("Bước cuối cùng: Mẹ mong muốn đạt được kết quả gì sau liệu trình này? (VD: Giảm 2kg, Bé tăng 500g, Bé cao thêm...)", 'bot');
      setStep('FUTURE_GOAL');
    }, 600);
  };

  const handleManualInput = () => {
    if (!input.trim()) return;
    addMessage(input, 'user');
    
    if (step === 'INPUT_METRICS') {
      askFutureGoal();
    } else if (step === 'FUTURE_GOAL') {
      setFutureGoal(input);
      genResult(input);
    }
    setInput('');
  };

  const genResult = (fGoal: string) => {
    setTimeout(() => {
      addMessage(`Hệ thống đã phân tích xong! Dựa trên mục tiêu đạt được "${fGoal}", con đã gen thực đơn 7 ngày phù hợp nhất.`, 'bot');
      setStep('RESULT');
    }, 1000);
  };

  const currentGoalOptions = target === 'Mẹ' 
    ? ['Giảm cân sau sinh', 'Lợi sữa', 'Giữ dáng'] 
    : ['Phát triển toàn diện', 'Tăng cân nhanh', 'Tăng chiều cao'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FF8FAB" /></TouchableOpacity>
        <Text style={styles.headerTitle}>AI Nutritionist</Text>
        <Ionicons name="sparkles" size={24} color="#FF8FAB" />
      </View>

      <ScrollView 
        ref={scrollRef} 
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()} 
        style={{ flex: 1, padding: 20 }}
      >
        {messages.map(m => (
          <View key={m.id} style={[styles.bubble, m.type === 'bot' ? styles.botB : styles.userB]}>
            <Text style={{ color: m.type === 'bot' ? '#5C7A8A' : '#FFF', fontWeight: '600' }}>{m.text}</Text>
          </View>
        ))}

        <View style={styles.optRow}>
          {step === 'WHO' && ['Cho Mẹ', 'Cho Bé'].map(o => (
            <TouchableOpacity key={o} style={styles.opt} onPress={() => handleAction(o)}><Text style={styles.optT}>{o}</Text></TouchableOpacity>
          ))}
          
          {step === 'CURRENT_GOAL' && currentGoalOptions.map(o => (
            <TouchableOpacity key={o} style={styles.opt} onPress={() => handleAction(o)}><Text style={styles.optT}>{o}</Text></TouchableOpacity>
          ))}

          {step === 'DATA_SOURCE' && ['Dữ liệu cũ', 'Nhập mới'].map(o => (
            <TouchableOpacity key={o} style={styles.opt} onPress={() => handleAction(o)}><Text style={styles.optT}>{o}</Text></TouchableOpacity>
          ))}
        </View>

        {step === 'RESULT' && (
          <TouchableOpacity 
            style={styles.resCard} 
            onPress={() => router.push({ pathname: '/dinhduong/WeeklyView', params: { target } })}
          >
            <Ionicons name="calendar" size={30} color="#FF8FAB" />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.resT}>Lịch ăn cho {target}</Text>
              <Text style={styles.resSub}>Mục tiêu tương lai: {futureGoal}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FF8FAB" />
          </TouchableOpacity>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Nhập thông tin tại đây..."
          value={input} 
          onChangeText={setInput} 
          onSubmitEditing={handleManualInput}
        />
        <TouchableOpacity style={styles.send} onPress={handleManualInput}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FF8FAB' },
  bubble: { padding: 15, borderRadius: 20, marginBottom: 10, maxWidth: '85%' },
  botB: { backgroundColor: '#FFF', alignSelf: 'flex-start', elevation: 1 },
  userB: { backgroundColor: '#FF8FAB', alignSelf: 'flex-end' },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  opt: { backgroundColor: '#FFE5EC', padding: 10, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1, borderColor: '#FF8FAB' },
  optT: { color: '#FF8FAB', fontWeight: '800' },
  resCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4, marginTop: 10 },
  resT: { fontWeight: '900', color: '#5C7A8A', fontSize: 15 },
  resSub: { color: '#FF8FAB', fontSize: 12, fontWeight: '700' },
  inputArea: { flexDirection: 'row', padding: 20, backgroundColor: '#FFF', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F0F4F8', borderRadius: 20, paddingHorizontal: 15, height: 45 },
  send: { marginLeft: 10, backgroundColor: '#FF8FAB', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
});