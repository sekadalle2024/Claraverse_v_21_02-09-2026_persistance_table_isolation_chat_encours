/**
 * popup.js - Table Selector Detective
 * Gère l'injection du content script et le rendu des résultats
 * @version 1.0.0
 */

"use strict";

// ============================================================
// UTILITAIRES
// ============================================================

// Variable globale pour stocker les résultats du dernier scan
let lastScanResults = null;

/** Affiche un toast de confirmation de copie */
function showCopyToast(message = "✅ Sélecteur copié !") {
  const toast = document.getElementById("copyToast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

/** Copie un texte dans le presse-papier */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showCopyToast();
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showCopyToast();
  }
}

/** Échappe le HTML pour affichage sécurisé */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// RENDU - BARRE DE STATUT
// ============================================================
function renderStatusBar(results) {
  const count = results.totalTablesFound;
  const color = count > 0 ? "ready" : "error";
  const text = count > 0
    ? `Scan terminé — ${new Date(results.timestamp).toLocaleTimeString("fr-FR")}`
    : "Aucune table trouvée sur cette page";

  return `
    <div class="status-bar">
      <div class="status-dot ${color}"></div>
      <span class="status-text">${text}</span>
      <span class="status-count">${count} table${count > 1 ? "s" : ""}</span>
    </div>
  `;
}

// ============================================================
// RENDU - CATALOGUE DES HITS PAR CATÉGORIE
// ============================================================
function renderCatalogHits(catalogHits) {
  let html = `<div class="section-title">📚 Sélecteurs qui fonctionnent</div>`;
  html += `<div class="catalog-grid">`;

  for (const [key, data] of Object.entries(catalogHits)) {
    const hasHits = data.hits && data.hits.length > 0;
    html += `<div class="catalog-row${hasHits ? " has-hits" : ""}">`;
    html += `<span class="catalog-label">${escapeHtml(data.label)}</span>`;
    html += `<div class="catalog-hits-list">`;

    if (hasHits) {
      data.hits.forEach(hit => {
        const sel = escapeHtml(hit.selector);
        html += `
          <div class="catalog-hit-item">
            <code class="catalog-hit-selector" title="Cliquer pour copier"
              data-copy="${escapeHtml(hit.selector)}">${sel}</code>
            <span class="catalog-hit-count">${hit.count}×</span>
          </div>`;
      });
    } else {
      html += `<span class="no-hits">— aucun résultat</span>`;
    }

    html += `</div></div>`;
  }

  html += `</div>`;
  return html;
}

// ============================================================
// RENDU - CARTE D'UNE TABLE
// ============================================================
function renderTableCard(table) {
  const headersHtml = table.headers
    .map(h => `<span class="header-tag">${escapeHtml(h)}</span>`)
    .join("");

  // Sélecteurs correspondants
  let matchedHtml = "";
  if (table.matchedSelectors.length > 0) {
    matchedHtml = `<div class="matched-selectors">`;
    table.matchedSelectors.forEach(m => {
      matchedHtml += `
        <div class="matched-sel-item">
          <span class="matched-sel-cat">${escapeHtml(m.category)}</span>
          <code class="matched-sel-code" data-copy="${escapeHtml(m.selector)}">${escapeHtml(m.selector)}</code>
        </div>`;
    });
    matchedHtml += `</div>`;
  } else {
    matchedHtml = `<span class="no-matched">⚠️ Aucun sélecteur du catalogue ne correspond</span>`;
  }

  return `
    <div class="table-card" id="card-${table.index}">
      <div class="table-card-header" onclick="toggleCard(${table.index})">
        <span class="table-index">${table.index}</span>
        <span class="table-short-selector">${escapeHtml(table.shortSelector)}</span>
        <span class="table-meta-badge">${table.rowCount} ligne${table.rowCount > 1 ? "s" : ""} · ${table.cellCount} cell.</span>
        <span class="table-toggle" id="toggle-${table.index}">▼</span>
      </div>

      <div class="table-card-body" id="body-${table.index}">

        <div class="info-row">
          <span class="info-label">🏷️ Classes table</span>
          <span class="info-value">${escapeHtml(table.tableClasses)}</span>
        </div>

        <div class="info-row">
          <span class="info-label">📌 Sélecteur court</span>
          <code class="info-value code" data-copy="${escapeHtml(table.shortSelector)}"
            title="Cliquer pour copier">${escapeHtml(table.shortSelector)}</code>
        </div>

        <div class="info-row">
          <span class="info-label">🎯 Sélecteur précis</span>
          <code class="info-value code" data-copy="${escapeHtml(table.preciseSelector)}"
            title="Cliquer pour copier">${escapeHtml(table.preciseSelector)}</code>
        </div>

        <div class="info-row">
          <span class="info-label">🗂️ En-têtes &lt;th&gt;</span>
          <div class="info-value">
            <div class="headers-list">${headersHtml}</div>
          </div>
        </div>

        <div class="info-row">
          <span class="info-label">📦 Parent direct</span>
          <code class="parent-info-code">${escapeHtml(table.parentInfo)}</code>
        </div>

        <div class="info-row">
          <span class="info-label">📦 Grand-parent</span>
          <code class="parent-info-code">${escapeHtml(table.grandParentInfo)}</code>
        </div>

        <div class="info-row" style="flex-direction:column; gap:6px;">
          <span class="info-label" style="min-width:unset;">✅ Sélecteurs catalogue qui la capturent</span>
          <div class="info-value">${matchedHtml}</div>
        </div>

      </div>
    </div>
  `;
}

// ============================================================
// RENDU PRINCIPAL
// ============================================================
function renderResults(results) {
  const container = document.getElementById("mainContent");
  let html = "";

  // URL bar
  const shortUrl = results.url.length > 55
    ? results.url.substring(0, 55) + "…"
    : results.url;
  html += `<div class="url-bar" title="${escapeHtml(results.url)}">🌐 ${escapeHtml(shortUrl)}</div>`;

  // Status bar
  html += renderStatusBar(results);

  // Si aucune table
  if (results.totalTablesFound === 0) {
    html += `
      <div class="empty-state">
        <div class="icon">🚫</div>
        <p>Aucune balise <code>&lt;table&gt;</code> trouvée.<br>
        Le chat utilise peut-être un rendu différent<br>
        (divs CSS, grids). Essayez d'afficher un message<br>
        contenant une table, puis relancez le scan.</p>
      </div>`;
    container.innerHTML = html;
    attachCopyHandlers();
    return;
  }

  // Catalogue des hits
  html += renderCatalogHits(results.catalogHits);

  // Séparateur
  html += `<div class="section-title" style="margin-top:4px;">📋 Détail des ${results.totalTablesFound} table${results.totalTablesFound > 1 ? "s" : ""} trouvée${results.totalTablesFound > 1 ? "s" : ""}</div>`;

  // Cards des tables
  html += `<div class="tables-list">`;
  results.tables.forEach(t => {
    html += renderTableCard(t);
  });
  html += `</div>`;

  container.innerHTML = html;
  attachCopyHandlers();
}

// ============================================================
// TOGGLE ACCORDÉON
// ============================================================
window.toggleCard = function (index) {
  const body = document.getElementById(`body-${index}`);
  const toggle = document.getElementById(`toggle-${index}`);
  if (body.classList.contains("open")) {
    body.classList.remove("open");
    toggle.classList.remove("open");
  } else {
    body.classList.add("open");
    toggle.classList.add("open");
  }
};

// ============================================================
// COPIE AU CLIC
// ============================================================
function attachCopyHandlers() {
  document.querySelectorAll("[data-copy]").forEach(el => {
    el.addEventListener("click", async () => {
      const text = el.getAttribute("data-copy");
      await copyToClipboard(text);
      el.classList.add("copied");
      setTimeout(() => el.classList.remove("copied"), 1500);
    });
  });
}

// ============================================================
// BOUTON SCANNER - Injection du content script
// ============================================================
document.getElementById("btnScan").addEventListener("click", async () => {
  const btn = document.getElementById("btnScan");
  const btnIcon = document.getElementById("btnIcon");
  const btnLabel = document.getElementById("btnLabel");

  // État loading
  btn.classList.add("loading");
  btn.disabled = true;
  btnIcon.textContent = "⏳";
  btnLabel.textContent = "Scan…";

  // Status en cours
  document.getElementById("mainContent").innerHTML = `
    <div class="status-bar">
      <div class="status-dot scanning"></div>
      <span class="status-text">Scan en cours…</span>
    </div>`;

  try {
    // Récupère l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      throw new Error("Impossible d'accéder à l'onglet actif.");
    }

    // Injection + exécution du content script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectedScanFunction,
    });

    const data = results?.[0]?.result;

    if (!data) {
      throw new Error("Le script n'a retourné aucune donnée. La page est peut-être protégée.");
    }

    renderResults(data);

    // Stocker les résultats et afficher le bouton export
    lastScanResults = data;
    document.getElementById("btnExport").style.display = "flex";

  } catch (err) {
    document.getElementById("mainContent").innerHTML = `
      <div class="empty-state">
        <div class="icon">❌</div>
        <p><strong>Erreur :</strong> ${escapeHtml(err.message)}<br><br>
        Vérifiez que vous êtes sur une page web normale<br>
        (pas chrome://, extensions://, etc.)</p>
      </div>`;
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
    btnIcon.textContent = "↺";
    btnLabel.textContent = "Rescanner";
  }
});

// ============================================================
// FONCTION INJECTÉE DANS LA PAGE
// Cette fonction est sérialisée et exécutée dans le contexte
// de la page via chrome.scripting.executeScript
// ============================================================
function injectedScanFunction() {

  // --- CATALOGUE COMPLET DES SÉLECTEURS ---
  const SELECTOR_CATALOG = {
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
    tailwind_chat: {
      label: "🔵 Chat Tailwind CSS",
      selectors: [
        "table.min-w-full",
        "table.border.border-gray-200",
        "table.rounded-lg",
        "div.overflow-x-auto table",
        "div.overflow-auto table",
        "div.overflow-x-scroll table",
      ],
    },
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
    markdown_renderers: {
      label: "🟠 Markdown Renderers",
      selectors: [
        ".wmde-markdown table",
        ".react-markdown table",
        ".remark table",
        ".marked table",
        "[class*='markdown'] table",
        "[class*='prose'] table",
      ],
    },
    dark_mode: {
      label: "⚫ Dark Mode",
      selectors: [
        ".dark table",
        "[data-theme='dark'] table",
        "[class*='dark'] table",
      ],
    },
    universal: {
      label: "🔴 Universel",
      selectors: [
        "table",
        "div > table",
        "section table",
        "article table",
        "main table",
      ],
    },
  };

  // --- Générer sélecteur court ---
  function generateShortSelector(table) {
    const tableClasses = Array.from(table.classList)
      .filter(cls => cls.length > 0)
      .map(cls => "." + cls.replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c))
      .join("");

    if (tableClasses) {
      const selector = "table" + tableClasses;
      try {
        const matches = document.querySelectorAll(selector);
        if (matches.length === 1) return selector + " ✅ (unique)";
        return selector + ` (${matches.length} tables)`;
      } catch { return selector; }
    }

    let parent = table.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      if (parent.classList.length > 0) {
        const pcls = Array.from(parent.classList)
          .filter(cls => cls.length > 0 && cls.length < 50)
          .slice(0, 3)
          .map(cls => "." + cls.replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c))
          .join("");
        if (pcls) {
          const selector = parent.tagName.toLowerCase() + pcls + " table";
          try {
            const matches = document.querySelectorAll(selector);
            if (matches.length <= 3) return selector + ` (${matches.length} table(s))`;
          } catch {}
        }
      }
      parent = parent.parentElement;
      depth++;
    }
    return "table (générique)";
  }

  // --- Générer sélecteur précis ---
  function generatePreciseSelector(element) {
    if (!element || element === document.body) return "body";
    if (element.id) return "#" + element.id;

    const selectors = [];
    let el = element;
    while (el && el !== document.documentElement) {
      let selector = el.tagName.toLowerCase();
      const classes = Array.from(el.classList)
        .filter(cls => cls.length > 0 && cls.length < 50)
        .slice(0, 3)
        .map(cls => "." + cls.replace(/[^a-zA-Z0-9_-]/g, c => "\\" + c))
        .join("");
      if (classes) selector += classes;

      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).filter(s => s.tagName === el.tagName)
        : [];
      if (siblings.length > 1) {
        selector += `:nth-of-type(${siblings.indexOf(el) + 1})`;
      }

      selectors.unshift(selector);
      el = el.parentElement;

      if (el && el.id) { selectors.unshift("#" + el.id); break; }
      if (selectors.length >= 6) break;
    }
    return selectors.join(" > ");
  }

  // --- Analyser une table ---
  function analyzeTable(table, index) {
    const headers = Array.from(table.querySelectorAll("th, thead td")).map(th =>
      th.textContent.trim()
    );
    const rowCount = table.querySelectorAll("tbody tr").length;
    const cellCount = table.querySelectorAll("td").length;
    const allClasses = Array.from(table.classList).join(" ") || "(aucune classe)";

    const parent = table.parentElement;
    const parentInfo = parent
      ? `<${parent.tagName.toLowerCase()}${parent.id ? ' id="' + parent.id + '"' : ""}${parent.classList.length ? ' class="' + Array.from(parent.classList).slice(0, 3).join(" ") + '"' : ""}>`
      : "N/A";

    const grandParent = parent ? parent.parentElement : null;
    const grandParentInfo = grandParent
      ? `<${grandParent.tagName.toLowerCase()}${grandParent.id ? ' id="' + grandParent.id + '"' : ""}${grandParent.classList.length ? ' class="' + Array.from(grandParent.classList).slice(0, 3).join(" ") + '"' : ""}>`
      : "N/A";

    const matchedSelectors = [];
    for (const [, data] of Object.entries(SELECTOR_CATALOG)) {
      for (const sel of data.selectors) {
        try {
          const results = document.querySelectorAll(sel);
          if (Array.from(results).includes(table)) {
            matchedSelectors.push({ category: data.label, selector: sel });
          }
        } catch {}
      }
    }

    return {
      index,
      tableClasses: allClasses,
      headers: headers.length > 0 ? headers : ["(aucun en-tête <th>)"],
      rowCount,
      cellCount,
      parentInfo,
      grandParentInfo,
      shortSelector: generateShortSelector(table),
      preciseSelector: generatePreciseSelector(table),
      matchedSelectors,
    };
  }

  // --- SCAN PRINCIPAL ---
  const results = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    totalTablesFound: 0,
    catalogHits: {},
    tables: [],
  };

  // Catalogue hits
  for (const [categoryKey, data] of Object.entries(SELECTOR_CATALOG)) {
    results.catalogHits[categoryKey] = { label: data.label, hits: [] };
    for (const sel of data.selectors) {
      try {
        const found = document.querySelectorAll(sel);
        if (found.length > 0) {
          results.catalogHits[categoryKey].hits.push({ selector: sel, count: found.length });
        }
      } catch {}
    }
  }

  // Toutes les tables
  const allTables = document.querySelectorAll("table");
  results.totalTablesFound = allTables.length;
  allTables.forEach((table, index) => {
    results.tables.push(analyzeTable(table, index + 1));
  });

  return results;
}

// ============================================================
// GESTIONNAIRES D'ÉVÉNEMENTS - MENU EXPORT
// ============================================================

// Bouton Export - Ouvre le menu
document.getElementById("btnExport").addEventListener("click", () => {
  document.getElementById("exportMenu").style.display = "block";
});

// Bouton Fermer - Ferme le menu
document.getElementById("exportClose").addEventListener("click", () => {
  document.getElementById("exportMenu").style.display = "none";
});

// Options d'export
document.querySelectorAll(".export-option").forEach(btn => {
  btn.addEventListener("click", () => {
    const format = btn.getAttribute("data-format");
    if (lastScanResults) {
      handleExport(format, lastScanResults);
      document.getElementById("exportMenu").style.display = "none";
    }
  });
});
