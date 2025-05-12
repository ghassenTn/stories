import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useStoryStore } from '@/store/storyStore';
import StoryCard from '@/components/StoryCard';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';

export default function StoriesScreen() {
  const router = useRouter();
  const { stories, deleteStory } = useStoryStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleCreateStory = () => {
    router.push('/story/create');
  };

  const handleDeleteStory = (id: string) => {
    deleteStory(id);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you might fetch fresh data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderContent = () => {
    if (stories.length === 0) {
      return (
        <EmptyState
          title="لا توجد قصص بعد"
          description="قم بإنشاء قصتك التعليمية الأولى للأطفال"
          buttonTitle="إنشاء قصة جديدة"
          onButtonPress={handleCreateStory}
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>القصص التعليمية</Text>
          <Text style={styles.subtitle}>
            قم بإنشاء وإدارة القصص التعليمية للأطفال
          </Text>
        </View>

        <FlatList
          data={stories.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoryCard story={item} onDelete={handleDeleteStory} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        
        {Platform.OS !== 'web' && (
          <View style={styles.fabContainer}>
            <Button
              title="إنشاء قصة جديدة"
              onPress={handleCreateStory}
              style={styles.fab}
              textStyle={styles.fabText}
              variant="primary"
            />
          </View>
        )}
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
    paddingVertical: 16,
    ...(Platform.OS === 'web' ? { paddingHorizontal: 20 } : {}),
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    marginLeft: 8,
  },
});