import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStoryStore } from '@/store/storyStore';
import { generateId, ageGroups } from '@/utils/helpers';
import { generateStory } from '@/utils/aiService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Picker from '@/components/Picker';
import Colors from '@/constants/colors';

export default function CreateStoryScreen() {
  const router = useRouter();
  const { addStory } = useStoryStore();
  
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [heroName, setHeroName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [content, setContent] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'يرجى إدخال عنوان القصة';
    if (!topic.trim()) newErrors.topic = 'يرجى إدخال موضوع القصة';
    if (!heroName.trim()) newErrors.heroName = 'يرجى إدخال اسم البطل';
    if (!ageGroup) newErrors.ageGroup = 'يرجى اختيار الفئة العمرية';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateStory = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    
    try {
      const generatedContent = await generateStory(topic, heroName, ageGroup);
      setContent(generatedContent);
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert(
        "خطأ في إنشاء القصة",
        "حدث خطأ أثناء إنشاء القصة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStory = () => {
    if (!validateForm() || !content.trim()) {
      if (!content.trim()) {
        setErrors(prev => ({ ...prev, content: 'يرجى إنشاء محتوى القصة أولاً' }));
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newStory = {
        id: generateId(),
        title,
        content,
        heroName,
        topic,
        ageGroup,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      addStory(newStory);
      router.push(`/story/${newStory.id}`);
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert(
        "خطأ في حفظ القصة",
        "حدث خطأ أثناء حفظ القصة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.heading}>إنشاء قصة جديدة</Text>
          <Text style={styles.subheading}>
            أدخل المعلومات الأساسية للقصة ثم اضغط على زر إنشاء القصة
          </Text>
          
          <Input
            label="عنوان القصة"
            value={title}
            onChangeText={setTitle}
            placeholder="أدخل عنوان القصة"
            error={errors.title}
          />
          
          <Input
            label="موضوع القصة"
            value={topic}
            onChangeText={setTopic}
            placeholder="مثال: التعاون، الصداقة، النظافة..."
            error={errors.topic}
          />
          
          <Input
            label="اسم البطل"
            value={heroName}
            onChangeText={setHeroName}
            placeholder="أدخل اسم البطل الرئيسي"
            error={errors.heroName}
          />
          
          <Picker
            label="الفئة العمرية"
            items={ageGroups}
            selectedValue={ageGroup}
            onValueChange={setAgeGroup}
            placeholder="اختر الفئة العمرية"
            error={errors.ageGroup}
          />
          
          <Button
            title="إنشاء القصة"
            onPress={handleGenerateStory}
            loading={isGenerating}
            disabled={isGenerating || isSubmitting}
            style={styles.generateButton}
          />
          
          {content ? (
            <>
              <Text style={styles.contentLabel}>محتوى القصة:</Text>
              <Input
                multiline
                value={content}
                onChangeText={setContent}
                error={errors.content}
                style={styles.contentInput}
              />
              
              <Button
                title="حفظ القصة"
                onPress={handleSaveStory}
                loading={isSubmitting}
                disabled={isGenerating || isSubmitting}
                style={styles.saveButton}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  scrollContent: {
    padding: 16,
    ...(Platform.OS === 'web' ? { display: 'flex', justifyContent: 'center', alignItems: 'center' } : {}),
  },
  formContainer: {
    ...(Platform.OS === 'web' ? { maxWidth: 700, width: '100%' } : {}),
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
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
  subheading: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 24,
    textAlign: 'right',
  },
  generateButton: {
    marginTop: 16,
    marginBottom: 24,
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
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: Colors.success,
  },
});