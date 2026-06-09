import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmSheet = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) => {
  const isDanger = tone === 'danger';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.backdropTint} />
        <View style={styles.sheet}>
          <View pointerEvents="none" style={styles.bubblePink} />
          <View pointerEvents="none" style={styles.bubbleMint} />
          <LinearGradient
            colors={isDanger ? ['#FFF1F4', '#FFFFFF'] : ['#EFFBFF', '#FFFFFF']}
            style={styles.iconStage}
          >
            <Ionicons
              name={isDanger ? 'warning-outline' : 'sparkles-outline'}
              size={24}
              color={isDanger ? '#F05F78' : '#5EC9E8'}
            />
          </LinearGradient>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.86}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, isDanger && styles.dangerConfirmBtn]}
              onPress={onConfirm}
              activeOpacity={0.86}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 68, 85, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 250, 0.18)',
  },
  sheet: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD8E5',
    shadowColor: '#FF8FAB',
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
    overflow: 'hidden',
  },
  bubblePink: {
    position: 'absolute',
    top: -24,
    right: -18,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255, 143, 171, 0.10)',
  },
  bubbleMint: {
    position: 'absolute',
    left: -20,
    bottom: -22,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(184, 239, 207, 0.16)',
  },
  iconStage: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#334455',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#5C7A8A',
    lineHeight: 19,
    marginBottom: 20,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#5C7A8A',
    fontWeight: '900',
    fontSize: 12,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 17,
    backgroundColor: '#5EC9E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5EC9E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  dangerConfirmBtn: {
    backgroundColor: '#FF5F85',
    shadowColor: '#FF8FAB',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
});
