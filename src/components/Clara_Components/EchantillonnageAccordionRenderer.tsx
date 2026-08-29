/**
 * EchantillonnageAccordionRenderer
 *
 * Renders audit sampling and data analysis results as a rich interactive accordion.
 *
 * Expected data shape (EchantillonnageAccordionData):
 * {
 *   "type": "sampling" | "analysis",
 *   "methodLabel": "Aléatoire simple",
 *   "methodKey": "random",
 *   "filename": "comptes.xlsx",
 *   "statistics": { population_size, sample_size, sampling_rate, ... },
 *   "description": { ... },
 *   "sourceTable": { headers: string[], rows: string[][] },
 *   "resultTable": { headers: string[], rows: string[][] },
 *   "analysisDetails": { ... }   // Only for analysis
 * }
 *
 * Four accordion panels (in order):
 *   0 – Cover page  (always open)
 *   1 – Statistiques
 *   2 – Données source
 *   3 – Méthode / Résultats
 */

import React, { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TableData {
  headers: string[];
  rows: string[][];
}

interface SamplingStatistics {
  population_size?: number;
  sample_size?: number;
  sampling_rate?: number;
  population_total?: number;
  sample_total?: number;
  population_mean?: number;
  sample_mean?: number;
  estimated_total?: number;
  [key: string]: any;
}

export interface EchantillonnageAccordionData {
  type: 'sampling' | 'analysis';
  methodLabel: string;   // e.g. "Aléatoire simple"
  methodKey: string;     // e.g. "random"
  filename?: string;
  statistics?: SamplingStatistics;
  description?: Record<string, string | number>;
  sourceTable?: TableData;
  resultTable?: TableData;
  analysisDetails?: Record<string, any>;
}

interface EchantillonnageAccordionRendererProps {
  data: EchantillonnageAccordionData;
  isDark?: boolean;
}

// ─── Method metadata ────────────────────────────────────────────────────────────

const METHOD_META: Record<string, { emoji: string; color: string; gradient: string }> = {
  random:           { emoji: '🎲', color: '#1976d2', gradient: 'linear-gradient(135deg,#1976d2 0%,#42a5f5 100%)' },
  systematic:       { emoji: '📏', color: '#7b1fa2', gradient: 'linear-gradient(135deg,#7b1fa2 0%,#ba68c8 100%)' },
  monetary:         { emoji: '💰', color: '#2e7d32', gradient: 'linear-gradient(135deg,#2e7d32 0%,#66bb6a 100%)' },
  stratified:       { emoji: '📊', color: '#e65100', gradient: 'linear-gradient(135deg,#e65100 0%,#ff9800 100%)' },
  fixed:            { emoji: '📌', color: '#c62828', gradient: 'linear-gradient(135deg,#c62828 0%,#ef5350 100%)' },
  with_replacement: { emoji: '🔄', color: '#0277bd', gradient: 'linear-gradient(135deg,#0277bd 0%,#29b6f6 100%)' },
  duplicates:       { emoji: '🔍', color: '#880e4f', gradient: 'linear-gradient(135deg,#880e4f 0%,#e91e8c 100%)' },
  gaps:             { emoji: '🔢', color: '#4a148c', gradient: 'linear-gradient(135deg,#4a148c 0%,#9c27b0 100%)' },
  benford:          { emoji: '📐', color: '#006064', gradient: 'linear-gradient(135deg,#006064 0%,#00bcd4 100%)' },
  threshold:        { emoji: '🎯', color: '#bf360c', gradient: 'linear-gradient(135deg,#bf360c 0%,#ff7043 100%)' },
  weekend:          { emoji: '📅', color: '#33691e', gradient: 'linear-gradient(135deg,#33691e 0%,#8bc34a 100%)' },
  round_amounts:    { emoji: '🔵', color: '#1a237e', gradient: 'linear-gradient(135deg,#1a237e 0%,#3949ab 100%)' },
  outliers:         { emoji: '📈', color: '#b71c1c', gradient: 'linear-gradient(135deg,#b71c1c 0%,#f44336 100%)' },
  period_changes:   { emoji: '📉', color: '#0d47a1', gradient: 'linear-gradient(135deg,#0d47a1 0%,#2196f3 100%)' },
};

function getMeta(key: string) {
  const base = METHOD_META[key] ?? { emoji: '📋' };
  // Thème global Rouge Bordeau
  return {
    emoji: base.emoji || '📋',
    color: '#800020',
    gradient: 'linear-gradient(135deg, #800020 0%, #a31535 100%)'
  };
}

// ─── Helper: format number ──────────────────────────────────────────────────────

function fmt(value: number | undefined | null, decimals = 0): string {
  if (value == null || isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(value);
}

// ─── Accordion Panel ────────────────────────────────────────────────────────────

interface PanelProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isDark: boolean;
  index: number;
  total: number;
  accentColor?: string;
  icon?: string;
}

const AccordionPanel: React.FC<PanelProps> = ({
  title, children, defaultOpen = false, isDark, index, total, accentColor = '#1976d2', icon = '📋'
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const isFirst = index === 0;
  const isLast  = index === total - 1;

  const borderRadius = isFirst
    ? '10px 10px 0 0'
    : isLast && !open
    ? '0 0 10px 10px'
    : '0';

  const activeHeader: React.CSSProperties = {
    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
    color: '#ffffff',
  };
  const inactiveHeader: React.CSSProperties = {
    background: isDark ? '#1e293b' : '#f1f5f9',
    color: isDark ? '#e2e8f0' : '#1e3a5f',
  };

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        style={{
          ...(open ? activeHeader : inactiveHeader),
          cursor: 'pointer',
          padding: '14px 22px',
          width: '100%',
          textAlign: 'left',
          border: 'none',
          borderTop: isFirst ? 'none' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
          outline: 'none',
          fontSize: '15px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius,
          transition: 'background 0.25s ease',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <span>{title}</span>
        </span>
        <span style={{ fontSize: '20px', fontWeight: 400, lineHeight: 1, color: open ? '#fff' : accentColor }}>
          {open ? '−' : '+'}
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? '6000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: isLast && open ? '0 0 10px 10px' : '0',
          borderTop: open ? `1px solid ${isDark ? '#334155' : '#e2e8f0'}` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Cover Page ─────────────────────────────────────────────────────────────────

interface CoverProps {
  data: EchantillonnageAccordionData;
  meta: { emoji: string; color: string; gradient: string };
}

const CoverPage: React.FC<CoverProps> = ({ data, meta }) => (
  <div
    style={{
      background: meta.gradient,
      color: '#ffffff',
      padding: '48px 40px',
      textAlign: 'center',
      minHeight: '220px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
    }}
  >
    <div style={{ fontSize: '48px', lineHeight: 1 }}>{meta.emoji}</div>

    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.75 }}>
      {data.type === 'sampling' ? 'Échantillonnage Audit' : 'Analyse de Données'}
    </div>

    <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, maxWidth: '700px' }}>
      {data.methodLabel}
    </div>

    {data.filename && (
      <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>
        📄 {data.filename}
      </div>
    )}

    <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px', marginTop: '6px' }} />
  </div>
);

// ─── Statistics Panel Content ────────────────────────────────────────────────────

interface StatsContentProps {
  stats: SamplingStatistics;
  meta: { color: string };
  isDark: boolean;
  type: 'sampling' | 'analysis';
  analysisDetails?: Record<string, any>;
}

const StatCard: React.FC<{ label: string; value: string; color: string; bg: string }> = ({ label, value, color, bg }) => (
  <div style={{ textAlign: 'center', padding: '16px 12px', background: bg, borderRadius: '10px', flex: '1 1 120px' }}>
    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</div>
  </div>
);

const StatsContent: React.FC<StatsContentProps> = ({ stats, meta, isDark, type, analysisDetails }) => {
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const subText   = isDark ? '#94a3b8' : '#64748b';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const bgCard    = isDark ? '#1e293b' : '#f8fafc';

  // Build stat cards
  const cards: Array<{ label: string; value: string; color: string; bg: string }> = [];

  if (stats.population_size != null) {
    cards.push({ label: 'Population', value: fmt(stats.population_size), color: meta.color, bg: isDark ? '#80002033' : '#fce4ec' });
  }
  if (stats.sample_size != null) {
    cards.push({ label: 'Échantillon', value: fmt(stats.sample_size), color: meta.color, bg: isDark ? '#80002033' : '#fce4ec' });
  }
  if (stats.sampling_rate != null) {
    cards.push({ label: 'Taux de sondage', value: `${stats.sampling_rate.toFixed(1)} %`, color: meta.color, bg: isDark ? '#80002033' : '#fce4ec' });
  }
  if (stats.population_total != null) {
    cards.push({ label: 'Total population', value: fmt(stats.population_total, 0), color: meta.color, bg: isDark ? '#80002033' : '#fce4ec' });
  }
  if (stats.sample_total != null) {
    cards.push({ label: 'Total échantillon', value: fmt(stats.sample_total, 0), color: meta.color, bg: isDark ? '#80002033' : '#fce4ec' });
  }
  if (stats.estimated_total != null) {
    cards.push({ label: 'Total estimé', value: fmt(stats.estimated_total, 0), color: meta.color, bg: isDark ? '#80002033' : '#fce4ec' });
  }

  // Analysis-specific extra stats from analysisDetails
  const extraStats: Array<{ label: string; value: string }> = [];
  if (analysisDetails) {
    const skip = ['columns_checked', 'suspicious_digits', 'missing_values', 'by_type'];
    Object.entries(analysisDetails).forEach(([k, v]) => {
      if (!skip.includes(k) && v != null) {
        extraStats.push({
          label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          value: typeof v === 'number' ? fmt(v, 2) : String(v)
        });
      }
    });
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Stat cards */}
      {cards.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          {cards.map((c, i) => <StatCard key={i} {...c} />)}
        </div>
      )}

      {/* Extra analysis stats */}
      {extraStats.length > 0 && (
        <div
          style={{
            background: bgCard,
            border: `1px solid ${borderCol}`,
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: meta.color, borderBottom: `1px solid ${borderCol}` }}>
            Détails statistiques
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {extraStats.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 16px',
                  borderBottom: i < extraStats.length - 1 ? `1px solid ${borderCol}` : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '13px', color: subText }}>{s.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: textColor }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 && extraStats.length === 0 && (
        <p style={{ color: subText, fontStyle: 'italic', textAlign: 'center' }}>Aucune statistique disponible</p>
      )}
    </div>
  );
};

// ─── Description Panel Content ────────────────────────────────────────────────────

const DescriptionContent: React.FC<{
  data: EchantillonnageAccordionData;
  meta: { color: string };
  isDark: boolean;
}> = ({ data, meta, isDark }) => {
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const bgCard    = isDark ? '#1e293b' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const subText   = isDark ? '#94a3b8' : '#64748b';

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Type', value: data.type === 'sampling' ? 'Échantillonnage' : 'Analyse de données' },
    { label: 'Méthode', value: data.methodLabel },
    { label: 'Clé méthode', value: data.methodKey },
    ...(data.filename ? [{ label: 'Fichier source', value: data.filename }] : []),
    ...(data.statistics?.population_size != null ? [{ label: 'Taille population', value: fmt(data.statistics.population_size) + ' enregistrements' }] : []),
    ...Object.entries(data.description || {}).map(([k, v]) => ({
      label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: String(v)
    }))
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          background: bgCard,
          border: `1px solid ${borderCol}`,
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              borderBottom: i < rows.length - 1 ? `1px solid ${borderCol}` : 'none',
              background: i % 2 === 0 ? 'transparent' : isDark ? '#ffffff08' : '#f8fafc',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '13px', color: subText, minWidth: '160px' }}>{row.label}</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: textColor,
                textAlign: 'right',
                flex: 1,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Data Table Component ────────────────────────────────────────────────────────

interface DataTableProps {
  tableData: TableData;
  isDark: boolean;
  headerColor: string;
  caption?: string;
}

const DataTable: React.FC<DataTableProps> = ({ tableData, isDark, headerColor, caption }) => {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(tableData.rows.length / PAGE_SIZE);
  const visibleRows = tableData.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const borderCol = isDark ? '#334155' : '#e2e8f0';

  return (
    <div>
      {caption && (
        <div style={{
          padding: '8px 0 12px',
          fontWeight: 700,
          fontSize: '13px',
          color: headerColor,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {caption}
          <span style={{ fontWeight: 400, color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px' }}>
            ({tableData.rows.length} enregistrement{tableData.rows.length > 1 ? 's' : ''})
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${borderCol}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {tableData.headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: headerColor,
                    color: '#ffffff',
                    fontWeight: 700,
                    borderRight: i < tableData.headers.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? (isDark ? '#0f172a' : '#ffffff') : (isDark ? '#1e293b' : '#f8fafc') }}>
                {row.map((cell, ci) => {
                  const num = parseFloat(String(cell).replace(/\s/g, '').replace(',', '.'));
                  const isNeg = !isNaN(num) && ci > 0 && num < 0;
                  return (
                    <td
                      key={ci}
                      style={{
                        padding: '8px 14px',
                        borderRight: ci < row.length - 1 ? `1px solid ${borderCol}` : 'none',
                        borderBottom: `1px solid ${borderCol}`,
                        color: isNeg ? '#e53e3e' : (isDark ? '#cbd5e1' : '#374151'),
                        fontWeight: isNeg ? 700 : 400,
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '5px 14px', borderRadius: '6px', border: `1px solid ${headerColor}`,
              background: page === 0 ? 'transparent' : headerColor, color: page === 0 ? headerColor : '#fff',
              cursor: page === 0 ? 'default' : 'pointer', fontSize: '13px', opacity: page === 0 ? 0.4 : 1,
            }}
          >
            ‹ Préc.
          </button>
          <span style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              padding: '5px 14px', borderRadius: '6px', border: `1px solid ${headerColor}`,
              background: page === totalPages - 1 ? 'transparent' : headerColor, color: page === totalPages - 1 ? headerColor : '#fff',
              cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: '13px', opacity: page === totalPages - 1 ? 0.4 : 1,
            }}
          >
            Suiv. ›
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Source Data Panel Content ───────────────────────────────────────────────────

const SourceDataContent: React.FC<{
  tableData?: TableData;
  isDark: boolean;
  meta: { color: string };
}> = ({ tableData, isDark, meta }) => {
  const subText = isDark ? '#94a3b8' : '#64748b';

  if (!tableData || !tableData.headers || tableData.rows.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: subText, fontStyle: 'italic' }}>
        Aucune donnée source disponible
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <DataTable
        tableData={tableData}
        isDark={isDark}
        headerColor={meta.color}
        caption='📊 Population complète'
      />
    </div>
  );
};

// ─── Result Panel Content ────────────────────────────────────────────────────────

const ResultContent: React.FC<{
  data: EchantillonnageAccordionData;
  meta: { color: string; emoji: string };
  isDark: boolean;
}> = ({ data, meta, isDark }) => {
  const subText = isDark ? '#94a3b8' : '#64748b';

  if (!data.resultTable || !data.resultTable.headers || data.resultTable.rows.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: subText, fontStyle: 'italic' }}>
        Aucun résultat disponible
      </div>
    );
  }

  const caption = data.type === 'sampling'
    ? `${meta.emoji} Échantillon sélectionné`
    : `${meta.emoji} Résultats — ${data.methodLabel}`;

  return (
    <div style={{ padding: '24px' }}>
      <DataTable
        tableData={data.resultTable}
        isDark={isDark}
        headerColor={meta.color}
        caption={caption}
      />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────────

const EchantillonnageAccordionRenderer: React.FC<EchantillonnageAccordionRendererProps> = ({
  data,
  isDark = false,
}) => {
  const meta = getMeta(data.methodKey);
  const TOTAL = 4; // cover + stats + source + result

  return (
    <div
      style={{
        margin: '16px 0',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        borderRadius: '10px',
        border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 6px 30px rgba(0,0,0,0.5)'
          : '0 6px 30px rgba(0,0,0,0.1)',
      }}
    >
      {/* ── Panel 0: Cover ─────────────────────────────────────────────────── */}
      <AccordionPanel
        title="Couverture"
        defaultOpen={true}
        isDark={isDark}
        index={0}
        total={TOTAL}
        accentColor={meta.color}
        icon={meta.emoji}
      >
        <CoverPage data={data} meta={meta} />
      </AccordionPanel>

      {/* ── Panel 1: Statistiques ───────────────────────────────────────────── */}
      <AccordionPanel
        title="Statistiques"
        defaultOpen={true}
        isDark={isDark}
        index={1}
        total={TOTAL}
        accentColor={meta.color}
        icon="📈"
      >
        <StatsContent
          stats={data.statistics || {}}
          meta={meta}
          isDark={isDark}
          type={data.type}
          analysisDetails={data.analysisDetails}
        />
      </AccordionPanel>

      {/* ── Panel 2: Données source ──────────────────────────────────────────── */}
      <AccordionPanel
        title="Données source"
        defaultOpen={false}
        isDark={isDark}
        index={2}
        total={TOTAL}
        accentColor={meta.color}
        icon="🗄️"
      >
        <SourceDataContent tableData={data.sourceTable} isDark={isDark} meta={meta} />
      </AccordionPanel>

      {/* ── Panel 3: Résultats méthode ───────────────────────────────────────── */}
      <AccordionPanel
        title={`Méthode analyse de données : ${data.methodLabel}`}
        defaultOpen={true}
        isDark={isDark}
        index={3}
        total={TOTAL}
        accentColor={meta.color}
        icon={data.type === 'sampling' ? '🎯' : '🔬'}
      >
        <ResultContent data={data} meta={meta} isDark={isDark} />
      </AccordionPanel>
    </div>
  );
};

export default EchantillonnageAccordionRenderer;
