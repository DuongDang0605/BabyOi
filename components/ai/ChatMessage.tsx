import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatMessageProps {
  isAi: boolean;
  text: string;
  avatar?: string;
  highlightText?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const ChatMessage = ({
  isAi,
  text,
  avatar,
  highlightText,
  actionText,
  onActionPress
}: ChatMessageProps) => {
  if (isAi) {
    const avatarSource = avatar
      ? { uri: avatar }
      : require('../../assets/images/AI_chatBox_transparent.png');

    // Process text to highlight parts if needed (Simplified for now, assuming highlightText is a single string)
    const renderText = () => {
      if (!highlightText) return <Text style={styles.text_AI}>{text}</Text>;

      const parts = text.split(highlightText);
      return (
        <Text style={styles.text_AI}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && <Text style={styles.textHighlight}>{highlightText}</Text>}
            </React.Fragment>
          ))}
        </Text>
      );
    };

    return (
      <View style={styles.messageWrapper_AI}>
        <Image source={avatarSource} style={styles.aiAvatar} />
        <View style={styles.bubble_AI}>
          {renderText()}

          {actionText && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={onActionPress}
            >
              <Text style={styles.quickActionText}>👉 {actionText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.messageWrapper_User}>
      <View style={styles.bubble_User}>
        <Text style={styles.text_User}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper_AI: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    paddingRight: 50,
  },
  aiAvatar: {
    width: 44,
    height: 44,
    marginRight: 10,
    resizeMode: 'contain',
  },
  bubble_AI: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 22,
    borderBottomLeftRadius: 5,
    borderWidth: 1.5,
    borderColor: '#F0E8EC',
    shadowColor: '#A7E4F5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 3,
  },
  text_AI: {
    fontSize: 15,
    color: '#435466',
    lineHeight: 23,
  },
  textHighlight: {
    fontWeight: 'bold',
    color: '#d46b08',
  },
  quickActionButton: {
    marginTop: 15,
    backgroundColor: '#fffcf5',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#ffe08a',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d46b08',
  },
  messageWrapper_User: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingLeft: 50,
  },
  bubble_User: {
    backgroundColor: '#FF8FAB',
    padding: 16,
    borderRadius: 22,
    borderBottomRightRadius: 5,
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  text_User: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    fontWeight: '600',
  },
});
