import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  Animated,
  Image
} from 'react-native';
import { Timer, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Audio } from 'expo-av';

interface MemoryGameProps {
  data: {
    cards: Array<{
      id: number;
      content: string;
      matched: boolean;
    }>;
  };
  onComplete: (result: { score: number; time: number; moves: number }) => void;
}

export default function MemoryGame({ data, onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [lastMatch, setLastMatch] = useState<number | null>(null);

  // Animation values
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Sound effects
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize game
  useEffect(() => {
    // Shuffle cards
    const shuffledCards = [...data.cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameCompleted(false);
    setLastMatch(null);
    
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

  // Check for game completion
  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length) {
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
      
      // Calculate score based on moves and time
      const maxMoves = cards.length;
      const moveScore = Math.max(0, 100 - Math.floor((moves - maxMoves/2) * (100 / maxMoves)));
      
      // Play success sound
      playSound('success');
      
      onComplete({
        score: moveScore,
        time,
        moves,
      });
    }
  }, [matched, cards, moves, time, onComplete]);

  // Animation for last matched pair
  useEffect(() => {
    if (lastMatch !== null) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setTimeout(() => {
          setLastMatch(null);
        }, 500);
      });
    }
  }, [lastMatch, scaleAnim]);

  const playSound = async (type: 'flip' | 'match' | 'success' | 'error') => {
    if (Platform.OS === 'web') return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const soundFile = type === 'flip' 
        ? require('@/assets/sounds/card-flip.mp3') 
        : type === 'match' 
          ? require('@/assets/sounds/match.mp3')
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

  const handleCardClick = (id: number) => {
    // Start game on first click
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Ignore click if card is already flipped or matched
    if (flipped.includes(id) || matched.includes(id)) {
      return;
    }
    
    // Limit to flipping only 2 cards at a time
    if (flipped.length === 2) {
      return;
    }
    
    // Play flip sound
    playSound('flip');
    
    // Flip animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
    
    // Add card to flipped cards
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    // If 2 cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMoves(prevMoves => prevMoves + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match found
        setMatched(prevMatched => [...prevMatched, firstId, secondId]);
        setFlipped([]);
        setLastMatch(Date.now());
        
        // Play match sound
        playSound('match');
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlipped([]);
          
          // Play error sound
          playSound('error');
        }, 1000);
      }
    }
  };

  // Calculate grid dimensions based on number of cards
  const numCards = cards.length;
  const numCols = numCards <= 8 ? 2 : numCards <= 12 ? 3 : 4;
  const numRows = Math.ceil(numCards / numCols);

  // Card emojis for different card contents
  const getCardEmoji = (content: string) => {
    const emojiMap: Record<string, string> = {
      'الشمس': '☀️',
      'القمر': '🌙',
      'النجوم': '⭐',
      'الأرض': '🌍',
      'المريخ': '🔴',
      'زحل': '🪐',
      'السماء': '🌤️',
      'البحر': '🌊',
      'الجبال': '⛰️',
      'الأشجار': '🌳',
      'الزهور': '🌸',
      'الحيوانات': '🦁',
      'الطيور': '🦜',
      'الأسماك': '🐠',
    };
    
    return emojiMap[content] || content;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>الحركات:</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>الوقت:</Text>
          <View style={styles.timerContainer}>
            <Timer size={16} color={Colors.primary} />
            <Text style={styles.statValue}>{time}s</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.gameArea}>
        <View style={[
          styles.grid, 
          { 
            gridTemplateColumns: `repeat(${numCols}, 1fr)`,
            gridTemplateRows: `repeat(${numRows}, 1fr)`,
          }
        ]}>
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.id);
            const isLastMatched = lastMatch !== null && isMatched;
            
            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardContainer,
                ]}
                onPress={() => handleCardClick(card.id)}
                activeOpacity={0.8}
                disabled={isFlipped || isMatched}
              >
                <Animated.View
                  style={[
                    styles.card,
                    isFlipped && styles.flippedCard,
                    isMatched && styles.matchedCard,
                    isLastMatched && {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  {(isFlipped || isMatched) ? (
                    <View style={styles.cardFront}>
                      <Text style={[
                        styles.cardContent,
                        isMatched && styles.matchedCardContent
                      ]}>
                        {getCardEmoji(card.content)}
                      </Text>
                      <Text style={[
                        styles.cardText,
                        isMatched && styles.matchedCardContent
                      ]}>
                        {card.content}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.cardBack}>
                      <Text style={styles.cardBackText}>?</Text>
                      <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=100&auto=format&fit=crop' }} 
                        style={styles.cardBackImage} 
                      />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
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
          <Text style={styles.completionText}>أحسنت! لقد أكملت اللعبة</Text>
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
    marginBottom: 20,
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      display: 'grid',
      gap: '16px',
    } : {}),
  },
  cardContainer: {
    aspectRatio: 1,
    width: '45%',
    maxWidth: 120,
    margin: 4,
    ...(Platform.OS === 'web' ? {
      margin: 0,
    } : {}),
  },
  card: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  flippedCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  matchedCard: {
    backgroundColor: Colors.success,
    borderColor: Colors.white,
  },
  cardFront: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cardBack: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    fontSize: 32,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    textAlign: 'center',
  },
  matchedCardContent: {
    color: Colors.white,
  },
  cardBackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    position: 'absolute',
    zIndex: 1,
  },
  cardBackImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
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