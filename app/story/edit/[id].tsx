import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoryStore } from '@/store/storyStore';
import { ageGroups } from '@/utils/helpers';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Picker from '@/components/Picker';
import Colors from '@/constants/colors';

export default function EditStoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { stories, updateStory } = useStoryStore();
  const story = stories.find(s => s.id === id);
  
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [heroName, setHeroName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [content, setContent] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setTopic(story.topic);
      setHeroName(story.heroName);
      setAgeGroup(story.ageGroup);
      setContent(story.content);
    } else {
      Alert.alert(
        "خطأ",
        "القصة غير موجودة",
        [{ text: "العودة", onPress: () => router.back() }]
      );
    }
  }, [story, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'يرجى إدخال عنوان القصة';
    if (!topic.trim()) newErrors.topic = 'يرجى إدخال موضوع القصة';
    if (!heroName.trim()) newErrors.heroName = 'يرجى إدخال اسم البطل';
    if (!ageGroup) newErrors.ageGroup = 'يرجى اختيار الفئة العمرية';
    if (!content.trim()) newErrors.content = 'يرجى إدخال محتوى القصة';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateStory = () => {
    if (!validateForm() || !story) return;
    
    setIsSubmitting(true);
    
    try {
      updateStory(id, {
        title,
        content,
        heroName,
        topic,
        ageGroup,
      });
      
      router.push(`/story/${id}`);
    } catch (error) {
      console.error('Error updating story:', error);
      Alert.alert(
        "خطأ في تحديث القصة",
        "حدث خطأ أثناء تحديث القصة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>تعديل القصة</Text>
        
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
        
        <Text style={styles.contentLabel}>محتوى القصة:</Text>
        <Input
          multiline
          value={content}
          onChangeText={setContent}
          error={errors.content}
          style={styles.contentInput}
        />
        
        <View style={styles.buttonsContainer}>
          <Button
            title="إلغاء"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
            disabled={isSubmitting}
          />
          
          <Button
            title="حفظ التغييرات"
            onPress={handleUpdateStory}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.saveButton}
          />
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
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 24,
    textAlign: 'right',
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.success,
  },
});