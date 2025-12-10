import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Lire uniquement depuis localStorage, pas de préférence système
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        return saved as Theme;
      }
    } catch (e) {
      // Ignorer les erreurs
    }
    return 'light'; // Toujours 'light' par défaut
  });

  // Appliquer le thème au chargement et à chaque changement
  useEffect(() => {
    const root = document.documentElement;
    
    // Retirer complètement la classe dark
    root.classList.remove('dark');
    
    // Ajouter seulement si nécessaire
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Sauvegarder
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // Ignorer
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      
      // Appliquer immédiatement au DOM
      const root = document.documentElement;
      root.classList.remove('dark');
      
      if (newTheme === 'dark') {
        root.classList.add('dark');
      }
      
      // Sauvegarder immédiatement
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        // Ignorer si localStorage non disponible
      }
      
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
