import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform,
  Image as RNImage
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Edit, Trash2, PlusCircle, Play, Palette } from 'lucide-react-native';
import { useStoryStore } from '@/store/storyStore';
import { useContentStore } from '@/store/contentStore';
import { formatDate } from '@/utils/helpers';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { stories, deleteStory } = useStoryStore();
  const { getStoryContent } = useContentStore();
  
  const story = stories.find(s => s.id === id);
  
  if (!story) {
    return (
      <AppLayout>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>القصة غير موجودة</Text>
          <Button 
            title="العودة إلى القصص" 
            onPress={() => router.push('/')}
            style={styles.backButton}
          />
        </View>
      </AppLayout>
    );
  }
  
  const { images, activities, games, coloringPages } = getStoryContent(id);

  const handleEditStory = () => {
    router.push(`/story/edit/${id}`);
  };

  const handleDeleteStory = () => {
    Alert.alert(
      "حذف القصة",
      "هل أنت متأكد من رغبتك في حذف هذه القصة؟ سيتم حذف جميع الصور والأنشطة المرتبطة بها.",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        { 
          text: "حذف", 
          onPress: () => {
            deleteStory(id);
            router.push('/');
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleCreateImage = () => {
    router.push(`/image/create/${id}`);
  };

  const handleCreateActivity = () => {
    router.push(`/activity/create/${id}`);
  };

  const handleCreateGame = () => {
    router.push(`/game/create/${id}`);
  };

  const handleCreateColoringPage = (imageId: string) => {
    router.push(`/coloring/create/${imageId}`);
  };

  const handleViewActivity = (activityId: string) => {
    router.push(`/activity/${activityId}`);
  };

  const handleViewGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const handleViewColoringPage = (coloringId: string) => {
    router.push(`/coloring/${coloringId}`);
  };

  return (
    <AppLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{story.title}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={handleEditStory}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit size={20} color={Colors.info} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleDeleteStory}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>البطل: {story.heroName}</Text>
          <Text style={styles.meta}>الموضوع: {story.topic}</Text>
          <Text style={styles.meta}>الفئة العمرية: {story.ageGroup}</Text>
          <Text style={styles.meta}>تاريخ الإنشاء: {formatDate(story.createdAt)}</Text>
        </View>
        
        <Card style={styles.contentCard}>
          <Text style={styles.contentTitle}>محتوى القصة</Text>
          <Text style={styles.contentText}>{story.content}</Text>
        </Card>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الصور</Text>
            <TouchableOpacity onPress={handleCreateImage}>
              <PlusCircle size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {images.map(image => (
                <View key={image.id} style={styles.imageCard}>
                  <RNImage 
                    source={{ uri: image.url }} 
                    style={styles.imagePreview}
                  />
                  <Text style={styles.imagePrompt} numberOfLines={2}>
                    {image.prompt}
                  </Text>
                  <TouchableOpacity 
                    style={styles.coloringButton}
                    onPress={() => handleCreateColoringPage(image.id)}
                  >
                    <Palette size={16} color={Colors.white} />
                    <Text style={styles.coloringButtonText}>صفحة تلوين</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>لا توجد صور بعد</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>صفحات التلوين</Text>
          </View>
          
          {coloringPages.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {coloringPages.map(page => (
                <TouchableOpacity 
                  key={page.id} 
                  style={styles.imageCard}
                  onPress={() => handleViewColoringPage(page.id)}
                >
                  <RNImage 
                    source={{ uri: page.outlineUrl }} 
                    style={styles.imagePreview}
                  />
                  <Text style={styles.imagePrompt} numberOfLines={2}>
                    {page.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>لا توجد صفحات تلوين بعد</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الأنشطة</Text>
            <TouchableOpacity onPress={handleCreateActivity}>
              <PlusCircle size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {activities.length > 0 ? (
            <View style={styles.activitiesContainer}>
              {activities.map(activity => (
                <TouchableOpacity 
                  key={activity.id} 
                  onPress={() => handleViewActivity(activity.id)}
                  activeOpacity={0.8}
                >
                  <Card style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Play size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.activityType}>
                      النوع: {
                        activity.type === 'matching' ? 'توصيل' :
                        activity.type === 'truefalse' ? 'صح أو خطأ' :
                        activity.type === 'fillblanks' ? 'املأ الفراغ' :
                        'اختيار من متعدد'
                      }
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>لا توجد أنشطة بعد</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الألعاب</Text>
            <TouchableOpacity onPress={handleCreateGame}>
              <PlusCircle size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {games.length > 0 ? (
            <View style={styles.activitiesContainer}>
              {games.map(game => (
                <TouchableOpacity 
                  key={game.id} 
                  onPress={() => handleViewGame(game.id)}
                  activeOpacity={0.8}
                >
                  <Card style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{game.title}</Text>
                      <Play size={18} color={Colors.info} />
                    </View>
                    <Text style={styles.activityType}>
                      النوع: {
                        game.type === 'memory' ? 'لعبة الذاكرة' :
                        game.type === 'ordering' ? 'ترتيب الأحداث' :
                        'اختبار معلومات'
                      }
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>لا توجد ألعاب بعد</Text>
          )}
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  metaContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  meta: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 8,
    textAlign: 'right',
  },
  contentCard: {
    marginBottom: 24,
    padding: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  contentText: {
    fontSize: 16,
    color: Colors.gray[800],
    lineHeight: 24,
    textAlign: 'right',
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  imageCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePreview: {
    width: 180,
    height: 180,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  imagePrompt: {
    fontSize: 12,
    color: Colors.gray[700],
    padding: 8,
    textAlign: 'right',
  },
  coloringButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  coloringButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    padding: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  activityType: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
});