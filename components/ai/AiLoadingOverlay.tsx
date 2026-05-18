import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface AiLoadingOverlayProps {
  visible: boolean;
  text: string;
}

export const AiLoadingOverlay = ({ visible, text }: AiLoadingOverlayProps) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FF8FAB" style={{ marginBottom: 20, transform: [{ scale: 1.5 }] }} />
          <Text style={styles.loadingTitle}>BabyOi AI đang xử lý</Text>
          <Text style={styles.loadingSubtitle}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(254, 249, 243, 0.9)', justifyContent: 'center', alignItems: 'center' },
  loadingBox: { backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center', elevation: 10, width: '80%' },
  loadingTitle: { fontSize: 18, fontWeight: '900', color: '#FF8FAB', marginBottom: 10 },
  loadingSubtitle: { fontSize: 14, color: '#5C7A8A', textAlign: 'center', fontStyle: 'italic' }
});
