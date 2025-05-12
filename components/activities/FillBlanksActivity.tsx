import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  Platform
} from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FillBlanksActivityProps {
  data: {
    sentences: Array<{
      id: number;
      text: string;
      answer: string;
      options?: string[];
    }>;
  };
  answers: Record<number, string>;
  onAnswerChange: (id: number, answer: string) => void;
  showResults: boolean;
}

export default function FillBlanksActivity({ 
  data, 
  answers, 
  onAnswerChange,
  showResults
}: FillBlanksActivityProps) {
  const [focusedId, setFocusedId] = useState<number | null>(null);

  const handleTextChange = (id: number, text: string) => {
    onAnswerChange(id, text);
  };

  const handleOptionSelect = (id: number, option: string) => {
    onAnswerChange(id, option);
  };

  const isCorrect = (id: number) => {
    const sentence = data.sentences.find(s => s.id === id);
    return sentence && answers[id]?.toLowerCase() === sentence.answer.toLowerCase();
  };

  // Function to render the sentence with a blank
  const renderSentenceWithBlank = (sentence: string, id: number) => {
    const parts = sentence.split('_____');
    
    if (parts.length !== 2) {
      return <Text style={styles.sentenceText}>{sentence}</Text>;
    }
    
    return (
      <View style={styles.sentenceContainer}>
        <Text style={styles.sentenceText}>{parts[0]}</Text>
        
        <View style={[
          styles.blankContainer,
          focusedId === id && styles.focusedBlank,
          showResults && isCorrect(id) && styles.correctBlank,
          showResults && !isCorrect(id) && answers[id] && styles.incorrectBlank,
        ]}>
          <TextInput
            style={styles.blankInput}
            value={answers[id] || ''}
            onChangeText={(text) => handleTextChange(id, text)}
            onFocus={() => setFocusedId(id)}
            onBlur={() => setFocusedId(null)}
            placeholder="..."
            placeholderTextColor={Colors.gray[400]}
            editable={!showResults}
            textAlign="center"
          />
        </View>
        
        <Text style={styles.sentenceText}>{parts[1]}</Text>
        
        {showResults && (
          <View style={styles.resultIcon}>
            {isCorrect(id) ? (
              <CheckCircle size={16} color={Colors.success} />
            ) : (
              <XCircle size={16} color={Colors.error} />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {data.sentences.map((sentence) => (
        <View key={sentence.id} style={styles.questionContainer}>
          <View style={styles.sentenceWrapper}>
            {renderSentenceWithBlank(sentence.text, sentence.id)}
          </View>
          
          {sentence.options && (
            <View style={styles.optionsContainer}>
              {sentence.options.map((option, index) => (
                <TouchableOpacity
                  key={`${sentence.id}-option-${index}`}
                  style={[
                    styles.option,
                    answers[sentence.id] === option && styles.selectedOption,
                    showResults && option.toLowerCase() === sentence.answer.toLowerCase() && styles.correctOption,
                    showResults && answers[sentence.id] === option && 
                      option.toLowerCase() !== sentence.answer.toLowerCase() && styles.incorrectOption,
                  ]}
                  onPress={() => !showResults && handleOptionSelect(sentence.id, option)}
                  disabled={showResults}
                >
                  <Text style={[
                    styles.optionText,
                    answers[sentence.id] === option && styles.selectedOptionText,
                    showResults && option.toLowerCase() === sentence.answer.toLowerCase() && styles.correctOptionText,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {showResults && (
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>
                الإجابة الصحيحة: {sentence.answer}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  questionContainer: {
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  sentenceWrapper: {
    padding: 16,
    backgroundColor: Colors.gray[50],
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sentenceText: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'right',
    lineHeight: 24,
  },
  blankContainer: {
    minWidth: 80,
    height: 36,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray[400],
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  focusedBlank: {
    borderBottomColor: Colors.primary,
  },
  correctBlank: {
    borderBottomColor: Colors.success,
  },
  incorrectBlank: {
    borderBottomColor: Colors.error,
  },
  blankInput: {
    fontSize: 16,
    color: Colors.dark,
    padding: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  resultIcon: {
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  correctOption: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  incorrectOption: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  optionText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: Colors.white,
    fontWeight: '500',
  },
  correctOptionText: {
    color: Colors.white,
    fontWeight: '500',
  },
  explanation: {
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[300],
  },
  explanationText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'right',
  },
});