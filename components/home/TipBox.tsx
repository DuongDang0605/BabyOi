import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

interface TipBoxProps {
  tip: string;
}

export const TipBox = ({ tip }: TipBoxProps) => {
  return (
    <LinearGradient colors={['#FFF8FA', '#F0FFF6', '#EFFBFF']} style={styles.tipCard}>
      <View style={styles.colorDotPink} />
      <View style={styles.colorDotBlue} />
      <View style={styles.tipStickerWrap}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }}
          style={styles.tipSticker}
        />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipLabel}>Gợi ý AI</Text>
        <Text style={styles.tipText}>{tip}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  tipCard: {
    padding: 15,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE1EA',
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  colorDotPink: {
    position: 'absolute',
    top: -16,
    right: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 143, 171, 0.18)',
  },
  colorDotBlue: {
    position: 'absolute',
    bottom: -20,
    right: -8,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(123, 220, 242, 0.2)',
  },
  tipStickerWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#FFF8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipSticker: { width: 40, height: 40 },
  tipContent: { flex: 1 },
  tipLabel: { fontSize: 12, color: '#FF8FAB', fontWeight: '900', marginBottom: 3 },
  tipText: { fontSize: 13, color: '#5C7A8A', fontWeight: '700', lineHeight: 18 },
});
