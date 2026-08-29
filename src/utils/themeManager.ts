/**
 * Theme Manager pour E-audit
 * Gère les thèmes : noir, rose (sakura), gris (Grok-style), et blanc
 */

export type ThemeType = 'dark' | 'sakura' | 'gray' | 'white';

const THEME_STORAGE_KEY = 'e-audit-theme';
const DARK_MODE_STORAGE_KEY = 'e-audit-dark-mode';

/**
 * Obtenir le thème actuel depuis le localStorage
 */
export const getCurrentTheme = (): ThemeType => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'sakura' || savedTheme === 'gray' || savedTheme === 'white') {
    return savedTheme;
  }
  return 'gray'; // Thème par défaut
};

/**
 * Obtenir le mode sombre actuel
 */
export const getDarkMode = (): boolean => {
  const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  // Only return true if explicitly set to 'true', otherwise default to false (light mode)
  return savedDarkMode === 'true';
};

/**
 * Appliquer un thème
 */
export const applyTheme = (theme: ThemeType, darkMode: boolean = false) => {
  const root = document.documentElement;
  
  // Retirer tous les thèmes existants
  root.classList.remove('theme-dark', 'theme-sakura', 'theme-gray', 'theme-white');
  root.classList.remove('dark');
  
  // Appliquer le mode sombre si nécessaire
  if (darkMode) {
    root.classList.add('dark');
  }
  
  // Appliquer le thème
  switch (theme) {
    case 'dark':
      root.classList.add('theme-dark', 'dark');
      break;
    case 'sakura':
      root.classList.add('theme-sakura');
      break;
    case 'gray':
      root.classList.add('theme-gray');
      break;
    case 'white':
      root.classList.add('theme-white');
      break;
  }
  
  // Sauvegarder dans le localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  localStorage.setItem(DARK_MODE_STORAGE_KEY, darkMode.toString());
  
  // Émettre un événement pour notifier les composants
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { theme, darkMode } 
  }));
};

/**
 * Basculer entre les thèmes
 */
export const cycleTheme = () => {
  const currentTheme = getCurrentTheme();
  const darkMode = getDarkMode();
  
  let nextTheme: ThemeType;
  switch (currentTheme) {
    case 'sakura':
      nextTheme = 'gray';
      break;
    case 'gray':
      nextTheme = 'white';
      break;
    case 'white':
      nextTheme = 'dark';
      break;
    case 'dark':
      nextTheme = 'sakura';
      break;
    default:
      nextTheme = 'sakura';
  }
  
  applyTheme(nextTheme, darkMode);
  return nextTheme;
};

/**
 * Basculer le mode sombre
 */
export const toggleDarkMode = () => {
  const currentTheme = getCurrentTheme();
  const currentDarkMode = getDarkMode();
  const newDarkMode = !currentDarkMode;
  
  applyTheme(currentTheme, newDarkMode);
  return newDarkMode;
};

/**
 * Initialiser le thème au chargement de l'application
 */
export const initializeTheme = () => {
  const theme = getCurrentTheme();
  const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  
  // If no dark mode preference is saved, default to light mode (false)
  const darkMode = savedDarkMode === 'true';
  
  console.log('🎨 ThemeManager: Initializing theme:', theme, 'Dark mode:', darkMode);
  
  applyTheme(theme, darkMode);
};

/**
 * Obtenir les informations du thème actuel
 */
export const getThemeInfo = (theme: ThemeType) => {
  switch (theme) {
    case 'dark':
      return {
        name: 'Noir',
        description: 'Thème sombre classique',
        icon: '🌙',
        colors: {
          primary: '#111827',
          secondary: '#1f2937',
          accent: '#374151'
        }
      };
    case 'sakura':
      return {
        name: 'Rose',
        description: 'Thème rose Sakura',
        icon: '🌸',
        colors: {
          primary: '#fce7f3',
          secondary: '#fbcfe8',
          accent: '#ec4899'
        }
      };
    case 'gray':
      return {
        name: 'Gris',
        description: 'Thème gris uniforme (Grok-style)',
        icon: '🔘',
        colors: {
          primary: '#f3f4f6',
          secondary: '#e5e7eb',
          accent: '#6b7280'
        }
      };
    case 'white':
      return {
        name: 'Blanc',
        description: 'Thème blanc pur et lumineux',
        icon: '⚪',
        colors: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          accent: '#3b82f6'
        }
      };
    default:
      // Fallback au thème rose par défaut
      return {
        name: 'Rose',
        description: 'Thème rose Sakura',
        icon: '🌸',
        colors: {
          primary: '#fce7f3',
          secondary: '#fbcfe8',
          accent: '#ec4899'
        }
      };
  }
};
