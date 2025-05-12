import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, XCircle, ArrowRight, Trophy, RefreshCw } from 'lucide-react-native';
import { useContentStore } from '@/store/contentStore';
import { useStoryStore } from '@/store/storyStore';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';
import { generateDynamicActivity } from '@/utils/aiService';

// Activity components
import MatchingActivity from '@/components/activities/MatchingActivity';
import TrueFalseActivity from '@/components/activities/TrueFalseActivity';
import FillBlanksActivity from '@/components/activities/FillBlanksActivity';
import MultipleChoiceActivity from '@/components/activities/MultipleChoiceActivity';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { activities } = useContentStore();
  const { stories } = useStoryStore();
  
  const [activity, setActivity] = useState<any>(null);
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any>({});
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (id) {
      const foundActivity = activities.find(a => a.id === id);
      
      if (foundActivity) {
        setActivity(foundActivity);
        
        const relatedStory = stories.find(s => s.id === foundActivity.storyId);
        if (relatedStory) {
          setStory(relatedStory);
        }
        
        // Set activity data from stored content
        if (foundActivity.content) {
          setActivityData(foundActivity.content);
        }
      }
      
      setLoading(false);
    }
  }, [id, activities, stories]);

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    if (!activityData) return;
    
    let correctAnswers = 0;
    let totalQuestions = 0;
    
    switch (activity?.type) {
      case 'matching':
        totalQuestions = activityData.pairs.length;
        activityData.pairs.forEach((pair: any) => {
          if (answers[pair.id] === pair.right) {
            correctAnswers++;
          }
        });
        break;
      
      case 'truefalse':
        totalQuestions = activityData.questions.length;
        activityData.questions.forEach((question: any) => {
          if (answers[question.id] === question.answer) {
            correctAnswers++;
          }
        });
        break;
      
      case 'fillblanks':
        totalQuestions = activityData.sentences.length;
        activityData.sentences.forEach((sentence: any) => {
          if (answers[sentence.id]?.toLowerCase() === sentence.answer.toLowerCase()) {
            correctAnswers++;
          }
        });
        break;
      
      case 'multiplechoice':
        totalQuestions = activityData.questions.length;
        activityData.questions.forEach((question: any) => {
          if (answers[question.id] === question.answer) {
            correctAnswers++;
          }
        });
        break;
    }
    
    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers({});
    setScore(null);
    setShowResults(false);
  };

  const handleRegenerateActivity = async () => {
    if (!story || !activity) return;
    
    setIsRegenerating(true);
    
    try {
      const newActivityData = await generateDynamicActivity(story.content, activity.type);
      setActivityData(newActivityData);
      handleReset();
    } catch (error) {
      console.error('Error regenerating activity:', error);
      Alert.alert(
        "خطأ في إعادة إنشاء النشاط",
        "حدث خطأ أثناء إعادة إنشاء النشاط. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderActivityComponent = () => {
    if (!activityData) return null;
    
    switch (activity?.type) {
      case 'matching':
        return (
          <MatchingActivity 
            data={activityData} 
            answers={answers}
            onAnswerChange={handleAnswerChange}
            showResults={showResults}
          />
        );
      
      case 'truefalse':
        return (
          <TrueFalseActivity 
            data={activityData} 
            answers={answers}
            onAnswerChange={handleAnswerChange}
            showResults={showResults}
          />
        );
      
      case 'fillblanks':
        return (
          <FillBlanksActivity 
            data={activityData} 
            answers={answers}
            onAnswerChange={handleAnswerChange}
            showResults={showResults}
          />
        );
      
      case 'multiplechoice':
        return (
          <MultipleChoiceActivity 
            data={activityData} 
            answers={answers}
            onAnswerChange={handleAnswerChange}
            showResults={showResults}
          />
        );
      
      default:
        return (
          <View style={styles.defaultContent}>
            <Text style={styles.contentText}>{activity?.content?.instructions || "محتوى النشاط غير متوفر"}</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل النشاط...</Text>
        </View>
      </AppLayout>
    );
  }

  if (!activity) {
    return (
      <AppLayout>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>النشاط غير موجود</Text>
          <Button 
            title="العودة إلى الأنشطة" 
            onPress={() => router.push('/activities')}
            style={styles.backButton}
          />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{activity.title}</Text>
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
        
        <Card style={styles.activityCard}>
          {activityData && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>التعليمات:</Text>
              <Text style={styles.instructions}>{activityData.instructions}</Text>
            </View>
          )}
          
          {isRegenerating ? (
            <View style={styles.regeneratingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.regeneratingText}>جاري إعادة إنشاء النشاط...</Text>
            </View>
          ) : (
            <View style={styles.activityContent}>
              {renderActivityComponent()}
            </View>
          )}
          
          {!showResults && !isRegenerating ? (
            <View style={styles.actionsContainer}>
              <Button
                title="تحقق من الإجابات"
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={Object.keys(answers).length === 0 || isRegenerating}
              />
              
              <TouchableOpacity 
                style={styles.regenerateButton}
                onPress={handleRegenerateActivity}
                disabled={isRegenerating}
              >
                <RefreshCw size={16} color={Colors.primary} />
                <Text style={styles.regenerateText}>أسئلة جديدة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            !isRegenerating && (
              <View style={styles.resultsContainer}>
                <View style={styles.scoreContainer}>
                  <Trophy size={32} color={score && score >= 70 ? Colors.success : Colors.warning} />
                  <Text style={styles.scoreText}>النتيجة: {score}%</Text>
                </View>
                
                <Text style={[
                  styles.feedbackText,
                  score && score >= 70 ? styles.successText : styles.warningText
                ]}>
                  {score && score >= 70 
                    ? 'أحسنت! لقد أكملت النشاط بنجاح.' 
                    : 'حاول مرة أخرى للحصول على نتيجة أفضل.'}
                </Text>
                
                <View style={styles.resultActions}>
                  <Button
                    title="إعادة المحاولة"
                    onPress={handleReset}
                    variant="outline"
                    style={styles.resetButton}
                  />
                  
                  <Button
                    title="أسئلة جديدة"
                    onPress={handleRegenerateActivity}
                    style={styles.newQuestionsButton}
                    icon={<RefreshCw size={16} color={Colors.white} />}
                  />
                </View>
              </View>
            )
          )}
        </Card>
      </ScrollView>
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
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    flex: 1,
    textAlign: 'right',
  },
  storyLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyLinkText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  activityCard: {
    padding: 20,
  },
  instructionsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'right',
  },
  instructions: {
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 22,
    textAlign: 'right',
  },
  activityContent: {
    marginBottom: 24,
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
  actionsContainer: {
    marginTop: 16,
  },
  submitButton: {
    marginBottom: 16,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  regenerateText: {
    marginLeft: 8,
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  regeneratingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regeneratingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginLeft: 12,
  },
  feedbackText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    color: Colors.success,
  },
  warningText: {
    color: Colors.warning,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  newQuestionsButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.info,
  },
});