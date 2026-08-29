/**
 * GuideCommandesAccordionRenderer.tsx
 * 
 * Composant React pour afficher le Guide des Commandes E AUDIT PRO
 * avec un menu accordéon et une page de couverture
 * 
 * Structure de données attendue depuis n8n:
 * [
 *   {
 *     "data": [
 *       {
 *         "Sous-section": "Guide d'Onboarding E AUDIT PRO : Maîtriser votre Programme de Travail",
 *         "Sub-items": [
 *           {
 *             "Sub-item C1": "Lancement et Cadrage de la Mission",
 *             "Items": [
 *               {
 *                 "Item C1.1": "La commande [Command] : Programme de travail",
 *                 "Rubrique": "Le point de départ",
 *                 "Contenu": "..."
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 */

import React, { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface GuideItem {
  [key: string]: string; // "Item C1.1", "Rubrique", "Contenu"
}

interface GuideSubItem {
  [key: string]: string | GuideItem[]; // "Sub-item C1", "Items"
}

interface GuideSection {
  "Sous-section": string;
  "Sub-items": GuideSubItem[];
}

interface GuideCommandesAccordionRendererProps {
  jsonData: string;
  isDark?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Détermine le style de couleur basé sur la rubrique
 */
function getRubricStyle(rubrique: string): { bg: string; text: string; border: string } {
  const rubLower = rubrique.toLowerCase();
  
  if (rubLower.includes("départ") || rubLower.includes("point")) {
    return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-700" };
  }
  if (rubLower.includes("cible") || rubLower.includes("cœur") || rubLower.includes("coeur")) {
    return { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-700" };
  }
  if (rubLower.includes("filtre") || rubLower.includes("précision")) {
    return { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-700" };
  }
  if (rubLower.includes("mesure") || rubLower.includes("tableau")) {
    return { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-700" };
  }
  if (rubLower.includes("temps") || rubLower.includes("maîtrise")) {
    return { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-700" };
  }
  if (rubLower.includes("clarté") || rubLower.includes("document")) {
    return { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-700" };
  }
  if (rubLower.includes("situation") || rubLower.includes("mise")) {
    return { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-700" };
  }
  
  // Par défaut
  return { bg: "bg-gray-50 dark:bg-gray-800/50", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT: AccordionPanel
// ═══════════════════════════════════════════════════════════════════════════

interface AccordionPanelProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isDark: boolean;
  level?: number;
}

const AccordionPanel: React.FC<AccordionPanelProps> = ({
  title,
  children,
  isOpen,
  onToggle,
  isDark,
  level = 1,
}) => {
  const bgColor = level === 1 
    ? (isDark ? "bg-gray-800" : "bg-gray-100")
    : (isDark ? "bg-gray-750" : "bg-gray-50");
  
  const hoverColor = isDark ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";

  return (
    <div className={`border ${borderColor} rounded-lg mb-3 overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 text-left ${bgColor} ${hoverColor} transition-colors duration-200 flex items-center justify-between`}
      >
        <span className={`font-semibold ${level === 1 ? 'text-base' : 'text-sm'} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT: CoverPage
// ═══════════════════════════════════════════════════════════════════════════

const CoverPage: React.FC<{ sousSection: string; sectionIndex: number; totalSections: number }> = ({
  sousSection,
  sectionIndex,
  totalSections,
}) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg mb-6">
      <div className="text-center space-y-6 max-w-3xl">
        <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold mb-4">
          Section {sectionIndex + 1} / {totalSections}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Guide des Commandes
        </h1>
        
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
        
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
          {sousSection}
        </h2>
        
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
          E AUDIT PRO - Guide Interactif
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT: ItemCard
// ═══════════════════════════════════════════════════════════════════════════

interface ItemCardProps {
  itemLabel: string;
  rubrique: string;
  contenu: string;
  isDark: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ itemLabel, rubrique, contenu, isDark }) => {
  const style = getRubricStyle(rubrique);
  
  return (
    <div className={`border ${style.border} rounded-lg p-4 mb-4 ${style.bg} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start space-x-3 mb-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center`}>
          <span className={`text-xs font-bold ${style.text}`}>
            {itemLabel.match(/\d+/)?.[0] || '•'}
          </span>
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
            {itemLabel}
          </h4>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
            {rubrique}
          </div>
        </div>
      </div>
      <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} pl-11`}>
        {contenu}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT: SubItemSection
// ═══════════════════════════════════════════════════════════════════════════

interface SubItemSectionProps {
  subItem: GuideSubItem;
  isDark: boolean;
}

const SubItemSection: React.FC<SubItemSectionProps> = ({ subItem, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Extraire le titre du sub-item (clé qui commence par "Sub-item")
  const subItemKey = Object.keys(subItem).find(key => key.startsWith("Sub-item")) || "";
  const subItemTitle = subItem[subItemKey] as string;
  
  // Extraire les items
  const items = (subItem.Items || subItem.items) as GuideItem[];
  
  if (!items || !Array.isArray(items)) {
    return null;
  }
  
  return (
    <AccordionPanel
      title={subItemTitle}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      isDark={isDark}
      level={2}
    >
      <div className="space-y-3">
        {items.map((item, idx) => {
          // Extraire les données de l'item
          const itemKey = Object.keys(item).find(key => key.startsWith("Item")) || "";
          const itemLabel = item[itemKey] || "";
          const rubrique = item.Rubrique || item.rubrique || "";
          const contenu = item.Contenu || item.contenu || "";
          
          return (
            <ItemCard
              key={idx}
              itemLabel={itemLabel}
              rubrique={rubrique}
              contenu={contenu}
              isDark={isDark}
            />
          );
        })}
      </div>
    </AccordionPanel>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL: GuideCommandesAccordionRenderer
// ═══════════════════════════════════════════════════════════════════════════

const GuideCommandesAccordionRenderer: React.FC<GuideCommandesAccordionRendererProps> = ({
  jsonData,
  isDark = false,
}) => {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log("🔍 GuideCommandesAccordionRenderer - Parsing JSON data");
      const parsed = JSON.parse(jsonData);
      
      // La structure attendue est: [{ "data": [...] }]
      let sectionsData: GuideSection[] = [];
      
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].data) {
        sectionsData = parsed[0].data;
      } else if (Array.isArray(parsed)) {
        sectionsData = parsed;
      } else {
        throw new Error("Format de données non reconnu");
      }
      
      console.log("✅ Sections chargées:", sectionsData.length);
      setSections(sectionsData);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur lors du parsing JSON:", err);
      setError("Erreur lors du chargement des données du guide");
    }
  }, [jsonData]);

  const toggleSection = (index: number) => {
    setOpenSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (error) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'}`}>
        <p className="font-semibold">⚠️ {error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
        <p>Chargement du guide...</p>
      </div>
    );
  }

  return (
    <div className={`guide-commandes-accordion ${isDark ? 'dark' : ''}`}>
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-8">
          {/* Page de couverture */}
          <CoverPage
            sousSection={section["Sous-section"]}
            sectionIndex={sectionIndex}
            totalSections={sections.length}
          />
          
          {/* Contenu accordéon */}
          <div className="space-y-3">
            {section["Sub-items"] && section["Sub-items"].map((subItem, subIndex) => (
              <SubItemSection
                key={subIndex}
                subItem={subItem}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuideCommandesAccordionRenderer;
