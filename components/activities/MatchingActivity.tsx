import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Platform 
} from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface MatchingActivityProps {
  data: {
    pairs: Array<{
      id: number;
      left: string;
      right: string;
    }>;
  };
  answers: Record<number, string>;
  onAnswerChange: (id: number, answer: string) => void;
  showResults: boolean;
}

export default function MatchingActivity({ 
  data, 
  answers, 
  onAnswerChange,
  showResults
}: MatchingActivityProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<number, boolean>>({});
  const [rightItems, setRightItems] = useState<Array<{id: number, text: string}>>([]);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Shuffle the right items for the game
    const shuffled = [...data.pairs]
      .map(pair => ({ id: pair.id, text: pair.right }))
      .sort(() => Math.random() - 0.5);
    
    setRightItems(shuffled);
  }, [data]);

  useEffect(() => {
    // Reset when answers are reset
    if (Object.keys(answers).length === 0) {
      setMatchedPairs({});
      setSelectedLeft(null);
    }
  }, [answers]);

  const handleLeftSelect = (id: number) => {
    // If already matched, do nothing
    if (matchedPairs[id]) return;
    
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
    
    setSelectedLeft(id);
  };

  const handleRightSelect = (rightId: number, rightText: string) => {
    // If no left item selected or right item already matched, do nothing
    if (selectedLeft === null) return;
    
    // Check if this right item is already matched with another left item
    const isRightMatched = Object.entries(answers).some(
      ([key, value]) => Number(key) !== selectedLeft && value === rightText
    );
    
    if (isRightMatched) return;
    
    // Record the answer
    onAnswerChange(selectedLeft, rightText);
    
    // Mark as matched
    setMatchedPairs(prev => ({
      ...prev,
      [selectedLeft]: true
    }));
    
    // Reset selection
    setSelectedLeft(null);
    
    // Animate match
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const isCorrectMatch = (leftId: number) => {
    const pair = data.pairs.find(p => p.id === leftId);
    return pair && answers[leftId] === pair.right;
  };

  return (
    <View style={styles.container}>
      <View style={styles.columnsContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {data.pairs.map(pair => (
            <TouchableOpacity
              key={`left-${pair.id}`}
              style={[
                styles.item,
                styles.leftItem,
                selectedLeft === pair.id && styles.selectedItem,
                matchedPairs[pair.id] && styles.matchedItem,
                showResults && isCorrectMatch(pair.id) && styles.correctItem,
                showResults && !isCorrectMatch(pair.id) && matchedPairs[pair.id] && styles.incorrectItem
              ]}
              onPress={() => !showResults && handleLeftSelect(pair.id)}
              disabled={matchedPairs[pair.id] || showResults}
            >
              <Text style={[
                styles.itemText,
                selectedLeft === pair.id && styles.selectedItemText,
                matchedPairs[pair.id] && styles.matchedItemText
              ]}>
                {pair.left}
              </Text>
              
              {showResults && (
                <View style={styles.resultIcon}>
                  {isCorrectMatch(pair.id) ? (
                    <CheckCircle size={16} color={Colors.success} />
                  ) : (
                    matchedPairs[pair.id] && <XCircle size={16} color={Colors.error} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Right Column */}
        <View style={styles.column}>
          {rightItems.map(item => {
            const isMatched = Object.values(answers).includes(item.text);
            const matchedWithId = Object.entries(answers).find(
              ([_, value]) => value === item.text
            )?.[0];
            
            const isCorrect = matchedWithId && 
              data.pairs.find(p => p.id === Number(matchedWithId))?.right === item.text;
            
            return (
              <TouchableOpacity
                key={`right-${item.id}`}
                style={[
                  styles.item,
                  styles.rightItem,
                  isMatched && styles.matchedItem,
                  showResults && isCorrect && styles.correctItem,
                  showResults && !isCorrect && isMatched && styles.incorrectItem
                ]}
                onPress={() => !showResults && handleRightSelect(item.id, item.text)}
                disabled={isMatched || showResults}
              >
                <Text style={[
                  styles.itemText,
                  isMatched && styles.matchedItemText
                ]}>
                  {item.text}
                </Text>
                
                {showResults && isMatched && (
                  <View style={styles.resultIcon}>
                    {isCorrect ? (
                      <CheckCircle size={16} color={Colors.success} />
                    ) : (
                      <XCircle size={16} color={Colors.error} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      {showResults && (
        <View style={styles.correctAnswersContainer}>
          <Text style={styles.correctAnswersTitle}>الإجابات الصحيحة:</Text>
          {data.pairs.map(pair => (
            <View key={`answer-${pair.id}`} style={styles.correctAnswer}>
              <Text style={styles.correctAnswerText}>
                {pair.left} ↔ {pair.right}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    ...(Platform.OS === 'web' ? { flexWrap: 'wrap' } : {}),
  },
  column: {
    width: '48%',
    ...(Platform.OS === 'web' ? { minWidth: 250 } : {}),
  },
  item: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftItem: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[300],
  },
  rightItem: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray[300],
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  matchedItem: {
    borderColor: Colors.info,
    backgroundColor: Colors.info + '10', // 10% opacity
  },
  correctItem: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10', // 10% opacity
  },
  incorrectItem: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10', // 10% opacity
  },
  itemText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  selectedItemText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  matchedItemText: {
    color: Colors.info,
    fontWeight: '500',
  },
  resultIcon: {
    marginLeft: 8,
  },
  correctAnswersContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  correctAnswersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  correctAnswer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  correctAnswerText: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'right',
  },
});