import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Image,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoryStore } from '@/store/storyStore';
import { useContentStore } from '@/store/contentStore';
import { generateId, gameTypes } from '@/utils/helpers';
import { generateActivityIdeas } from '@/utils/aiService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { Brain, Sparkles, Wand2, ListOrdered, HelpCircle } from 'lucide-react-native';

export default function CreateGameScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  
  const { stories } = useStoryStore();
  const { addGame } = useContentStore();
  
  const story = stories.find(s => s.id === storyId);
  
  const [title, setTitle] = useState('');
  const [gameType, setGameType] = useState('');
  const [content, setContent] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGameTypeInfo, setSelectedGameTypeInfo] = useState<any>(null);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!story) {
      Alert.alert(
        "خطأ",
        "القصة غير موجودة",
        [{ text: "العودة", onPress: () => router.back() }]
      );
    } else {
      // Set default title based on story topic
      setTitle(`لعبة تعليمية عن ${story.topic}`);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [story, router, fadeAnim]);
  
  // Update selected game type info
  useEffect(() => {
    if (gameType) {
      const gameTypeData = gameTypes.find(t => t.value === gameType);
      if (gameTypeData) {
        setSelectedGameTypeInfo({
          label: gameTypeData.label,
          description: gameTypeData.description,
          iconName: gameTypeData.iconName,
        });
        
        // Bounce animation
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      }
    } else {
      setSelectedGameTypeInfo(null);
    }
  }, [gameType, bounceAnim]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'يرجى إدخال عنوان اللعبة';
    if (!gameType) newErrors.gameType = 'يرجى اختيار نوع اللعبة';
    if (!content.trim()) newErrors.content = 'يرجى إدخال محتوى اللعبة';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateGame = async () => {
    if (!gameType || !story) {
      setErrors({ 
        gameType: !gameType ? 'يرجى اختيار نوع اللعبة' : '' 
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const gameTypeLabel = gameTypes.find(t => t.value === gameType)?.label || gameType;
      const generatedGame = await generateActivityIdeas(story.content, gameTypeLabel);
      
      // Extract a title from the first line if possible
      const lines = generatedGame.split('\n');
      let extractedTitle = '';
      let extractedContent = generatedGame;
      
      if (lines.length > 0 && lines[0].length < 100) {
        extractedTitle = lines[0].replace(/^#+ /, '').trim();
        extractedContent = lines.slice(1).join('\n').trim();
      }
      
      if (extractedTitle) setTitle(extractedTitle);
      setContent(extractedContent);
    } catch (error) {
      console.error('Error generating game:', error);
      Alert.alert(
        "خطأ في إنشاء اللعبة",
        "حدث خطأ أثناء إنشاء اللعبة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGame = () => {
    if (!validateForm() || !story) return;
    
    setIsSaving(true);
    
    try {
      const newGame = {
        id: generateId(),
        storyId: story.id,
        title,
        type: gameType as any,
        content: content,
        createdAt: Date.now(),
      };
      
      addGame(newGame);
      router.push(`/story/${story.id}`);
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert(
        "خطأ في حفظ اللعبة",
        "حدث خطأ أثناء حفظ اللعبة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Get game type image
  const getGameTypeImage = (type: string) => {
    switch (type) {
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

  // Render game type icon based on iconName
  const renderGameTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain size={24} color={Colors.primary} />;
      case 'ListOrdered':
        return <ListOrdered size={24} color={Colors.primary} />;
      case 'HelpCircle':
        return <HelpCircle size={24} color={Colors.primary} />;
      default:
        return null;
    }
  };

  if (!story) {
    return null; // Loading or error state handled in useEffect
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>إنشاء لعبة للقصة</Text>
            <Text style={styles.storyTitle}>القصة: {story.title}</Text>
          </View>
          
          <View style={styles.gameTypesContainer}>
            <Text style={styles.sectionTitle}>اختر نوع اللعبة:</Text>
            <View style={styles.gameTypeCards}>
              {gameTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.gameTypeCard,
                    gameType === type.value && styles.selectedGameTypeCard
                  ]}
                  onPress={() => setGameType(type.value)}
                >
                  <Image 
                    source={{ uri: getGameTypeImage(type.value) }} 
                    style={styles.gameTypeImage} 
                  />
                  <Text style={[
                    styles.gameTypeTitle,
                    gameType === type.value && styles.selectedGameTypeTitle
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gameType ? (
              <Text style={styles.errorText}>{errors.gameType}</Text>
            ) : null}
          </View>
          
          {selectedGameTypeInfo && (
            <Animated.View 
              style={[
                styles.gameTypeInfoContainer,
                { transform: [{ scale: bounceAnim }] }
              ]}
            >
              <View style={styles.gameTypeInfoHeader}>
                <Text style={styles.gameTypeInfoTitle}>{selectedGameTypeInfo.label}</Text>
                {renderGameTypeIcon(selectedGameTypeInfo.iconName)}
              </View>
              <Text style={styles.gameTypeInfoDescription}>
                {selectedGameTypeInfo.description}
              </Text>
            </Animated.View>
          )}
          
          <View style={styles.generateContainer}>
            <View style={styles.generateHeader}>
              <Text style={styles.generateTitle}>اقتراح لعبة باستخدام الذكاء الاصطناعي</Text>
              <Sparkles size={20} color={Colors.warning} />
            </View>
            <Text style={styles.generateDescription}>
              يمكننا اقتراح محتوى للعبة بناءً على القصة ونوع اللعبة المختار.
            </Text>
            <Button
              title="اقتراح لعبة"
              onPress={handleGenerateGame}
              loading={isGenerating}
              disabled={isGenerating || isSaving || !gameType}
              style={styles.generateButton}
              icon={<Wand2 size={18} color={Colors.white} />}
            />
          </View>
          
          <Input
            label="عنوان اللعبة"
            value={title}
            onChangeText={setTitle}
            placeholder="أدخل عنوان اللعبة"
            error={errors.title}
          />
          
          <Text style={styles.contentLabel}>محتوى اللعبة:</Text>
          <Input
            multiline
            value={content}
            onChangeText={setContent}
            placeholder="أدخل تفاصيل اللعبة هنا..."
            error={errors.content}
            style={styles.contentInput}
          />
          
          <Button
            title="حفظ اللعبة"
            onPress={handleSaveGame}
            loading={isSaving}
            disabled={isGenerating || isSaving}
            style={styles.saveButton}
          />
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'right',
  },
  storyTitle: {
    fontSize: 16,
    color: Colors.gray[700],
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
    textAlign: 'right',
  },
  gameTypesContainer: {
    marginBottom: 24,
  },
  gameTypeCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gameTypeCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  selectedGameTypeCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  gameTypeImage: {
    width: '80%',
    height: '60%',
    borderRadius: 8,
    marginBottom: 8,
  },
  gameTypeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
    textAlign: 'center',
  },
  selectedGameTypeTitle: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },
  gameTypeInfoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameTypeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTypeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  gameTypeInfoDescription: {
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 22,
    textAlign: 'right',
  },
  generateContainer: {
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed',
  },
  generateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  generateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'right',
  },
  generateDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 16,
    textAlign: 'right',
  },
  generateButton: {
    backgroundColor: Colors.info,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'right',
  },
  contentInput: {
    minHeight: 200,
    textAlign: 'right',
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
  },
});