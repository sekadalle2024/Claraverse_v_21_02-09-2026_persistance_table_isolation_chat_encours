/**
 * content.js - Table Selector Detective
 * Détecte toutes les tables dans le DOM du chat et retourne leurs sélecteurs CSS
 * Compatible Claraverse / Flowise / Interfaces chat génériques
 * @version 1.0.0
 */

(function () {
  "use strict";

  // =====================================================================
  // CATALOGUE COMPLET DES SÉLECTEURS - basé sur Flowise.js + génériques
  // =====================================================================
  const SELECTOR_CATALOG = {
    // --- Sélecteurs NATIFS Claraverse / Flowise.js V17 ---
    claraverse: {
      label: "🟢 Claraverse / Flowise (Natifs)",
      selectors: [
        "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
        "div.prose.prose-base.dark\\:prose-invert.max-w-none table",
        "div.overflow-x-auto.my-4 table",
        "div.prose table",
        "div.prose-base table",
        "div.prose-invert table",
      ],
    },

    // --- Sélecteurs génériques interface chat Tailwind CSS ---
    tailwind_chat: {
      label: "🔵 Chat Tailwind CSS (Génériques)",
      selectors: [
        "table.min-w-full",
        "table.border.border-gray-200",
        "table.rounded-lg",
        "div.overflow-x-auto table",
        "div.overflow-auto table",
        "div.overflow-x-scroll table",
      ],
    },

    // --- Sélecteurs message/réponse chat ---
    message_containers: {
      label: "🟡 Conteneurs Messages Chat",
      selectors: [
        ".message table",
        ".message-content table",
        ".chat-message table",
        ".bot-message table",
        ".assistant-message table",
        ".ai-message table",
        ".response table",
        ".answer table",
        "[data-role='assistant'] table",
        "[data-message-role='assistant'] table",
        ".markdown table",
        ".markdown-body table",
        ".prose table",
      ],
    },

    // --- Sélecteurs Markdown renderers ---
    markdown_renderers: {
      label: "🟠 Markdown Renderers",
      selectors: [
        ".wmde-markdown table",
        ".react-markdown table",
        ".remark table",
        ".marked table",
        ".hljs-container table",
        "[class*='markdown'] table",
        "[class*='prose'] table",
      ],
    },

    // --- Sélecteurs spéciaux dark mode ---
    dark_mode: {
      label: "⚫ Dark Mode Variants",
      selectors: [
        ".dark table",
        "[data-theme='dark'] table",
        ".dark\\:prose-invert table",
        "[class*='dark'] table",
      ],
    },

    // --- Sélecteur universel de dernier recours ---
    universal: {
      label: "🔴 Universel (Dernier recours)",
      selectors: [
        "table",
        "div > table",
        "section table",
        "article table",
        "main table",
      ],
    },
  };

  // =====================================================================
  // FONCTION : Génère le sélecteur CSS précis d'un élément
  // =====================================================================
  function generateCSSSelector(element) {
    if (!element || element === document.body) return "body";

    const selectors = [];

    // 1. ID unique
    if (element.id) {
      return "#" + CSS.escape(element.id);
    }

    // 2. Reconstruction par chemin d'ancêtres
    let el = element;
    while (el && el !== document.documentElement) {
      let selector = el.tagName.toLowerCase();

      // Classes CSS significatives
      if (el.classList.length > 0) {
        const classes = Array.from(el.classList)
          .filter(cls => cls.length > 0 && !cls.includes(":") && cls.length < 60)
          .slice(0, 4) // max 4 classes
          .map(cls => "." + CSS.escape(cls))
          .join("");
        if (classes) selector += classes;
      }

      // Position nth-child si nécessaire pour disambiguïté
      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).filter(
            (s) => s.tagName === el.tagName
          )
        : [];
      if (siblings.length > 1) {
        const idx = siblings.indexOf(el) + 1;
        selector += `:nth-of-type(${idx})`;
      }

      selectors.unshift(selector);
      el = el.parentElement;

      // Arrêter si on atteint un conteneur identifié (div avec id ou classe unique)
      if (el && el.id) {
        selectors.unshift("#" + CSS.escape(el.id));
        break;
      }

      // Limite de profondeur
      if (selectors.length >= 6) break;
    }

    return selectors.join(" > ");
  }

  // =====================================================================
  // FONCTION : Génère un sélecteur COURT et pratique pour une table
  // =====================================================================
  function generateShortSelector(table) {
    // Classes de la table elle-même
    const tableClasses = Array.from(table.classList)
      .filter(cls => cls.length > 0)
      .map(cls => "." + CSS.escape(cls))
      .join("");

    if (tableClasses) {
      const selector = "table" + tableClasses;
      // Vérifier si ce sélecteur est unique dans la page
      try {
        const matches = document.querySelectorAll(selector);
        if (matches.length === 1) return selector + " ✅ (unique)";
        return selector + ` (${matches.length} tables)`;
      } catch {
        return selector;
      }
    }

    // Remonter vers le parent le plus proche avec une classe
    let parent = table.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      if (parent.classList.length > 0) {
        const parentClasses = Array.from(parent.classList)
          .filter(cls => cls.length > 0 && cls.length < 50)
          .slice(0, 3)
          .map(cls => "." + CSS.escape(cls))
          .join("");
        if (parentClasses) {
          const selector = parent.tagName.toLowerCase() + parentClasses + " table";
          try {
            const matches = document.querySelectorAll(selector);
            if (matches.length <= 3) return selector + ` (${matches.length} table(s))`;
          } catch {}
        }
      }
      parent = parent.parentElement;
      depth++;
    }

    return "table (sélecteur générique)";
  }

  // =====================================================================
  // FONCTION : Analyse un élément table et extrait ses métadonnées
  // =====================================================================
  function analyzeTable(table, index) {
    const headers = Array.from(table.querySelectorAll("th, thead td")).map(th =>
      th.textContent.trim()
    );
    const rowCount = table.querySelectorAll("tbody tr").length;
    const cellCount = table.querySelectorAll("td").length;

    // Classes complètes
    const allClasses = Array.from(table.classList).join(" ") || "(aucune classe)";

    // Parent direct info
    const parent = table.parentElement;
    const parentInfo = parent
      ? `<${parent.tagName.toLowerCase()}${parent.id ? ' id="' + parent.id + '"' : ""}${parent.classList.length ? ' class="' + Array.from(parent.classList).slice(0, 3).join(" ") + '"' : ""}>`
      : "N/A";

    // Grand-parent info
    const grandParent = parent ? parent.parentElement : null;
    const grandParentInfo = grandParent
      ? `<${grandParent.tagName.toLowerCase()}${grandParent.id ? ' id="' + grandParent.id + '"' : ""}${grandParent.classList.length ? ' class="' + Array.from(grandParent.classList).slice(0, 3).join(" ") + '"' : ""}>`
      : "N/A";

    // Quel sélecteur du catalogue correspond à cette table ?
    const matchedSelectors = [];
    for (const [category, data] of Object.entries(SELECTOR_CATALOG)) {
      for (const sel of data.selectors) {
        try {
          const results = document.querySelectorAll(sel);
          if (Array.from(results).includes(table)) {
            matchedSelectors.push({ category: data.label, selector: sel });
          }
        } catch {}
      }
    }

    // Sélecteur court et sélecteur précis
    const shortSelector = generateShortSelector(table);
    const preciseSelector = generateCSSSelector(table);

    return {
      index,
      tableClasses: allClasses,
      headers: headers.length > 0 ? headers : ["(aucun en-tête <th>)"],
      rowCount,
      cellCount,
      parentInfo,
      grandParentInfo,
      shortSelector,
      preciseSelector,
      matchedSelectors,
    };
  }

  // =====================================================================
  // FONCTION PRINCIPALE : Scan toutes les tables du DOM
  // =====================================================================
  function scanAllTables() {
    console.log("🔍 [Table Detective] Début du scan...");

    const results = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      totalTablesFound: 0,
      catalogHits: {},
      tables: [],
    };

    // --- Scan par sélecteur du catalogue ---
    for (const [categoryKey, data] of Object.entries(SELECTOR_CATALOG)) {
      results.catalogHits[categoryKey] = { label: data.label, hits: [] };
      for (const sel of data.selectors) {
        try {
          const found = document.querySelectorAll(sel);
          if (found.length > 0) {
            results.catalogHits[categoryKey].hits.push({
              selector: sel,
              count: found.length,
            });
          }
        } catch (e) {
          // Sélecteur invalide sur ce navigateur
        }
      }
    }

    // --- Scan universel de TOUTES les tables ---
    const allTables = document.querySelectorAll("table");
    results.totalTablesFound = allTables.length;

    allTables.forEach((table, index) => {
      const analysis = analyzeTable(table, index + 1);
      results.tables.push(analysis);
    });

    console.log(`✅ [Table Detective] ${results.totalTablesFound} table(s) trouvée(s)`);
    return results;
  }

  // Expose la fonction pour le popup
  window.__tableDetective = { scan: scanAllTables };

  // Réponse aux messages venant du popup via chrome.tabs.sendMessage
  // (Injection via scripting.executeScript)
  return scanAllTables();
})();
