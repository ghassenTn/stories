import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, Activity, Game, ColoringPage } from '@/types';

interface ContentState {
  images: Image[];
  activities: Activity[];
  games: Game[];
  coloringPages: ColoringPage[];
  addImage: (image: Image) => void;
  addActivity: (activity: Activity) => void;
  addGame: (game: Game) => void;
  addColoringPage: (page: ColoringPage) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteImage: (id: string) => void;
  deleteActivity: (id: string) => void;
  deleteGame: (id: string) => void;
  deleteColoringPage: (id: string) => void;
  getStoryContent: (storyId: string) => {
    images: Image[];
    activities: Activity[];
    games: Game[];
    coloringPages: ColoringPage[];
  };
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      images: [],
      activities: [],
      games: [],
      coloringPages: [],
      addImage: (image) => set((state) => ({ 
        images: [...state.images, image] 
      })),
      addActivity: (activity) => set((state) => ({ 
        activities: [...state.activities, activity] 
      })),
      addGame: (game) => set((state) => ({ 
        games: [...state.games, game] 
      })),
      addColoringPage: (page) => set((state) => ({ 
        coloringPages: [...state.coloringPages, page] 
      })),
      updateActivity: (id, data) => set((state) => ({
        activities: state.activities.map(activity => 
          activity.id === id ? { ...activity, ...data } : activity
        )
      })),
      deleteImage: (id) => set((state) => ({
        images: state.images.filter((img) => img.id !== id),
        coloringPages: state.coloringPages.filter((page) => page.imageId !== id)
      })),
      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter((activity) => activity.id !== id)
      })),
      deleteGame: (id) => set((state) => ({
        games: state.games.filter((game) => game.id !== id)
      })),
      deleteColoringPage: (id) => set((state) => ({
        coloringPages: state.coloringPages.filter((page) => page.id !== id)
      })),
      getStoryContent: (storyId) => {
        const state = get();
        return {
          images: state.images.filter((img) => img.storyId === storyId),
          activities: state.activities.filter((activity) => activity.storyId === storyId),
          games: state.games.filter((game) => game.storyId === storyId),
          coloringPages: state.coloringPages.filter((page) => page.storyId === storyId),
        };
      },
    }),
    {
      name: 'content-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);