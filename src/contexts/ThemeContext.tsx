import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  sidebarColor: string;
  toggleDarkMode: () => void;
  setSidebarColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const sidebarColors = {
  purple: 'from-purple-600 to-pink-600',
  blue: 'from-blue-600 to-cyan-600',
  green: 'from-green-600 to-emerald-600',
  orange: 'from-orange-600 to-red-600',
  pink: 'from-pink-600 to-rose-600',
  indigo: 'from-indigo-600 to-purple-600',
  teal: 'from-teal-600 to-blue-600',
  emerald: 'from-emerald-600 to-green-600',
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [sidebarColor, setSidebarColor] = useState(() => {
    const saved = localStorage.getItem('sidebarColor');
    return saved || 'purple';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sidebarColor', sidebarColor);
  }, [sidebarColor]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        sidebarColor,
        toggleDarkMode,
        setSidebarColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
