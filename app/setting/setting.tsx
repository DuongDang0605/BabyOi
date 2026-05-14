import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Cai dat', headerShadowVisible: false }} />
      <View style={styles.card}>
        <Text style={styles.title}>Cai dat</Text>
        <Text style={styles.text}>Man hinh cai dat dang duoc khoi tao.</Text>
        <Text style={styles.text}>Ban co the them thong bao, ngon ngu, va bao mat sau.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 16,
  },
  text: {
    fontSize: 15,
    color: '#5c7a8a',
    lineHeight: 22,
    marginBottom: 8,
  },
});
