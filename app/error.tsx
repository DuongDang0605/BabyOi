import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ErrorScreen() {
  const { status, message } = useLocalSearchParams<{ status?: string; message?: string }>();
  const statusText = typeof status === 'string' && status.trim() ? status : 'Oops';
  const messageText = typeof message === 'string' && message.trim()
    ? message
    : 'BabyOi chưa kết nối được đến máy chủ. Mẹ thử lại sau một chút nhé.';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.softCircleTop} />
      <View style={styles.softCircleBottom} />

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="cloud-offline-outline" size={70} color="#FF8FAB" />
        </View>
        <Text style={styles.status}>{statusText}</Text>
        <Text style={styles.title}>Có lỗi xảy ra</Text>
        <Text style={styles.message}>{messageText}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FF8FAB" />
            <Text style={styles.secondaryText}>Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/home/home')}>
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  softCircleTop: { position: 'absolute', top: -75, right: -75, width: 220, height: 220, borderRadius: 110, backgroundColor: '#FFE5EC' },
  softCircleBottom: { position: 'absolute', bottom: -95, left: -90, width: 240, height: 240, borderRadius: 120, backgroundColor: '#E9F8FD' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  iconWrap: { width: 128, height: 128, borderRadius: 40, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#FFE5EC', elevation: 4 },
  status: { color: '#FF8FAB', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  title: { color: '#5C7A8A', fontSize: 30, fontWeight: '900', marginBottom: 10 },
  message: { color: '#7D95A1', fontSize: 15, fontWeight: '700', lineHeight: 23, textAlign: 'center', marginBottom: 30 },
  actions: { width: '100%', gap: 12 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF8FAB', paddingVertical: 15, borderRadius: 26, elevation: 4 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', paddingVertical: 15, borderRadius: 26, borderWidth: 2, borderColor: '#FFE5EC' },
  secondaryText: { color: '#FF8FAB', fontSize: 16, fontWeight: '900' },
});
