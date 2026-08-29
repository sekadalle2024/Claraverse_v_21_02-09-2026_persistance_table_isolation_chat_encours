/**
 * CiaQcmAccordionRenderer
 *
 * Renders the CIA QCM n8n endpoint response as an interactive accordion menu.
 * Groups questions from "table X" arrays, provides distinct selection for A/B/C/D, 
 * and shows correction once an option is selected.
 */

import React, { useState, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CiaQcmOption {
  REF_QUESTION: string;
  Question: string;
  Option: string;
  'REPONSE CIA': string;
  Remarques: string;
  Reponse_user: string;
  Score: string;
}

interface CiaQcmQuestionGroup {
  questionText: string;
  options: CiaQcmOption[]; // Should typically be 4 options
  correctAnswer: string;
  remarques: string;
}

interface CiaQcmAccordionRendererProps {
  data: any[];
  isDark?: boolean;
}

// ─── Extraction logic ─────────────────────────────────────────────────────────

function extractQuestionsFromData(data: any[]): CiaQcmQuestionGroup[] {
  if (!data || !data.length) return [];
  
  const mainObj = data[0];
  const etape = mainObj['Etape mission - CIA'];
  if (!Array.isArray(etape)) return [];

  const groupsMap = new Map<string, CiaQcmOption[]>();

  etape.forEach((tableObj) => {
    // Iterate through keys like "table 1", "table 2", etc.
    Object.keys(tableObj).forEach((tableKey) => {
      const rows = tableObj[tableKey];
      if (Array.isArray(rows)) {
        rows.forEach((row: any) => {
          // If the row has "Question" and "Option", it's an option row
          if (row.Question && row.Option) {
            const qStr = String(row.Question).trim();
            if (!groupsMap.has(qStr)) {
              groupsMap.set(qStr, []);
            }
            groupsMap.get(qStr)!.push(row as CiaQcmOption);
          }
        });
      }
    });
  });

  const questions: CiaQcmQuestionGroup[] = [];
  
  groupsMap.forEach((options, questionText) => {
    // Assuming 'REPONSE CIA' and 'Remarques' are consistent across the options 
    // for the same question (or taking the one that is non-empty)
    const refOption = options.find(o => o.Remarques && o.Remarques.trim() !== '') || options[0];
    
    questions.push({
      questionText,
      options,
      correctAnswer: refOption['REPONSE CIA'] || '',
      remarques: refOption['Remarques'] || ''
    });
  });

  return questions;
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

const CoverPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, rgba(234,88,12,0.92) 0%, rgba(194,65,12,0.92) 100%)', // Orange gradient
      color: '#ffffff',
      padding: '48px 40px',
      textAlign: 'center',
      minHeight: '150px',
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
        opacity: 0.9,
      }}
    >
      CIA — Formation Audit Interne
    </div>
    <div
      style={{
        fontSize: '26px',
        fontWeight: 700,
        lineHeight: 1.3,
        maxWidth: '700px',
      }}
    >
      QCM d'Évaluation
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

// ─── Single Question Section ──────────────────────────────────────────────────

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const QuestionSection: React.FC<{
  group: CiaQcmQuestionGroup;
  index: number;
  isDark: boolean;
}> = ({ group, index, isDark }) => {

  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);

  const hasSelected = selectedOptionIdx !== null;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Question Header & Text */}
      <div style={{ 
        fontSize: '15px', 
        fontWeight: 600, 
        color: isDark ? '#e2e8f0' : '#1e293b',
        lineHeight: 1.6,
        background: isDark ? '#1e293b' : '#f8fafc',
        padding: '16px 20px',
        borderRadius: '8px',
        borderLeft: `4px solid ${isDark ? '#f97316' : '#ea580c'}`
      }}>
        <div style={{ 
          color: isDark ? '#f97316' : '#ea580c', 
          fontSize: '12px', 
          textTransform: 'uppercase', 
          fontWeight: 800, 
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          Question {index + 1}
        </div>
        <div>
          {group.questionText}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {group.options.map((opt, optIdx) => {
          const letter = LETTERS[optIdx] || '?';
          const isSelected = selectedOptionIdx === optIdx;
          
          let borderColor = isDark ? '#334155' : '#e2e8f0';
          let bgColor = isDark ? '#0f172a' : '#ffffff';
          let indicatorBg = isDark ? '#1e293b' : '#f1f5f9';
          let indicatorColor = isDark ? '#94a3b8' : '#64748b';

          if (isSelected) {
            borderColor = isDark ? '#f97316' : '#f97316';
            bgColor = isDark ? 'rgba(249, 115, 22, 0.1)' : '#fff7ed';
            indicatorBg = '#f97316';
            indicatorColor = '#ffffff';
          }

          return (
            <div
              key={optIdx}
              onClick={() => setSelectedOptionIdx(optIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '8px',
                border: `2px solid ${borderColor}`,
                background: bgColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Checkbox / Indicator */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: indicatorBg,
                color: indicatorColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 0 4px rgba(249, 115, 22, 0.2)' : 'none'
              }}>
                {letter}
              </div>
              
              {/* Option Text */}
              <div style={{ 
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: '14px',
                lineHeight: 1.5
              }}>
                {opt.Option}
              </div>
            </div>
          );
        })}
      </div>

      {/* Correction Section (Visible only if answered) */}
      <div style={{
        maxHeight: hasSelected ? '2000px' : '0',
        opacity: hasSelected ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s ease, opacity 0.4s ease',
        marginTop: hasSelected ? '8px' : '0'
      }}>
        <div style={{
          background: isDark ? '#1e293b' : '#f8fafc',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header Correction */}
          <div style={{
            background: isDark ? '#0f172a' : '#f1f5f9',
            padding: '12px 16px',
            borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            fontSize: '13px',
            fontWeight: 700,
            color: isDark ? '#818cf8' : '#4f46e5',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Correction & Remarques
          </div>
          
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Réponse CIA */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Réponse Attendue
              </div>
              <div style={{ 
                padding: '12px', 
                background: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                borderLeft: '4px solid #22c55e',
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '14px',
                borderRadius: '4px'
              }}>
                {group.correctAnswer}
              </div>
            </div>

            {/* Remarques */}
            {group.remarques && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Explications
                </div>
                <div style={{ 
                  color: isDark ? '#cbd5e1' : '#475569', 
                  fontSize: '14px', 
                  lineHeight: 1.6 
                }}>
                  {group.remarques}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', // Orange theme for QCM
    color: '#ffffff',
  };

  const inactiveHeaderStyle: React.CSSProperties = {
    background: isDark ? '#1e293b' : '#f1f5f9',
    color: isDark ? '#e2e8f0' : '#1e3a8a',
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
          fontSize: '15px',
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
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          paddingRight: '16px' 
        }}>
          {title}
        </span>
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
            flexShrink: 0
          }}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? '6000px' : '0',
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

// ─── Main Component ───────────────────────────────────────────────────────────

const CiaQcmAccordionRenderer: React.FC<CiaQcmAccordionRendererProps> = ({
  data,
  isDark = false,
}) => {

  const questions = useMemo(() => extractQuestionsFromData(data), [data]);

  if (questions.length === 0) {
    return (
      <div style={{ color: isDark ? '#f87171' : '#dc2626', padding: '16px' }}>
        Aucune question QCM valide n'a pu être extraite des résultats.
      </div>
    );
  }

  const totalPanels = questions.length + 1; // 1 for cover

  return (
    <div
      style={{
        margin: '16px 0',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
        title="📋 Introduction QCM"
        defaultOpen={true}
        isDark={isDark}
        index={0}
        totalPanels={totalPanels}
      >
        <CoverPage isDark={isDark} />
      </AccordionPanel>

      {/* ── Panels 1..N: one per Question ─────────────────────────── */}
      {questions.map((group, idx) => {
        // Truncate question for title to keep it clean
        let title = group.questionText;
        if (title.length > 80) {
          title = title.substring(0, 80) + '...';
        }

        return (
          <AccordionPanel
            key={idx}
            title={`❓ Q${idx + 1} : ${title}`}
            defaultOpen={false}
            isDark={isDark}
            index={idx + 1}
            totalPanels={totalPanels}
          >
            <QuestionSection group={group} index={idx} isDark={isDark} />
          </AccordionPanel>
        );
      })}
    </div>
  );
};

export default CiaQcmAccordionRenderer;
