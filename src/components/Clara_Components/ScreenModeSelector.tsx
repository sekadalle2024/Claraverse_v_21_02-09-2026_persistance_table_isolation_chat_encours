/**
 * ScreenModeSelector Component
 * 
 * Composant pour ajuster dynamiquement la largeur des divs contenant les tables modelisées
 * Permet de basculer entre le mode "Wide Screen" (largeur étendue) et "Normal Screen" (largeur normale)
 * 
 * Les tables modelisées sont identifiées par leurs colonnes spécifiques:
 * - Conclusion, Assertion, CTR1-4, Ecart, Résultat
 */

import React, { useState, useEffect } from 'react';
import { Monitor, ChevronDown } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type ScreenMode = 'normal' | 'wide';

interface ScreenModeSelectorProps {
  className?: string;
  onModeChange?: (mode: ScreenMode) => void;
}

// ============================================================
// CONSTANTES
// ============================================================

const STORAGE_KEY = 'clara-screen-mode';

// Colonnes à détecter pour identifier une table modelisée
const MODELIZED_TABLE_KEYWORDS = [
  'conclusion',
  'assertion',
  'ecart',
  'écart',
  'resultat',
  'résultat',
  /^ctr\s*\d*$/i // CTR 1, CTR 2, CTR1, CTR, etc.
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Vérifie si une table est une table modelisée en analysant ses en-têtes
 */
function isModelizedTable(table: HTMLTableElement): boolean {
  // Vérifier les 5 premières lignes pour trouver les en-têtes
  const rows = Array.from(table.querySelectorAll('tr')).slice(0, 5);
  
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const headers = cells.map(c => c.textContent?.toLowerCase().trim() || '');
    
    const hasKeyword = headers.some(h => {
      // Vérifier les mots-clés exacts
      if (MODELIZED_TABLE_KEYWORDS.some(keyword => {
        if (typeof keyword === 'string') {
          return h === keyword;
        } else {
          return keyword.test(h);
        }
      })) {
        return true;
      }
      return false;
    });
    
    if (hasKeyword) return true;
  }
  
  return false;
}

/**
 * Applique le mode Wide Screen aux tables modelisées
 */
function applyWideScreen(): void {
  const tables = Array.from(document.querySelectorAll('table')) as HTMLTableElement[];
  
  tables.forEach(table => {
    if (!isModelizedTable(table)) return;

    // 1. Obtenir la largeur réelle du contenu de la table
    const origWidth = table.style.width;
    const origMaxWidth = table.style.maxWidth;
    const origLayout = table.style.tableLayout;
    
    table.style.setProperty('width', 'max-content', 'important');
    table.style.setProperty('max-width', 'none', 'important');
    table.style.setProperty('table-layout', 'auto', 'important');
    
    const tableScrollWidth = table.scrollWidth;
    
    table.style.width = origWidth;
    table.style.maxWidth = origMaxWidth;
    table.style.tableLayout = origLayout;

    // Ajouter du padding supplémentaire (160px) pour éviter le word-wrap
    const neededWidth = tableScrollWidth + 160;
    
    // Largeur cible (minimum 1200px)
    const targetWidth = Math.max(neededWidth, 1200);

    // 2. Parcourir les ancêtres pour trouver les conteneurs à élargir
    let current: HTMLElement | null = table;
    const ancestorsToWiden: HTMLElement[] = [];
    const proseDiv = table.closest('.prose, [class*="prose"]');
    
    while (current && current !== document.body) {
      current = current.parentElement;
      if (!current) break;
      
      const style = window.getComputedStyle(current);
      const hasMaxWidth = style.maxWidth && style.maxWidth !== 'none';
      const hasMaxWClass = Array.from(current.classList).some(cls => cls.includes('max-w-'));
      const isMxAuto = current.classList.contains('mx-auto') || Array.from(current.classList).some(cls => cls.includes('mx-auto'));
      const isChatContainer = Array.from(current.classList).some(cls => {
        const c = cls.toLowerCase();
        return c.includes('chat') || c.includes('message') || c.includes('bubble') || c.includes('window');
      });
      
      if (hasMaxWidth || hasMaxWClass || isMxAuto || isChatContainer || current.hasAttribute('data-clara-container')) {
        ancestorsToWiden.push(current);
      }
    }

    // Appliquer les styles aux ancêtres
    ancestorsToWiden.forEach(el => {
      if (!el.hasAttribute('data-orig-style')) {
        el.setAttribute('data-orig-style', el.getAttribute('style') || '');
      }
      if (!el.hasAttribute('data-orig-class')) {
        el.setAttribute('data-orig-class', el.className || '');
      }
      
      el.style.setProperty('max-width', `${targetWidth}px`, 'important');
      el.style.setProperty('width', '95%', 'important');
    });

    // 3. Pour la table et son wrapper, permettre la largeur complète
    const wrapper = table.parentElement;
    if (wrapper && wrapper.tagName === 'DIV') {
      if (!wrapper.hasAttribute('data-orig-style')) {
        wrapper.setAttribute('data-orig-style', wrapper.getAttribute('style') || '');
      }
      wrapper.style.setProperty('max-width', 'none', 'important');
      wrapper.style.setProperty('width', '100%', 'important');
      wrapper.style.setProperty('overflow-x', 'auto', 'important');
    }

    if (!table.hasAttribute('data-orig-style')) {
      table.setAttribute('data-orig-style', table.getAttribute('style') || '');
    }
    table.style.setProperty('width', '100%', 'important');
    table.style.setProperty('table-layout', 'auto', 'important');

    // 4. Restreindre la largeur des autres tables non-modelisées dans le même prose
    if (proseDiv) {
      const allWrappersInProse = Array.from(proseDiv.querySelectorAll('div')) as HTMLDivElement[];
      allWrappersInProse.forEach(div => {
        const innerTables = Array.from(div.querySelectorAll('table')) as HTMLTableElement[];
        if (innerTables.length > 0 && !innerTables.some(isModelizedTable)) {
          if (!div.hasAttribute('data-orig-style')) {
            div.setAttribute('data-orig-style', div.getAttribute('style') || '');
          }
          div.style.setProperty('max-width', '800px', 'important');
          div.style.setProperty('width', '100%', 'important');
          div.style.setProperty('margin-left', '0', 'important');
          div.style.setProperty('margin-right', 'auto', 'important');
        }
      });
    }
  });
}

/**
 * Restaure le mode Normal Screen en retirant les styles appliqués
 */
function restoreNormalScreen(): void {
  // Restaurer les styles originaux
  const elementsWithOrigStyle = Array.from(document.querySelectorAll('[data-orig-style]'));
  elementsWithOrigStyle.forEach(el => {
    const origStyle = el.getAttribute('data-orig-style');
    if (origStyle) {
      el.setAttribute('style', origStyle);
    } else {
      el.removeAttribute('style');
    }
    el.removeAttribute('data-orig-style');
  });

  // Restaurer les classes originales
  const elementsWithOrigClass = Array.from(document.querySelectorAll('[data-orig-class]'));
  elementsWithOrigClass.forEach(el => {
    const origClass = el.getAttribute('data-orig-class');
    if (origClass) {
      el.className = origClass;
    }
    el.removeAttribute('data-orig-class');
  });
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const ScreenModeSelector: React.FC<ScreenModeSelectorProps> = ({
  className = '',
  onModeChange
}) => {
  const [currentMode, setCurrentMode] = useState<ScreenMode>('normal');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Charger le mode depuis le localStorage au montage
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ScreenMode | null;
    if (savedMode && (savedMode === 'normal' || savedMode === 'wide')) {
      setCurrentMode(savedMode);
      if (savedMode === 'wide') {
        // Attendre que le DOM soit prêt
        setTimeout(() => applyWideScreen(), 100);
      }
    }
  }, []);

  // Appliquer le mode lors des changements de contenu
  useEffect(() => {
    if (currentMode === 'wide') {
      const observer = new MutationObserver(() => {
        applyWideScreen();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    }
  }, [currentMode]);

  // Gérer le changement de mode
  const handleModeChange = (mode: ScreenMode) => {
    setCurrentMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    setIsDropdownOpen(false);

    if (mode === 'wide') {
      applyWideScreen();
    } else {
      restoreNormalScreen();
    }

    if (onModeChange) {
      onModeChange(mode);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        title="Ajuster la largeur d'affichage"
      >
        <Monitor className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentMode === 'wide' ? 'Wide Screen' : 'Normal Screen'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu déroulant */}
      {isDropdownOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Options */}
          <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="py-1">
              {/* Option Wide Screen */}
              <button
                onClick={() => handleModeChange('wide')}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentMode === 'wide' ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Wide Screen
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Largeur étendue pour les tables
                    </div>
                  </div>
                  {currentMode === 'wide' && (
                    <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                  )}
                </div>
              </button>

              {/* Option Normal Screen */}
              <button
                onClick={() => handleModeChange('normal')}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentMode === 'normal' ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Normal Screen
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Largeur standard
                    </div>
                  </div>
                  {currentMode === 'normal' && (
                    <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                  )}
                </div>
              </button>
            </div>

            {/* Footer informatif */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ajuste automatiquement la largeur des tables d'audit modelisées
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScreenModeSelector;
