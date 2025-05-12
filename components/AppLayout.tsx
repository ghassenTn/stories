import React, { ReactNode, useEffect } from 'react';
import { View, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/context/AppContext';
import Sidebar from './Sidebar';
import Colors from '@/constants/colors';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebar } = useAppContext();
  const contentMarginAnim = React.useRef(new Animated.Value(sidebar.isOpen && !sidebar.isMobile ? 280 : 0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      Animated.timing(contentMarginAnim, {
        toValue: sidebar.isOpen && !sidebar.isMobile ? 280 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [sidebar.isOpen, sidebar.isMobile]);
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Sidebar />
      
      <Animated.View style={[
        styles.content,
        Platform.OS === 'web' ? { marginRight: contentMarginAnim } : {}
      ]}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[100],
  },
  content: {
    flex: 1,
  },
});