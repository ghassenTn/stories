export interface Story {
  id: string;
  title: string;
  content: string;
  heroName: string;
  topic: string;
  ageGroup: string;
  createdAt: number;
  updatedAt: number;
}

export interface Image {
  id: string;
  storyId: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  storyId: string;
  title: string;
  type: 'matching' | 'truefalse' | 'fillblanks' | 'multiplechoice';
  content: {
    title?: string;
    instructions?: string;
    pairs?: Array<{id: number; left: string; right: string}>;
    questions?: Array<{id: number; text: string; answer: boolean | string; options?: string[]}>;
    sentences?: Array<{id: number; text: string; answer: string; options?: string[]}>;
  };
  createdAt: number;
}

export interface Game {
  id: string;
  storyId: string;
  title: string;
  type: 'memory' | 'ordering' | 'quiz';
  content: any; // Structure depends on game type
  createdAt: number;
}

export interface ColoringPage {
  id: string;
  storyId: string;
  imageId: string;
  title: string;
  outlineUrl: string;
  originalUrl: string;
  createdAt: number;
}