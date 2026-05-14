import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface TipBoxProps {
  tip: string;
}

export const TipBox = ({ tip }: TipBoxProps) => {
  return (
    <View style={styles.tipCard}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }}
        style={styles.tipSticker}
      />
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tipCard: {
    backgroundColor: '#E8F9ED',
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  tipSticker: { width: 40, height: 40, marginRight: 12 },
  tipText: { flex: 1, fontSize: 13, color: '#2E7D32', fontWeight: '600' },
});
