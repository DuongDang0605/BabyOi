import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecipeDetailScreen() {
  const steps = [
    { id: 1, title: 'Sơ chế ức gà', content: 'Rửa sạch ức gà, thấm khô. Ướp với muối, tiêu và 5ml dầu olive trong 10 phút.', icon: 'cut-outline' },
    { id: 2, title: 'Áp chảo gà', content: 'Làm nóng chảo, áp chảo gà mỗi mặt 5-6 phút cho đến khi chín vàng đều. Thái miếng vừa ăn.', icon: 'flame-outline' },
    { id: 3, title: 'Chuẩn bị rau củ', content: 'Xà lách rửa sạch cắt đoạn, cà chua bi bổ đôi, bơ thái lát, hạt điều giã dập.', icon: 'leaf-outline' },
    { id: 4, title: 'Trộn Salad', content: 'Cho tất cả vào bát lớn, rưới dầu olive và trộn nhẹ tay để bơ không bị nát.', icon: 'restaurant-outline' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: "Cách chế biến", headerTransparent: true, headerTintColor: '#FFF', headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#FF8FAB" /></TouchableOpacity>
      )}} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800' }} style={styles.banner} />
        <View style={styles.card}>
          <Text style={styles.title}>Salad Ức Gà Áp Chảo</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Các bước thực hiện</Text>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepBox}>
              <View style={styles.stepNum}><Text style={styles.numText}>{step.id}</Text></View>
              <View style={styles.stepInfo}>
                <View style={styles.stepHead}><Ionicons name={step.icon as any} size={18} color="#FF8FAB" /><Text style={styles.stepTitle}>{step.title}</Text></View>
                <Text style={styles.stepTxt}>{step.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  backBtn: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, marginLeft: 15, marginTop: 10 },
  banner: { width: '100%', height: 250 },
  card: { backgroundColor: '#FEF9F3', marginTop: -30, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25 },
  title: { fontSize: 24, fontWeight: '900', color: '#FF8FAB', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#FFE5EC', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15 },
  stepBox: { flexDirection: 'row', marginBottom: 20 },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFB6C1', justifyContent: 'center', alignItems: 'center' },
  numText: { color: '#FFF', fontWeight: '900' },
  stepInfo: { flex: 1, marginLeft: 15, backgroundColor: '#FFF', padding: 15, borderRadius: 15, elevation: 2 },
  stepHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#FF8FAB', marginLeft: 8 },
  stepTxt: { fontSize: 14, color: '#5C7A8A', lineHeight: 20 }
});