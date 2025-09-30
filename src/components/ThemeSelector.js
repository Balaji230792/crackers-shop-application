import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeSelector() {
  const { currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="theme-selector">
      <button 
        className="theme-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        🎨
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          <h4>Choose Theme</h4>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className={`theme-option ${currentTheme === key ? 'active' : ''}`}
              onClick={() => {
                changeTheme(key);
                setIsOpen(false);
              }}
              style={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
              }}
            >
              <span className="theme-name">{theme.name}</span>
              {currentTheme === key && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;