import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '@/types';

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
  addStory: (story: Story) => void;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  setCurrentStory: (story: Story | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      stories: [],
      currentStory: null,
      isLoading: false,
      error: null,
      addStory: (story) => set((state) => ({ 
        stories: [...state.stories, story],
        currentStory: story
      })),
      updateStory: (id, updates) => set((state) => ({
        stories: state.stories.map((story) => 
          story.id === id ? { ...story, ...updates, updatedAt: Date.now() } : story
        ),
        currentStory: state.currentStory?.id === id 
          ? { ...state.currentStory, ...updates, updatedAt: Date.now() } 
          : state.currentStory
      })),
      deleteStory: (id) => set((state) => ({
        stories: state.stories.filter((story) => story.id !== id),
        currentStory: state.currentStory?.id === id ? null : state.currentStory
      })),
      setCurrentStory: (story) => set({ currentStory: story }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'story-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);