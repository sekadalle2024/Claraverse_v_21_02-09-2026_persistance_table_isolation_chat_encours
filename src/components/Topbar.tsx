import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, Clock, LogOut, Loader2 } from 'lucide-react';
import { useTheme, ThemeMode } from '../hooks/useTheme';
import UserProfileButton from './common/UserProfileButton';
import NotificationPanel from './common/NotificationPanel';
import ThemeSelector from './ThemeSelector';
import ScreenSelector from './ScreenSelector';
import { db } from '../db';
import logo from "../assets/logo.png";

interface TopbarProps {
  userName?: string;
  onPageChange?: (page: string) => void;
  projectTitle?: string;
  showProjectTitle?: boolean;
  onLogoClick?: () => void;
}

const Topbar = ({ userName, onPageChange, projectTitle, showProjectTitle = false, onLogoClick }: TopbarProps) => {
  const { theme, setTheme } = useTheme();
  const [now, setNow] = useState(new Date());
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timer = setInterval(() => setNow(new Date()), 1000);
    
    const loadUserInfo = async () => {
      // First try to get current user
      const currentUserId = await db.getCurrentUser();
      if (currentUserId) {
        const user = await db.getUser(currentUserId);
        if (user) {
          console.log('👤 Topbar: Current user loaded:', user.name);
          setCurrentUserName(user.name);
          setPersonalInfo(user.personalInfo);
          if (user.personalInfo?.timezone) setTimezone(user.personalInfo.timezone);
          if (user.personalInfo?.theme_preference && (user.personalInfo.theme_preference === 'light' || user.personalInfo.theme_preference === 'dark' || user.personalInfo.theme_preference === 'system')) {
            setTheme(user.personalInfo.theme_preference as ThemeMode);
          }
          return;
        }
      }
      
      // Fallback to legacy personal info
      const info = await db.getPersonalInfo();
      if (info) {
        console.log('🔄 Topbar: Using legacy personal info:', info.name);
        setCurrentUserName(info.name || '');
        setPersonalInfo(info);
        if (info?.timezone) setTimezone(info.timezone);
        if (info?.theme_preference && (info.theme_preference === 'light' || info.theme_preference === 'dark' || info.theme_preference === 'system')) {
          setTheme(info.theme_preference as ThemeMode);
        }
      }
    };
    
    loadUserInfo();
    return () => clearInterval(timer);
  }, [setTheme]);

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone });
  const dateString = now.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: timezone });
  const dayString = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });

  // Helper to update theme everywhere
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    if (personalInfo) {
      db.updatePersonalInfo({ ...personalInfo, theme_preference: newTheme });
      setPersonalInfo({ ...personalInfo, theme_preference: newTheme });
    }
  };

  // Cycle through theme modes: light -> dark -> system -> light ...
  const cycleTheme = () => {
    let newTheme: ThemeMode;
    if (theme === 'light') newTheme = 'dark';
    else if (theme === 'dark') newTheme = 'system';
    else newTheme = 'light';
    handleThemeChange(newTheme);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      setIsExiting(true);
      console.log('🚪 Topbar: Logout initiated, clearing user name');
      
      // Clear current user name immediately for UI feedback
      setCurrentUserName('');
      
      // Call the global logout function exposed by App.tsx
      const globalLogout = (window as any).handleLogout;
      if (globalLogout) {
        await globalLogout();
      } else {
        console.error('Global logout function not available');
        // Fallback: reload the page to reset the app state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: reload the page
      window.location.reload();
    } finally {
      setIsExiting(false);
    }
  };

  return (
    <div className="topbar-grok h-16 px-6 flex items-center justify-between relative z-[10000]">
      <div className="flex items-center">
        {/* Logo E-audit aligné avec les icônes */}
        <button
          onClick={() => onLogoClick?.()}
          className="hover:opacity-80 hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
          title="Afficher l'historique des chats"
        >
          <img src={logo} alt="E-audit Logo" className="w-5 h-5" />
        </button>
      </div>
      {/* Center section - Project Title only (Clock removed) */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {showProjectTitle && projectTitle && (
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            {projectTitle}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-6">
        {/* Sélecteur de mode écran (Wide / Normal) */}
        <ScreenSelector showLabel={false} />
        
        {/* Sélecteur de thème avec icônes */}
        <ThemeSelector showLabel={false} />
        
        {/* Ancien bouton de thème (light/dark/system) - Gardé pour compatibilité */}
        <button 
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-sakura-50 dark:hover:bg-sakura-100/10 transition-colors"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === 'light' && <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
          {theme === 'dark' && <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
          {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
        </button>
        <NotificationPanel onNavigateToClara={() => onPageChange?.('clara')} />
        <UserProfileButton
          userName={currentUserName || userName || 'Profile'}
          onPageChange={onPageChange || (() => {})}
        />
        <button 
          onClick={handleLogout}
          disabled={isExiting}
          className={`p-2 rounded-lg transition-colors group relative ${
            isExiting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
          aria-label="Logout"
          title="Logout"
        >
          {isExiting ? (
            <Loader2 className="w-5 h-5 text-red-600 dark:text-red-400 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Topbar;