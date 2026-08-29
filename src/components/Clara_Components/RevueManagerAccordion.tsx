/**
 * RevueManagerAccordion.tsx
 * 
 * Interactive accordion for Manager Review in audit workpapers.
 * Supports persistent edits, adding/removing points, and status management.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  blueMain:  "#1855A3",
  blueDark:  "#0C447C",
  blueLight: "#E6F1FB",
  blueText:  "#185FA5",
  greenBg:   "#EAF3DE",
  greenTxt:  "#3B6D11",
  amberBg:   "#FAEEDA",
  amberTxt:  "#854F0B",
  redBg:     "#FCEBEB",
  redTxt:    "#A32D2D",
  border:    "#cbd5e1",
  borderSub: "#e2e8f0",
  bgCard:    "#f8fafc",
  txtBody:   "#475569",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevuePoint {
  num: number;
  titre: string;
  statut: 'ok' | 'warn' | 'ko';
  prep: string;
  rev: string;
}

interface RevueManagerAccordionProps {
  points?: RevuePoint[];
  reference: string;
  preparer?: string;
  reviewer?: string;
  isDark?: boolean;
  onSave?: (points: RevuePoint[]) => void;
}

// ─── Statut badge ─────────────────────────────────────────────────────────────

const STATUT = {
  ok:   { label: "Validé",    bg: C.greenBg, color: C.greenTxt, icon: <CheckCircle2 size={12} /> },
  warn: { label: "À suivre",  bg: C.amberBg, color: C.amberTxt, icon: <AlertCircle size={12} /> },
  ko:   { label: "À ajuster", bg: C.redBg,   color: C.redTxt,   icon: <XCircle size={12} />     },
};

function StatutBadge({ statut }: { statut: string }) {
  const m = STATUT[statut as keyof typeof STATUT] ?? STATUT.ok;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      padding: "2px 8px", borderRadius: 10,
      background: m.bg, color: m.color,
      flexShrink: 0, marginLeft: 6, whiteSpace: "nowrap",
      display: "flex", alignItems: "center", gap: 4
    }}>
      {m.icon}
      {m.label}
    </span>
  );
}

// ─── Cover ────────────────────────────────────────────────────────────────────

function RevueCover({ reference }: { reference: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.blueMain} 0%, ${C.blueDark} 100%)`,
      color: "#fff", padding: "18px 22px",
    }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: 3,
        textTransform: "uppercase", opacity: 0.8, marginBottom: 6,
      }}>
        Dossier de mission — {reference}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
        Revue Manager
      </div>
      <div style={{
        width: 44, height: 2,
        background: "rgba(255,255,255,0.4)",
        borderRadius: 2, marginTop: 8,
      }} />
    </div>
  );
}

// ─── Single Panel ─────────────────────────────────────────────────────────────

interface RevuePanelProps {
  point: RevuePoint;
  preparer: string;
  reviewer: string;
  index: number;
  total: number;
  onChange: (index: number, updated: RevuePoint) => void;
  onRemove: (index: number) => void;
}

function RevuePanel({ point, preparer, reviewer, index, total, onChange, onRemove }: RevuePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLast = index === total - 1;

  const headerActive = {
    background: `linear-gradient(135deg, ${C.blueMain} 0%, ${C.blueDark} 100%)`,
    color: "#fff",
  };
  const headerInactive = { background: "#f1f5f9", color: "#1e3a8a" };

  return (
    <div style={{ borderBottom: isLast ? 'none' : `1px solid ${C.borderSub}` }}>
      {/* ── Bouton ── */}
      <div style={{ display: 'flex', width: '100%' }}>
        <button
          onClick={() => setIsOpen(v => !v)}
          aria-expanded={isOpen}
          style={{
            ...(isOpen ? headerActive : headerInactive),
            flex: 1, textAlign: "left",
            border: "none", 
            outline: "none", cursor: "pointer",
            padding: "11px 18px",
            fontSize: 11.5, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            transition: "all 0.2s ease",
            fontFamily: "inherit",
          }}
        >
          <span style={{
            display: "flex", alignItems: "center",
            gap: 6, overflow: "hidden", flex: 1, minWidth: 0,
          }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, flexShrink: 0,
              color: isOpen ? "#fff" : C.blueMain,
              transition: "color 0.2s",
            }}>
              Point {point.num}
            </span>
            <span style={{
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {point.titre}
            </span>
            {!isOpen && <StatutBadge statut={point.statut} />}
          </span>
          <span style={{
            fontSize: 16, fontWeight: 400, flexShrink: 0, marginLeft: 8,
            color: isOpen ? "#fff" : C.blueMain, transition: "color 0.2s",
          }}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          style={{
            background: "#fecaca", color: "#b91c1c", border: 'none',
            width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s'
          }}
          title="Supprimer ce point"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* ── Corps ── */}
      <div style={{
        maxHeight: isOpen ? 1200 : 0,
        overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "#fff",
      }}>
        <div style={{ padding: "16px 18px" }}>
          <div style={{
            border: `1px solid ${C.borderSub}`,
            borderRadius: 8, overflow: "hidden",
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {/* En-tête carte */}
            <div style={{
              padding: "10px 14px",
              background: C.bgCard,
              borderBottom: `1px solid ${C.borderSub}`,
              display: "flex", alignItems: "center", justifyContent: 'space-between', gap: 6,
            }}>
              <input 
                value={point.titre}
                onChange={(e) => onChange(index, { ...point, titre: e.target.value })}
                placeholder="Titre du point de revue..."
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontSize: 10, fontWeight: 700, color: C.blueMain,
                  textTransform: "uppercase", letterSpacing: 0.7,
                  outline: 'none', padding: '4px 0'
                }}
              />
              <select 
                value={point.statut}
                onChange={(e) => onChange(index, { ...point, statut: e.target.value as any })}
                style={{
                  fontSize: 9, fontWeight: 700, border: 'none', borderRadius: 4,
                  padding: '2px 4px', background: C.borderSub, cursor: 'pointer'
                }}
              >
                <option value="ok">Validé</option>
                <option value="warn">À suivre</option>
                <option value="ko">À ajuster</option>
              </select>
            </div>

            {/* Preparer */}
            <div style={{
              display: "flex", flexDirection: 'column', gap: 4,
              padding: "12px 14px", borderBottom: `1px solid ${C.borderSub}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 8.5, fontWeight: 800,
                  padding: "2px 8px", borderRadius: 10,
                  background: C.greenBg, color: C.greenTxt,
                  whiteSpace: "nowrap", textTransform: 'uppercase'
                }}>
                  Preparer — {preparer}
                </span>
              </div>
              <textarea 
                value={point.prep}
                onChange={(e) => onChange(index, { ...point, prep: e.target.value })}
                placeholder="Commentaire du préparateur..."
                style={{
                  width: '100%', minHeight: 60, border: '1px solid #f1f5f9',
                  borderRadius: 4, padding: 8, fontSize: 11, color: C.txtBody,
                  lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit',
                  background: '#fcfdfe'
                }}
              />
            </div>

            {/* Reviewer */}
            <div style={{
              display: "flex", flexDirection: 'column', gap: 4,
              padding: "12px 14px", background: C.bgCard
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 8.5, fontWeight: 800,
                  padding: "2px 8px", borderRadius: 10,
                  background: C.blueLight, color: C.blueText,
                  whiteSpace: "nowrap", textTransform: 'uppercase'
                }}>
                  Reviewer — {reviewer}
                </span>
              </div>
              <textarea 
                value={point.rev}
                onChange={(e) => onChange(index, { ...point, rev: e.target.value })}
                placeholder="Commentaire du superviseur..."
                style={{
                  width: '100%', minHeight: 60, border: '1px solid #e2e8f0',
                  borderRadius: 4, padding: 8, fontSize: 11, color: C.txtBody,
                  lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function RevueManagerAccordion({
  points: initialPoints = [],
  reference = "REF-TEST",
  preparer = "KMP",
  reviewer = "JFK",
  isDark = false,
  onSave
}: RevueManagerAccordionProps) {
  const [points, setPoints] = useState<RevuePoint[]>([]);
  const [isSaved, setIsSaved] = useState(true);

  // Persistence Key
  const storageKey = `clara_revue_manager_${reference}`;

  // Initial load
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        setPoints(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load revue manager data", e);
        setPoints(initialPoints);
      }
    } else {
      setPoints(initialPoints);
    }
  }, [reference]);

  // Save to localStorage
  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(points));
    setIsSaved(true);
    if (onSave) onSave(points);
  };

  const updatePoint = (index: number, updated: RevuePoint) => {
    const next = [...points];
    next[index] = updated;
    setPoints(next);
    setIsSaved(false);
  };

  const removePoint = (index: number) => {
    if (window.confirm("Supprimer ce point de revue ?")) {
      const next = points.filter((_, i) => i !== index).map((p, i) => ({ ...p, num: i + 1 }));
      setPoints(next);
      setIsSaved(false);
    }
  };

  const addPoint = () => {
    const newPoint: RevuePoint = {
      num: points.length + 1,
      titre: "Nouveau point de revue",
      statut: 'ok',
      prep: "",
      rev: ""
    };
    setPoints([...points, newPoint]);
    setIsSaved(false);
  };

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden",
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      margin: '20px 0',
      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      background: '#fff'
    }}>
      <RevueCover reference={reference} />
      
      {points.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <AlertCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Aucun point de revue</div>
          <div style={{ fontSize: 11, marginTop: 4 }}>Cliquez sur "Ajouter" pour commencer la revue.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {points.map((pt, idx) => (
            <RevuePanel
              key={idx}
              point={pt}
              preparer={preparer}
              reviewer={reviewer}
              index={idx}
              total={points.length}
              onChange={updatePoint}
              onRemove={removePoint}
            />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        padding: "12px 18px",
        background: "#f8fafc",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <button
          onClick={addPoint}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", border: `1px solid ${C.blueMain}`,
            color: C.blueMain, padding: "6px 12px", borderRadius: 6,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Plus size={14} /> Ajouter un point
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isSaved && (
            <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} /> Modifications non enregistrées
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaved}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isSaved ? "#94a3b8" : C.blueMain,
              color: "#fff", border: "none",
              padding: "6px 16px", borderRadius: 6,
              fontSize: 11, fontWeight: 700, cursor: isSaved ? "default" : "pointer",
              transition: "all 0.2s",
              boxShadow: isSaved ? 'none' : '0 2px 4px rgba(24, 85, 163, 0.3)'
            }}
          >
            <Save size={14} /> Enregistrer la revue
          </button>
        </div>
      </div>
    </div>
  );
}
