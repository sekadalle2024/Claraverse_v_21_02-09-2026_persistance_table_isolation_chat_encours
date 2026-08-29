/**
 * DemarrerMenu Component
 * 
 * Menu contextuel hiérarchique pour automatiser les prompts E-audit
 * Design inspiré du menu Claude/ChatGPT avec deux panneaux côte à côte
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  Play,
  ChevronRight,
  FileText,
  Shield,
  ClipboardList,
  FileCheck,
  Target,
  AlertTriangle,
  CheckSquare,
  FileSearch,
  BookOpen,
  HelpCircle,
  Map,
  BarChart3,
  Grid3X3,
  Calculator,
  Briefcase,
  X,
  Zap,
  Brain,
  Settings,
  User
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface ModeItem {
  id: string;
  label: string;
  prefix: string;
}

interface EtapeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  command: string;
  norme?: string; // Norme d'audit associée
}

interface PhaseItem {
  id: string;
  label: string;
  etapes: EtapeItem[];
}

interface LogicielItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  phases: PhaseItem[];
}

interface DemarrerMenuProps {
  onInsertCommand: (command: string) => void;
  disabled?: boolean;
}

// ============================================================
// MODES DISPONIBLES
// ============================================================

const MODES: ModeItem[] = [
  { id: 'normal', label: 'Normal', prefix: '' },
  { id: 'avance', label: 'Avancé', prefix: '[Mode] = Avancé\n' },
  { id: 'intelligent', label: 'Intelligent', prefix: '[Mode] = Intelligent\n' },
  { id: 'manuel', label: 'Manuel', prefix: '[Mode] = Manuel\n' }
];

// ============================================================
// CONFIGURATION DU MENU
// ============================================================

const MENU_DATA: LogicielItem[] = [
  {
    id: 'e-audit-pro',
    label: 'E-audit pro',
    icon: <Briefcase className="w-4 h-4" />,
    phases: [
      {
        id: 'phase-preparation',
        label: 'Phase de préparation',
        etapes: [
          {
            id: 'cartographie-risques',
            label: 'Cartographie des risques',
            norme: '13.2 Évaluation des risques dans le cadre de la mission',
            icon: <Map className="w-4 h-4" />,
            command: `[Command] = Cartographie des risques
[Processus] = inventaire de caisse
[Risques critiques] = fraude
[Objectif] = couvrir la fraude`
          },
          {
            id: 'referentiel-ci',
            label: 'Référentiel de contrôle interne',
            norme: '13.4 Critères d\'évaluation',
            icon: <Shield className="w-4 h-4" />,
            command: `[Command] = Référentiel de contrôle interne
[Processus] = 
[Objectif] = `
          },
          {
            id: 'questionnaire-ci',
            label: 'Questionnaire de contrôle interne',
            norme: '14.1 Collecte d\'informations pour l\'analyse et l\'évaluation',
            icon: <ClipboardList className="w-4 h-4" />,
            command: `[Command] = Questionnaire de contrôle interne
[Processus] = 
[Objectif] = `
          },
          {
            id: 'tableau-ffa',
            label: 'Tableau des forces et faiblesses',
            norme: '14.2 Analyses et constats potentiels de la mission',
            icon: <BarChart3 className="w-4 h-4" />,
            command: `[Command] = Tableau des forces et faiblesses apparentes
[Processus] = 
[Objectif] = `
          },
          {
            id: 'rapport-orientation',
            label: "Rapport d'orientation",
            norme: '13.3 Objectifs et périmètre de la mission',
            icon: <Target className="w-4 h-4" />,
            command: `[Command] = Rapport d'orientation
[Processus] = 
[Objectif] = `
          },
          {
            id: 'programme-travail',
            label: 'Programme de travail',
            norme: '13.6 Programme de travail',
            icon: <FileText className="w-4 h-4" />,
            command: `[Command] = Programme de travail
[Processus] = inventaire de caisse`
          }
        ]
      },
      {
        id: 'phase-realisation',
        label: 'Phase de réalisation',
        etapes: [
          {
            id: 'feuille-couverture',
            label: 'Feuille couverture',
            norme: '14.6 Documentation relative à la mission',
            icon: <FileCheck className="w-4 h-4" />,
            command: `[Command] = Feuille couverture
[Processus] = 
[Objectif] = `
          }
        ]
      },
      {
        id: 'phase-conclusion',
        label: 'Phase de conclusion',
        etapes: [
          {
            id: 'frap',
            label: 'Frap',
            norme: '14.3 Évaluation des constats',
            icon: <AlertTriangle className="w-4 h-4" />,
            command: `[Command] = Frap
[Processus] = 
[Constat] = 
[Recommandation] = `
          },
          {
            id: 'synthese-frap',
            label: 'Synthèse des Frap',
            norme: '14.2 Analyses et constats potentiels de la mission',
            icon: <FileSearch className="w-4 h-4" />,
            command: `[Command] = Synthèse des Frap
[Processus] = 
[Objectif] = `
          },
          {
            id: 'rapport-provisoire',
            label: 'Rapport provisoire',
            norme: '14.5 Conclusions de la mission',
            icon: <FileText className="w-4 h-4" />,
            command: `[Command] = Rapport provisoire
[Processus] = 
[Objectif] = `
          },
          {
            id: 'reunion-cloture',
            label: 'Réunion de clôture',
            norme: '11.3 Communication des résultats',
            icon: <CheckSquare className="w-4 h-4" />,
            command: `[Command] = Réunion de clôture
[Processus] = 
[Objectif] = `
          },
          {
            id: 'rapport-final',
            label: 'Rapport final',
            norme: '15.1 Communication des résultats définitifs de la mission',
            icon: <FileCheck className="w-4 h-4" />,
            command: `[Command] = Rapport final
[Processus] = 
[Objectif] = `
          }
        ]
      }
    ]
  },
  {
    id: 'e-cartographie',
    label: 'E-cartographie',
    icon: <Map className="w-4 h-4" />,
    phases: [
      {
        id: 'analyse-risques',
        label: 'Analyse des risques',
        etapes: [
          {
            id: 'identification-risques',
            label: 'Identification des risques',
            icon: <Target className="w-4 h-4" />,
            command: `[Command] = Identification des risques
[Domaine] = 
[Périmètre] = `
          },
          {
            id: 'evaluation-risques',
            label: 'Évaluation des risques',
            icon: <BarChart3 className="w-4 h-4" />,
            command: `[Command] = Évaluation des risques
[Domaine] = 
[Critères] = `
          },
          {
            id: 'matrice-risques',
            label: 'Matrice des risques',
            icon: <Grid3X3 className="w-4 h-4" />,
            command: `[Command] = Matrice des risques
[Domaine] = 
[Format] = `
          }
        ]
      }
    ]
  },
  {
    id: 'e-revision',
    label: 'E-revision',
    icon: <Calculator className="w-4 h-4" />,
    phases: [
      {
        id: 'controle-comptes',
        label: 'Contrôle des comptes',
        etapes: [
          {
            id: 'revue-analytique',
            label: 'Revue analytique',
            icon: <BarChart3 className="w-4 h-4" />,
            command: `[Command] = Revue analytique
[Compte] = 
[Période] = `
          },
          {
            id: 'tests-detail',
            label: 'Tests de détail',
            icon: <FileSearch className="w-4 h-4" />,
            command: `[Command] = Tests de détail
[Compte] = 
[Échantillon] = `
          }
        ]
      }
    ]
  },
  {
    id: 'bibliotheque',
    label: 'Bibliothèque',
    icon: <BookOpen className="w-4 h-4" />,
    phases: [
      {
        id: 'guides',
        label: 'Guides',
        etapes: [
          {
            id: 'guide-methodologique',
            label: 'Guide méthodologique',
            icon: <BookOpen className="w-4 h-4" />,
            command: `[Command] = Guide méthodologique
[Thème] = `
          },
          {
            id: 'bonnes-pratiques',
            label: 'Bonnes pratiques',
            icon: <CheckSquare className="w-4 h-4" />,
            command: `[Command] = Bonnes pratiques
[Domaine] = `
          }
        ]
      },
      {
        id: 'commandes-complementaires',
        label: 'Commandes complémentaires',
        etapes: [
          {
            id: 'aide-contextuelle',
            label: 'Aide contextuelle',
            icon: <HelpCircle className="w-4 h-4" />,
            command: `[Command] = Aide
[Sujet] = `
          }
        ]
      }
    ]
  }
];

// ============================================================
// ICÔNES POUR LES MODES
// ============================================================

const getModeIcon = (modeId: string) => {
  switch (modeId) {
    case 'normal': return <User className="w-4 h-4" />;
    case 'avance': return <Zap className="w-4 h-4" />;
    case 'intelligent': return <Brain className="w-4 h-4" />;
    case 'manuel': return <Settings className="w-4 h-4" />;
    default: return null;
  }
};

// ============================================================
// COMPOSANT SOUS-MENU (PORTAIL)
// ============================================================

interface SubMenuPortalProps {
  etape: EtapeItem;
  anchorRect: DOMRect;
  onModeClick: (mode: ModeItem) => void;
  onClose: () => void;
}

const SubMenuPortal: React.FC<SubMenuPortalProps> = ({ etape, anchorRect, onModeClick, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Utiliser un délai pour laisser le click se propager d'abord
      setTimeout(() => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          // Ne pas fermer si on clique sur le menu principal
          const target = event.target as HTMLElement;
          if (!target.closest('[data-demarrer-menu]') && !target.closest('[data-submenu-portal]')) {
            onClose();
          }
        }
      }, 0);
    };

    // Utiliser click au lieu de mousedown pour éviter de fermer avant le traitement du clic
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [onClose]);

  // Calculer la position du sous-menu
  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.top,
    left: anchorRect.right + 4,
    zIndex: 9999,
  };

  // Vérifier si le menu dépasse à droite de l'écran
  if (anchorRect.right + 200 > window.innerWidth) {
    style.left = anchorRect.left - 200 - 4;
  }

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      data-submenu-portal
      style={style}
      className="min-w-[220px] max-w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="text-xs font-semibold text-[#6b1102] dark:text-[#ff6b5b]">
          {etape.label}
        </div>
        {etape.norme && (
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-tight">
            Norme {etape.norme}
          </div>
        )}
      </div>
      {MODES.map(mode => (
        <button
          key={mode.id}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-[#6b1102]/10 dark:hover:bg-[#6b1102]/20 hover:text-[#6b1102] dark:hover:text-[#ff6b5b] transition-colors"
          onMouseDown={(e) => {
            // Empêcher la propagation du mousedown pour éviter la fermeture
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[SubMenuPortal] Mode button clicked:', mode.label);
            onModeClick(mode);
          }}
        >
          <span className="text-gray-400 dark:text-gray-500">
            {getModeIcon(mode.id)}
          </span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const DemarrerMenu: React.FC<DemarrerMenuProps> = ({ onInsertCommand, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLogiciel, setActiveLogiciel] = useState<string | null>(null);
  const [activeEtape, setActiveEtape] = useState<EtapeItem | null>(null);
  const [etapeAnchorRect, setEtapeAnchorRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Ne pas fermer si on clique sur le sous-menu
        if (!target.closest('[data-submenu-portal]')) {
          closeMenu();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveLogiciel(null);
    setActiveEtape(null);
    setEtapeAnchorRect(null);
  };

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
    }
  }, [isOpen]);

  const handleEtapeClick = (etape: EtapeItem, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (activeEtape?.id === etape.id) {
      setActiveEtape(null);
      setEtapeAnchorRect(null);
    } else {
      setActiveEtape(etape);
      setEtapeAnchorRect(rect);
    }
  };

  const handleModeClick = (mode: ModeItem) => {
    console.log('[DemarrerMenu] handleModeClick called with mode:', mode);
    console.log('[DemarrerMenu] activeEtape:', activeEtape);
    
    if (activeEtape) {
      const finalCommand = mode.prefix + activeEtape.command;
      console.log('[DemarrerMenu] Final command to insert:', finalCommand);
      
      // Appeler onInsertCommand AVANT de fermer le menu
      try {
        onInsertCommand(finalCommand);
        console.log('[DemarrerMenu] onInsertCommand called successfully');
      } catch (error) {
        console.error('[DemarrerMenu] Error calling onInsertCommand:', error);
      }
      
      // Fermer le menu après un court délai pour s'assurer que l'insertion est faite
      setTimeout(() => {
        closeMenu();
      }, 100);
    } else {
      console.warn('[DemarrerMenu] No activeEtape, cannot insert command');
    }
  };

  return (
    <div className="relative">
      {/* Bouton Démarrer - Rouge bordeaux */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
          ${isOpen 
            ? 'bg-[#6b1102] text-white shadow-lg shadow-[#6b1102]/30' 
            : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-[#6b1102]/10 dark:hover:bg-[#6b1102]/20 hover:text-[#6b1102] dark:hover:text-[#ff6b5b]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Menu Démarrer E-audit"
      >
        <Play className={`w-4 h-4 ${isOpen ? 'fill-white' : ''}`} />
        <span>Démarrer</span>
      </button>

      {/* Menu déroulant principal */}
      {isOpen && (
        <div
          ref={menuRef}
          data-demarrer-menu
          className="absolute bottom-full mb-2 left-0 min-w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header - Rouge bordeaux */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#6b1102] to-[#8b2112]">
            <div className="flex items-center gap-2 text-white">
              <Play className="w-5 h-5 fill-white" />
              <span className="font-semibold">Menu Démarrer</span>
            </div>
            <button
              onClick={closeMenu}
              className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenu du menu */}
          <div className="py-1 max-h-[60vh] overflow-y-auto">
            {MENU_DATA.map(logiciel => (
              <div key={logiciel.id}>
                {/* Logiciel */}
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors border-b border-gray-100 dark:border-gray-700/50
                    ${activeLogiciel === logiciel.id 
                      ? 'bg-[#6b1102]/10 dark:bg-[#6b1102]/20 text-[#6b1102] dark:text-[#ff6b5b]' 
                      : 'text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  onClick={() => {
                    setActiveLogiciel(activeLogiciel === logiciel.id ? null : logiciel.id);
                    setActiveEtape(null);
                    setEtapeAnchorRect(null);
                  }}
                >
                  <span className={`flex-shrink-0 ${activeLogiciel === logiciel.id ? 'text-[#6b1102] dark:text-[#ff6b5b]' : 'text-gray-500 dark:text-gray-400'}`}>
                    {logiciel.icon}
                  </span>
                  <span className="flex-1">{logiciel.label}</span>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${activeLogiciel === logiciel.id ? 'rotate-90 text-[#6b1102] dark:text-[#ff6b5b]' : 'text-gray-400'}`} />
                </button>

                {/* Phases et Étapes */}
                {activeLogiciel === logiciel.id && (
                  <div className="bg-gray-50 dark:bg-gray-900/50">
                    {logiciel.phases.map(phase => (
                      <div key={phase.id}>
                        {/* Phase (titre) */}
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800/50">
                          {phase.label}
                        </div>
                        
                        {/* Étapes */}
                        {phase.etapes.map(etape => (
                          <button
                            key={etape.id}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 pl-6 text-left text-sm transition-colors
                              ${activeEtape?.id === etape.id 
                                ? 'bg-[#6b1102]/10 dark:bg-[#6b1102]/20 text-[#6b1102] dark:text-[#ff6b5b]' 
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            onClick={(e) => handleEtapeClick(etape, e)}
                          >
                            <span className={`flex-shrink-0 ${activeEtape?.id === etape.id ? 'text-[#6b1102] dark:text-[#ff6b5b]' : 'text-gray-400 dark:text-gray-500'}`}>
                              {etape.icon}
                            </span>
                            <span className="flex-1">{etape.label}</span>
                            <ChevronRight className={`w-4 h-4 flex-shrink-0 text-gray-400 ${activeEtape?.id === etape.id ? 'text-[#6b1102] dark:text-[#ff6b5b]' : ''}`} />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sous-menu des modes (portail) */}
      {activeEtape && etapeAnchorRect && (
        <SubMenuPortal
          etape={activeEtape}
          anchorRect={etapeAnchorRect}
          onModeClick={handleModeClick}
          onClose={() => {
            setActiveEtape(null);
            setEtapeAnchorRect(null);
          }}
        />
      )}
    </div>
  );
};

export default DemarrerMenu;
