import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BookOpen, Image, Gamepad2, Settings, Menu, X, Home, PlusCircle, Palette } from 'lucide-react-native';
import { useAppContext } from '@/context/AppContext';
import Colors from '@/constants/colors';
import { useStoryStore } from '@/store/storyStore';
import { truncateText } from '@/utils/helpers';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebar, toggleSidebar, closeSidebar } = useAppContext();
  const { stories } = useStoryStore();
  const slideAnim = React.useRef(new Animated.Value(sidebar.isOpen ? 0 : -280)).current;
  const fadeAnim = React.useRef(new Animated.Value(sidebar.isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: sidebar.isOpen ? 0 : -280,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: sidebar.isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebar.isOpen]);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (sidebar.isMobile) {
      closeSidebar();
    }
  };

  if (!sidebar.isOpen && !sidebar.isMobile) {
    return (
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={toggleSidebar}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Menu size={24} color={Colors.primary} />
      </TouchableOpacity>
    );
  }

  return (
    <>
      {sidebar.isMobile && sidebar.isOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <Animated.View style={[styles.overlayInner, { opacity: fadeAnim }]} />
        </TouchableOpacity>
      )}
      
      <Animated.View 
        style={[
          styles.container,
          sidebar.isMobile ? styles.mobileContainer : {},
          { right: slideAnim }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>منصة المعلم الإبداعي</Text>
          <TouchableOpacity 
            onPress={toggleSidebar}
            style={styles.closeButton}
          >
            <X size={20} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.createButtonContainer}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => handleNavigation('/story/create')}
          >
            <PlusCircle size={18} color={Colors.white} />
            <Text style={styles.createButtonText}>إنشاء قصة جديدة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navSection}>
          <Text style={styles.navSectionTitle}>القائمة الرئيسية</Text>
          
          <TouchableOpacity 
            style={[styles.navItem, isActive('/') && styles.activeNavItem]} 
            onPress={() => handleNavigation('/')}
          >
            <Text style={[styles.navText, isActive('/') && styles.activeNavText]}>الرئيسية</Text>
            <Home size={20} color={isActive('/') ? Colors.primary : Colors.gray[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, isActive('/images') && styles.activeNavItem]} 
            onPress={() => handleNavigation('/images')}
          >
            <Text style={[styles.navText, isActive('/images') && styles.activeNavText]}>مكتبة الصور</Text>
            <Image size={20} color={isActive('/images') ? Colors.primary : Colors.gray[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, isActive('/activities') && styles.activeNavItem]} 
            onPress={() => handleNavigation('/activities')}
          >
            <Text style={[styles.navText, isActive('/activities') && styles.activeNavText]}>الأنشطة والألعاب</Text>
            <Gamepad2 size={20} color={isActive('/activities') ? Colors.primary : Colors.gray[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, isActive('/coloring') && styles.activeNavItem]} 
            onPress={() => handleNavigation('/coloring')}
          >
            <Text style={[styles.navText, isActive('/coloring') && styles.activeNavText]}>صفحات التلوين</Text>
            <Palette size={20} color={isActive('/coloring') ? Colors.primary : Colors.gray[600]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, isActive('/settings') && styles.activeNavItem]} 
            onPress={() => handleNavigation('/settings')}
          >
            <Text style={[styles.navText, isActive('/settings') && styles.activeNavText]}>الإعدادات</Text>
            <Settings size={20} color={isActive('/settings') ? Colors.primary : Colors.gray[600]} />
          </TouchableOpacity>
        </View>

        {stories.length > 0 && (
          <View style={styles.storiesSection}>
            <Text style={styles.navSectionTitle}>القصص الأخيرة</Text>
            <ScrollView style={styles.storiesList}>
              {stories
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5)
                .map(story => (
                  <TouchableOpacity 
                    key={story.id}
                    style={[
                      styles.storyItem, 
                      isActive(`/story/${story.id}`) && styles.activeNavItem
                    ]} 
                    onPress={() => handleNavigation(`/story/${story.id}`)}
                  >
                    <Text 
                      style={[
                        styles.storyTitle, 
                        isActive(`/story/${story.id}`) && styles.activeNavText
                      ]}
                      numberOfLines={1}
                    >
                      {truncateText(story.title, 20)}
                    </Text>
                    <BookOpen 
                      size={16} 
                      color={isActive(`/story/${story.id}`) ? Colors.primary : Colors.gray[600]} 
                    />
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>الإصدار 1.0.0</Text>
        </View>
      </Animated.View>
      
      {!sidebar.isOpen && (
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Menu size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: '100%',
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.gray[200],
    paddingVertical: 20,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' ? { 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 1000,
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    } : {}),
  },
  mobileContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    shadowColor: Colors.black,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  toggleButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  closeButton: {
    padding: 4,
    borderRadius: 4,
  },
  createButtonContainer: {
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  navSection: {
    marginBottom: 24,
  },
  navSectionTitle: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 12,
    textAlign: 'right',
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeNavItem: {
    backgroundColor: Colors.gray[100],
  },
  navText: {
    fontSize: 14,
    color: Colors.gray[700],
    marginRight: 12,
  },
  activeNavText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  storiesSection: {
    marginBottom: 24,
    flex: 1,
  },
  storiesList: {
    maxHeight: 200,
  },
  storyItem: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 12,
    color: Colors.gray[700],
    marginRight: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
});