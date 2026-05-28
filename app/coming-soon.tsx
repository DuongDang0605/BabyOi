import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ComingSoonScreen() {
  const { feature } = useLocalSearchParams<{ feature?: string }>();
  const featureName = typeof feature === 'string' && feature.trim() ? feature : 'Chức năng này';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.softCircleTop} />
      <View style={styles.softCircleBottom} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FF8FAB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{featureName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/10485/10485020.png' }}
          style={styles.image}
        />
        <Text style={styles.title}>Sắp ra mắt</Text>
        <Text style={styles.subtitle}>
          {featureName} đang được phát triển. Mẹ quay lại sau nhé, BabyOi sẽ cập nhật khi chức năng sẵn sàng.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  softCircleTop: { position: 'absolute', top: -70, right: -70, width: 210, height: 210, borderRadius: 105, backgroundColor: '#FFE5EC' },
  softCircleBottom: { position: 'absolute', bottom: -90, left: -85, width: 230, height: 230, borderRadius: 115, backgroundColor: '#E9F8FD' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, paddingHorizontal: 20 },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#FF8FAB', fontSize: 21, fontWeight: '900' },
  headerSpacer: { width: 44 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 70 },
  image: { width: 132, height: 132, marginBottom: 26 },
  title: { color: '#5C7A8A', fontSize: 30, fontWeight: '900', marginBottom: 10 },
  subtitle: { color: '#7D95A1', fontSize: 15, fontWeight: '700', lineHeight: 23, textAlign: 'center', marginBottom: 28 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF8FAB', paddingVertical: 15, paddingHorizontal: 26, borderRadius: 26, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
