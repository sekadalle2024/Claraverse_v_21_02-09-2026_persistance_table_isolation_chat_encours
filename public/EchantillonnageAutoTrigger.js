/**
 * EchantillonnageAutoTrigger.js - V1.0
 * Détecte automatiquement les tables "Data analyst" et déclenche l'échantillonnage audit
 * 
 * @version 1.0.0
 * @description
 * - Détecte les tables avec entête "Data analyst"
 * - Lit les paramètres encodés dans la cellule (méthode, nb lignes, colonne cible)
 * - Ouvre automatiquement le dialogue de sélection de fichier Excel
 * - Parse le fichier Excel côté front avec SheetJS
 * - Envoie les données JSON vers le backend Python /echantillonnage/sample
 * - Remplace la table "Data analyst" avec les résultats (population + échantillon + stats)
 * 
 * DÉCLENCHEMENT 100% AUTOMATIQUE (modèle LeadBalanceAutoTrigger.js)
 * Extensible pour les méthodes futures : systematic, monetary, stratified, fixed, with_replacement
 */

(function () {
  "use strict";

  console.group("🎲 ECHANTILLONNAGE AUTO TRIGGER V1.0 - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log("📋 Mode: DÉCLENCHEMENT AUTOMATIQUE (table Data analyst)");
  console.groupEnd();

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  const CONFIG = {
    BACKEND_URL: (window.CLARA_BACKEND_URL || 'http://localhost:5000'),
    ENDPOINT_SAMPLE: '/echantillonnage/sample',

    // Entête de la table déclencheuse
    TRIGGER_HEADER: "Data analyst",

    // Formats de fichier acceptés
    ACCEPTED_FORMATS: [".xlsx", ".xls", ".csv"],
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20 MB

    // Sélecteurs CSS Claraverse
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border, table.min-w-full.border-gray-200",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    },

    // Attribut pour marquer les tables traitées
    PROCESSED_ATTR: "data-echantillonnage-processed"
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CHARGEMENT DE SHEETJS (xlsx.js) - parseur Excel côté navigateur
  // ═══════════════════════════════════════════════════════════════════════

  let XLSX_LIB = null;

  function loadSheetJS() {
    return new Promise((resolve) => {
      if (window.XLSX) {
        XLSX_LIB = window.XLSX;
        console.log("✅ [Échantillonnage] SheetJS déjà chargé");
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => {
        XLSX_LIB = window.XLSX;
        console.log("✅ [Échantillonnage] SheetJS chargé depuis CDN");
        resolve(true);
      };
      script.onerror = () => {
        console.warn("⚠️ [Échantillonnage] Impossible de charger SheetJS depuis CDN");
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Affiche une notification flottante
   */
  function showNotification(message, type = "success") {
    const colors = {
      success: "linear-gradient(135deg, #4caf50, #45a049)",
      error:   "linear-gradient(135deg, #f44336, #d32f2f)",
      info:    "linear-gradient(135deg, #2196f3, #1976d2)",
      warning: "linear-gradient(135deg, #ff9800, #f57c00)"
    };

    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${colors[type] || colors.info};
      color: white; padding: 12px 20px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 20000;
      font-size: 14px; opacity: 0; transform: translateY(-20px);
      transition: all 0.3s ease; max-width: 420px; line-height: 1.4;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px)";
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Vérifie si une table est une table "Data analyst"
   */
  function isDataAnalystTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());
    return headers.includes(CONFIG.TRIGGER_HEADER);
  }

  /**
   * Met à jour le texte de la cellule de la table
   */
  function updateTableCell(table, message) {
    const cell = table.querySelector('td');
    if (cell) {
      cell.textContent = message;
      cell.style.textAlign = 'center';
      cell.style.padding = '20px';
      cell.style.color = '#555';
      cell.style.fontStyle = 'italic';
    }
  }

  /**
   * Lit les paramètres encodés dans la cellule de la table "Data analyst"
   * Format: "🎲 Aléatoire simple · 10 lignes · Colonne: Montant · 📂 Sélectionnez..."
   */
  function parseTableParams(table) {
    const cell = table.querySelector('td');
    const cellText = cell ? cell.textContent.trim() : '';

    // Méthode d'échantillonnage (par défaut: random)
    let method = 'random';
    if (cellText.toLowerCase().includes('aléatoire simple') || cellText.toLowerCase().includes('aleatoire simple')) {
      method = 'random';
    } else if (cellText.toLowerCase().includes('systématique') || cellText.toLowerCase().includes('systematique')) {
      method = 'systematic';
    } else if (cellText.toLowerCase().includes('monétaire') || cellText.toLowerCase().includes('mus')) {
      method = 'monetary';
    } else if (cellText.toLowerCase().includes('stratifié') || cellText.toLowerCase().includes('stratifie')) {
      method = 'stratified';
    } else if (cellText.toLowerCase().includes('enregistrements fixes') || cellText.toLowerCase().includes('enregistrement fixe')) {
      method = 'fixed';
    } else if (cellText.toLowerCase().includes('avec remise')) {
      method = 'with_replacement';
    } else if (cellText.toLowerCase().includes('calculer taille') || cellText.toLowerCase().includes('calcul taille')) {
      method = 'calculate-size';
    }

    // Taille d'échantillon (ex: "10 lignes" ou "[Nb lignes] = 10")
    const sizeMatch = cellText.match(/(\d+)\s*lignes/i);
    const sampleSize = sizeMatch ? parseInt(sizeMatch[1], 10) : null;

    // Colonne cible (ex: "Colonne: Montant")
    const colMatch = cellText.match(/Colonne\s*[:\·]\s*([^\·\n📂]+)/i);
    const monetaryColumn = colMatch ? colMatch[1].trim() : null;

    // Intervalle (ex: "Intervalle: 5")
    const intMatch = cellText.match(/Intervalle\s*[:\·]\s*(\d+)/i);
    const interval = intMatch ? parseInt(intMatch[1], 10) : null;

    // Fixed records (ex: "Indices: [0, 1, 2]")
    const fixedMatch = cellText.match(/Indices\s*[:\·]\s*\[([^\]]+)\]/i);
    const fixedRecords = fixedMatch ? fixedMatch[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)) : null;

    console.log("📋 [Échantillonnage] Paramètres extraits:", { method, sampleSize, monetaryColumn, interval, fixedRecords });
    return { method, sampleSize, monetaryColumn, interval, fixedRecords };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DIALOGUE DE SÉLECTION DE FICHIER
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Ouvre le dialogue de sélection de fichier Excel
   */
  function openFileDialog() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = CONFIG.ACCEPTED_FORMATS.join(',');
      input.style.display = 'none';

      input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        document.body.removeChild(input);
        resolve(file || null);
      });

      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        resolve(null);
      });

      document.body.appendChild(input);
      setTimeout(() => {
        console.log("📂 [Échantillonnage] Ouverture du dialogue de sélection de fichier");
        input.click();
      }, 300);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PARSEUR EXCEL AVEC SHEETJS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Parse un fichier Excel et retourne headers + rows
   */
  function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX_LIB.read(data, { type: 'array' });

          // Prendre la première feuille
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convertir en array d'arrays
          const rawData = XLSX_LIB.utils.sheet_to_json(worksheet, {
            header: 1,    // Array d'arrays
            defval: '',   // Valeur par défaut pour les cellules vides
            raw: false    // Convertir tout en string
          });

          if (rawData.length < 2) {
            reject(new Error('Le fichier est vide ou ne contient qu\'une seule ligne'));
            return;
          }

          // Première ligne = entêtes
          const headers = rawData[0].map(h => String(h).trim()).filter(h => h !== '');

          if (headers.length === 0) {
            reject(new Error('Aucun en-tête de colonne trouvé dans le fichier'));
            return;
          }

          // Lignes de données (filtrer les lignes complètement vides)
          const rows = rawData.slice(1)
            .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
            .map(row => {
              // S'assurer que chaque ligne a autant de cellules que d'entêtes
              return headers.map((_, i) => String(row[i] !== undefined && row[i] !== null ? row[i] : '').trim());
            });

          console.log(`✅ [Échantillonnage] Fichier parsé: ${headers.length} colonnes, ${rows.length} lignes`);
          console.log(`📋 [Échantillonnage] En-têtes: ${headers.join(', ')}`);

          resolve({ headers, rows });

        } catch (err) {
          reject(new Error(`Erreur de lecture du fichier Excel: ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse un fichier CSV simple
   */
  function parseCsvFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          // Détection du séparateur (virgule ou point-virgule)
          const firstLine = text.split('\n')[0];
          const sep = firstLine.includes(';') ? ';' : ',';

          const lines = text.split('\n').filter(l => l.trim() !== '');
          if (lines.length < 2) {
            reject(new Error('Fichier CSV vide ou insuffisant'));
            return;
          }

          const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
          const rows = lines.slice(1).map(line =>
            line.split(sep).map(cell => cell.trim().replace(/^"|"$/g, ''))
          ).filter(row => row.some(cell => cell !== ''));

          resolve({ headers, rows });
        } catch (err) {
          reject(new Error(`Erreur CSV: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Erreur de lecture CSV'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Parse le fichier selon son extension
   */
  async function parseFile(file) {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (ext === '.csv') {
      return await parseCsvFile(file);
    }

    if (!XLSX_LIB) {
      const loaded = await loadSheetJS();
      if (!loaded) {
        throw new Error('SheetJS non disponible. Impossible de lire le fichier Excel. Veuillez utiliser un fichier CSV.');
      }
    }

    return await parseExcelFile(file);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ENVOI VERS LE BACKEND
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Envoie les données vers le backend Python /echantillonnage/sample
   */
  async function sendToBackend(tableData, params) {
    const { method, sampleSize, monetaryColumn, interval, fixedRecords } = params;
    const endpointUrl = CONFIG.BACKEND_URL + CONFIG.ENDPOINT_SAMPLE;

    const payload = {
      tables: [tableData],
      targetTableId: tableData.tableId,
      method: method,
      // Paramètres optionnels selon la méthode
      ...(sampleSize !== null && sampleSize !== undefined ? { sampleSize } : {}),
      ...(method === 'monetary'    && monetaryColumn ? { monetaryColumn }              : {}),
      ...(method === 'stratified'  && monetaryColumn ? { stratifyColumn: monetaryColumn } : {}),
      ...(method === 'systematic'  && interval       ? { interval }                    : {}),
      ...(method === 'fixed'       && fixedRecords   ? { fixedRecords }                : {}),
    };

    console.group("📤 [Échantillonnage] ENVOI VERS BACKEND");
    console.log("🌐 Endpoint:", endpointUrl);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));
    console.groupEnd();

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ [Échantillonnage] Résultat reçu:", result);
    return result;
  }

  /**
   * Appelle l'endpoint /echantillonnage/calculate-size
   * et formate la réponse en structure compatible accordion
   */
  async function sendCalculateSizeToBackend(calcParams) {
    const endpointUrl = CONFIG.BACKEND_URL + '/echantillonnage/calculate-size';

    console.group("📤 [Taille échantillon] ENVOI VERS BACKEND");
    console.log("🌐 Endpoint:", endpointUrl);
    console.log("📦 Payload:", JSON.stringify(calcParams, null, 2));
    console.groupEnd();

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(calcParams)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [Taille échantillon] Résultat reçu:", data);

    // Convertir en structure accordion standard (sans tableaux de données)
    return {
      success: true,
      method: 'calculate-size',
      message: data.message || `Taille recommandée : ${data.recommendedSampleSize} enregistrements`,
      calculateSizeResult: data,
      // Fournir un sampleTable minimal pour l'accordion
      sampleTable: {
        sampleSize: data.recommendedSampleSize || 0,
        headers: ['Paramètre', 'Valeur'],
        rows: [
          ['Taille population',    String(calcParams.populationSize)],
          ['Niveau de confiance',  `${(calcParams.confidenceLevel * 100).toFixed(0)} %`],
          ['Erreur tolérée',       `${(calcParams.tolerableError * 100).toFixed(1)} %`],
          ['Erreur attendue',      `${(calcParams.expectedError * 100).toFixed(1)} %`],
          ['Taille recommandée',   String(data.recommendedSampleSize || '—')],
          ['Taux de sondage',      data.samplingRate ? `${(data.samplingRate * 100).toFixed(2)} %` : '—'],
        ]
      },
      originalTable: {
        sampleSize: calcParams.populationSize,
        headers: ['Paramètre', 'Valeur'],
        rows: []
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDU DES RÉSULTATS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Crée un tableau HTML stylé compatible Claraverse
   */
  function createStyledTable(headers, rows, options = {}) {
    const { headerBg = '#1976d2', title = '' } = options;

    let html = '';
    if (title) {
      html += `<div style="font-weight:600; margin-bottom:8px; color:${headerBg}; font-size:14px;">${title}</div>`;
    }

    html += `<div style="overflow-x:auto; margin-bottom:1.5rem;">`;
    html += `<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" style="width:100%; border-collapse:collapse; font-size:13px;">`;

    // En-têtes
    html += `<thead><tr>`;
    headers.forEach(h => {
      html += `<th style="padding:10px 14px; text-align:left; background:${headerBg}; color:white; border:1px solid ${headerBg}; white-space:nowrap; font-weight:600;">${h}</th>`;
    });
    html += `</tr></thead>`;

    // Corps
    html += `<tbody>`;
    rows.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      html += `<tr style="background:${bg};">`;
      row.forEach((cell, ci) => {
        // Colorer les valeurs numériques négatives en rouge
        let style = 'padding:8px 14px; border:1px solid #e2e8f0; font-size:13px;';
        const num = parseFloat(String(cell).replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(num) && ci > 0) {
          if (num < 0) style += ' color:#e53e3e; font-weight:600;';
        }
        html += `<td style="${style}">${cell !== null && cell !== undefined ? cell : ''}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;

    return html;
  }

  /**
   * Crée le bloc de statistiques
   */
  function createStatsBlock(statistics, filename) {
    if (!statistics) return '';

    const stats = [
      { label: 'Population', value: statistics.population_size, color: '#1976d2', bg: '#e3f2fd' },
      { label: 'Échantillon', value: statistics.sample_size,     color: '#388e3c', bg: '#e8f5e9' },
      { label: 'Taux de sondage', value: statistics.sampling_rate ? `${statistics.sampling_rate.toFixed(1)}%` : '—', color: '#f57c00', bg: '#fff3e0' },
    ];

    if (statistics.sample_total) {
      stats.push({ label: 'Total échantillon', value: new Intl.NumberFormat('fr-FR').format(Math.round(statistics.sample_total)), color: '#7b1fa2', bg: '#f3e5f5' });
    }
    if (statistics.population_total) {
      stats.push({ label: 'Total population', value: new Intl.NumberFormat('fr-FR').format(Math.round(statistics.population_total)), color: '#c2185b', bg: '#fce4ec' });
    }

    let html = `<div style="margin-bottom:1rem; padding:12px 16px; background:linear-gradient(135deg,#e8f5e9,#c8e6c9); border-radius:10px; border:2px solid #4caf50;">`;
    html += `<div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">`;
    html += `<span style="font-size:20px;">🎲</span>`;
    html += `<strong style="color:#2e7d32; font-size:15px;">Résultat Échantillonnage — Aléatoire simple</strong>`;
    if (filename) {
      html += `<span style="margin-left:auto; font-size:11px; color:#555; font-style:italic;">📄 ${filename}</span>`;
    }
    html += `</div>`;

    html += `<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:10px;">`;
    stats.forEach(s => {
      html += `<div style="text-align:center; padding:10px; background:${s.bg}; border-radius:8px;">`;
      html += `<div style="font-size:11px; color:#666; text-transform:uppercase; letter-spacing:0.5px;">${s.label}</div>`;
      html += `<div style="font-size:20px; font-weight:700; color:${s.color}; margin-top:4px;">${s.value}</div>`;
      html += `</div>`;
    });
    html += `</div></div>`;

    return html;
  }

  /**
   * Construit la structure de données pour EchantillonnageAccordionRenderer
   */
  function buildAccordionData(result, filename, method, sampleSize) {
    const METHOD_LABELS = {
      random:           'Aléatoire simple',
      systematic:       'Systématique',
      monetary:         'Monétaire (MUS)',
      mus:              'Monétaire (MUS)',
      stratified:       'Stratifié',
      fixed:            'Enregistrements fixes',
      with_replacement: 'Avec remise',
      duplicates:       'Détection doublons',
      gaps:             'Trous de séquence',
      benford:          'Loi de Benford',
      threshold:        'Seuil de détection',
      weekend:          'Transactions week-end',
      round_amounts:    'Montants ronds',
      outliers:         'Valeurs aberrantes',
      period_changes:   'Variations périodiques',
    };

    const type = ['duplicates','gaps','benford','threshold','weekend','round_amounts','outliers','period_changes'].includes(method)
      ? 'analysis'
      : 'sampling';

    const data = {
      type,
      methodLabel: METHOD_LABELS[method] || method,
      methodKey:   method,
      filename:    filename || '',
      statistics:  result.statistics || {},
      description: {
        'Méthode':           METHOD_LABELS[method] || method,
        'Fichier analysé':   filename || 'Non spécifié',
        'Taille demandée':   sampleSize ? `${sampleSize} enregistrements` : 'Auto',
      },
      sourceTable: result.originalTable
        ? { headers: result.originalTable.headers || [], rows: result.originalTable.rows || [] }
        : undefined,
      resultTable: result.sampleTable
        ? { headers: result.sampleTable.headers || [], rows: result.sampleTable.rows || [] }
        : result.result
        ? { headers: result.result.headers || [], rows: result.result.rows || [] }
        : undefined,
      analysisDetails: result.result?.details || undefined,
    };

    return data;
  }

  /**
   * Remplace la div parente de la table "Data analyst" avec les résultats
   * via le système de préfixe magique React __ECHANTILLONNAGE_AUDIT__
   */
  function replaceWithResults(table, result, filename, method, sampleSize) {
    console.group("🔄 [Échantillonnage] REMPLACEMENT DOM (React Accordion)");

    const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);

    if (!parentDiv) {
      console.error("❌ Div parent (prose) non trouvée !");
      console.groupEnd();
      return false;
    }

    try {
      // 1. Construire les données structurées pour l'accordéon React
      const accordionData = buildAccordionData(result, filename, method || 'random', sampleSize);
      const magicContent = '__ECHANTILLONNAGE_AUDIT__' + JSON.stringify(accordionData);

      // 2. Dispatche un événement personnalisé que le composant React parent peut intercepter
      //    pour mettre à jour le contenu du message
      const messageContainer = parentDiv.closest('[data-message-id]') ||
                               parentDiv.closest('.message-content') ||
                               parentDiv.closest('[class*="message"]');

      const messageId = messageContainer?.dataset?.messageId || null;

      document.dispatchEvent(new CustomEvent('claraverse:echantillonnage:render', {
        detail: {
          messageId,
          content: magicContent,
          accordionData,
          filename,
          method: method || 'random',
        }
      }));

      // 3. Fallback: injection directe dans le div prose pour les cas où
      //    l'événement React ne peut pas être intercepté
      //    On crée un nœud React root dans un div dédié
      const mountDiv = document.createElement('div');
      mountDiv.id = `echantillonnage-result-${Date.now()}`;
      mountDiv.className = 'echantillonnage-accordion-mount';

      // Stocker les données sur le nœud pour React
      mountDiv.dataset.echantillonnageData = JSON.stringify(accordionData);
      mountDiv.dataset.magicContent = magicContent;

      // Injecter un placeholder HTML minimal avec les stats clés
      // (visible avant que React ne prenne le relai)
      const stats = accordionData.statistics || {};
      const population = stats.population_size || 0;
      const sample    = stats.sample_size || 0;
      const rate      = stats.sampling_rate ? stats.sampling_rate.toFixed(1) + '%' : '—';

      mountDiv.innerHTML = `
        <div data-echantillonnage-placeholder="true" style="
          border:1px solid #cbd5e1; border-radius:10px; overflow:hidden;
          font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
          box-shadow:0 6px 30px rgba(0,0,0,0.1); margin:16px 0;
        ">
          <!-- COVER -->
          <div style="background:linear-gradient(135deg,${getMethodGradient(method)} );color:#fff;padding:36px 32px;text-align:center;">
            <div style="font-size:40px;">${getMethodEmoji(method)}</div>
            <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;opacity:0.75;margin-top:8px;">
              ${accordionData.type === 'sampling' ? 'Échantillonnage Audit' : 'Analyse de Données'}
            </div>
            <div style="font-size:26px;font-weight:800;margin-top:8px;">${accordionData.methodLabel}</div>
            ${filename ? `<div style="font-size:13px;opacity:0.85;margin-top:6px;">📄 ${filename}</div>` : ''}
          </div>
          <!-- STATS -->
          <div style="padding:20px 24px;background:#fff;">
            <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:12px;">📈 Statistiques</div>
            <div style="display:flex;flex-wrap:wrap;gap:12px;">
              ${population ? `<div style="flex:1 1 120px;text-align:center;padding:14px;background:#fce4ec;border-radius:10px;"><div style="font-size:11px;color:#666;text-transform:uppercase;">Population</div><div style="font-size:22px;font-weight:800;color:#800020;">${formatNumber(population)}</div></div>` : ''}
              ${sample ? `<div style="flex:1 1 120px;text-align:center;padding:14px;background:#fce4ec;border-radius:10px;"><div style="font-size:11px;color:#666;text-transform:uppercase;">Échantillon</div><div style="font-size:22px;font-weight:800;color:#800020;">${formatNumber(sample)}</div></div>` : ''}
              ${stats.sampling_rate != null ? `<div style="flex:1 1 120px;text-align:center;padding:14px;background:#fce4ec;border-radius:10px;"><div style="font-size:11px;color:#666;text-transform:uppercase;">Taux</div><div style="font-size:22px;font-weight:800;color:#800020;">${rate}</div></div>` : ''}
            </div>
          </div>
          <!-- NOTE -->
          <div style="padding:12px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
            ⏳ Chargement de la vue complète en accordéon...
          </div>
        </div>
      `;

      parentDiv.innerHTML = '';
      parentDiv.appendChild(mountDiv);

      // 4. Essayer de monter React si ReactDOM est disponible globalement
      //    (tentative via window.__REACT_ROOT__ ou similaire)
      setTimeout(() => {
        const mount = document.getElementById(mountDiv.id);
        if (mount && window.__CLARAVERSE_MOUNT_ECHANTILLONNAGE__) {
          window.__CLARAVERSE_MOUNT_ECHANTILLONNAGE__(mount, accordionData);
        }
      }, 100);

      console.log("✅ Placeholder accordéon injecté avec succès");
      console.log("📡 Événement 'claraverse:echantillonnage:render' dispatché");
      console.groupEnd();
      return true;

    } catch (err) {
      console.error("❌ Erreur construction accordéon:", err);
      console.groupEnd();
      return false;
    }
  }

  /** Retourne le dégradé CSS (Thème global Rouge Bordeau) */
  function getMethodGradient(method) {
    return '#800020 0%, #a31535 100%';
  }

  /** Retourne l'emoji selon la méthode */
  function getMethodEmoji(method) {
    const emojis = {
      random:'🎲', systematic:'📏', monetary:'💰', mus:'💰',
      stratified:'📊', fixed:'📌', with_replacement:'🔄',
      duplicates:'🔍', gaps:'🔢', benford:'📐',
      threshold:'🎯', weekend:'📅', round_amounts:'🔵',
      outliers:'📈', period_changes:'📉',
    };
    return emojis[method] || '📋';
  }

  /** Formate un nombre en français */
  function formatNumber(n) {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Traite automatiquement une table "Data analyst"
   */
  async function processDataAnalystTable(table) {
    console.group("🎯 [Échantillonnage] TRAITEMENT AUTOMATIQUE");

    if (table.getAttribute(CONFIG.PROCESSED_ATTR)) {
      console.log("⏭️ Table déjà traitée");
      console.groupEnd();
      return;
    }

    try {
      // Marquer comme en cours
      table.setAttribute(CONFIG.PROCESSED_ATTR, 'processing');

      // 1. Lire les paramètres depuis la cellule
      const params = parseTableParams(table);

      // 2. Extraire et compléter les paramètres selon la méthode
      let { method, sampleSize, monetaryColumn, interval, fixedRecords } = params;

      // ─── Branche spéciale : Calculer la taille d'échantillon (pas de fichier) ───
      if (method === 'calculate-size') {
        updateTableCell(table, '🔢 Saisie des paramètres de calcul...');

        const popStr = prompt('📐 Calculer la taille d\'échantillon\n\nTaille de la population (nombre total d\'enregistrements) :', '1000');
        if (popStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        const populationSize = parseInt(popStr, 10) || 1000;

        const confStr = prompt('📐 Niveau de confiance (ex: 0.95 pour 95%, 0.99 pour 99%) :', '0.95');
        if (confStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        const confidenceLevel = parseFloat(confStr) || 0.95;

        const tolStr = prompt('📐 Erreur tolérée (ex: 0.05 pour 5%, 0.10 pour 10%) :', '0.05');
        if (tolStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        const tolerableError = parseFloat(tolStr) || 0.05;

        const expStr = prompt('📐 Erreur attendue / taux d\'anomalie estimé (ex: 0.02 pour 2%) :', '0.02');
        if (expStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        const expectedError = parseFloat(expStr) || 0.02;

        updateTableCell(table, '⏳ Calcul de la taille optimale...');
        showNotification('🔢 Calcul de la taille d\'échantillon en cours...', 'info');

        const calcResult = await sendCalculateSizeToBackend({ populationSize, confidenceLevel, tolerableError, expectedError });

        const replaced = replaceWithResults(table, calcResult, null, 'calculate-size', calcResult.sampleTable.sampleSize);
        if (replaced) {
          showNotification(calcResult.message, 'success');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'completed');
        } else {
          throw new Error('Impossible de remplacer le contenu dans le DOM');
        }
        console.groupEnd();
        return;
      }
      // ─────────────────────────────────────────────────────────────────────

      // Prompt taille d'échantillon si nécessaire
      if (['random', 'systematic', 'monetary', 'stratified', 'with_replacement'].includes(method) && !sampleSize) {
        const methodLabels = {
          random: 'Aléatoire simple', systematic: 'Systématique',
          monetary: 'Monétaire (MUS)', stratified: 'Stratifié', with_replacement: 'Avec remise'
        };
        const sizeStr = prompt(
          `🎲 Échantillonnage ${methodLabels[method] || method}\n\nTaille de l\'échantillon (nombre d\'enregistrements) :`,
          '10'
        );
        if (sizeStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        const parsed = parseInt(sizeStr, 10);
        sampleSize = (!isNaN(parsed) && parsed > 0) ? parsed : 10;
      }

      // Prompt intervalle si méthode systématique
      if (method === 'systematic' && !interval) {
        const intStr = prompt(
          '📏 Échantillonnage Systématique\n\nIntervalle de sélection (ex: 5 = 1 enregistrement tous les 5) :',
          '5'
        );
        if (intStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        const parsedInt = parseInt(intStr, 10);
        interval = (!isNaN(parsedInt) && parsedInt > 0) ? parsedInt : 5;
      }

      // Prompt indices si méthode enregistrements fixes
      if (method === 'fixed' && (!fixedRecords || fixedRecords.length === 0)) {
        const fixStr = prompt(
          '📌 Enregistrements fixes\n\nIndices à sélectionner séparés par des virgules (ex: 0, 5, 10, 15) :',
          '0, 5, 10'
        );
        if (fixStr === null) {
          showNotification('❌ Opération annulée', 'error');
          updateTableCell(table, '❌ Opération annulée — rechargez le chat pour recommencer');
          table.setAttribute(CONFIG.PROCESSED_ATTR, 'cancelled');
          console.groupEnd();
          return;
        }
        fixedRecords = fixStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        if (fixedRecords.length === 0) fixedRecords = [0, 5, 10];
      }

      updateTableCell(table, '📂 Sélectionnez votre fichier Excel...');
      showNotification('📂 Sélectionnez votre fichier de données (Excel ou CSV)', 'info');

      // 3. Ouvrir le dialogue de sélection de fichier
      const file = await openFileDialog();

      if (!file) {
        console.log('❌ Sélection de fichier annulée');
        updateTableCell(table, '❌ Sélection annulée — cliquez pour recommencer');
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        // Permettre un nouveau déclenchement via clic
        addCellClickHandler(table);
        console.groupEnd();
        return;
      }

      console.log(`✅ Fichier sélectionné: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

      // Vérifier la taille
      if (file.size > CONFIG.MAX_FILE_SIZE) {
        const maxMB = (CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
        const msg = `⚠️ Fichier trop volumineux (max: ${maxMB} MB)`;
        showNotification(msg, "error");
        updateTableCell(table, msg);
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      updateTableCell(table, `⏳ Lecture de ${file.name}...`);
      showNotification(`📊 Lecture du fichier ${file.name}...`, "info");

      // 4. Parser le fichier Excel/CSV côté front
      let tableData;
      try {
        const parsed = await parseFile(file);
        const tableId = `table_${Date.now()}`;
        tableData = {
          tableId,
          headers: parsed.headers,
          rows: parsed.rows
        };
        console.log(`📋 Données parsées: ${parsed.headers.length} colonnes × ${parsed.rows.length} lignes`);
      } catch (parseErr) {
        showNotification(`❌ Erreur de lecture: ${parseErr.message}`, "error");
        updateTableCell(table, `❌ Erreur de lecture: ${parseErr.message}`);
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        console.groupEnd();
        return;
      }

      // 5. Auto-détecter la colonne monétaire si méthode monetary et non spécifiée
      if (method === 'monetary' && !monetaryColumn) {
        const monetaryKeywords = ['montant', 'solde', 'valeur', 'amount', 'total', 'debit', 'credit', 'débit', 'crédit'];
        const detectedCol = tableData.headers.find(h =>
          monetaryKeywords.some(kw => h.toLowerCase().includes(kw))
        );
        monetaryColumn = detectedCol || tableData.headers[tableData.headers.length - 1];
        console.log(`🔍 Colonne monétaire auto-détectée: ${monetaryColumn}`);
      }

      updateTableCell(table, `⏳ Échantillonnage en cours... (${tableData.rows.length} enregistrements)`);
      showNotification(
        `🎲 Envoi de ${tableData.rows.length} enregistrement${tableData.rows.length > 1 ? 's' : ''} vers le backend...`,
        "info"
      );

      // 6. Envoyer vers le backend Python
      const result = await sendToBackend(tableData, { method, sampleSize, monetaryColumn, interval, fixedRecords });

      // 7. Remplacer le DOM avec les résultats
      if (result.success) {
        const replaced = replaceWithResults(table, result, file.name, method, sampleSize);

        if (replaced) {
          showNotification(
            result.message || `✅ Échantillonnage terminé: ${result.sampleTable?.sampleSize} enregistrements sélectionnés`,
            "success"
          );

          table.setAttribute(CONFIG.PROCESSED_ATTR, 'completed');

          // Événement personnalisé pour la persistance (indexedDB, etc.)
          document.dispatchEvent(new CustomEvent('claraverse:echantillonnage:success', {
            detail: {
              filename: file.name,
              method,
              sampleSize: result.sampleTable?.sampleSize,
              populationSize: result.originalTable?.sampleSize,
              timestamp: Date.now()
            }
          }));
        } else {
          throw new Error("Impossible de remplacer le contenu dans le DOM");
        }
      } else {
        throw new Error(result.message || "Erreur inconnue du backend");
      }

    } catch (error) {
      console.error("❌ [Échantillonnage] Erreur:", error);
      showNotification(`❌ Erreur: ${error.message}`, "error");
      updateTableCell(table, `❌ Erreur: ${error.message}`);
      table.removeAttribute(CONFIG.PROCESSED_ATTR);
      // Permettre un nouveau déclenchement via clic
      addCellClickHandler(table);
    }

    console.groupEnd();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DÉTECTION ET SCAN
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Ajoute un gestionnaire de clic sur la cellule (pour relancer en cas d'annulation ou d'erreur)
   */
  function addCellClickHandler(table) {
    const cell = table.querySelector('td');
    if (cell && !cell.dataset.echantillonnageClick) {
      cell.style.cursor = 'pointer';
      cell.title = 'Cliquer pour sélectionner un fichier Excel';
      cell.dataset.echantillonnageClick = '1';

      cell.addEventListener('click', function () {
        const status = table.getAttribute(CONFIG.PROCESSED_ATTR);
        if (status === 'processing' || status === 'completed') return;
        console.log("🖱️ [Échantillonnage] Clic sur cellule détecté - relancement");
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processDataAnalystTable(table);
      });

      console.log("✅ [Échantillonnage] Gestionnaire de clic ajouté");
    }
  }

  /**
   * Scan toutes les tables et traite les tables "Data analyst"
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

    allTables.forEach((table) => {
      if (isDataAnalystTable(table) && !table.getAttribute(CONFIG.PROCESSED_ATTR)) {
        console.log("🎯 [Échantillonnage] Table 'Data analyst' détectée - Déclenchement automatique");
        addCellClickHandler(table);
        processDataAnalystTable(table);
      }
    });
  }

  /**
   * Configure le MutationObserver pour détecter les nouvelles tables
   */
  function setupMutationObserver() {
    let scanTimeout = null;

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "TABLE" || node.querySelector?.("table")) {
                shouldScan = true;
              }
            }
          });
        }
      });

      if (shouldScan && !scanTimeout) {
        scanTimeout = setTimeout(() => {
          scanAndProcess();
          scanTimeout = null;
        }, 600);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("👁️ [Échantillonnage] MutationObserver configuré");
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API GLOBALE
  // ═══════════════════════════════════════════════════════════════════════

  window.EchantillonnageAutoTrigger = {
    scan:    scanAndProcess,
    config:  CONFIG,
    version: "1.0.0",

    /** Déclenchement manuel depuis le menu contextuel (future use) */
    triggerFromContextMenu: function (table, params = {}) {
      console.log("🎯 [Échantillonnage] Déclenchement manuel depuis menu contextuel");
      if (table && isDataAnalystTable(table)) {
        table.removeAttribute(CONFIG.PROCESSED_ATTR);
        processDataAnalystTable(table);
      }
    },

    /** Test manuel */
    test: function () {
      console.log("🧪 [Échantillonnage] TEST MANUEL");
      scanAndProcess();
    },

    /** Reset (permet de relancer sur les tables existantes) */
    reset: function () {
      document.querySelectorAll(`[${CONFIG.PROCESSED_ATTR}]`).forEach(t => {
        t.removeAttribute(CONFIG.PROCESSED_ATTR);
      });
      console.log("✅ [Échantillonnage] Reset effectué");
    }
  };

  console.log("🌐 [Échantillonnage] API: EchantillonnageAutoTrigger.test() / .reset()");

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════

  async function init() {
    // Pré-charger SheetJS
    await loadSheetJS();

    // Observer les mutations DOM
    setupMutationObserver();

    // Scan initial après un délai (le temps que React monte les composants)
    setTimeout(scanAndProcess, 2000);

    // Scan périodique de sécurité
    setInterval(() => {
      const tables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
      const unprocessed = Array.from(tables).filter(t =>
        isDataAnalystTable(t) && !t.getAttribute(CONFIG.PROCESSED_ATTR)
      );
      if (unprocessed.length > 0) {
        console.log(`🔄 [Échantillonnage] ${unprocessed.length} table(s) non traitée(s) détectée(s)`);
        scanAndProcess();
      }
    }, 3000);

    console.log("✅ ECHANTILLONNAGE AUTO TRIGGER V1.0 INITIALISÉ");
    console.log("📋 Méthodes supportées: random | systematic | monetary | stratified | fixed | with_replacement");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
