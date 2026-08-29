/**
 * RevueManagerAccordion.jsx
 *
 * Composant React — Revue Manager pour feuilles de travail CAC.
 * Adapté du pattern CiaQcmAccordionRenderer.tsx.
 *
 * Affiche les commentaires numérotés du Preparer et du Reviewer
 * dans un menu accordéon, positionné en dessous du tableau [Légendes].
 *
 * Props :
 *   points    {RevuePoint[]}  — liste des points de revue
 *   reference {string}        — référence du test  (ex : "Test-Caisse-001")
 *   preparer  {string}        — initiales preparer (ex : "KMP")
 *   reviewer  {string}        — initiales reviewer (ex : "JFK")
 *   isDark    {boolean}       — thème sombre (optionnel, défaut false)
 *
 * RevuePoint :
 *   num    {number}               — numéro du point (1, 2 …)
 *   titre  {string}               — intitulé du point
 *   statut {'ok'|'warn'|'ko'}     — ok=Validé  warn=À suivre  ko=À ajuster
 *   prep   {string}               — commentaire Preparer
 *   rev    {string}               — commentaire Reviewer
 */

import { useState } from "react";

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

// ─── Statut badge ─────────────────────────────────────────────────────────────

const STATUT = {
  ok:   { label: "Validé",    bg: C.greenBg, color: C.greenTxt },
  warn: { label: "À suivre",  bg: C.amberBg, color: C.amberTxt },
  ko:   { label: "À ajuster", bg: C.redBg,   color: C.redTxt   },
};

function StatutBadge({ statut }) {
  const m = STATUT[statut] ?? STATUT.ok;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      padding: "2px 7px", borderRadius: 10,
      background: m.bg, color: m.color,
      flexShrink: 0, marginLeft: 6, whiteSpace: "nowrap",
    }}>
      {m.label}
    </span>
  );
}

// ─── Cover ────────────────────────────────────────────────────────────────────

function RevueCover({ reference }) {
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
      <div style={{ fontSize: 16, fontWeight: 700 }}>Revue Manager</div>
      <div style={{
        width: 44, height: 2,
        background: "rgba(255,255,255,0.4)",
        borderRadius: 2, marginTop: 8,
      }} />
    </div>
  );
}

// ─── Single Panel ─────────────────────────────────────────────────────────────

function RevuePanel({ point, preparer, reviewer, index, total }) {
  const [isOpen, setIsOpen] = useState(false);
  const isLast = index === total - 1;

  const headerActive = {
    background: `linear-gradient(135deg, ${C.blueMain} 0%, ${C.blueDark} 100%)`,
    color: "#fff",
  };
  const headerInactive = { background: "#f1f5f9", color: "#1e3a8a" };

  return (
    <div>
      {/* ── Bouton ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        style={{
          ...(isOpen ? headerActive : headerInactive),
          width: "100%", textAlign: "left",
          border: "none", borderTop: `1px solid ${C.border}`,
          outline: "none", cursor: "pointer",
          padding: "11px 18px",
          fontSize: 11.5, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transition: "background 0.2s",
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
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* ── Corps ── */}
      <div style={{
        maxHeight: isOpen ? 800 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s ease",
        background: "#fff",
        borderRadius: isLast && isOpen ? "0 0 8px 8px" : 0,
        borderTop: isOpen ? `1px solid ${C.borderSub}` : "none",
      }}>
        <div style={{ padding: "14px 18px" }}>
          <div style={{
            border: `1px solid ${C.borderSub}`,
            borderRadius: 6, overflow: "hidden",
          }}>
            {/* En-tête carte */}
            <div style={{
              padding: "7px 12px",
              fontSize: 9.5, fontWeight: 700,
              letterSpacing: 0.7, textTransform: "uppercase",
              background: C.bgCard,
              borderBottom: `1px solid ${C.borderSub}`,
              color: C.blueMain,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Point {point.num} — {point.titre}
              <StatutBadge statut={point.statut} />
            </div>

            {/* Preparer */}
            <div style={{
              display: "flex", gap: 8,
              padding: "8px 12px", alignItems: "flex-start",
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700,
                padding: "2px 7px", borderRadius: 10,
                background: C.greenBg, color: C.greenTxt,
                whiteSpace: "nowrap", flexShrink: 0, marginTop: 1,
              }}>
                Preparer — {preparer}
              </span>
              <span style={{ fontSize: 11, lineHeight: 1.6, color: C.txtBody }}>
                {point.prep}
              </span>
            </div>

            {/* Reviewer */}
            <div style={{
              display: "flex", gap: 8,
              padding: "8px 12px", alignItems: "flex-start",
              background: C.bgCard,
              borderTop: `1px solid ${C.borderSub}`,
            }}>
              <span style={{
                fontSize: 9, fontWeight: 700,
                padding: "2px 7px", borderRadius: 10,
                background: C.blueLight, color: C.blueText,
                whiteSpace: "nowrap", flexShrink: 0, marginTop: 1,
              }}>
                Reviewer — {reviewer}
              </span>
              <span style={{ fontSize: 11, lineHeight: 1.6, color: C.txtBody }}>
                {point.rev}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function RevueManagerAccordion({
  points   = [],
  reference = "",
  preparer  = "KMP",
  reviewer  = "JFK",
  isDark    = false,
}) {
  if (!points.length) {
    return (
      <div style={{ color: "#dc2626", padding: 12, fontSize: 12 }}>
        Aucun point de revue disponible.
      </div>
    );
  }

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 8, overflow: "hidden",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      marginTop: 4,
    }}>
      <RevueCover reference={reference} />
      {points.map((pt, idx) => (
        <RevuePanel
          key={idx}
          point={pt}
          preparer={preparer}
          reviewer={reviewer}
          index={idx}
          total={points.length}
        />
      ))}
    </div>
  );
}

// ─── Données Test-Caisse-001 (à importer ou inliner) ─────────────────────────

export const POINTS_CAISSE_001 = [
  {
    num: 1,
    titre: "Étendue de l'échantillon et représentativité",
    statut: "ok",
    prep: "Échantillon de 20 PV couvrant l'intégralité de l'exercice 2023 (jan.–déc.), au moins un PV par mois. Taux de couverture : 100 % des mois. Sélection conforme ISA 530.",
    rev:  "Étendue validée. La sélection est représentative et couvre les périodes à risque (clôture, mid-year). Aucun ajustement requis sur ce point.",
  },
  {
    num: 2,
    titre: "Anomalie significative — PV-C-23-009 (−150 000 FCFA)",
    statut: "ko",
    prep: "Écart de −150 000 FCFA entre solde physique (650 000 FCFA) et solde théorique (800 000 FCFA). Bon de caisse volant « Avance sur salaire DG » non comptabilisé et non autorisé. Risque de fraude signalé (ISA 240). Proposition d'ajustement ISA 450.",
    rev:  "Point critique confirmé. L'ajustement d'audit est à formaliser et soumettre à la direction. Lettre de recommandation ISA 265 à adresser au management. Communication aux responsables (ISA 260). Suivi obligatoire en revue finale.",
  },
  {
    num: 3,
    titre: "Faiblesses CI — PV non signés (PV-C-23-004 & PV-C-23-015)",
    statut: "warn",
    prep: "Deux PV présentent des défauts de signature : PV-C-23-004 (contrôleur financier absent) et PV-C-23-015 (signature caissier manquante). CTR1 négatif sur les deux. Montants concordants mais procédure de validation non respectée.",
    rev:  "Faiblesses CI confirmées. À intégrer dans la lettre de recommandations ISA 265. Vérifier si ces défauts sont isolés ou systémiques. Contrôler l'existence d'une délégation de signature dans les procédures internes.",
  },
  {
    num: 4,
    titre: "Écart positif mineur — PV-C-23-018 (+5 000 FCFA)",
    statut: "ok",
    prep: "Excédent de +5 000 FCFA (versement client non réclamé) comptabilisé en compte 77 — Produits divers. PV signé, CTR 1/2/3 positifs. Montant en deçà du seuil de signification.",
    rev:  "Traitement comptable correct. Montant non significatif. Aucune action complémentaire requise. Point soldé.",
  },
  {
    num: 5,
    titre: "Inventaire de clôture au 31/12/2023 — PV-C-23-020",
    statut: "ok",
    prep: "Inventaire de clôture assisté par l'auditeur conformément à ISA 501. Solde physique = solde théorique = 500 000 FCFA. Toutes signatures conformes. Cut-off validé.",
    rev:  "Procédure de clôture conforme. Assertions Existence et Cut-off validées sans réserve. À mentionner positivement dans le rapport de synthèse.",
  },
];

// ─── Usage ────────────────────────────────────────────────────────────────────
//
// import RevueManagerAccordion, { POINTS_CAISSE_001 } from "./RevueManagerAccordion";
//
// <RevueManagerAccordion
//   points={POINTS_CAISSE_001}
//   reference="Test-Caisse-001"
//   preparer="KMP"
//   reviewer="JFK"
// />
