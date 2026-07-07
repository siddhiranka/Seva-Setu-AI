import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('seva_setu_dark') === 'true';
  });
  
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('seva_setu_high_contrast') === 'true';
  });

  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('seva_setu_text_size') || 'base';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('seva_setu_dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('seva_setu_high_contrast', isHighContrast);
  }, [isHighContrast]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl', 'text-size-2xl');
    root.classList.add(`text-size-${textSize}`);
    localStorage.setItem('seva_setu_text_size', textSize);
  }, [textSize]);

  return (
    <ThemeContext.Provider value={{
      isDark,
      setIsDark,
      isHighContrast,
      setIsHighContrast,
      textSize,
      setTextSize
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
