import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Download, RefreshCw, Palette } from 'lucide-react-native';
import { useContentStore } from '@/store/contentStore';
import { useStoryStore } from '@/store/storyStore';
import { downloadColoringPage } from '@/utils/coloringService';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import AppLayout from '@/components/AppLayout';

// For web only - Canvas coloring component
const ColoringCanvas = ({ imageUrl, width, height }: { imageUrl: string, width: number, height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Available colors for coloring
  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#A52A2A', // Brown
  ];

  useEffect(() => {
    if (!canvasRef.current || Platform.OS !== 'web') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Load the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setIsImageLoaded(true);
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!canvasRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (!canvasRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Reload the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const handleDownload = () => {
    if (!canvasRef.current || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    
    // Create a download link
    const link = document.createElement('a');
    link.download = 'coloring-page.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.canvasContainer}>
      <View style={styles.colorPalette}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorOption,
              { backgroundColor: c },
              color === c && styles.selectedColor,
            ]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>
      
      <View style={styles.brushSizeContainer}>
        <Text style={styles.brushSizeLabel}>حجم الفرشاة:</Text>
        <View style={styles.brushSizeOptions}>
          <TouchableOpacity
            style={[styles.brushOption, brushSize === 2 && styles.selectedBrush]}
            onPress={() => setBrushSize(2)}
          >
            <View style={[styles.brushPreview, { width: 2, height: 2 }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.brushOption, brushSize === 5 && styles.selectedBrush]}
            onPress={() => setBrushSize(5)}
          >
            <View style={[styles.brushPreview, { width: 5, height: 5 }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.brushOption, brushSize === 10 && styles.selectedBrush]}
            onPress={() => setBrushSize(10)}
          >
            <View style={[styles.brushPreview, { width: 10, height: 10 }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.brushOption, brushSize === 15 && styles.selectedBrush]}
            onPress={() => setBrushSize(15)}
          >
            <View style={[styles.brushPreview, { width: 15, height: 15 }]} />
          </TouchableOpacity>
        </View>
      </View>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          cursor: 'crosshair',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <View style={styles.canvasActions}>
        <Button
          title="مسح"
          onPress={handleClear}
          variant="outline"
          style={styles.canvasButton}
        />
        <Button
          title="تحميل"
          onPress={handleDownload}
          style={styles.canvasButton}
        />
      </View>
    </View>
  );
};

export default function ColoringPageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { coloringPages } = useContentStore();
  const { stories } = useStoryStore();
  
  const [coloringPage, setColoringPage] = useState<any>(null);
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      const foundPage = coloringPages.find(p => p.id === id);
      
      if (foundPage) {
        setColoringPage(foundPage);
        
        const relatedStory = stories.find(s => s.id === foundPage.storyId);
        if (relatedStory) {
          setStory(relatedStory);
        }
      }
      
      setLoading(false);
    }
  }, [id, coloringPages, stories]);

  const handleDownload = async () => {
    if (!coloringPage) return;
    
    setIsDownloading(true);
    
    try {
      const success = await downloadColoringPage(coloringPage);
      
      if (success) {
        Alert.alert(
          "تم التحميل",
          "تم تحميل صفحة التلوين بنجاح."
        );
      } else {
        Alert.alert(
          "خطأ في التحميل",
          "حدث خطأ أثناء تحميل صفحة التلوين. يرجى المحاولة مرة أخرى."
        );
      }
    } catch (error) {
      console.error('Error downloading coloring page:', error);
      Alert.alert(
        "خطأ في التحميل",
        "حدث خطأ أثناء تحميل صفحة التلوين. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل صفحة التلوين...</Text>
        </View>
      </AppLayout>
    );
  }

  if (!coloringPage) {
    return (
      <AppLayout>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>صفحة التلوين غير موجودة</Text>
          <Button 
            title="العودة إلى صفحات التلوين" 
            onPress={() => router.push('/coloring')}
            style={styles.backButton}
          />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{coloringPage.title}</Text>
          {story && (
            <TouchableOpacity 
              style={styles.storyLink}
              onPress={() => router.push(`/story/${story.id}`)}
            >
              <Text style={styles.storyLinkText}>العودة إلى القصة</Text>
              <ArrowRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.coloringContainer}>
          {Platform.OS === 'web' ? (
            <ColoringCanvas 
              imageUrl={coloringPage.outlineUrl} 
              width={600} 
              height={400} 
            />
          ) : (
            <View style={styles.mobileColoringContainer}>
              <Image
                source={{ uri: coloringPage.outlineUrl }}
                style={styles.coloringImage}
                resizeMode="contain"
              />
              
              <View style={styles.mobileInstructions}>
                <Palette size={24} color={Colors.primary} />
                <Text style={styles.mobileInstructionsText}>
                  يمكنك تحميل صفحة التلوين وطباعتها للتلوين اليدوي
                </Text>
              </View>
              
              <Button
                title="تحميل صفحة التلوين"
                onPress={handleDownload}
                loading={isDownloading}
                style={styles.downloadButton}
                icon={<Download size={16} color={Colors.white} />}
              />
            </View>
          )}
        </View>
        
        {Platform.OS === 'web' && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>تعليمات التلوين:</Text>
            <Text style={styles.instructionsText}>
              1. اختر لونًا من لوحة الألوان أعلى الصفحة
            </Text>
            <Text style={styles.instructionsText}>
              2. اختر حجم الفرشاة المناسب
            </Text>
            <Text style={styles.instructionsText}>
              3. قم بالتلوين داخل الصورة باستخدام الماوس
            </Text>
            <Text style={styles.instructionsText}>
              4. يمكنك مسح التلوين والبدء من جديد باستخدام زر "مسح"
            </Text>
            <Text style={styles.instructionsText}>
              5. عند الانتهاء، يمكنك تحميل الصورة باستخدام زر "تحميل"
            </Text>
          </View>
        )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    flex: 1,
    textAlign: 'right',
  },
  storyLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyLinkText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  coloringContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  canvasContainer: {
    width: '100%',
    alignItems: 'center',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  brushSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brushSizeLabel: {
    fontSize: 14,
    color: Colors.dark,
    marginRight: 8,
  },
  brushSizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  brushOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  selectedBrush: {
    borderColor: Colors.primary,
    backgroundColor: Colors.gray[100],
  },
  brushPreview: {
    backgroundColor: Colors.dark,
    borderRadius: 50,
  },
  canvasActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  canvasButton: {
    minWidth: 120,
  },
  mobileColoringContainer: {
    width: '100%',
    alignItems: 'center',
  },
  coloringImage: {
    width: '100%',
    height: 400,
    marginBottom: 16,
  },
  mobileInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  mobileInstructionsText: {
    fontSize: 14,
    color: Colors.gray[700],
    flex: 1,
    textAlign: 'right',
  },
  downloadButton: {
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructions: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'right',
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 8,
    textAlign: 'right',
  },
});