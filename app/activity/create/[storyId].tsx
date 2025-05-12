import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoryStore } from '@/store/storyStore';
import { useContentStore } from '@/store/contentStore';
import { generateId, activityTypes } from '@/utils/helpers';
import { generateDynamicActivity } from '@/utils/aiService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Picker from '@/components/Picker';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';

export default function CreateActivityScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  
  const { stories } = useStoryStore();
  const { addActivity } = useContentStore();
  
  const story = stories.find(s => s.id === storyId);
  
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState('');
  const [activityData, setActivityData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!story) {
      Alert.alert(
        "خطأ",
        "القصة غير موجودة",
        [{ text: "العودة", onPress: () => router.back() }]
      );
    } else {
      // Set default title based on story topic
      setTitle(`نشاط تعليمي عن ${story.topic}`);
    }
  }, [story, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'يرجى إدخال عنوان النشاط';
    if (!activityType) newErrors.activityType = 'يرجى اختيار نوع النشاط';
    if (!activityData) newErrors.activityData = 'يرجى إنشاء محتوى النشاط أولاً';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateActivity = async () => {
    if (!activityType || !story) {
      setErrors({ 
        activityType: !activityType ? 'يرجى اختيار نوع النشاط' : '' 
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const activityTypeLabel = activityTypes.find(t => t.value === activityType)?.label || activityType;
      const generatedActivityData = await generateDynamicActivity(story.content, activityType);
      
      setActivityData(generatedActivityData);
      
      // Update title if not already set by user
      if (!title || title === `نشاط تعليمي عن ${story.topic}`) {
        setTitle(generatedActivityData.title || `نشاط ${activityTypeLabel} عن ${story.topic}`);
      }
      
      setPreviewMode(true);
    } catch (error) {
      console.error('Error generating activity:', error);
      Alert.alert(
        "خطأ في إنشاء النشاط",
        "حدث خطأ أثناء إنشاء النشاط. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveActivity = () => {
    if (!validateForm() || !story) return;
    
    setIsSaving(true);
    
    try {
      const newActivity = {
        id: generateId(),
        storyId: story.id,
        title,
        type: activityType as any,
        content: activityData,
        createdAt: Date.now(),
      };
      
      addActivity(newActivity);
      router.push(`/story/${story.id}`);
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(
        "خطأ في حفظ النشاط",
        "حدث خطأ أثناء حفظ النشاط. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (!activityData) return null;
    
    return (
      <Card style={styles.previewCard}>
        <Text style={styles.previewTitle}>معاينة النشاط</Text>
        
        <View style={styles.previewContent}>
          <Text style={styles.previewInstructions}>{activityData.instructions}</Text>
          
          {activityType === 'matching' && activityData.pairs && (
            <View style={styles.previewItems}>
              <Text style={styles.previewItemTitle}>أزواج التوصيل:</Text>
              {activityData.pairs.slice(0, 3).map((pair: any, index: number) => (
                <Text key={index} style={styles.previewItem}>
                  {pair.left} ↔ {pair.right}
                </Text>
              ))}
              {activityData.pairs.length > 3 && (
                <Text style={styles.previewMore}>...وأكثر</Text>
              )}
            </View>
          )}
          
          {activityType === 'truefalse' && activityData.questions && (
            <View style={styles.previewItems}>
              <Text style={styles.previewItemTitle}>أسئلة صح/خطأ:</Text>
              {activityData.questions.slice(0, 3).map((q: any, index: number) => (
                <Text key={index} style={styles.previewItem}>
                  {q.text} ({q.answer ? 'صحيح' : 'خطأ'})
                </Text>
              ))}
              {activityData.questions.length > 3 && (
                <Text style={styles.previewMore}>...وأكثر</Text>
              )}
            </View>
          )}
          
          {activityType === 'fillblanks' && activityData.sentences && (
            <View style={styles.previewItems}>
              <Text style={styles.previewItemTitle}>جمل ملء الفراغات:</Text>
              {activityData.sentences.slice(0, 3).map((s: any, index: number) => (
                <Text key={index} style={styles.previewItem}>
                  {s.text.replace('_____', `[${s.answer}]`)}
                </Text>
              ))}
              {activityData.sentences.length > 3 && (
                <Text style={styles.previewMore}>...وأكثر</Text>
              )}
            </View>
          )}
          
          {activityType === 'multiplechoice' && activityData.questions && (
            <View style={styles.previewItems}>
              <Text style={styles.previewItemTitle}>أسئلة الاختيار من متعدد:</Text>
              {activityData.questions.slice(0, 3).map((q: any, index: number) => (
                <Text key={index} style={styles.previewItem}>
                  {q.text} (الإجابة: {q.answer})
                </Text>
              ))}
              {activityData.questions.length > 3 && (
                <Text style={styles.previewMore}>...وأكثر</Text>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.previewActions}>
          <Button
            title="إعادة الإنشاء"
            onPress={handleGenerateActivity}
            variant="outline"
            style={styles.regenerateButton}
            disabled={isGenerating}
          />
          <Button
            title="حفظ النشاط"
            onPress={handleSaveActivity}
            loading={isSaving}
            disabled={isGenerating || isSaving}
            style={styles.saveButton}
          />
        </View>
      </Card>
    );
  };

  if (!story) {
    return null; // Loading or error state handled in useEffect
  }

  return (
    <AppLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.heading}>إنشاء نشاط للقصة</Text>
          <Text style={styles.storyTitle}>القصة: {story.title}</Text>
          
          <Card style={styles.formCard}>
            <Input
              label="عنوان النشاط"
              value={title}
              onChangeText={setTitle}
              placeholder="أدخل عنوان النشاط"
              error={errors.title}
            />
            
            <Picker
              label="نوع النشاط"
              items={activityTypes}
              selectedValue={activityType}
              onValueChange={setActivityType}
              placeholder="اختر نوع النشاط"
              error={errors.activityType}
            />
            
            {!previewMode && (
              <Button
                title="إنشاء النشاط"
                onPress={handleGenerateActivity}
                loading={isGenerating}
                disabled={isGenerating || isSaving || !activityType}
                style={styles.generateButton}
              />
            )}
          </Card>
          
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>جاري إنشاء النشاط...</Text>
            </View>
          ) : (
            previewMode && renderPreview()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    ...(Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center', width: '100%' } : {}),
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
    marginBottom: 24,
    textAlign: 'right',
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  generateButton: {
    marginTop: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  previewCard: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
    textAlign: 'center',
  },
  previewContent: {
    marginBottom: 20,
  },
  previewInstructions: {
    fontSize: 16,
    color: Colors.gray[800],
    marginBottom: 16,
    textAlign: 'right',
    padding: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    borderRightWidth: 4,
    borderRightColor: Colors.primary,
  },
  previewItems: {
    marginTop: 12,
  },
  previewItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'right',
  },
  previewItem: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 6,
    textAlign: 'right',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  previewMore: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  regenerateButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.success,
  },
});