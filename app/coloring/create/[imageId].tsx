import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStoryStore } from '@/store/storyStore';
import { useContentStore } from '@/store/contentStore';
import { generateColoringPage } from '@/utils/coloringService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function CreateColoringPageScreen() {
  const { imageId } = useLocalSearchParams<{ imageId: string }>();
  const router = useRouter();
  
  const { stories } = useStoryStore();
  const { images, addColoringPage } = useContentStore();
  
  const image = images.find(img => img.id === imageId);
  const story = image ? stories.find(s => s.id === image.storyId) : null;
  
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedOutlineUrl, setGeneratedOutlineUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!image || !story) {
      Alert.alert(
        "خطأ",
        "الصورة أو القصة غير موجودة",
        [{ text: "العودة", onPress: () => router.back() }]
      );
    } else {
      // Set default title based on story title
      setTitle(`صفحة تلوين: ${story.title}`);
    }
  }, [image, story, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'يرجى إدخال عنوان لصفحة التلوين';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateOutline = async () => {
    if (!validateForm() || !image) return;
    
    setIsGenerating(true);
    
    try {
      // In a real app, this would call an AI service to convert the image to a coloring page
      // For this demo, we'll simulate it
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use the same image URL but pretend it's an outline
      setGeneratedOutlineUrl(image.url + '?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&fm=jpg&grayscale=true');
    } catch (error) {
      console.error('Error generating outline:', error);
      Alert.alert(
        "خطأ في إنشاء صفحة التلوين",
        "حدث خطأ أثناء إنشاء صفحة التلوين. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveColoringPage = async () => {
    if (!validateForm() || !image || !story || !generatedOutlineUrl) return;
    
    setIsSaving(true);
    
    try {
      const coloringPage = await generateColoringPage(image, title);
      addColoringPage(coloringPage);
      router.push(`/story/${story.id}`);
    } catch (error) {
      console.error('Error saving coloring page:', error);
      Alert.alert(
        "خطأ في حفظ صفحة التلوين",
        "حدث خطأ أثناء حفظ صفحة التلوين. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!image || !story) {
    return null; // Loading or error state handled in useEffect
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>إنشاء صفحة تلوين</Text>
        <Text style={styles.storyTitle}>القصة: {story.title}</Text>
        
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.previewLabel}>الصورة الأصلية:</Text>
          <Image
            source={{ uri: image.url }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
        </View>
        
        <Input
          label="عنوان صفحة التلوين"
          value={title}
          onChangeText={setTitle}
          placeholder="أدخل عنوانًا لصفحة التلوين"
          error={errors.title}
        />
        
        <Button
          title="إنشاء صفحة التلوين"
          onPress={handleGenerateOutline}
          loading={isGenerating}
          disabled={isGenerating || isSaving}
          style={styles.generateButton}
        />
        
        {generatedOutlineUrl ? (
          <View style={styles.outlineContainer}>
            <Text style={styles.outlineLabel}>صفحة التلوين:</Text>
            <Image
              source={{ uri: generatedOutlineUrl }}
              style={styles.outlinePreview}
              resizeMode="contain"
            />
            
            <Button
              title="حفظ صفحة التلوين"
              onPress={handleSaveColoringPage}
              loading={isSaving}
              disabled={isGenerating || isSaving}
              style={styles.saveButton}
            />
          </View>
        ) : null}
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
    paddingBottom: 40,
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
    marginBottom: 16,
    textAlign: 'right',
  },
  imagePreviewContainer: {
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  generateButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  outlineContainer: {
    marginTop: 16,
    marginBottom: 40,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  outlinePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.success,
  },
});