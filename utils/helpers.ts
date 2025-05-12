import Colors from '@/constants/colors';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export const ageGroups = [
  { label: '3-5 سنوات', value: '3-5' },
  { label: '6-8 سنوات', value: '6-8' },
  { label: '9-11 سنة', value: '9-11' },
  { label: '12-14 سنة', value: '12-14' },
];

export const activityTypes = [
  { label: 'توصيل', value: 'matching' },
  { label: 'صح أو خطأ', value: 'truefalse' },
  { label: 'املأ الفراغ', value: 'fillblanks' },
  { label: 'اختيار من متعدد', value: 'multiplechoice' },
];

export const gameTypes = [
  { 
    label: 'لعبة الذاكرة', 
    value: 'memory',
    description: 'لعبة تساعد على تقوية الذاكرة من خلال البحث عن الأزواج المتطابقة من البطاقات. مناسبة لجميع الأعمار وتساعد على تحسين التركيز.',
    iconName: 'Brain'
  },
  { 
    label: 'ترتيب الأحداث', 
    value: 'ordering',
    description: 'لعبة تتطلب ترتيب أحداث القصة بشكل صحيح حسب تسلسلها الزمني. تساعد على فهم تسلسل الأحداث وتطوير مهارات التفكير المنطقي.',
    iconName: 'ListOrdered'
  },
  { 
    label: 'اختبار معلومات', 
    value: 'quiz',
    description: 'اختبار يتضمن أسئلة متنوعة حول القصة لقياس مدى فهم الطفل للمحتوى. يساعد على تعزيز المعلومات وتقييم الفهم.',
    iconName: 'HelpCircle'
  },
];