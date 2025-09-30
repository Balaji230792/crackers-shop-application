import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themes = {
  orange: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#e74c3c',
    success: '#27ae60',
    name: 'Orange (Default)'
  },
  blue: {
    primary: '#3498db',
    secondary: '#2980b9',
    accent: '#e74c3c',
    success: '#27ae60',
    name: 'Blue'
  },
  green: {
    primary: '#27ae60',
    secondary: '#2ecc71',
    accent: '#e74c3c',
    success: '#16a085',
    name: 'Green'
  },
  purple: {
    primary: '#9b59b6',
    secondary: '#8e44ad',
    accent: '#e74c3c',
    success: '#27ae60',
    name: 'Purple'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('orange');

  useEffect(() => {
    const savedTheme = localStorage.getItem('mahin-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--success-color', theme.success);
    
    localStorage.setItem('mahin-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      changeTheme, 
      themes, 
      theme: themes[currentTheme] 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};