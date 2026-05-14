import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const CustomHeader = ({ title, onBack, rightElement }: CustomHeaderProps) => {
  return (
    <View style={styles.customHeader}>
      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color="#ff8fab" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.rightPlaceholder}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 70,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 45,
  },
  rightPlaceholder: {
    width: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab',
    letterSpacing: 0.5,
  },
});
