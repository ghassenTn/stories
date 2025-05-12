import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Dimensions } from 'react-native';

type SidebarState = {
  isOpen: boolean;
  isMobile: boolean;
};

type AppContextType = {
  sidebar: SidebarState;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });
  
  const isMobile = dimensions.width < 768;
  
  const [sidebar, setSidebar] = useState<SidebarState>({
    isOpen: !isMobile,
    isMobile,
  });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const newDimensions = {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      };
      setDimensions(newDimensions);
    };

    // Set up event listener for dimension changes
    const dimensionsHandler = Dimensions.addEventListener('change', updateDimensions);

    // Additional web-specific resize handler
    if (Platform.OS === 'web') {
      window.addEventListener('resize', updateDimensions);
    }

    // Cleanup
    return () => {
      dimensionsHandler.remove();
      if (Platform.OS === 'web') {
        window.removeEventListener('resize', updateDimensions);
      }
    };
  }, []);

  // Update sidebar state when dimensions change
  useEffect(() => {
    const newIsMobile = dimensions.width < 768;
    
    setSidebar(prev => ({
      isOpen: newIsMobile ? false : prev.isOpen,
      isMobile: newIsMobile,
    }));
  }, [dimensions]);

  const toggleSidebar = () => {
    setSidebar(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  };

  const closeSidebar = () => {
    setSidebar(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const openSidebar = () => {
    setSidebar(prev => ({
      ...prev,
      isOpen: true,
    }));
  };

  return (
    <AppContext.Provider value={{ sidebar, toggleSidebar, closeSidebar, openSidebar }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}