/**
 * Screen Selector Component
 * Permet de basculer entre les modes Wide screen, Middle screen et Normal screen
 * pour les tables modélisées dans le chat E-audit
 */

import React, { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { getCurrentScreenMode, setScreenMode } from '../utils/screenManager';

type ScreenMode = 'wide' | 'middle' | 'normal';

interface ScreenSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const screenModes: { mode: ScreenMode; icon: string; name: string; description: string }[] = [
  {
    mode: 'wide',
    icon: '🖥️',
    name: 'Wide screen',
    description: 'Élargit les tables modélisées'
  },
  {
    mode: 'middle',
    icon: '🖥️',
    name: 'Middle screen',
    description: 'Largeur intermédiaire (–10%)'
  },
  {
    mode: 'normal',
    icon: '🖥️',
    name: 'Normal screen',
    description: 'Largeur standard des tables'
  }
];


const ScreenSelector: React.FC<ScreenSelectorProps> = ({
  className = '',
  showLabel = false
}) => {
  const [currentMode, setCurrentMode] = useState<ScreenMode>(getCurrentScreenMode());
  const [isOpen, setIsOpen] = useState(false);

  // Écouter les changements de mode écran (depuis d'autres composants ou onglets)
  useEffect(() => {
    const handleScreenModeChange = (event: CustomEvent) => {
      setCurrentMode(event.detail.mode);
    };

    window.addEventListener('clara-screen-mode-changed', handleScreenModeChange as EventListener);
    return () => {
      window.removeEventListener('clara-screen-mode-changed', handleScreenModeChange as EventListener);
    };
  }, []);

  const handleModeChange = (mode: ScreenMode) => {
    setScreenMode(mode);
    setCurrentMode(mode);
    setIsOpen(false);
  };

  const currentInfo = screenModes.find(s => s.mode === currentMode) || screenModes[1];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal - Monitor icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors border border-gray-200 dark:border-gray-700"
        title="Mode d'affichage écran"
      >
        <Monitor className={`w-5 h-5 ${
          currentMode === 'wide'
            ? 'text-blue-500'
            : currentMode === 'middle'
            ? 'text-orange-500'
            : 'text-gray-700 dark:text-gray-300'
        }`} />
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentInfo.name}
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
                Mode d'affichage
              </h3>
            </div>

            {/* Liste des modes */}
            <div className="py-2">
              {screenModes.map((item) => {
                const isActive = item.mode === currentMode;

                return (
                  <button
                    key={item.mode}
                    onClick={() => handleModeChange(item.mode)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    {/* Icône du mode */}
                    <span className="text-2xl">{item.icon}</span>

                    {/* Informations du mode */}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>

                    {/* Indicateur de sélection - pastille verte */}
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScreenSelector;
