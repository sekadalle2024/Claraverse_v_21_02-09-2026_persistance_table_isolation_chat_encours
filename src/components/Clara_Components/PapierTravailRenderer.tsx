/**
 * PapierTravailRenderer.tsx
 * 
 * Component to render a full Audit Workpaper (Papier de Travail).
 * Renders various sections and includes the interactive RevueManagerAccordion.
 */

import React from 'react';
import RevueManagerAccordion, { RevuePoint } from './RevueManagerAccordion';

interface PapierTravailData {
  reference: string;
  signature?: any;
  missionInfo?: any;
  objectives?: string;
  tasks?: any[];
  testSection?: {
    headers: string[];
    rows: any[];
  };
  legends?: any[];
  managerReview?: RevuePoint[];
  crossRefs?: any[];
  preparer?: string;
  reviewer?: string;
}

interface PapierTravailRendererProps {
  data: PapierTravailData;
  isDark?: boolean;
}

const PapierTravailRenderer: React.FC<PapierTravailRendererProps> = ({ data, isDark = false }) => {
  const {
    reference,
    signature,
    missionInfo,
    objectives,
    tasks,
    testSection,
    legends,
    managerReview,
    crossRefs,
    preparer = "KMP",
    reviewer = "JFK"
  } = data;

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: isDark ? '#e2e8f0' : '#334155',
      background: isDark ? '#0f172a' : '#fff',
      padding: '0',
      borderRadius: '8px',
    },
    section: {
      marginBottom: '24px',
    },
    sectionBar: {
      background: '#1855A3',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase' as const,
      padding: '8px 16px',
      borderRadius: '6px 6px 0 0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '12px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    },
    th: {
      background: isDark ? '#1e293b' : '#f8fafc',
      padding: '10px 12px',
      textAlign: 'left' as const,
      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      fontWeight: 600,
    },
    td: {
      padding: '10px 12px',
      borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
      lineHeight: 1.5,
    },
    label: {
      fontWeight: 700,
      width: '30%',
      background: isDark ? '#1e293b' : '#f8fafc',
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. Signature Worksheet */}
      {signature && (
        <div style={styles.section}>
          <div style={styles.sectionBar}>Signature Worksheet</div>
          <table style={styles.table}>
            <tbody>
              {Object.entries(signature).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ ...styles.td, ...styles.label }}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                  <td style={styles.td}>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Mission Info */}
      {missionInfo && (
        <div style={styles.section}>
          <div style={styles.sectionBar}>Feuille de couverture</div>
          <table style={styles.table}>
            <tbody>
              {Object.entries(missionInfo).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ ...styles.td, ...styles.label }}>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                  <td style={styles.td}>{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Objectives */}
      {objectives && (
        <div style={styles.section}>
          <div style={{ ...styles.sectionBar, background: '#ca8a04' }}>🎯 Objectifs du test</div>
          <div style={{ 
            padding: '16px', 
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderTop: 'none',
            fontSize: '13px',
            lineHeight: 1.6,
            background: isDark ? 'rgba(202, 138, 4, 0.05)' : '#fefce8',
            borderRadius: '0 0 6px 6px'
          }}>
            {objectives}
          </div>
        </div>
      )}

      {/* 4. Tasks */}
      {tasks && tasks.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionBar}>Procédures / Travaux à effectuer</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '40px' }}>No</th>
                <th style={styles.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((row: any, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{row.no || row.No || (idx + 1)}</td>
                  <td style={styles.td}>{row["travaux a effectuer"] || row["travaux"] || Object.values(row)[1] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Main Test Section */}
      {testSection && (
        <div style={styles.section}>
          <div style={styles.sectionBar}>Tests d'audit</div>
          <div style={{ overflowX: 'auto', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0 0 6px 6px' }}>
            <table style={{ ...styles.table, border: 'none' }}>
              <thead>
                <tr>
                  {testSection.headers.map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {testSection.rows.map((row, idx) => (
                  <tr key={idx}>
                    {testSection.headers.map(h => (
                      <td key={h} style={styles.td}>{row[h] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Legends */}
      {legends && legends.length > 0 && (
        <div style={styles.section}>
          <div style={{ ...styles.sectionBar, width: 'fit-content', borderRadius: '6px' }}>Légendes</div>
          <table style={{ ...styles.table, width: 'auto', marginTop: '8px', minWidth: '300px' }}>
            <thead>
              <tr>
                <th style={styles.th}>Légende</th>
                <th style={styles.th}>Symboles</th>
              </tr>
            </thead>
            <tbody>
              {legends.map((row: any, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{row["Légende"] || row["legende"] || ''}</td>
                  <td style={styles.td}>{row["Symboles"] || row["symboles"] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 7. Revue Manager (The Interactive Part) */}
      <RevueManagerAccordion 
        points={managerReview}
        reference={reference}
        preparer={preparer}
        reviewer={reviewer}
        isDark={isDark}
      />

      {/* 8. Cross References */}
      {crossRefs && crossRefs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionBar}>Cross references documentaires</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Référence</th>
                <th style={styles.th}>Document</th>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Exercice</th>
              </tr>
            </thead>
            <tbody>
              {crossRefs.map((row: any, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{row.no || row.No || (idx + 1)}</td>
                  <td style={styles.td}>{row["Cross references"] || row["cross_references"] || ''}</td>
                  <td style={styles.td}>{row["Document"] || ''}</td>
                  <td style={styles.td}>{row["Client"] || ''}</td>
                  <td style={styles.td}>{row["Exercice"] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PapierTravailRenderer;
