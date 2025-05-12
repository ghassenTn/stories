import React from 'react';
import { View, FlatList, StyleSheet, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { useContentStore } from '@/store/contentStore';
import { useStoryStore } from '@/store/storyStore';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/Card';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { truncateText } from '@/utils/helpers';
import AppLayout from '@/components/AppLayout';

export default function ImagesScreen() {
  const router = useRouter();
  const { images } = useContentStore();
  const { stories } = useStoryStore();

  // Get story titles for each image
  const imagesWithStoryTitles = images.map(image => {
    const story = stories.find(s => s.id === image.storyId);
    return {
      ...image,
      storyTitle: story ? story.title : 'قصة غير معروفة'
    };
  });

  const renderContent = () => {
    if (images.length === 0) {
      return (
        <EmptyState
          title="لا توجد صور بعد"
          description="قم بإنشاء قصة أولاً ثم أضف صوراً لها"
          buttonTitle="الذهاب إلى القصص"
          onButtonPress={() => router.push('/')}
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>مكتبة الصور</Text>
          <Text style={styles.subtitle}>
            جميع الصور المنشأة للقصص التعليمية
          </Text>
        </View>

        <FlatList
          data={imagesWithStoryTitles.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={(item) => item.id}
          numColumns={Platform.OS === 'web' ? 3 : 2}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.imageCard, Platform.OS === 'web' && styles.webImageCard]}
              onPress={() => router.push(`/story/${item.storyId}`)}
              activeOpacity={0.8}
            >
              <Card style={styles.card}>
                <Image 
                  source={{ uri: item.url }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
                <View style={styles.imageInfo}>
                  <Text style={styles.storyTitle}>{truncateText(item.storyTitle, 20)}</Text>
                  <Text style={styles.prompt}>{truncateText(item.prompt, 30)}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    textAlign: 'right',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'right',
  },
  listContent: {
    padding: 12,
  },
  imageCard: {
    width: '50%',
    padding: 8,
  },
  webImageCard: {
    width: '33.333%',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageInfo: {
    padding: 12,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
    textAlign: 'right',
  },
  prompt: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'right',
  },
});