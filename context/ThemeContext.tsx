
import React, { createContext, useContext, useState, useEffect } from 'react';

// Expanded Theme Types
export type Theme = 'dark' | 'light' | 'iabooks' | 'wood' | 'water' | 'forest' | 'ocean' | 'universe';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage for saved theme
    const saved = localStorage.getItem('iabooks_theme');
    // Validate if saved theme is one of the valid types, else default to dark
    const validThemes = ['dark', 'light', 'iabooks', 'wood', 'water', 'forest', 'ocean', 'universe'];
    return validThemes.includes(saved as string) ? (saved as Theme) : 'dark';
  });

  useEffect(() => {
    // Persist to storage
    localStorage.setItem('iabooks_theme', theme);
    
    // Update data-theme attribute on body for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    // Handle Tailwind dark mode class logic
    // 'light' and 'water' are generally light modes, others are dark
    if (theme === 'light' || theme === 'water') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
