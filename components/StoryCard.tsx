import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Book, Edit, Trash2 } from 'lucide-react-native';
import { Story } from '@/types';
import { formatDate, truncateText } from '@/utils/helpers';
import Colors from '@/constants/colors';
import Card from './Card';

interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/story/${story.id}`);
  };

  const handleEdit = () => {
    router.push(`/story/edit/${story.id}`);
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title}>{story.title}</Text>
          <View style={styles.iconContainer}>
            <Book size={18} color={Colors.primary} />
          </View>
        </View>
        
        <View style={styles.metaContainer}>
          <Text style={styles.meta}>البطل: {story.heroName}</Text>
          <Text style={styles.meta}>الفئة العمرية: {story.ageGroup}</Text>
        </View>
        
        <Text style={styles.content}>{truncateText(story.content, 150)}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(story.createdAt)}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit size={18} color={Colors.info} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onDelete(story.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    textAlign: 'right',
    flex: 1,
  },
  iconContainer: {
    marginLeft: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
    gap: 12,
  },
  meta: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'right',
  },
  content: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 12,
    lineHeight: 20,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
});