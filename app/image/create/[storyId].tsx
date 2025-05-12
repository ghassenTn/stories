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
import { generateId } from '@/utils/helpers';
import { generateImagePrompt } from '@/utils/aiService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

// Mock image URLs for demo purposes
const DEMO_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1551966775-a4ddc8df052b',
  'https://images.unsplash.com/photo-1629654297299-c8506221ca97',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  'https://images.unsplash.com/photo-1579547945413-497e1b99dac0',
];

export default function CreateImageScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  
  const { stories } = useStoryStore();
  const { addImage } = useContentStore();
  
  const story = stories.find(s => s.id === storyId);
  
  const [scene, setScene] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!story) {
      Alert.alert(
        "خطأ",
        "القصة غير موجودة",
        [{ text: "العودة", onPress: () => router.back() }]
      );
    } else {
      // Set default scene based on story topic
      setScene(`مشهد من قصة "${story.title}" عن ${story.topic} مع البطل ${story.heroName}`);
    }
  }, [story, router]);

  const validateScene = () => {
    const newErrors: Record<string, string> = {};
    
    if (!scene.trim()) {
      newErrors.scene = 'يرجى وصف المشهد الذي تريد إنشاء صورة له';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePrompt = async () => {
    if (!validateScene() || !story) return;
    
    setIsGeneratingPrompt(true);
    
    try {
      const generatedPrompt = await generateImagePrompt(story.content, scene);
      setPrompt(generatedPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      Alert.alert(
        "خطأ في إنشاء وصف الصورة",
        "حدث خطأ أثناء إنشاء وصف الصورة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setErrors({ prompt: 'يرجى إنشاء وصف الصورة أولاً' });
      return;
    }
    
    setIsGeneratingImage(true);
    
    try {
      // In a real app, this would call an image generation API
      // For demo purposes, we'll use a random image from our mock URLs
      const randomIndex = Math.floor(Math.random() * DEMO_IMAGE_URLS.length);
      const imageUrl = DEMO_IMAGE_URLS[randomIndex];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert(
        "خطأ في إنشاء الصورة",
        "حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveImage = () => {
    if (!generatedImageUrl || !story) return;
    
    setIsSaving(true);
    
    try {
      const newImage = {
        id: generateId(),
        storyId: story.id,
        url: generatedImageUrl,
        prompt: prompt,
        createdAt: Date.now(),
      };
      
      addImage(newImage);
      router.push(`/story/${story.id}`);
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert(
        "خطأ في حفظ الصورة",
        "حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSaving(false);
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
        <Text style={styles.heading}>إنشاء صورة للقصة</Text>
        <Text style={styles.storyTitle}>القصة: {story.title}</Text>
        
        <Input
          label="وصف المشهد"
          value={scene}
          onChangeText={setScene}
          placeholder="صف المشهد الذي تريد إنشاء صورة له من القصة"
          error={errors.scene}
        />
        
        <Button
          title="إنشاء وصف الصورة"
          onPress={handleGeneratePrompt}
          loading={isGeneratingPrompt}
          disabled={isGeneratingPrompt || isGeneratingImage || isSaving}
          style={styles.generateButton}
        />
        
        {prompt ? (
          <>
            <Text style={styles.promptLabel}>وصف الصورة (بالإنجليزية):</Text>
            <Input
              multiline
              value={prompt}
              onChangeText={setPrompt}
              error={errors.prompt}
              style={styles.promptInput}
            />
            
            <Button
              title="إنشاء الصورة"
              onPress={handleGenerateImage}
              loading={isGeneratingImage}
              disabled={isGeneratingPrompt || isGeneratingImage || isSaving}
              style={styles.generateImageButton}
            />
          </>
        ) : null}
        
        {generatedImageUrl ? (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>الصورة المنشأة:</Text>
            <Image
              source={{ uri: generatedImageUrl }}
              style={styles.generatedImage}
              resizeMode="contain"
            />
            
            <Button
              title="حفظ الصورة"
              onPress={handleSaveImage}
              loading={isSaving}
              disabled={isGeneratingPrompt || isGeneratingImage || isSaving}
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
  generateButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'right',
  },
  promptInput: {
    minHeight: 100,
  },
  generateImageButton: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: Colors.info,
  },
  imageContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.gray[200],
  },
  saveButton: {
    backgroundColor: Colors.success,
  },
});