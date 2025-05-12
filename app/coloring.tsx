import React from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Palette, Download } from 'lucide-react-native';
import { useContentStore } from '@/store/contentStore';
import { useStoryStore } from '@/store/storyStore';
import { downloadColoringPage } from '@/utils/coloringService';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/Card';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';

export default function ColoringPagesScreen() {
  const router = useRouter();
  const { coloringPages } = useContentStore();
  const { stories } = useStoryStore();

  // Get story titles for each coloring page
  const pagesWithStoryTitles = coloringPages.map(page => {
    const story = stories.find(s => s.id === page.storyId);
    return {
      ...page,
      storyTitle: story ? story.title : 'قصة غير معروفة'
    };
  });

  const handleViewColoringPage = (id: string) => {
    router.push(`/coloring/${id}`);
  };

  const handleDownload = async (page: any) => {
    await downloadColoringPage(page);
  };

  const renderContent = () => {
    if (coloringPages.length === 0) {
      return (
        <EmptyState
          title="لا توجد صفحات تلوين بعد"
          description="قم بإنشاء قصة أولاً ثم أضف صوراً وصفحات تلوين لها"
          buttonTitle="الذهاب إلى القصص"
          onButtonPress={() => router.push('/')}
          icon={<Palette size={48} color={Colors.primary} />}
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>صفحات التلوين</Text>
          <Text style={styles.subtitle}>
            صفحات تلوين مستوحاة من القصص التعليمية
          </Text>
        </View>

        <FlatList
          data={pagesWithStoryTitles.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={(item) => item.id}
          numColumns={Platform.OS === 'web' ? 3 : 2}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.coloringCard, Platform.OS === 'web' && styles.webColoringCard]}
              onPress={() => handleViewColoringPage(item.id)}
              activeOpacity={0.8}
            >
              <Card style={styles.card}>
                <Image 
                  source={{ uri: item.outlineUrl }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
                <View style={styles.coloringInfo}>
                  <Text style={styles.coloringTitle}>{item.title}</Text>
                  <Text style={styles.storyTitle}>القصة: {item.storyTitle}</Text>
                  
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => handleDownload(item)}
                  >
                    <Download size={14} color={Colors.primary} />
                    <Text style={styles.downloadText}>تحميل</Text>
                  </TouchableOpacity>
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
  coloringCard: {
    width: '50%',
    padding: 8,
  },
  webColoringCard: {
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
  coloringInfo: {
    padding: 12,
  },
  coloringTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
    textAlign: 'right',
  },
  storyTitle: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: 8,
    textAlign: 'right',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignSelf: 'flex-end',
    gap: 4,
  },
  downloadText: {
    fontSize: 12,
    color: Colors.primary,
  },
});