/**
 * CiaMethodoAccordionRenderer
 *
 * Renders the CIA n8n endpoint response as an interactive accordion menu,
 * specifically tailored for "Methodologie" with a media section at the end.
 *
 * Expected data shape (array of "sections") :
 * [
 *   {
 *     "Sous-section": "...",
 *     "Sub-items": [
 *       {
 *         "Sub-item C1": "...",
 *         "Items": [
 *           { "Item C1.1": "...", "Rubrique": "...", "Contenu": "..." },
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

interface CiaItem {
  [itemKey: string]: string; // e.g. "Item C1.1", "Rubrique", "Contenu"
}

interface CiaSubItem {
  [subItemKey: string]: string | CiaItem[]; // e.g. "Sub-item C1", "Items"
}

interface CiaSection {
  'Sous-section': string;
  'Sub-items': CiaSubItem[];
}

interface CiaMethodoAccordionRendererProps {
  data: CiaSection[];
  isDark?: boolean;
}

// ─── Helper: rubric badge colour ──────────────────────────────────────────────

const RUBRIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'acteurs clés':         { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' },
  'a retenir':            { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
  'erreur':               { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  'astuces pour l\'examen': { bg: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' },
  'exemple':              { bg: '#fef9c3', text: '#854d0e', border: '#eab308' },
  'definition':           { bg: '#f0fdf4', text: '#166534', border: '#22c55e' },
  'quoi':                 { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' },
  'pourquoi':             { bg: '#fae8ff', text: '#86198f', border: '#c084fc' },
  'action logique':       { bg: '#ffedd5', text: '#c2410c', border: '#fb923c' },
  'données d\'entrée':    { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' },
  'données de sortie':    { bg: '#ecfdf5', text: '#059669', border: '#34d399' },
  'technique utilisée':   { bg: '#fef2f2', text: '#dc2626', border: '#f87171' },
  'erreurs courantes':    { bg: '#fff1f2', text: '#be123c', border: '#fb7185' },
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
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Orange gradient
    color: '#ffffff',
  };

  const inactiveHeaderStyle: React.CSSProperties = {
    background: isDark ? '#1e293b' : '#f3f4f6', // Light gray background
    color: isDark ? '#e2e8f0' : '#4b5563', // Dark text for contrast
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
      background: 'linear-gradient(135deg, rgba(249,115,22,0.92) 0%, rgba(234,88,12,0.92) 100%)', // Orange gradient
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
      CIA — Méthodologie{totalSections > 1 ? ` · Section ${sectionIndex + 1}/${totalSections}` : ''}
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
  contenu: string;
  isDark: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ itemLabel, rubrique, contenu, isDark }) => {
  const rubricStyle = getRubricStyle(rubrique);

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
            color: isDark ? '#fdba74' : '#ea580c', // Orange text
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
          whiteSpace: 'pre-line',
        }}
      >
        {contenu}
      </div>
    </div>
  );
};

// ─── Sub-Item Section ─────────────────────────────────────────────────────────

interface SubItemSectionProps {
  subItem: CiaSubItem;
  isDark: boolean;
}

const SubItemSection: React.FC<SubItemSectionProps> = ({ subItem, isDark }) => {
  // Extract sub-item label (e.g. "Sub-item C1") and items array
  const subItemKey = Object.keys(subItem).find((k) =>
    k.toLocaleLowerCase().startsWith('sub-item')
  );
  const subItemLabel = subItemKey ? String(subItem[subItemKey]) : 'Sous-thème';
  const items = (subItem['Items'] || []) as CiaItem[];

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
          color: isDark ? '#fdba74' : '#ea580c', // Orange text
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          marginBottom: '4px',
        }}
      >
        {subItemLabel}
      </div>

      {/* Items */}
      {items.map((item, idx) => {
        // Find the "Item Cx.y" key
        const itemKey = Object.keys(item).find(
          (k) => k !== 'Rubrique' && k !== 'Contenu'
        );
        const itemLabel = itemKey || `Item ${idx + 1}`;
        const rubrique = String(item['Rubrique'] || '');
        const contenu = String(item['Contenu'] || '');

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

// ─── Media Section ────────────────────────────────────────────────────────────

const MediaSection: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <h3 style={{ color: isDark ? '#e2e8f0' : '#1e3a8a', fontSize: '18px', fontWeight: 600 }}>Ressources Vidéo</h3>
      <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px', marginTop: '4px' }}>
        Visionnez ces vidéos pour approfondir la méthodologie.
      </p>
    </div>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '24px' 
    }}>
      {/* Video 1 */}
      <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: isDark ? '#0f172a' : '#f8fafc' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe 
            src="https://www.youtube.com/embed/dUr1wDUaYzg" 
            title="Vidéo Méthodologie 1"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></iframe>
        </div>
        <div style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
          Tutoriel Méthodologie Partie 1
        </div>
      </div>
      
      {/* Video 2 */}
      <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: isDark ? '#0f172a' : '#f8fafc' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe 
            src="https://www.youtube.com/embed/oyUk7J1w15c" 
            title="Vidéo Méthodologie 2"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></iframe>
        </div>
        <div style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
          Tutoriel Méthodologie Partie 2
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CiaMethodoAccordionRenderer: React.FC<CiaMethodoAccordionRendererProps> = ({
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

        // Total panels = 1 cover + N sub-items + 1 media (for the last section)
        const isLastSection = sectionIdx === data.length - 1;
        const totalPanels = 1 + subItems.length + (isLastSection ? 1 : 0);

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

            {/* ── Panel N+1: Media ───────────────────────────────────────── */}
            {isLastSection && (
              <AccordionPanel 
                key="media" 
                title="🎥 Vidéos de Formation" 
                defaultOpen={false} 
                isDark={isDark} 
                index={totalPanels - 1} 
                totalPanels={totalPanels}
              >
                <MediaSection isDark={isDark} />
              </AccordionPanel>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default CiaMethodoAccordionRenderer;
