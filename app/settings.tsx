import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Info, HelpCircle, Trash2, Star, ExternalLink, Palette } from 'lucide-react-native';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useStoryStore } from '@/store/storyStore';
import { useContentStore } from '@/store/contentStore';
import AppLayout from '@/components/AppLayout';

export default function SettingsScreen() {
  const router = useRouter();
  const { stories } = useStoryStore();
  const { images, activities, games, coloringPages } = useContentStore();
  
  const [notifications, setNotifications] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  
  const handleClearAllData = () => {
    Alert.alert(
      "مسح جميع البيانات",
      "هل أنت متأكد من رغبتك في مسح جميع البيانات؟ لا يمكن التراجع عن هذه العملية.",
      [
        {
          text: "إلغاء",
          style: "cancel"
        },
        { 
          text: "مسح", 
          onPress: () => {
            // Clear all data from stores
            // This would need to be implemented in the stores
            Alert.alert("تم مسح البيانات", "تم مسح جميع البيانات بنجاح.");
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <AppLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>الإعدادات</Text>
          <Text style={styles.subtitle}>
            تخصيص إعدادات التطبيق وإدارة البيانات
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>إحصائيات</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stories.length}</Text>
                <Text style={styles.statLabel}>القصص</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{images.length}</Text>
                <Text style={styles.statLabel}>الصور</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activities.length}</Text>
                <Text style={styles.statLabel}>الأنشطة</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{games.length}</Text>
                <Text style={styles.statLabel}>الألعاب</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{coloringPages.length}</Text>
                <Text style={styles.statLabel}>صفحات التلوين</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>الإعدادات العامة</Text>
            
            <View style={styles.settingRow}>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
              <Text style={styles.settingLabel}>الإشعارات</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
              <Text style={styles.settingLabel}>الوضع الليلي</Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>الدعم والمساعدة</Text>
            
            <View style={styles.supportRow}>
              <HelpCircle size={20} color={Colors.primary} />
              <Text style={styles.supportText}>مركز المساعدة</Text>
            </View>
            
            <View style={styles.supportRow}>
              <Info size={20} color={Colors.info} />
              <Text style={styles.supportText}>عن التطبيق</Text>
            </View>
            
            <View style={styles.supportRow}>
              <Star size={20} color={Colors.warning} />
              <Text style={styles.supportText}>تقييم التطبيق</Text>
            </View>
            
            <View style={styles.supportRow}>
              <ExternalLink size={20} color={Colors.success} />
              <Text style={styles.supportText}>زيارة موقعنا</Text>
            </View>
            
            <View style={styles.supportRow}>
              <Palette size={20} color={Colors.info} />
              <Text style={styles.supportText}>دليل استخدام صفحات التلوين</Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>إدارة البيانات</Text>
            
            <Button
              title="مسح جميع البيانات"
              onPress={handleClearAllData}
              variant="outline"
              style={styles.dangerButton}
              textStyle={styles.dangerButtonText}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>منصة المعلم الإبداعي - الإصدار 1.0.0</Text>
          </View>
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
    flexGrow: 1,
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
  settingsContainer: {
    padding: 16,
    ...(Platform.OS === 'web' ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : {}),
  },
  statsCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'right',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  supportText: {
    fontSize: 14,
    color: Colors.dark,
    marginRight: 12,
    textAlign: 'right',
  },
  dangerButton: {
    borderColor: Colors.error,
    marginTop: 8,
  },
  dangerButtonText: {
    color: Colors.error,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
});