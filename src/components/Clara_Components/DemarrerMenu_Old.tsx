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
  TrendingUp,
  Settings,
  User,
  Package,
  Building
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

interface TestItem {
  id: string;
  reference: string;
  label: string;
  processus: string;
  command: string;
}
interface CycleComptable {
  id: string;
  label: string;
  icon: React.ReactNode;
  tests: TestItem[];
}

interface PhaseItem {
  id: string;
  label: string;
  etapes?: EtapeItem[];
  cycles?: CycleComptable[];
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
  { id: 'demo', label: 'Demo', prefix: '[Demo] = Activate\n' },
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
        id: 'revue-analytique',
        label: 'Revue analytique',
        etapes: [
          {
            id: 'revue-analytique-generale',
            label: 'Revue analytique générale',
            icon: <BarChart3 className="w-4 h-4" />,
            command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = `
          }
        ]
      },
      {
        id: 'programme-controle',
        label: 'Programme de contrôle',
        cycles: [
          {
            id: 'cycle-tresorerie',
            label: 'Trésorerie',
            icon: <Calculator className="w-4 h-4" />,
            tests: [
              {
                id: 'tresorerie-aa040',
                reference: 'AA040',
                label: 'Rapprochements',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = Rapprochements
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa145',
                reference: 'AA145',
                label: 'Test sur les décaissements après la clôture',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA145
[reference] = Test sur les décaissements après la clôture
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa160',
                reference: 'AA160',
                label: 'Test sur les décaissements avant la clôture',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA160
[reference] = Test sur les décaissements avant la clôture
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa200',
                reference: 'AA200',
                label: 'Caisse',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA200
[reference] = Caisse
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa400',
                reference: 'AA400',
                label: 'Suspens Banque',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA400
[reference] = Suspens Banque
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa465',
                reference: 'AA465',
                label: 'Note de synthèse rapprochement',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA465
[reference] = Note de synthèse rapprochement
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa02',
                reference: 'AA02',
                label: 'Feuilles maîtresses-TRESORERIE',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA02
[reference] = Feuilles maîtresses-TRESORERIE
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa02-travaux',
                reference: 'AA02',
                label: 'Travaux analytiques caisse',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA02
[reference] = Travaux analytiques caisse
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa03',
                reference: 'AA03',
                label: 'Revue du Contrôle interne',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA03
[reference] = Revue du Contrôle interne
[Nb de lignes] = 10`
              },
              {
                id: 'tresorerie-aa04',
                reference: 'AA04',
                label: 'Revue des techniques comptables',
                processus: 'Trésorerie',
                command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA04
[reference] = Revue des techniques comptables
[Nb de lignes] = 10`
              }
            ]
          },
          {
            id: 'cycle-ventes',
            label: 'Ventes',
            icon: <BarChart3 className="w-4 h-4" />,
            tests: [
              {
                id: 'ventes-bb040',
                reference: 'BB040',
                label: 'Rapprochement CA',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB040
[reference] = Rapprochement CA
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb145',
                reference: 'BB145',
                label: 'Test de séparation des exercices ventes',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB145
[reference] = Test de séparation des exercices ventes
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb160',
                reference: 'BB160',
                label: 'Test de séparation des exercices avoir',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB160
[reference] = Test de séparation des exercices avoir
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb300',
                reference: 'BB300',
                label: 'Test de validation analytique',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB300
[reference] = Test de validation analytique
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb545',
                reference: 'BB545',
                label: 'Note de synthèse Test de séparation des exercices',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB545
[reference] = Note de synthèse Test de séparation des exercices
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb30',
                reference: 'BB30',
                label: 'CA-TSE-TVA',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB30
[reference] = CA-TSE-TVA
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb20',
                reference: 'BB20',
                label: 'Rapprochement de solde CA TVA_TSE',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB20
[reference] = Rapprochement de solde CA TVA_TSE
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb02',
                reference: 'BB02',
                label: 'Feuilles maîtresses-CHIFFRE D\'AFFAIRES',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB02
[reference] = Feuilles maîtresses-CHIFFRE D'AFFAIRES
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb02-travaux',
                reference: 'BB02',
                label: 'Travaux analytiques CA',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB02
[reference] = Travaux analytiques CA
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb03',
                reference: 'BB03',
                label: 'Revue du Contrôle interne',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB03
[reference] = Revue du Contrôle interne
[Nb de lignes] = 10`
              },
              {
                id: 'ventes-bb04',
                reference: 'BB04',
                label: 'Revue des techniques comptables',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB04
[reference] = Revue des techniques comptables
[Nb de lignes] = 10`
              }
            ]
          },
          {
            id: 'cycle-ventes',
            label: 'Ventes',
            icon: <BarChart3 className="w-4 h-4" />,
            tests: [
              {
                id: 'ventes-bb040',
                reference: 'BB040',
                label: 'Rapprochement CA',
                processus: 'VENTES',
                command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB040
[reference] = Rapprochement CA
[Nb de lignes] = 10`
              }
            ]
          }
        ]
      },
      {
        id: 'synthese-mission',
        label: 'Synthèse de mission',
        etapes: [
          {
            id: 'synthese-travaux',
            label: 'Synthèse des travaux',
            icon: <FileText className="w-4 h-4" />,
            command: `[Command] = Synthèse des travaux
[Mission] = 
[Période] = 
[Conclusions] = `
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
    case 'demo': return <Play className="w-4 h-4" />;
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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchorRect.top,
    left: anchorRect.right + 4,
    zIndex: 9999,
  };

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
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
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
  const [activeCycle, setActiveCycle] = useState<CycleComptable | null>(null);
  const [activeTest, setActiveTest] = useState<TestItem | null>(null);
  const [etapeAnchorRect, setEtapeAnchorRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
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
    if (activeEtape) {
      const finalCommand = mode.prefix + activeEtape.command;
      
      try {
        onInsertCommand(finalCommand);
      } catch (error) {
        console.error('[DemarrerMenu] Error calling onInsertCommand:', error);
      }
      
      setTimeout(() => {
        closeMenu();
      }, 100);
    }
  };

  const handleCycleClick = (cycle: CycleComptable) => {
    if (activeCycle?.id === cycle.id) {
      setActiveCycle(null);
      setActiveTest(null);
    } else {
      setActiveCycle(cycle);
      setActiveTest(null);
    }
  };
  const handleTestClick = (test: TestItem, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (activeTest?.id === test.id) {
      setActiveTest(null);
      setEtapeAnchorRect(null);
    } else {
      const etapeFromTest: EtapeItem = {
        id: test.id,
        label: `${test.reference} - ${test.label}`,
        icon: <FileText className="w-4 h-4" />,
        command: test.command
      };
      setActiveTest(test);
      setActiveEtape(etapeFromTest);
      setEtapeAnchorRect(rect);
    }
  };

  return (
    <div className="relative">
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

      {isOpen && (
        <div
          ref={menuRef}
          data-demarrer-menu
          className="absolute bottom-full mb-2 left-0 min-w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          style={{ maxHeight: '70vh' }}
        >
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
          <div className="py-1 max-h-[60vh] overflow-y-auto">
            {MENU_DATA.map(logiciel => (
              <div key={logiciel.id}>
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

                {activeLogiciel === logiciel.id && (
                  <div className="bg-gray-50 dark:bg-gray-900/50">
                    {logiciel.phases.map(phase => (
                      <div key={phase.id}>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800/50">
                          {phase.label}
                        </div>
                        
                        {phase.etapes && phase.etapes.map(etape => (
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
                        {phase.cycles && phase.cycles.map(cycle => (
                          <div key={cycle.id}>
                            <button
                              className={`w-full flex items-center gap-3 px-4 py-2.5 pl-6 text-left text-sm transition-colors
                                ${activeCycle?.id === cycle.id 
                                  ? 'bg-[#6b1102]/10 dark:bg-[#6b1102]/20 text-[#6b1102] dark:text-[#ff6b5b]' 
                                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              onClick={() => handleCycleClick(cycle)}
                            >
                              <span className={`flex-shrink-0 ${activeCycle?.id === cycle.id ? 'text-[#6b1102] dark:text-[#ff6b5b]' : 'text-gray-400 dark:text-gray-500'}`}>
                                {cycle.icon}
                              </span>
                              <span className="flex-1">{cycle.label}</span>
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${activeCycle?.id === cycle.id ? 'rotate-90 text-[#6b1102] dark:text-[#ff6b5b]' : 'text-gray-400'}`} />
                            </button>
                            
                            {activeCycle?.id === cycle.id && (
                              <div className="bg-gray-100 dark:bg-gray-800/30">
                                {cycle.tests.map(test => (
                                  <button
                                    key={test.id}
                                    className={`w-full flex items-center gap-3 px-4 py-2 pl-12 text-left text-sm transition-colors
                                      ${activeTest?.id === test.id 
                                        ? 'bg-[#6b1102]/10 dark:bg-[#6b1102]/20 text-[#6b1102] dark:text-[#ff6b5b]' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                      }`}
                                    onClick={(e) => handleTestClick(test, e)}
                                  >
                                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 min-w-[3rem]">
                                      {test.reference}
                                    </span>
                                    <span className="flex-1">{test.label}</span>
                                    <ChevronRight className={`w-4 h-4 flex-shrink-0 text-gray-400 ${activeTest?.id === test.id ? 'text-[#6b1102] dark:text-[#ff6b5b]' : ''}`} />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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