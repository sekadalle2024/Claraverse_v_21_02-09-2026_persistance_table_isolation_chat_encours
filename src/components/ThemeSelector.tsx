/**
 * Theme Selector Component
 * Permet de basculer entre les thèmes : noir, rose (sakura), gris (Grok-style), et blanc
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { 
  getCurrentTheme, 
  getDarkMode, 
  applyTheme, 
  toggleDarkMode,
  getThemeInfo,
  type ThemeType 
} from '../utils/themeManager';

interface ThemeSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(getCurrentTheme());
  const [darkMode, setDarkMode] = useState(getDarkMode());
  const [isOpen, setIsOpen] = useState(false);

  // Écouter les changements de thème
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
      setDarkMode(event.detail.darkMode);
    };

    window.addEventListener('theme-changed', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange as EventListener);
    };
  }, []);

  const handleThemeChange = (theme: ThemeType) => {
    applyTheme(theme, darkMode);
    setCurrentTheme(theme);
    setIsOpen(false);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = toggleDarkMode();
    setDarkMode(newDarkMode);
  };

  const themes: ThemeType[] = ['sakura', 'gray', 'white', 'dark'];
  const currentThemeInfo = getThemeInfo(currentTheme);

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors border border-gray-200 dark:border-gray-700"
        title="Changer de thème"
      >
        <Palette className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentThemeInfo.name}
          </span>
        )}
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-2 right-0 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* En-tête */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Choisir un thème
              </h3>
            </div>

            {/* Liste des thèmes */}
            <div className="py-2">
              {themes.map((theme) => {
                const themeInfo = getThemeInfo(theme);
                const isActive = theme === currentTheme;
                
                return (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    {/* Icône du thème */}
                    <span className="text-2xl">{themeInfo.icon}</span>
                    
                    {/* Informations du thème */}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {themeInfo.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {themeInfo.description}
                      </div>
                    </div>
                    
                    {/* Indicateur de sélection */}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Toggle mode sombre */}
            <div className="px-4 py-3">
              <button
                onClick={handleDarkModeToggle}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {darkMode ? (
                    <Moon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Sun className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mode sombre
                  </span>
                </div>
                
                {/* Toggle switch */}
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;
