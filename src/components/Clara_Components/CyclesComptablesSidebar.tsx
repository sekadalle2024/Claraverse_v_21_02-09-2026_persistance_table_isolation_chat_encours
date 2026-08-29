/**
 * CyclesComptablesSidebar Component
 * 
 * Barre latérale pour afficher les cycles comptables et leurs tests
 * Interface moderne avec navigation hiérarchique
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  BarChart3,
  Grid3X3,
  Briefcase,
  User,
  Building,
  Users,
  Wallet,
  Receipt,
  FileText,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  Filter
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface TestItem {
  id: string;
  reference: string;
  label: string;
  processus: string;
}

interface CycleComptable {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  tests: TestItem[];
}

interface CyclesComptablesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onTestSelect: (test: TestItem, mode: 'normal' | 'demo') => void;
}

// ============================================================
// DONNÉES DES CYCLES COMPTABLES
// ============================================================

const CYCLES_COMPTABLES: CycleComptable[] = [
  {
    id: 'tresorerie',
    label: 'Trésorerie',
    icon: <Calculator className="w-5 h-5" />,
    color: 'bg-blue-500',
    tests: [
      { id: 'aa040', reference: 'AA040', label: 'Rapprochements', processus: 'Trésorerie' },
      { id: 'aa145', reference: 'AA145', label: 'Test sur les décaissements après la clôture', processus: 'Trésorerie' },
      { id: 'aa160', reference: 'AA160', label: 'Test sur les décaissements avant la clôture', processus: 'Trésorerie' },
      { id: 'aa200', reference: 'AA200', label: 'Caisse', processus: 'Trésorerie' },
      { id: 'aa400', reference: 'AA400', label: 'Suspens Banque', processus: 'Trésorerie' },
      { id: 'aa465', reference: 'AA465', label: 'Note de synthèse rapprochement', processus: 'Trésorerie' },
      { id: 'aa02', reference: 'AA02', label: 'Feuilles maîtresses-TRESORERIE', processus: 'Trésorerie' },
      { id: 'aa02-travaux', reference: 'AA02', label: 'Travaux analytiques caisse', processus: 'Trésorerie' }
    ]
  },
  {
    id: 'ventes',
    label: 'Ventes',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'bg-green-500',
    tests: [
      { id: 'bb040', reference: 'BB040', label: 'Rapprochement CA', processus: 'VENTES' },
      { id: 'bb145', reference: 'BB145', label: 'Test de séparation des exercices ventes', processus: 'VENTES' },
      { id: 'bb160', reference: 'BB160', label: 'Test de séparation des exercices avoir', processus: 'VENTES' },
      { id: 'bb300', reference: 'BB300', label: 'Test de validation analytique', processus: 'VENTES' },
      { id: 'bb545', reference: 'BB545', label: 'Note de synthèse Test de séparation des exercices', processus: 'VENTES' },
      { id: 'bb30', reference: 'BB30', label: 'CA-TSE-TVA', processus: 'VENTES' },
      { id: 'bb20', reference: 'BB20', label: 'Rapprochement de solde CA TVA_TSE', processus: 'VENTES' },
      { id: 'bb02', reference: 'BB02', label: 'Feuilles maîtresses-CHIFFRE D\'AFFAIRES', processus: 'VENTES' },
      { id: 'bb02-travaux', reference: 'BB02', label: 'Travaux analytiques CA', processus: 'VENTES' }
    ]
  },
  {
    id: 'stocks',
    label: 'Stocks',
    icon: <Grid3X3 className="w-5 h-5" />,
    color: 'bg-orange-500',
    tests: [
      { id: 'cc20', reference: 'CC20', label: 'Test sur la centralisation', processus: 'Stock' },
      { id: 'cc25', reference: 'CC25', label: 'Test Stock Phys_Théorique', processus: 'Stock' },
      { id: 'cc30', reference: 'CC30', label: 'Test Stock Physique Inventorié', processus: 'Stock' },
      { id: 'cc35', reference: 'CC35', label: 'Test Stock PV_Valorisé', processus: 'Stock' },
      { id: 'cc40', reference: 'CC40', label: 'Test de séparation des exercices Stocks-Reception', processus: 'Stock' },
      { id: 'cc45', reference: 'CC45', label: 'Test de séparation des exercices Stocks-Expédition', processus: 'Stock' },
      { id: 'cc104', reference: 'CC104', label: 'Test la variation stock', processus: 'Stock' },
      { id: 'cc120', reference: 'CC120', label: 'Rapprochement de solde Valorisation', processus: 'Stock' },
      { id: 'cc145', reference: 'CC145', label: 'Valorisation en CUMP AAN', processus: 'Stock' },
      { id: 'cc300', reference: 'CC300', label: 'Provisions Dépréciation', processus: 'Stock' },
      { id: 'cc040', reference: 'CC040', label: 'Rapprochement de solde BG AAchier stock', processus: 'Stock' },
      { id: 'cc02', reference: 'CC02', label: 'Feuilles maîtresses-STOCKS', processus: 'Stock' },
      { id: 'cc02-travaux', reference: 'CC02', label: 'Travaux analytiques -Stocks', processus: 'Stock' }
    ]
  },
  {
    id: 'immobilisations',
    label: 'Immobilisations',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'bg-purple-500',
    tests: [
      { id: 'dd040', reference: 'DD040', label: 'Tableau Mouvement immobilisations', processus: 'IMMOBILISATIONS' },
      { id: 'dd043', reference: 'DD043', label: 'Tableau mouv Dotations', processus: 'IMMOBILISATIONS' },
      { id: 'dd45', reference: 'DD45', label: 'Rapprochement de solde BG AAchier immob', processus: 'IMMOBILISATIONS' },
      { id: 'dd104', reference: 'DD104', label: 'Test acquisitions', processus: 'IMMOBILISATIONS' },
      { id: 'dd120', reference: 'DD120', label: 'Test sur les cessions', processus: 'IMMOBILISATIONS' },
      { id: 'dd145', reference: 'DD145', label: 'Test dotation aux amortissements', processus: 'IMMOBILISATIONS' },
      { id: 'dd155', reference: 'DD155', label: 'IMMOBILISATIONS', processus: 'IMMOBILISATIONS' },
      { id: 'dd160', reference: 'DD160', label: 'Test sur les Encours', processus: 'IMMOBILISATIONS' },
      { id: 'dd180', reference: 'DD180', label: 'Test entretien charges', processus: 'IMMOBILISATIONS' },
      { id: 'dd02', reference: 'DD02', label: 'Feuilles maîtresses-IMMOBILISATIONS', processus: 'IMMOBILISATIONS' },
      { id: 'dd02-travaux', reference: 'DD02', label: 'Travaux analytiques -Immo', processus: 'IMMOBILISATIONS' }
    ]
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: <User className="w-5 h-5" />,
    color: 'bg-cyan-500',
    tests: [
      { id: 'fe040', reference: 'FE040', label: 'Circularisation client', processus: 'client' },
      { id: 'fe45', reference: 'FE45', label: 'Rapprochement de solde BA-BG', processus: 'client' },
      { id: 'fe200', reference: 'FE200', label: 'Procédure alternative', processus: 'client' },
      { id: 'fe300', reference: 'FE300', label: 'Test de séparation des exercices Client', processus: 'client' },
      { id: 'fe340', reference: 'FE340', label: 'Test de séparation des exercices Avoirs', processus: 'client' },
      { id: 'fe345', reference: 'FE345', label: 'Créances provisionnées', processus: 'client' },
      { id: 'fe360', reference: 'FE360', label: 'Revue Balance agée', processus: 'client' },
      { id: 'fe02', reference: 'FE02', label: 'Feuilles maîtresses-CLIENTS', processus: 'client' },
      { id: 'fe02-travaux', reference: 'FE02', label: 'Travaux analytiques -Clients', processus: 'client' }
    ]
  },
  {
    id: 'fournisseurs',
    label: 'Fournisseurs',
    icon: <Building className="w-5 h-5" />,
    color: 'bg-red-500',
    tests: [
      { id: 'ff040', reference: 'FF040', label: 'Circularisation fournisseurs', processus: 'fournisseur' },
      { id: 'ff41', reference: 'FF41', label: 'TEST FNP_BBE', processus: 'fournisseur' },
      { id: 'ff45', reference: 'FF45', label: 'Rapprochement de solde BA-BG', processus: 'fournisseur' },
      { id: 'ff200', reference: 'FF200', label: 'Procédure alternative FRS', processus: 'fournisseur' },
      { id: 'ff300', reference: 'FF300', label: 'Test de séparation des exercices Fournisseurs', processus: 'fournisseur' },
      { id: 'ff345', reference: 'FF345', label: 'Test de séparation des exercices Avoirs', processus: 'fournisseur' },
      { id: 'ff400', reference: 'FF400', label: 'Test PCA_CCA', processus: 'fournisseur' },
      { id: 'ff420', reference: 'FF420', label: 'TEST AAR_AAE', processus: 'fournisseur' },
      { id: 'ff445', reference: 'FF445', label: 'Test charges récurrentes', processus: 'fournisseur' },
      { id: 'ff465', reference: 'FF465', label: 'Rapprochement fournisseurs', processus: 'fournisseur' },
      { id: 'ff02', reference: 'FF02', label: 'Feuilles maîtresses-FOURNISSEURS', processus: 'fournisseur' },
      { id: 'ff02-travaux', reference: 'FF02', label: 'Travaux analytiques -Fournis', processus: 'fournisseur' }
    ]
  },
  {
    id: 'personnel',
    label: 'Personnel',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-indigo-500',
    tests: [
      { id: 'fp040', reference: 'FP040', label: 'Test Cotisations Fiscales', processus: 'personnel' },
      { id: 'fp45', reference: 'FP45', label: 'Rapprochement de solde BG-livre de paie', processus: 'personnel' },
      { id: 'fp11', reference: 'FP11', label: 'Test Cotisations sociales', processus: 'personnel' },
      { id: 'fp130', reference: 'FP130', label: 'Validation base imposable', processus: 'personnel' },
      { id: 'fp145', reference: 'FP145', label: 'Travaux analytiques salaire', processus: 'personnel' },
      { id: 'nn200-personnel', reference: 'NN200', label: 'Provisions congés', processus: 'personnel' },
      { id: 'nn02-personnel', reference: 'NN02', label: 'Feuilles maîtresses-PROVISIONS RISK&CHARGE', processus: 'personnel' },
      { id: 'nn02-travaux-personnel', reference: 'NN02', label: 'Travaux analytiques -Prov Risk', processus: 'personnel' },
      { id: 'fp02', reference: 'FP02', label: 'Feuilles maîtresses-PERSONNEL', processus: 'personnel' },
      { id: 'fp02-travaux', reference: 'FP02', label: 'Travaux analytiques -Personnel', processus: 'personnel' }
    ]
  },
  {
    id: 'capitaux-propres',
    label: 'Capitaux propres',
    icon: <Wallet className="w-5 h-5" />,
    color: 'bg-pink-500',
    tests: [
      { id: 'fq040', reference: 'FQ040', label: 'Mouvement Résultat net', processus: 'capitaux propres' },
      { id: 'fq200', reference: 'FQ200', label: 'Emprunts et dettes', processus: 'capitaux propres' },
      { id: 'fq300', reference: 'FQ300', label: 'Tableau provision RC', processus: 'capitaux propres' },
      { id: 'fq400', reference: 'FQ400', label: 'Subventions', processus: 'capitaux propres' },
      { id: 'fq02', reference: 'FQ02', label: 'Feuilles maîtresses-CAPITAUX PROPRES', processus: 'capitaux propres' },
      { id: 'fq02-travaux', reference: 'FQ02', label: 'Travaux analytiques capitaux', processus: 'capitaux propres' }
    ]
  },
  {
    id: 'charges-exploitation',
    label: 'Charges d\'exploitation',
    icon: <Receipt className="w-5 h-5" />,
    color: 'bg-yellow-500',
    tests: [
      { id: 'mm042', reference: 'MM042', label: 'TEST DETAIL PUB', processus: 'charge d\'exploitation' },
      { id: 'mm200', reference: 'MM200', label: 'Test sur les charges prestations', processus: 'charge d\'exploitation' },
      { id: 'mm245', reference: 'MM245', label: 'Test TSE', processus: 'charge d\'exploitation' },
      { id: 'mm300', reference: 'MM300', label: 'Test patentes', processus: 'charge d\'exploitation' },
      { id: 'mm400', reference: 'MM400', label: 'Test impôt Foncier', processus: 'charge d\'exploitation' },
      { id: 'mm02', reference: 'MM02', label: 'Revue analytique Charges', processus: 'charge d\'exploitation' },
      { id: 'mm02-feuilles', reference: 'MM02', label: 'Feuilles maîtresses-CHARGES D\'EXPL°', processus: 'charge d\'exploitation' }
    ]
  },
  {
    id: 'impots-taxes',
    label: 'Impôts et taxes',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-gray-500',
    tests: [
      { id: 'nn040', reference: 'NN040', label: 'Rapprochement de solde TVA - CA', processus: 'impôt et taxes' },
      { id: 'nn200', reference: 'NN200', label: 'Test CN', processus: 'impôt et taxes' },
      { id: 'nn220', reference: 'NN220', label: 'Test IGR', processus: 'impôt et taxes' },
      { id: 'nn245', reference: 'NN245', label: 'Test IRC', processus: 'impôt et taxes' },
      { id: 'nn300', reference: 'NN300', label: 'Test IRVM', processus: 'impôt et taxes' },
      { id: 'nn02', reference: 'NN02', label: 'Feuilles maîtresses-DETTES FISCALES& SOCIAL', processus: 'impôt et taxes' },
      { id: 'nn02-revue', reference: 'NN02', label: 'Revue analytique Dettes Fiscales', processus: 'impôt et taxes' }
    ]
  }
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const CyclesComptablesSidebar: React.FC<CyclesComptablesSidebarProps> = ({
  isOpen,
  onClose,
  onTestSelect
}) => {
  const [expandedCycles, setExpandedCycles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);

  // Filtrer les cycles selon la recherche
  const filteredCycles = CYCLES_COMPTABLES.filter(cycle =>
    cycle.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cycle.tests.some(test => 
      test.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.reference.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Toggle expansion d'un cycle
  const toggleCycle = (cycleId: string) => {
    const newExpanded = new Set(expandedCycles);
    if (newExpanded.has(cycleId)) {
      newExpanded.delete(cycleId);
    } else {
      newExpanded.add(cycleId);
    }
    setExpandedCycles(newExpanded);
    setSelectedCycle(cycleId);
  };

  // Générer la commande pour un test
  const generateCommand = (test: TestItem, mode: 'normal' | 'demo') => {
    let command = `[Command] = /feuille couverture
[Processus] = ${test.processus}
[test] = ${test.reference}
[reference] = ${test.label}
[Nb de lignes] = 10`;

    if (mode === 'demo') {
      command += '\n[Demo] = Activate';
    }

    return command;
  };

  // Gérer la sélection d'un test
  const handleTestClick = (test: TestItem, mode: 'normal' | 'demo') => {
    const command = generateCommand(test, mode);
    onTestSelect(test, mode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cycles Comptables
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cycles List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCycles.map((cycle) => (
          <div key={cycle.id} className="border-b border-gray-100 dark:border-gray-800">
            {/* Cycle Header */}
            <button
              onClick={() => toggleCycle(cycle.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cycle.color} text-white`}>
                  {cycle.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {cycle.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {cycle.tests.length} tests
                  </div>
                </div>
              </div>
              {expandedCycles.has(cycle.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Tests List */}
            {expandedCycles.has(cycle.id) && (
              <div className="bg-gray-50 dark:bg-gray-800">
                {cycle.tests.map((test) => (
                  <div key={test.id} className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {test.reference} - {test.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Processus: {test.processus}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mode Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestClick(test, 'normal')}
                        className="flex-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => handleTestClick(test, 'demo')}
                        className="flex-1 px-3 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                      >
                        Demo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          {filteredCycles.length} cycles • {filteredCycles.reduce((acc, cycle) => acc + cycle.tests.length, 0)} tests
        </div>
      </div>
    </div>
  );
};

export default CyclesComptablesSidebar;