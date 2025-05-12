import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nManager, Platform, StatusBar } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import Colors from "@/constants/colors";
import { AppProvider } from "@/context/AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Force RTL layout for Arabic
I18nManager.forceRTL(true);

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "رجوع",
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
        contentStyle: {
          backgroundColor: Colors.gray[100],
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="story/[id]" 
        options={{ 
          title: "تفاصيل القصة",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="story/edit/[id]" 
        options={{ 
          title: "تعديل القصة",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="story/create" 
        options={{ 
          title: "إنشاء قصة جديدة",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="activity/create/[storyId]" 
        options={{ 
          title: "إنشاء نشاط جديد",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="image/create/[storyId]" 
        options={{ 
          title: "إنشاء صورة",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="coloring/create/[imageId]" 
        options={{ 
          title: "إنشاء صفحة تلوين",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="coloring/[id]" 
        options={{ 
          title: "صفحة التلوين",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="game/create/[storyId]" 
        options={{ 
          title: "إنشاء لعبة",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "الإعدادات",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="images" 
        options={{ 
          title: "مكتبة الصور",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="activities" 
        options={{ 
          title: "الأنشطة والألعاب",
          headerBackTitle: "رجوع",
        }} 
      />
      <Stack.Screen 
        name="coloring" 
        options={{ 
          title: "صفحات التلوين",
          headerBackTitle: "رجوع",
        }} 
      />
    </Stack>
  );
}