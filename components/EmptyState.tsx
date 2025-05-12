import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  buttonTitle,
  onButtonPress,
  icon,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <BookOpen size={48} color={Colors.primary} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 150,
  },
});