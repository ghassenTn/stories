import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, RefreshCw } from 'lucide-react-native';
import { useContentStore } from '@/store/contentStore';
import { useStoryStore } from '@/store/storyStore';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';
import { generateDynamicActivity } from '@/utils/aiService';
import { generateId } from '@/utils/helpers';

export default function ActivitiesScreen() {
  const router = useRouter();
  const { activities, addActivity, updateActivity } = useContentStore();
  const { stories } = useStoryStore();
  
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  
  // Sort activities by creation date (newest first)
  const sortedActivities = [...activities].sort((a, b) => b.createdAt - a.createdAt);

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'matching': return 'توصيل';
      case 'truefalse': return 'صح أو خطأ';
      case 'fillblanks': return 'ملء الفراغات';
      case 'multiplechoice': return 'اختيار من متعدد';
      default: return type;
    }
  };

  const getStoryTitle = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    return story ? story.title : 'قصة غير معروفة';
  };

  const handleRefreshActivity = async (activity: any) => {
    if (!activity || refreshingId) return;
    
    const story = stories.find(s => s.id === activity.storyId);
    if (!story) return;
    
    setRefreshingId(activity.id);
    
    try {
      const newActivityData = await generateDynamicActivity(story.content, activity.type);
      
      // Update the activity with new content
      updateActivity(activity.id, {
        content: newActivityData
      });
    } catch (error) {
      console.error('Error refreshing activity:', error);
    } finally {
      setRefreshingId(null);
    }
  };

  const renderActivityItem = ({ item }: { item: any }) => (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <View style={styles.activityBadge}>
          <Text style={styles.activityBadgeText}>{getActivityTypeLabel(item.type)}</Text>
        </View>
      </View>
      
      <Text style={styles.storyTitle}>
        <BookOpen size={14} color={Colors.gray[600]} /> {getStoryTitle(item.storyId)}
      </Text>
      
      <View style={styles.activityActions}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => router.push(`/activity/${item.id}`)}
        >
          <Text style={styles.viewButtonText}>فتح النشاط</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.refreshButton, refreshingId === item.id && styles.refreshingButton]}
          onPress={() => handleRefreshActivity(item)}
          disabled={refreshingId === item.id}
        >
          {refreshingId === item.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <RefreshCw size={14} color={Colors.primary} />
              <Text style={styles.refreshButtonText}>تجديد</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.heading}>الأنشطة التعليمية</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>جاري تحميل الأنشطة...</Text>
          </View>
        ) : sortedActivities.length === 0 ? (
          <EmptyState
            title="لا توجد أنشطة بعد"
            message="قم بإنشاء نشاط جديد من صفحة القصة"
            icon="activity"
          />
        ) : (
          <FlatList
            data={sortedActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.gray[100],
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
    textAlign: 'right',
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
  listContent: {
    paddingBottom: 20,
    ...(Platform.OS === 'web' ? { maxWidth: 900, alignSelf: 'center', width: '100%' } : {}),
  },
  activityCard: {
    marginBottom: 16,
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    flex: 1,
    textAlign: 'right',
  },
  activityBadge: {
    backgroundColor: Colors.primary + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  activityBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  storyTitle: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 16,
    textAlign: 'right',
  },
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  refreshingButton: {
    opacity: 0.7,
  },
  refreshButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
});