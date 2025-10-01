import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const themes = {
  orange: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#3498db',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    name: 'Orange (Default)'
  },
  blue: {
    primary: '#3498db',
    secondary: '#2980b9',
    accent: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#17a2b8',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    name: 'Blue'
  },
  green: {
    primary: '#27ae60',
    secondary: '#2ecc71',
    accent: '#e74c3c',
    success: '#16a085',
    warning: '#f39c12',
    info: '#3498db',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    name: 'Green'
  },
  purple: {
    primary: '#9b59b6',
    secondary: '#8e44ad',
    accent: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#3498db',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    name: 'Purple'
  },
  dark: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    accent: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#3498db',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#404040',
    name: 'Dark Mode'
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
    
    // Core theme colors
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--success-color', theme.success);
    root.style.setProperty('--warning-color', theme.warning);
    root.style.setProperty('--info-color', theme.info);
    
    // Background and surface colors
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--surface-color', theme.surface);
    
    // Text colors
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--text-secondary-color', theme.textSecondary);
    
    // Border color
    root.style.setProperty('--border-color', theme.border);
    
    // Set body background
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
    
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