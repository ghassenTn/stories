import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MultipleChoiceActivityProps {
  data: {
    questions: Array<{
      id: number;
      text: string;
      options: string[];
      answer: string;
    }>;
  };
  answers: Record<number, string>;
  onAnswerChange: (id: number, answer: string) => void;
  showResults: boolean;
}

export default function MultipleChoiceActivity({ 
  data, 
  answers, 
  onAnswerChange,
  showResults
}: MultipleChoiceActivityProps) {
  const handleOptionSelect = (questionId: number, option: string) => {
    onAnswerChange(questionId, option);
  };

  return (
    <View style={styles.container}>
      {data.questions.map((question) => (
        <View key={question.id} style={styles.questionContainer}>
          <View style={[
            styles.questionHeader,
            showResults && answers[question.id] === question.answer && styles.correctHeader,
            showResults && answers[question.id] !== question.answer && answers[question.id] && styles.incorrectHeader,
          ]}>
            <Text style={styles.questionText}>{question.text}</Text>
            
            {showResults && answers[question.id] && (
              <View style={styles.resultIcon}>
                {answers[question.id] === question.answer ? (
                  <CheckCircle size={18} color={Colors.success} />
                ) : (
                  <XCircle size={18} color={Colors.error} />
                )}
              </View>
            )}
          </View>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={`${question.id}-option-${index}`}
                style={[
                  styles.option,
                  answers[question.id] === option && styles.selectedOption,
                  showResults && option === question.answer && styles.correctOption,
                  showResults && answers[question.id] === option && 
                    option !== question.answer && styles.incorrectOption,
                ]}
                onPress={() => !showResults && handleOptionSelect(question.id, option)}
                disabled={showResults}
              >
                <Text style={[
                  styles.optionText,
                  answers[question.id] === option && styles.selectedOptionText,
                  showResults && option === question.answer && styles.correctOptionText,
                ]}>
                  {option}
                </Text>
                
                {showResults && option === question.answer && (
                  <CheckCircle size={16} color={Colors.white} style={styles.optionIcon} />
                )}
                
                {showResults && answers[question.id] === option && 
                  option !== question.answer && (
                  <XCircle size={16} color={Colors.white} style={styles.optionIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {showResults && (
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>
                الإجابة الصحيحة: {question.answer}
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
  },
  questionHeader: {
    padding: 16,
    backgroundColor: Colors.gray[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctHeader: {
    backgroundColor: Colors.success + '20', // 20% opacity
  },
  incorrectHeader: {
    backgroundColor: Colors.error + '20', // 20% opacity
  },
  questionText: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  resultIcon: {
    marginLeft: 12,
  },
  optionsContainer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '10', // 10% opacity
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
    textAlign: 'right',
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  correctOptionText: {
    color: Colors.white,
    fontWeight: '500',
  },
  optionIcon: {
    marginLeft: 8,
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