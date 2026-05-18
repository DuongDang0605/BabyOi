import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AssessmentQuestionProps {
  question: string;
  value: boolean | null;
  onSelect: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
}

export const AssessmentQuestion = ({
  question,
  value,
  onSelect,
  yesLabel,
  noLabel
}: AssessmentQuestionProps) => {
  return (
    <View style={styles.questionRow}>
      <Text style={styles.questionText}>{question}</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            value === true && styles.optionYesSelected
          ]}
          onPress={() => onSelect(true)}
        >
          <Text style={[styles.optionText, value === true && styles.optionTextSelected]}>{yesLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            value === false && styles.optionNoSelected
          ]}
          onPress={() => onSelect(false)}
        >
          <Text style={[styles.optionText, value === false && styles.optionTextSelected]}>{noLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionRow: { paddingVertical: 10 },
  questionText: { fontSize: 15, fontWeight: '700', color: '#5C7A8A', marginBottom: 15, lineHeight: 22 },
  optionsContainer: { flexDirection: 'row', gap: 10 },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F4F8'
  },
  optionText: { fontSize: 14, fontWeight: '800', color: '#8899AA', textAlign: 'center' },
  optionYesSelected: { backgroundColor: '#FFF0F5', borderColor: '#FF8FAB' },
  optionNoSelected: { backgroundColor: '#FFF', borderColor: '#FFB6C1' },
  optionTextSelected: { color: '#FF8FAB' },
});
