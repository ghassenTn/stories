import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Platform,
  Image
} from 'react-native';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Audio } from 'expo-av';

interface QuizGameProps {
  data: {
    questions: Array<{
      id: number;
      text: string;
      options: string[];
      answer: string;
    }>;
  };
  onComplete: (result: { score: number; time: number; moves: number }) => void;
}

export default function QuizGame({ data, onComplete }: QuizGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // Sound effects
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize game
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTime(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowResults(false);
    setSelectedOption(null);
    
    // Load sounds
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [data]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameCompleted]);

  // Update progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / data.questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, data.questions.length, progressAnim]);

  const playSound = async (type: 'select' | 'correct' | 'incorrect' | 'complete') => {
    if (Platform.OS === 'web') return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const soundFile = type === 'select' 
        ? require('@/assets/sounds/select.mp3') 
        : type === 'correct' 
          ? require('@/assets/sounds/correct.mp3')
          : type === 'incorrect'
            ? require('@/assets/sounds/incorrect.mp3')
            : require('@/assets/sounds/success.mp3');
      
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    // Start game on first answer
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Play select sound
    playSound('select');
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Record answer
    setSelectedOption(answer);
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    // Reset selected option
    setSelectedOption(null);
    
    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Last question, show results
      handleCompleteQuiz();
    }
  };

  const handlePrevQuestion = () => {
    // Reset selected option
    setSelectedOption(null);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleCompleteQuiz = () => {
    setGameCompleted(true);
    setShowResults(true);
    
    // Play complete sound
    playSound('complete');
    
    // Celebration animation
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Calculate score
    let correctAnswers = 0;
    data.questions.forEach(question => {
      if (answers[question.id] === question.answer) {
        correctAnswers++;
      }
    });
    
    const score = Math.floor((correctAnswers / data.questions.length) * 100);
    
    onComplete({
      score,
      time,
      moves: Object.keys(answers).length,
    });
  };

  const currentQuestion = data.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === data.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  
  // Get background image for quiz
  const getQuizBackground = () => {
    const backgroundImages = [
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=200&auto=format&fit=crop',
    ];
    
    return backgroundImages[currentQuestionIndex % backgroundImages.length];
  };

  return (
    <View style={styles.container}>
      {!showResults ? (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              السؤال {currentQuestionIndex + 1} من {data.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }) }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.questionContainer}>
            <Image 
              source={{ uri: getQuizBackground() }} 
              style={styles.questionBackground} 
            />
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option;
                const isActive = selectedOption === option;
                
                return (
                  <Animated.View
                    key={`${currentQuestion.id}-option-${index}`}
                    style={[
                      isActive && { transform: [{ scale: scaleAnim }] }
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.option,
                        isSelected && styles.selectedOption,
                      ]}
                      onPress={() => handleAnswer(currentQuestion.id, option)}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          styles.optionIndicator,
                          isSelected && styles.selectedOptionIndicator
                        ]}>
                          <Text style={[
                            styles.optionIndicatorText,
                            isSelected && styles.selectedOptionIndicatorText
                          ]}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        <Text style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                        ]}>
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
          
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, isFirstQuestion && styles.disabledButton]}
              onPress={handlePrevQuestion}
              disabled={isFirstQuestion}
            >
              <ArrowRight size={20} color={isFirstQuestion ? Colors.gray[400] : Colors.primary} />
              <Text style={[
                styles.navButtonText,
                isFirstQuestion && styles.disabledButtonText
              ]}>السابق</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.navButton, 
                styles.nextButton,
                !answers[currentQuestion.id] && styles.disabledButton
              ]}
              onPress={handleNextQuestion}
              disabled={!answers[currentQuestion.id]}
            >
              <Text style={[
                styles.navButtonText,
                styles.nextButtonText,
                !answers[currentQuestion.id] && styles.disabledButtonText
              ]}>
                {isLastQuestion ? 'إنهاء الاختبار' : 'التالي'}
              </Text>
              {!isLastQuestion && (
                <ArrowLeft size={20} color={!answers[currentQuestion.id] ? Colors.gray[400] : Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>نتائج الاختبار</Text>
            
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>
                  {Math.floor(Object.keys(answers).filter(id => 
                    answers[parseInt(id)] === data.questions.find(q => q.id === parseInt(id))?.answer
                  ).length / data.questions.length * 100)}%
                </Text>
              </View>
              <Text style={styles.scoreLabel}>النتيجة</Text>
            </View>
          </View>
          
          {data.questions.map(question => {
            const isCorrect = answers[question.id] === question.answer;
            
            return (
              <View key={`result-${question.id}`} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultQuestionText}>{question.text}</Text>
                  {isCorrect ? (
                    <CheckCircle size={24} color={Colors.success} />
                  ) : (
                    <XCircle size={24} color={Colors.error} />
                  )}
                </View>
                
                <View style={styles.resultOptions}>
                  {question.options.map((option, index) => (
                    <View
                      key={`result-${question.id}-option-${index}`}
                      style={[
                        styles.resultOption,
                        option === question.answer && styles.correctOption,
                        answers[question.id] === option && option !== question.answer && styles.incorrectOption,
                      ]}
                    >
                      <View style={[
                        styles.resultOptionIndicator,
                        option === question.answer && styles.correctOptionIndicator,
                        answers[question.id] === option && option !== question.answer && styles.incorrectOptionIndicator,
                      ]}>
                        <Text style={[
                          styles.resultOptionIndicatorText,
                          option === question.answer && styles.correctOptionIndicatorText,
                          answers[question.id] === option && option !== question.answer && styles.incorrectOptionIndicatorText,
                        ]}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.resultOptionText,
                        option === question.answer && styles.correctOptionText,
                        answers[question.id] === option && option !== question.answer && styles.incorrectOptionText,
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          
          <Animated.View 
            style={[
              styles.completionBanner,
              { transform: [{ scale: bounceAnim }] }
            ]}
          >
            <View style={styles.starContainer}>
              <Star size={24} color={Colors.warning} fill={Colors.warning} />
              <Star size={32} color={Colors.warning} fill={Colors.warning} />
              <Star size={24} color={Colors.warning} fill={Colors.warning} />
            </View>
            <Text style={styles.completionText}>أحسنت! لقد أكملت الاختبار</Text>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.gray[200],
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  questionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  questionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.05,
  },
  questionText: {
    fontSize: 20,
    color: Colors.dark,
    marginBottom: 24,
    textAlign: 'right',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  optionIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  optionIndicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[700],
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  selectedOptionIndicator: {
    backgroundColor: Colors.primary,
  },
  selectedOptionIndicatorText: {
    color: Colors.white,
  },
  optionText: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  nextButton: {
    backgroundColor: Colors.primary,
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  nextButtonText: {
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.gray[200],
    borderColor: Colors.gray[300],
  },
  disabledButtonText: {
    color: Colors.gray[500],
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreLabel: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  resultItem: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  resultQuestionText: {
    fontSize: 18,
    color: Colors.dark,
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
  resultOptions: {
    gap: 12,
  },
  resultOption: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  resultOptionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  resultOptionIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gray[700],
  },
  correctOption: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10', // 10% opacity
  },
  correctOptionIndicator: {
    backgroundColor: Colors.success,
  },
  correctOptionIndicatorText: {
    color: Colors.white,
  },
  incorrectOption: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10', // 10% opacity
  },
  incorrectOptionIndicator: {
    backgroundColor: Colors.error,
  },
  incorrectOptionIndicatorText: {
    color: Colors.white,
  },
  resultOptionText: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  correctOptionText: {
    color: Colors.success,
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: Colors.error,
    fontWeight: '500',
  },
  completionBanner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    textAlign: 'center',
  },
});