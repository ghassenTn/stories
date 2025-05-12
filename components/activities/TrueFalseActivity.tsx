import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { CheckCircle, XCircle, Check, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface TrueFalseActivityProps {
  data: {
    questions: Array<{
      id: number;
      text: string;
      answer: boolean;
    }>;
  };
  answers: Record<number, boolean>;
  onAnswerChange: (id: number, answer: boolean) => void;
  showResults: boolean;
}

export default function TrueFalseActivity({ 
  data, 
  answers, 
  onAnswerChange,
  showResults
}: TrueFalseActivityProps) {
  const handleAnswer = (questionId: number, answer: boolean) => {
    onAnswerChange(questionId, answer);
  };

  return (
    <View style={styles.container}>
      {data.questions.map((question) => (
        <View key={question.id} style={styles.questionContainer}>
          <View style={[
            styles.questionHeader,
            showResults && answers[question.id] === question.answer && styles.correctHeader,
            showResults && answers[question.id] !== question.answer && styles.incorrectHeader,
          ]}>
            <Text style={styles.questionText}>{question.text}</Text>
            
            {showResults && (
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
            <TouchableOpacity
              style={[
                styles.option,
                answers[question.id] === true && styles.selectedOption,
                showResults && question.answer === true && styles.correctOption,
                showResults && answers[question.id] === true && question.answer !== true && styles.incorrectOption,
              ]}
              onPress={() => !showResults && handleAnswer(question.id, true)}
              disabled={showResults}
            >
              <Text style={[
                styles.optionText,
                answers[question.id] === true && styles.selectedOptionText,
              ]}>صحيح</Text>
              <Check 
                size={18} 
                color={
                  answers[question.id] === true 
                    ? Colors.white 
                    : Colors.gray[500]
                } 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.option,
                answers[question.id] === false && styles.selectedOption,
                showResults && question.answer === false && styles.correctOption,
                showResults && answers[question.id] === false && question.answer !== false && styles.incorrectOption,
              ]}
              onPress={() => !showResults && handleAnswer(question.id, false)}
              disabled={showResults}
            >
              <Text style={[
                styles.optionText,
                answers[question.id] === false && styles.selectedOptionText,
              ]}>خطأ</Text>
              <X 
                size={18} 
                color={
                  answers[question.id] === false 
                    ? Colors.white 
                    : Colors.gray[500]
                } 
              />
            </TouchableOpacity>
          </View>
          
          {showResults && (
            <View style={styles.explanation}>
              <Text style={styles.explanationText}>
                الإجابة الصحيحة: {question.answer ? 'صحيح' : 'خطأ'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    minWidth: 120,
    gap: 8,
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
  },
  selectedOptionText: {
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