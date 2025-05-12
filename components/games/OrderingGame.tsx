import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Platform,
  Image
} from 'react-native';
import { ArrowUp, ArrowDown, CheckCircle, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Audio } from 'expo-av';

interface OrderingGameProps {
  data: {
    events: Array<{
      id: number;
      text: string;
      order: number;
    }>;
  };
  onComplete: (result: { score: number; time: number; moves: number }) => void;
}

export default function OrderingGame({ data, onComplete }: OrderingGameProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showCorrectOrder, setShowCorrectOrder] = useState(false);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // Sound effects
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize game
  useEffect(() => {
    // Shuffle events
    const shuffledEvents = [...data.events].sort(() => Math.random() - 0.5);
    setEvents(shuffledEvents);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowCorrectOrder(false);
    setActiveItem(null);
    
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

  const playSound = async (type: 'move' | 'check' | 'success' | 'error') => {
    if (Platform.OS === 'web') return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const soundFile = type === 'move' 
        ? require('@/assets/sounds/move.mp3') 
        : type === 'check' 
          ? require('@/assets/sounds/check.mp3')
          : type === 'success'
            ? require('@/assets/sounds/success.mp3')
            : require('@/assets/sounds/error.mp3');
      
      const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    // Start game on first move
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Set active item
    setActiveItem(events[index].id);
    
    // Animate item
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
    ]).start(() => {
      setTimeout(() => setActiveItem(null), 300);
    });
    
    // Play move sound
    playSound('move');
    
    // Move item
    const newEvents = [...events];
    
    if (direction === 'up' && index > 0) {
      // Swap with item above
      [newEvents[index], newEvents[index - 1]] = [newEvents[index - 1], newEvents[index]];
      setMoves(prevMoves => prevMoves + 1);
    } else if (direction === 'down' && index < events.length - 1) {
      // Swap with item below
      [newEvents[index], newEvents[index + 1]] = [newEvents[index + 1], newEvents[index]];
      setMoves(prevMoves => prevMoves + 1);
    }
    
    setEvents(newEvents);
  };

  const handleCheckOrder = () => {
    // Play check sound
    playSound('check');
    
    // Check if events are in correct order
    const isCorrect = events.every((event, index) => {
      const correctEvent = data.events.find(e => e.order === index + 1);
      return correctEvent && event.id === correctEvent.id;
    });
    
    if (isCorrect) {
      setGameCompleted(true);
      
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
      
      // Play success sound
      playSound('success');
      
      // Calculate score based on moves
      const minMoves = data.events.length - 1; // Minimum moves needed for perfect ordering
      const moveScore = Math.max(0, 100 - Math.floor((moves - minMoves) * (100 / (minMoves * 2))));
      
      onComplete({
        score: moveScore,
        time,
        moves,
      });
    } else {
      // Show correct order
      setShowCorrectOrder(true);
      
      // Play error sound
      playSound('error');
      
      // Fade animation for incorrect answers
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Calculate partial score
      let correctPositions = 0;
      events.forEach((event, index) => {
        const correctEvent = data.events.find(e => e.order === index + 1);
        if (correctEvent && event.id === correctEvent.id) {
          correctPositions++;
        }
      });
      
      const partialScore = Math.floor((correctPositions / data.events.length) * 100);
      
      onComplete({
        score: partialScore,
        time,
        moves,
      });
    }
  };

  // Get background image for event item
  const getEventBackground = (index: number) => {
    const backgroundImages = [
      'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557683304-673a23048d34?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop',
    ];
    
    return backgroundImages[index % backgroundImages.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>الحركات:</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.checkButton}
          onPress={handleCheckOrder}
          disabled={gameCompleted || !gameStarted}
        >
          <Text style={styles.checkButtonText}>تحقق من الترتيب</Text>
          <CheckCircle size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          رتب الأحداث التالية حسب تسلسلها في القصة من البداية إلى النهاية
        </Text>
      </View>
      
      <Animated.View 
        style={[
          styles.eventsContainer,
          { opacity: fadeAnim }
        ]}
      >
        {events.map((event, index) => {
          const isActive = activeItem === event.id;
          const isCorrect = showCorrectOrder && event.order === index + 1;
          const isIncorrect = showCorrectOrder && event.order !== index + 1;
          
          return (
            <Animated.View 
              key={event.id} 
              style={[
                styles.eventItem,
                isCorrect && styles.correctEventItem,
                isIncorrect && styles.incorrectEventItem,
                isActive && { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={styles.eventNumberContainer}>
                <Text style={styles.eventNumber}>{index + 1}</Text>
              </View>
              
              <View style={styles.eventContent}>
                <Image 
                  source={{ uri: getEventBackground(index) }} 
                  style={styles.eventBackground} 
                />
                <Text style={styles.eventText}>{event.text}</Text>
                {showCorrectOrder && (
                  <Text style={styles.orderText}>الترتيب الصحيح: {event.order}</Text>
                )}
              </View>
              
              {!gameCompleted && !showCorrectOrder && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, index === 0 && styles.disabledButton]}
                    onPress={() => handleMoveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp size={20} color={index === 0 ? Colors.gray[400] : Colors.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, index === events.length - 1 && styles.disabledButton]}
                    onPress={() => handleMoveItem(index, 'down')}
                    disabled={index === events.length - 1}
                  >
                    <ArrowDown size={20} color={index === events.length - 1 ? Colors.gray[400] : Colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          );
        })}
      </Animated.View>
      
      {showCorrectOrder && (
        <View style={styles.correctOrderContainer}>
          <Text style={styles.correctOrderTitle}>الترتيب الصحيح:</Text>
          {data.events
            .sort((a, b) => a.order - b.order)
            .map(event => (
              <Text key={`correct-${event.id}`} style={styles.correctOrderItem}>
                {event.order}. {event.text}
              </Text>
            ))
          }
        </View>
      )}
      
      {gameCompleted && (
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
          <Text style={styles.completionText}>أحسنت! لقد رتبت الأحداث بشكل صحيح</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: Colors.gray[100],
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
  },
  instructionsText: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'right',
    lineHeight: 24,
  },
  eventsContainer: {
    marginBottom: 20,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventNumber: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  correctEventItem: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10', // 10% opacity
    borderWidth: 2,
  },
  incorrectEventItem: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10', // 10% opacity
    borderWidth: 2,
  },
  eventContent: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    padding: 8,
  },
  eventBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  eventText: {
    fontSize: 16,
    color: Colors.dark,
    textAlign: 'right',
    fontWeight: '500',
  },
  orderText: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  disabledButton: {
    backgroundColor: Colors.gray[200],
    borderColor: Colors.gray[300],
  },
  correctOrderContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
  },
  correctOrderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  correctOrderItem: {
    fontSize: 16,
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'right',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[300],
  },
  completionBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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