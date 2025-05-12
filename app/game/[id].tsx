import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Trophy, Timer, RotateCcw, Star, Award, Brain, ListOrdered, HelpCircle } from 'lucide-react-native';
import { useContentStore } from '@/store/contentStore';
import { useStoryStore } from '@/store/storyStore';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';

// Game components
import MemoryGame from '@/components/games/MemoryGame';
import OrderingGame from '@/components/games/OrderingGame';
import QuizGame from '@/components/games/QuizGame';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { games } = useContentStore();
  const { stories } = useStoryStore();
  
  const [game, setGame] = useState<any>(null);
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<any>({
    started: false,
    completed: false,
    score: 0,
    time: 0,
    moves: 0,
  });
  const [gameData, setGameData] = useState<any>(null);
  
  // Animation values
  const bounceAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      const foundGame = games.find(g => g.id === id);
      
      if (foundGame) {
        setGame(foundGame);
        
        const relatedStory = stories.find(s => s.id === foundGame.storyId);
        if (relatedStory) {
          setStory(relatedStory);
        }
        
        // Parse the game content
        try {
          // In a real app, the content would be structured data
          // For this demo, we'll create mock structured data based on game type
          const parsedData = parseGameContent(foundGame);
          setGameData(parsedData);
        } catch (error) {
          console.error('Error parsing game content:', error);
        }
      }
      
      setLoading(false);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [id, games, stories, fadeAnim]);

  // This function would parse the text content into structured data
  // In a real app, you'd store structured data directly
  const parseGameContent = (game: any) => {
    // Mock parsing based on game type
    switch (game?.type) {
      case 'memory':
        return {
          title: 'لعبة الذاكرة',
          instructions: 'اقلب البطاقات لإيجاد الأزواج المتطابقة. حاول أن تتذكر مكان كل بطاقة لتتمكن من العثور على الأزواج بأقل عدد من المحاولات.',
          cards: [
            { id: 1, content: 'الشمس', matched: false },
            { id: 2, content: 'الشمس', matched: false },
            { id: 3, content: 'القمر', matched: false },
            { id: 4, content: 'القمر', matched: false },
            { id: 5, content: 'النجوم', matched: false },
            { id: 6, content: 'النجوم', matched: false },
            { id: 7, content: 'الأرض', matched: false },
            { id: 8, content: 'الأرض', matched: false },
            { id: 9, content: 'المريخ', matched: false },
            { id: 10, content: 'المريخ', matched: false },
            { id: 11, content: 'زحل', matched: false },
            { id: 12, content: 'زحل', matched: false },
          ]
        };
      
      case 'ordering':
        return {
          title: 'ترتيب الأحداث',
          instructions: 'رتب الأحداث التالية حسب تسلسلها في القصة من البداية إلى النهاية. استخدم الأسهم لتحريك كل حدث إلى أعلى أو أسفل.',
          events: [
            { id: 1, text: 'استيقظ البطل في الصباح الباكر', order: 1 },
            { id: 2, text: 'تناول البطل وجبة الإفطار', order: 2 },
            { id: 3, text: 'ذهب البطل إلى المدرسة', order: 3 },
            { id: 4, text: 'قابل البطل أصدقاءه في المدرسة', order: 4 },
            { id: 5, text: 'عاد البطل إلى المنزل بعد انتهاء اليوم الدراسي', order: 5 },
          ]
        };
      
      case 'quiz':
        return {
          title: 'اختبار معلومات',
          instructions: 'أجب عن الأسئلة التالية المتعلقة بالقصة. اختر الإجابة الصحيحة من بين الخيارات المتاحة.',
          questions: [
            { 
              id: 1, 
              text: 'ما هو اسم البطل الرئيسي في القصة؟', 
              options: ['أحمد', 'محمد', 'علي', 'خالد'],
              answer: 'أحمد'
            },
            { 
              id: 2, 
              text: 'أين تدور أحداث القصة؟', 
              options: ['المدرسة', 'الحديقة', 'المنزل', 'المدينة'],
              answer: 'المدرسة'
            },
            { 
              id: 3, 
              text: 'ما هو الدرس المستفاد من القصة؟', 
              options: ['التعاون', 'الصدق', 'الصبر', 'الشجاعة'],
              answer: 'التعاون'
            },
            { 
              id: 4, 
              text: 'متى وقعت أحداث القصة؟', 
              options: ['في الصباح', 'في المساء', 'خلال النهار', 'في الليل'],
              answer: 'خلال النهار'
            },
            { 
              id: 5, 
              text: 'ماذا تعلم البطل في نهاية القصة؟', 
              options: ['أهمية مساعدة الآخرين', 'أهمية الوقت', 'أهمية الدراسة', 'أهمية الصداقة'],
              answer: 'أهمية الصداقة'
            },
          ]
        };
      
      default:
        return {
          title: 'لعبة تعليمية',
          instructions: 'اتبع التعليمات لإكمال اللعبة',
          content: game.content
        };
    }
  };

  const handleStartGame = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
    
    setGameState({
      ...gameState,
      started: true,
      completed: false,
      score: 0,
      time: 0,
      moves: 0,
    });
  };

  const handleGameComplete = (result: any) => {
    setGameState({
      ...gameState,
      completed: true,
      score: result.score,
      time: result.time,
      moves: result.moves,
    });
  };

  const handleResetGame = () => {
    setGameState({
      ...gameState,
      started: false,
      completed: false,
      score: 0,
      time: 0,
      moves: 0,
    });
  };

  const renderGameComponent = () => {
    if (!gameData) return null;
    
    switch (game?.type) {
      case 'memory':
        return (
          <MemoryGame 
            data={gameData} 
            onComplete={handleGameComplete}
          />
        );
      
      case 'ordering':
        return (
          <OrderingGame 
            data={gameData} 
            onComplete={handleGameComplete}
          />
        );
      
      case 'quiz':
        return (
          <QuizGame 
            data={gameData} 
            onComplete={handleGameComplete}
          />
        );
      
      default:
        return (
          <View style={styles.defaultContent}>
            <Text style={styles.contentText}>{game?.content}</Text>
          </View>
        );
    }
  };

  // Get game type icon
  const getGameTypeIcon = () => {
    switch (game?.type) {
      case 'memory':
        return 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=200&auto=format&fit=crop';
      case 'ordering':
        return 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop';
      case 'quiz':
        return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=200&auto=format&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=200&auto=format&fit=crop';
    }
  };

  // Render game type icon component
  const renderGameTypeIconComponent = () => {
    switch (game?.type) {
      case 'memory':
        return <Brain size={24} color={Colors.primary} />;
      case 'ordering':
        return <ListOrdered size={24} color={Colors.primary} />;
      case 'quiz':
        return <HelpCircle size={24} color={Colors.primary} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل اللعبة...</Text>
        </View>
      </AppLayout>
    );
  }

  if (!game) {
    return (
      <AppLayout>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>اللعبة غير موجودة</Text>
          <Button 
            title="العودة إلى الألعاب" 
            onPress={() => router.push('/activities')}
            style={styles.backButton}
          />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{game.title}</Text>
              {story && (
                <TouchableOpacity 
                  style={styles.storyLink}
                  onPress={() => router.push(`/story/${story.id}`)}
                >
                  <Text style={styles.storyLinkText}>العودة إلى القصة</Text>
                  <ArrowRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <Image 
              source={{ uri: getGameTypeIcon() }} 
              style={styles.headerImage} 
            />
          </View>
          
          <Card style={styles.gameCard}>
            {!gameState.started ? (
              <View style={styles.startContainer}>
                <View style={styles.gameTypeContainer}>
                  <View style={styles.gameTypeIconContainer}>
                    <Image 
                      source={{ uri: getGameTypeIcon() }} 
                      style={styles.gameTypeIcon} 
                    />
                  </View>
                  <Text style={styles.gameTypeText}>
                    {game.type === 'memory' ? 'لعبة الذاكرة' : 
                     game.type === 'ordering' ? 'ترتيب الأحداث' : 
                     game.type === 'quiz' ? 'اختبار معلومات' : 'لعبة تعليمية'}
                  </Text>
                </View>
                
                {gameData && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>التعليمات:</Text>
                    <Text style={styles.instructions}>{gameData.instructions}</Text>
                  </View>
                )}
                
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <Button
                    title="ابدأ اللعبة"
                    onPress={handleStartGame}
                    style={styles.startButton}
                  />
                </Animated.View>
              </View>
            ) : gameState.completed ? (
              <View style={styles.resultsContainer}>
                <View style={styles.trophyContainer}>
                  <View style={styles.trophyCircle}>
                    <Trophy size={64} color={Colors.warning} />
                  </View>
                  <View style={styles.starsContainer}>
                    <Star size={24} color={Colors.warning} fill={Colors.warning} />
                    <Star size={32} color={Colors.warning} fill={Colors.warning} />
                    <Star size={24} color={Colors.warning} fill={Colors.warning} />
                  </View>
                </View>
                
                <Text style={styles.congratsText}>تهانينا!</Text>
                <Text style={styles.completedText}>لقد أكملت اللعبة بنجاح</Text>
                
                <View style={styles.statsContainer}>
                  {gameState.score !== undefined && (
                    <View style={styles.statItem}>
                      <View style={[styles.statCircle, { backgroundColor: Colors.primary }]}>
                        <Award size={24} color={Colors.white} />
                        <Text style={styles.statCircleValue}>{gameState.score}%</Text>
                      </View>
                      <Text style={styles.statLabel}>النتيجة</Text>
                    </View>
                  )}
                  
                  {gameState.time !== undefined && (
                    <View style={styles.statItem}>
                      <View style={[styles.statCircle, { backgroundColor: Colors.info }]}>
                        <Timer size={24} color={Colors.white} />
                        <Text style={styles.statCircleValue}>{gameState.time}s</Text>
                      </View>
                      <Text style={styles.statLabel}>الوقت</Text>
                    </View>
                  )}
                  
                  {gameState.moves !== undefined && (
                    <View style={styles.statItem}>
                      <View style={[styles.statCircle, { backgroundColor: Colors.success }]}>
                        <Text style={styles.statCircleValue}>{gameState.moves}</Text>
                      </View>
                      <Text style={styles.statLabel}>الحركات</Text>
                    </View>
                  )}
                </View>
                
                <Button
                  title="إعادة اللعب"
                  onPress={handleResetGame}
                  variant="outline"
                  style={styles.resetButton}
                  icon={<RotateCcw size={18} color={Colors.primary} />}
                />
              </View>
            ) : (
              <View style={styles.gameContent}>
                {renderGameComponent()}
              </View>
            )}
          </Card>
        </ScrollView>
      </Animated.View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    ...(Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center', width: '100%' } : {}),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.gray[700],
    marginBottom: 20,
  },
  backButton: {
    minWidth: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 16,
    opacity: 0.2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark,
    textAlign: 'right',
    marginBottom: 8,
  },
  storyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: Colors.gray[100],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  storyLinkText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  gameCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startContainer: {
    alignItems: 'center',
  },
  gameTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: Colors.gray[100],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  gameTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  gameTypeIcon: {
    width: '100%',
    height: '100%',
  },
  gameTypeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  instructionsContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  instructions: {
    fontSize: 16,
    color: Colors.gray[700],
    lineHeight: 24,
    textAlign: 'right',
  },
  startButton: {
    minWidth: 200,
    paddingVertical: 12,
    borderRadius: 24,
  },
  gameContent: {
    width: '100%',
  },
  defaultContent: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    color: Colors.gray[800],
    lineHeight: 24,
    textAlign: 'right',
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.warning + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 18,
    color: Colors.gray[600],
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statCircleValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  resetButton: {
    minWidth: 200,
    borderRadius: 24,
  },
});