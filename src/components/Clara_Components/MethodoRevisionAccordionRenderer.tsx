/**
 * MethodoRevisionAccordionRenderer - Template Orion
 *
 * Renders the methodo_revision n8n endpoint response as an interactive accordion menu
 * with a cover page, similar to CiaMethodoAccordionRenderer but adapted for revision methodology.
 *
 * Expected data shape (array of "sections") :
 * [
 *   {
 *     "Sous-section": "AA040 — Rapprochements bancaires | Cadrage, objectifs et contrôles d'audit",
 *     "Sub-items": [
 *       {
 *         "Sub-item 1A": "Cadrage du test",
 *         "Items": [
 *           { "Item 1A.1": "Référence et domaine", "Rubrique": "référence", "Contenu": "..." },
 *           ...
 *         ]
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 */

import React, { useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevisionItem {
  [itemKey: string]: string | string[]; // e.g. "Item 1A.1", "Rubrique", "Contenu"
}

interface RevisionSubItem {
  [subItemKey: string]: string | RevisionItem[]; // e.g. "Sub-item 1A", "Items"
}

interface RevisionSection {
  'Sous-section': string;
  'Sub-items': RevisionSubItem[];
}

interface MethodoRevisionAccordionRendererProps {
  data: RevisionSection[];
  isDark?: boolean;
}

// ─── Helper: rubric badge colour ──────────────────────────────────────────────

const RUBRIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'référence':            { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' },
  'description du test':  { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  'nature de test':       { bg: '#fef9c3', text: '#854d0e', border: '#eab308' },
  'objectifs':            { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' },
  'phase de mission':     { bg: '#f0fdf4', text: '#166534', border: '#22c55e' },
  'assertions':           { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' },
  'contrôle audit':       { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  'controle audit':       { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  'normes':               { bg: '#fae8ff', text: '#86198f', border: '#c084fc' },
  'méthodologie':         { bg: '#ffedd5', text: '#c2410c', border: '#fb923c' },
  'methodologie':         { bg: '#ffedd5', text: '#c2410c', border: '#fb923c' },
  'anomalie courante':    { bg: '#fff1f2', text: '#be123c', border: '#fb7185' },
  'ajustement courant':   { bg: '#ecfdf5', text: '#059669', border: '#34d399' },
  'comptes concernés':    { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' },
  'comptes concernes':    { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' },
  'classes syscohada révisé': { bg: '#fef2f2', text: '#dc2626', border: '#f87171' },
  'documents à utiliser': { bg: '#f0fdf4', text: '#166534', border: '#22c55e' },
  'quoi':                 { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' },
  'pourquoi':             { bg: '#fae8ff', text: '#86198f', border: '#c084fc' },
  'action logique':       { bg: '#ffedd5', text: '#c2410c', border: '#fb923c' },
  'données d\'entrée':    { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' },
  'données de sortie':    { bg: '#ecfdf5', text: '#059669', border: '#34d399' },
  'technique utilisée':   { bg: '#fef2f2', text: '#dc2626', border: '#f87171' },
  'erreurs courantes':    { bg: '#fff1f2', text: '#be123c', border: '#fb7185' },
  'acteurs':              { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' },
  'norme':                { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' },
};

function getRubricStyle(rubrique: string): { bg: string; text: string; border: string } {
  const key = (rubrique || '').toLowerCase().trim();
  return RUBRIC_COLORS[key] ?? { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' };
}

// ─── Panel: single accordion entry ───────────────────────────────────────────

interface AccordionPanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isDark: boolean;
  index: number;
  totalPanels: number;
}

const AccordionPanel: React.FC<AccordionPanelProps> = ({
  title,
  children,
  defaultOpen = false,
  isDark,
  index,
  totalPanels,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isFirst = index === 0;
  const isLast = index === totalPanels - 1;

  const headerRadius = isFirst
    ? '8px 8px 0 0'
    : isLast && !isOpen
    ? '0 0 8px 8px'
    : '0';

  const activeHeaderStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Blue gradient for revision
    color: '#ffffff',
  };

  const inactiveHeaderStyle: React.CSSProperties = {
    background: isDark ? '#1e293b' : '#f3f4f6',
    color: isDark ? '#e2e8f0' : '#4b5563',
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          ...(isOpen ? activeHeaderStyle : inactiveHeaderStyle),
          cursor: 'pointer',
          padding: '16px 24px',
          width: '100%',
          textAlign: 'left',
          border: 'none',
          borderTop: isFirst ? 'none' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          outline: 'none',
          fontSize: '16px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: headerRadius,
          transition: 'background 0.25s ease',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: '20px',
            fontWeight: 400,
            lineHeight: 1,
            color: isOpen ? '#ffffff' : isDark ? '#94a3b8' : '#1e3a8a',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? '4000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: isLast && isOpen ? '0 0 8px 8px' : '0',
          borderTop: isOpen ? `1px solid ${isDark ? '#334155' : '#e2e8f0'}` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Cover Page ───────────────────────────────────────────────────────────────

const CoverPage: React.FC<{ sousSection: string; sectionIndex: number; totalSections: number }> = ({
  sousSection,
  sectionIndex,
  totalSections,
}) => (
  <div
    style={{
      background: 'linear-gradient(135deg, rgba(59,130,246,0.92) 0%, rgba(37,99,235,0.92) 100%)', // Blue gradient
      color: '#ffffff',
      padding: '48px 40px',
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}
  >
    <div
      style={{
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        opacity: 0.8,
      }}
    >
      Méthodologie de Révision{totalSections > 1 ? ` · Section ${sectionIndex + 1}/${totalSections}` : ''}
    </div>
    <div
      style={{
        fontSize: '26px',
        fontWeight: 700,
        lineHeight: 1.3,
        maxWidth: '700px',
      }}
    >
      {sousSection}
    </div>
    <div
      style={{
        width: '60px',
        height: '3px',
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '2px',
        marginTop: '8px',
      }}
    />
  </div>
);

// ─── Item Card ────────────────────────────────────────────────────────────────

interface ItemCardProps {
  itemLabel: string;
  rubrique: string;
  contenu: string | string[];
  isDark: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ itemLabel, rubrique, contenu, isDark }) => {
  const rubricStyle = getRubricStyle(rubrique);

  // Handle array content (for lists)
  const renderContent = () => {
    if (Array.isArray(contenu)) {
      return (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {contenu.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '8px' }}>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return <div style={{ whiteSpace: 'pre-line' }}>{contenu}</div>;
  };

  return (
    <div
      style={{
        margin: '12px 24px',
        borderRadius: '8px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        background: isDark ? '#1e293b' : '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Item header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          background: isDark ? '#0f172a' : '#f1f5f9',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: '13px',
            color: isDark ? '#60a5fa' : '#2563eb', // Blue text
            fontFamily: 'monospace',
          }}
        >
          {itemLabel}
        </span>

        {rubrique && (
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              background: rubricStyle.bg,
              color: rubricStyle.text,
              border: `1px solid ${rubricStyle.border}`,
            }}
          >
            {rubrique}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div
        style={{
          padding: '16px',
          fontSize: '14px',
          lineHeight: 1.75,
          color: isDark ? '#cbd5e1' : '#374151',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

// ─── Sub-Item Section ─────────────────────────────────────────────────────────

interface SubItemSectionProps {
  subItem: RevisionSubItem;
  isDark: boolean;
}

const SubItemSection: React.FC<SubItemSectionProps> = ({ subItem, isDark }) => {
  // Extract sub-item label (e.g. "Sub-item 1A") and items array
  const subItemKey = Object.keys(subItem).find((k) =>
    k.toLocaleLowerCase().startsWith('sub-item')
  );
  const subItemLabel = subItemKey ? String(subItem[subItemKey]) : 'Sous-thème';
  const items = (subItem['Items'] || []) as RevisionItem[];

  if (!items.length) return null;

  return (
    <div style={{ paddingBottom: '8px' }}>
      {/* Sub-item heading */}
      <div
        style={{
          padding: '12px 24px 8px',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: isDark ? '#60a5fa' : '#2563eb', // Blue text
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          marginBottom: '4px',
        }}
      >
        {subItemLabel}
      </div>

      {/* Items */}
      {items.map((item, idx) => {
        // Find the "Item X.Y" key
        const itemKey = Object.keys(item).find(
          (k) => k !== 'Rubrique' && k !== 'Contenu'
        );
        const itemLabel = itemKey ? String(item[itemKey]) : `Item ${idx + 1}`;
        const rubrique = String(item['Rubrique'] || '');
        const contenu = item['Contenu'] || '';

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
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MethodoRevisionAccordionRenderer: React.FC<MethodoRevisionAccordionRendererProps> = ({
  data,
  isDark = false,
}) => {
  const [_forceUpdate, _setForceUpdate] = useState(0);
  const forceUpdate = useCallback(() => _setForceUpdate((n) => n + 1), []);
  void forceUpdate;

  return (
    <div
      style={{
        margin: '16px 0',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {data.map((section, sectionIdx) => {
        const sousSection = section['Sous-section'] || `Section ${sectionIdx + 1}`;
        const subItems = section['Sub-items'] || [];

        // Total panels = 1 cover + N sub-items
        const totalPanels = 1 + subItems.length;

        return (
          <div
            key={sectionIdx}
            style={{
              marginBottom: data.length > 1 ? '24px' : '0',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
              overflow: 'hidden',
              boxShadow: isDark
                ? '0 4px 20px rgba(0,0,0,0.4)'
                : '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            {/* ── Panel 0: Cover ─────────────────────────────────────────── */}
            <AccordionPanel
              key="cover"
              title="📋 Couverture"
              defaultOpen={true}
              isDark={isDark}
              index={0}
              totalPanels={totalPanels}
            >
              <CoverPage
                sousSection={sousSection}
                sectionIndex={sectionIdx}
                totalSections={data.length}
              />
            </AccordionPanel>

            {/* ── Panels 1..N: one per Sub-item ──────────────────────────── */}
            {subItems.map((subItem, subIdx) => {
              const subItemKey = Object.keys(subItem).find((k) =>
                k.toLocaleLowerCase().startsWith('sub-item')
              );
              const panelTitle = subItemKey
                ? String(subItem[subItemKey])
                : `Thème ${subIdx + 1}`;
              const panelIndex = subIdx + 1;

              return (
                <AccordionPanel
                  key={subIdx}
                  title={`📚 ${panelTitle}`}
                  defaultOpen={false}
                  isDark={isDark}
                  index={panelIndex}
                  totalPanels={totalPanels}
                >
                  <SubItemSection subItem={subItem} isDark={isDark} />
                </AccordionPanel>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default MethodoRevisionAccordionRenderer;
