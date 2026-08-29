/**
 * export-functions.js - Fonctions d'export pour Table Selector Detective
 * Gère l'export des résultats en HTML, JSON, PDF et DOC (RTF)
 * @version 1.0.0
 */

"use strict";

// ============================================================
// EXPORT HTML
// ============================================================
function exportToHTML(results) {
  const timestamp = new Date(results.timestamp).toLocaleString("fr-FR");
  
  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Table Detective - Rapport ${timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f1117;
      color: #e2e8f0;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #1e2035 0%, #2a2d4a 100%);
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid #2e3254;
    }
    h1 {
      color: #818cf8;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .meta {
      color: #94a3b8;
      font-size: 14px;
    }
    .section {
      background: #1a1d2e;
      border: 1px solid #2e3254;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section-title {
      color: #818cf8;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #2e3254;
    }
    .catalog-grid {
      display: grid;
      gap: 10px;
    }
    .catalog-row {
      background: #242840;
      border: 1px solid #2e3254;
      border-radius: 8px;
      padding: 12px;
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 15px;
    }
    .catalog-row.has-hits {
      border-color: #2e4a2e;
      background: #141f14;
    }
    .catalog-label {
      color: #94a3b8;
      font-weight: 600;
    }
    .catalog-hits {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .catalog-hit {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    code {
      font-family: 'Courier New', monospace;
      background: #0d1018;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #22c55e;
    }
    .count {
      color: #f59e0b;
      font-weight: 700;
      font-size: 12px;
    }
    .table-card {
      background: #242840;
      border: 1px solid #2e3254;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .table-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2e3254;
    }
    .table-index {
      background: #6366f1;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }
    .table-selector {
      flex: 1;
      color: #818cf8;
      font-size: 16px;
      font-weight: 600;
    }
    .info-grid {
      display: grid;
      gap: 15px;
    }
    .info-row {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 15px;
      align-items: start;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    .info-value {
      color: #e2e8f0;
    }
    .headers-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .header-tag {
      background: #1e2035;
      border: 1px solid #2e3254;
      color: #818cf8;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
    }
    .matched-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .matched-item {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 10px;
      font-size: 13px;
    }
    .matched-cat {
      color: #f59e0b;
    }
    .no-data {
      color: #64748b;
      font-style: italic;
    }
    .footer {
      text-align: center;
      color: #64748b;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #2e3254;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Table Selector Detective - Rapport</h1>
      <div class="meta">
        <div>📅 Date: ${timestamp}</div>
        <div>🌐 URL: ${escapeHtml(results.url)}</div>
        <div>📊 Tables trouvées: ${results.totalTablesFound}</div>
      </div>
    </div>
`;

  // Catalogue des hits
  html += `
    <div class="section">
      <div class="section-title">📚 Sélecteurs qui fonctionnent</div>
      <div class="catalog-grid">
`;

  for (const [key, data] of Object.entries(results.catalogHits)) {
    const hasHits = data.hits && data.hits.length > 0;
    html += `
        <div class="catalog-row${hasHits ? " has-hits" : ""}">
          <div class="catalog-label">${escapeHtml(data.label)}</div>
          <div class="catalog-hits">
`;
    if (hasHits) {
      data.hits.forEach(hit => {
        html += `
            <div class="catalog-hit">
              <code>${escapeHtml(hit.selector)}</code>
              <span class="count">${hit.count}×</span>
            </div>
`;
      });
    } else {
      html += `<span class="no-data">— aucun résultat</span>`;
    }
    html += `
          </div>
        </div>
`;
  }

  html += `
      </div>
    </div>
`;

  // Détail des tables
  if (results.tables.length > 0) {
    html += `
    <div class="section">
      <div class="section-title">📋 Détail des ${results.totalTablesFound} table${results.totalTablesFound > 1 ? "s" : ""} trouvée${results.totalTablesFound > 1 ? "s" : ""}</div>
`;

    results.tables.forEach(table => {
      html += `
      <div class="table-card">
        <div class="table-header">
          <div class="table-index">${table.index}</div>
          <div class="table-selector">${escapeHtml(table.shortSelector)}</div>
        </div>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">🏷️ Classes table</div>
            <div class="info-value">${escapeHtml(table.tableClasses)}</div>
          </div>
          <div class="info-row">
            <div class="info-label">📌 Sélecteur court</div>
            <div class="info-value"><code>${escapeHtml(table.shortSelector)}</code></div>
          </div>
          <div class="info-row">
            <div class="info-label">🎯 Sélecteur précis</div>
            <div class="info-value"><code>${escapeHtml(table.preciseSelector)}</code></div>
          </div>
          <div class="info-row">
            <div class="info-label">📊 Dimensions</div>
            <div class="info-value">${table.rowCount} ligne${table.rowCount > 1 ? "s" : ""} · ${table.cellCount} cellules</div>
          </div>
          <div class="info-row">
            <div class="info-label">🗂️ En-têtes</div>
            <div class="info-value">
              <div class="headers-list">
`;
      table.headers.forEach(h => {
        html += `<span class="header-tag">${escapeHtml(h)}</span>`;
      });
      html += `
              </div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">📦 Parent direct</div>
            <div class="info-value"><code>${escapeHtml(table.parentInfo)}</code></div>
          </div>
          <div class="info-row">
            <div class="info-label">📦 Grand-parent</div>
            <div class="info-value"><code>${escapeHtml(table.grandParentInfo)}</code></div>
          </div>
          <div class="info-row">
            <div class="info-label">✅ Sélecteurs catalogue</div>
            <div class="info-value">
`;
      if (table.matchedSelectors.length > 0) {
        html += `<div class="matched-list">`;
        table.matchedSelectors.forEach(m => {
          html += `
                <div class="matched-item">
                  <span class="matched-cat">${escapeHtml(m.category)}</span>
                  <code>${escapeHtml(m.selector)}</code>
                </div>
`;
        });
        html += `</div>`;
      } else {
        html += `<span class="no-data">⚠️ Aucun sélecteur du catalogue ne correspond</span>`;
      }
      html += `
            </div>
          </div>
        </div>
      </div>
`;
    });

    html += `
    </div>
`;
  }

  html += `
    <div class="footer">
      Généré par Table Selector Detective v1.0.0 - Claraverse / Flowise Compatible
    </div>
  </div>
</body>
</html>`;

  return html;
}

// ============================================================
// EXPORT JSON
// ============================================================
function exportToJSON(results) {
  return JSON.stringify(results, null, 2);
}

// ============================================================
// EXPORT PDF (via impression HTML)
// ============================================================
function exportToPDF(results) {
  // Génère un HTML optimisé pour l'impression
  const html = exportToHTML(results);
  
  // Crée une nouvelle fenêtre pour l'impression
  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Attend le chargement puis lance l'impression
  printWindow.onload = function() {
    printWindow.print();
  };
  
  return "PDF généré via impression";
}

// ============================================================
// EXPORT DOC (RTF)
// ============================================================
function exportToRTF(results) {
  const timestamp = new Date(results.timestamp).toLocaleString("fr-FR");
  
  let rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Courier New;}{\\f1 Arial;}}
{\\colortbl;\\red99\\green102\\blue241;\\red34\\green197\\green94;\\red245\\green158\\blue11;}
\\f1\\fs24
{\\b\\fs32\\cf1 Table Selector Detective - Rapport}\\par
\\par
{\\b Date:} ${timestamp}\\par
{\\b URL:} ${results.url}\\par
{\\b Tables trouvées:} ${results.totalTablesFound}\\par
\\par
{\\b\\fs28\\cf1 Sélecteurs qui fonctionnent}\\par
\\par
`;

  // Catalogue des hits
  for (const [key, data] of Object.entries(results.catalogHits)) {
    rtf += `{\\b ${data.label}}\\par\n`;
    if (data.hits && data.hits.length > 0) {
      data.hits.forEach(hit => {
        rtf += `  {\\f0\\cf2 ${hit.selector}} {\\cf3 ${hit.count}×}\\par\n`;
      });
    } else {
      rtf += `  — aucun résultat\\par\n`;
    }
    rtf += `\\par\n`;
  }

  // Détail des tables
  if (results.tables.length > 0) {
    rtf += `\\par\n{\\b\\fs28\\cf1 Détail des tables}\\par\\par\n`;
    
    results.tables.forEach(table => {
      rtf += `{\\b\\fs26 Table ${table.index}}\\par\n`;
      rtf += `{\\b Classes:} ${table.tableClasses}\\par\n`;
      rtf += `{\\b Sélecteur court:} {\\f0 ${table.shortSelector}}\\par\n`;
      rtf += `{\\b Sélecteur précis:} {\\f0 ${table.preciseSelector}}\\par\n`;
      rtf += `{\\b Dimensions:} ${table.rowCount} lignes · ${table.cellCount} cellules\\par\n`;
      rtf += `{\\b En-têtes:} ${table.headers.join(", ")}\\par\n`;
      rtf += `{\\b Parent:} {\\f0 ${table.parentInfo}}\\par\n`;
      rtf += `{\\b Grand-parent:} {\\f0 ${table.grandParentInfo}}\\par\n`;
      
      if (table.matchedSelectors.length > 0) {
        rtf += `{\\b Sélecteurs catalogue:}\\par\n`;
        table.matchedSelectors.forEach(m => {
          rtf += `  {\\cf3 ${m.category}} {\\f0\\cf2 ${m.selector}}\\par\n`;
        });
      }
      rtf += `\\par\\par\n`;
    });
  }

  rtf += `\\par\n{\\i Généré par Table Selector Detective v1.0.0}\\par\n}`;
  
  return rtf;
}

// ============================================================
// TÉLÉCHARGEMENT DE FICHIER
// ============================================================
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// GESTIONNAIRE D'EXPORT
// ============================================================
function handleExport(format, results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const baseFilename = `table-detective-${timestamp}`;
  
  try {
    switch (format) {
      case "html":
        const html = exportToHTML(results);
        downloadFile(html, `${baseFilename}.html`, "text/html");
        showCopyToast("✅ Export HTML téléchargé !");
        break;
        
      case "json":
        const json = exportToJSON(results);
        downloadFile(json, `${baseFilename}.json`, "application/json");
        showCopyToast("✅ Export JSON téléchargé !");
        break;
        
      case "pdf":
        exportToPDF(results);
        showCopyToast("✅ Fenêtre d'impression ouverte !");
        break;
        
      case "doc":
        const rtf = exportToRTF(results);
        downloadFile(rtf, `${baseFilename}.rtf`, "application/rtf");
        showCopyToast("✅ Export DOC (RTF) téléchargé !");
        break;
        
      default:
        throw new Error("Format d'export non supporté");
    }
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    showCopyToast("❌ Erreur lors de l'export");
  }
}

// Fonction utilitaire pour échapper le HTML (doit être définie dans popup.js)
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
