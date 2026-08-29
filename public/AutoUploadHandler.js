/**
 * AutoUploadHandler.js - V2.0
 * Gère automatiquement l'upload de fichiers et le traitement backend
 * pour les tables déclencheuses détectées dans le chat
 * 
 * @version 2.0.0
 * @description
 * - Détecte automatiquement les tables déclencheuses (ex: Lead_balance)
 * - Ouvre automatiquement le dialogue de sélection de fichier
 * - Envoie le fichier vers le backend Python
 * - Remplace la table avec les résultats traités
 */

(function () {
  "use strict";

  console.group("🚀 AUTO UPLOAD HANDLER V2.0 - INITIALISATION");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log("📋 Comportement: Détection automatique et upload de fichiers");
  console.groupEnd();

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════

  const CONFIG = {
    // Sélecteurs CSS
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
    },

    // Classe pour marquer les tables traitées
    PROCESSED_CLASS: "auto-upload-processed",

    // Configurations par type de traitement
    UPLOAD_CONFIGS: {
      // Lead Balance
      lead_balance: {
        triggerTableHeader: "Lead_balance",
        endpoint: "http://127.0.0.1:5000/lead-balance/process-excel",
        acceptedFormats: [".xlsx", ".xls"],
        maxFileSize: 10 * 1024 * 1024, // 10 MB
        resultType: "html_accordions",
        description: "Analyse Lead Balance"
      },

      // Analyse de fraude (exemple)
      analyse_fraude: {
        triggerTableHeader: "Analyse_fraude",
        endpoint: "http://127.0.0.1:5000/fraud-detection/analyze",
        acceptedFormats: [".xlsx", ".xls", ".csv"],
        maxFileSize: 50 * 1024 * 1024, // 50 MB
        resultType: "html_tables",
        description: "Analyse de fraude"
      },

      // États financiers (exemple)
      etats_financiers: {
        triggerTableHeader: "Etats_financiers",
        endpoint: "http://127.0.0.1:5000/financial-statements/generate",
        acceptedFormats: [".xlsx", ".xls"],
        maxFileSize: 10 * 1024 * 1024, // 10 MB
        resultType: "html_accordions",
        description: "États financiers SYSCOHADA"
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // FONCTIONS UTILITAIRES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Affiche une notification
   */
  function showNotification(message, type = "success") {
    const colors = {
      success: "linear-gradient(135deg, #4caf50, #45a049)",
      error: "linear-gradient(135deg, #f44336, #d32f2f)",
      info: "linear-gradient(135deg, #2196f3, #1976d2)",
    };

    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${colors[type] || colors.info};
      color: white; padding: 12px 20px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20000;
      font-size: 14px; opacity: 0; transform: translateY(-20px);
      transition: all 0.3s; max-width: 400px;
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
    }, 4000);
  }

  /**
   * Détecte si une table est une table déclencheuse
   */
  function isTriggerTable(table) {
    const headers = Array.from(table.querySelectorAll("th"))
      .map(th => th.textContent.trim());

    // Vérifier si l'entête correspond à une config
    for (const [key, config] of Object.entries(CONFIG.UPLOAD_CONFIGS)) {
      if (headers.includes(config.triggerTableHeader)) {
        console.log(`🎯 Table déclencheuse détectée: ${key} (${config.triggerTableHeader})`);
        return { isTrigger: true, type: key, config };
      }
    }

    return { isTrigger: false };
  }

  /**
   * Ouvre automatiquement le dialogue de sélection de fichier
   */
  function openFileDialog(config) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = config.acceptedFormats.join(',');
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
      
      // Ouvrir le dialogue automatiquement
      setTimeout(() => input.click(), 100);
    });
  }

  /**
   * Convertit un fichier en base64
   */
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Envoie le fichier vers le backend
   */
  async function sendToBackend(file, config) {
    console.group(`📤 ENVOI VERS BACKEND: ${config.description}`);
    console.log("📁 Fichier:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    console.log("🌐 Endpoint:", config.endpoint);

    const fileBase64 = await readFileAsBase64(file);
    console.log("✅ Fichier encodé en base64:", fileBase64.length, "caractères");

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        file_base64: fileBase64,
        filename: file.name
      })
    });

    console.log("📥 Statut réponse:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erreur backend:", errorData);
      console.groupEnd();
      throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Résultat reçu:", result);
    console.groupEnd();

    return result;
  }

  /**
   * Crée une table HTML à partir des données
   */
  function createTableHTML(tableData) {
    if (!tableData.headers || !tableData.rows) {
      return '';
    }

    let html = '<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" style="margin-bottom: 1rem;">';

    // En-têtes
    html += '<thead><tr>';
    tableData.headers.forEach((h) => {
      html += `<th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold">${h}</th>`;
    });
    html += '</tr></thead>';

    // Lignes
    html += '<tbody>';
    tableData.rows.forEach((row, rowIndex) => {
      const bgClass = rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800";
      html += `<tr class="${bgClass}">`;

      row.forEach((cell, cellIndex) => {
        const headerName = tableData.headers[cellIndex]?.toLowerCase() || "";
        let style = "";

        // Coloration pour les écarts
        if (headerName === "ecart" || headerName === "écart") {
          const numValue = parseFloat(String(cell).replace(/,/g, "").replace(/\s/g, ""));
          if (!isNaN(numValue)) {
            style = numValue >= 0 ? "color: #22c55e; font-weight: bold;" : "color: #ef4444; font-weight: bold;";
          }
        }

        html += `<td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm" style="${style}">${cell}</td>`;
      });

      html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
  }

  /**
   * Remplace la table avec les résultats
   */
  function replaceTableWithResults(table, result, config) {
    console.group("🔄 REMPLACEMENT DE LA TABLE");

    const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);

    if (!parentDiv) {
      console.error("❌ Div parent non trouvée!");
      console.groupEnd();
      return false;
    }

    console.log("📍 Div parent trouvée:", parentDiv.className);

    let resultHTML = '';

    // Type 1: HTML Accordions (Lead Balance, États financiers)
    if (config.resultType === 'html_accordions' && result.html) {
      console.log("📊 Type de résultat: HTML Accordions");
      resultHTML = result.html;
    }
    // Type 2: HTML Tables (Analyse de fraude)
    else if (config.resultType === 'html_tables') {
      console.log("📊 Type de résultat: HTML Tables");
      if (result.tables && Array.isArray(result.tables)) {
        resultHTML = result.tables.map(t => createTableHTML(t)).join('');
      } else if (result.headers && result.rows) {
        resultHTML = createTableHTML(result);
      }
    }

    if (!resultHTML) {
      console.warn("⚠️ Aucun contenu HTML à afficher");
      console.groupEnd();
      return false;
    }

    // Remplacer le contenu
    parentDiv.innerHTML = resultHTML;

    console.log("✅ Contenu de la div remplacé");
    console.groupEnd();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TRAITEMENT PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Traite une table déclencheuse
   */
  async function processTriggerTable(table, type, config) {
    console.group(`🎯 TRAITEMENT TABLE: ${type}`);

    if (table.classList.contains(CONFIG.PROCESSED_CLASS)) {
      console.log("⏭️ Table déjà traitée");
      console.groupEnd();
      return;
    }

    try {
      table.classList.add(CONFIG.PROCESSED_CLASS);

      // Ouvrir automatiquement le dialogue
      showNotification(`📂 Sélectionnez votre fichier pour ${config.description}`, "info");

      const file = await openFileDialog(config);

      if (!file) {
        console.log("❌ Sélection de fichier annulée");
        table.classList.remove(CONFIG.PROCESSED_CLASS);
        console.groupEnd();
        return;
      }

      // Vérifier le format
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!config.acceptedFormats.includes(ext)) {
        showNotification(
          `⚠️ Format non supporté. Formats acceptés: ${config.acceptedFormats.join(', ')}`,
          "error"
        );
        table.classList.remove(CONFIG.PROCESSED_CLASS);
        console.groupEnd();
        return;
      }

      // Vérifier la taille
      if (file.size > config.maxFileSize) {
        const maxSizeMB = (config.maxFileSize / 1024 / 1024).toFixed(0);
        showNotification(
          `⚠️ Fichier trop volumineux (max: ${maxSizeMB} MB)`,
          "error"
        );
        table.classList.remove(CONFIG.PROCESSED_CLASS);
        console.groupEnd();
        return;
      }

      showNotification(`📊 Traitement de ${file.name}...`, "info");

      // Envoyer vers le backend
      const result = await sendToBackend(file, config);

      // Remplacer la table
      if (result.success) {
        const replaced = replaceTableWithResults(table, result, config);

        if (replaced) {
          showNotification(
            `✅ ${result.message || config.description + " terminé avec succès!"}`,
            "success"
          );

          // Événement personnalisé
          document.dispatchEvent(new CustomEvent("claraverse:auto-upload:success", {
            detail: { 
              type, 
              filename: file.name, 
              timestamp: Date.now() 
            }
          }));
        } else {
          showNotification("⚠️ Impossible d'afficher les résultats", "error");
        }
      } else {
        throw new Error(result.message || "Erreur de traitement");
      }

    } catch (error) {
      console.error(`❌ Erreur ${type}:`, error);
      showNotification(`❌ Erreur: ${error.message}`, "error");
      table.classList.remove(CONFIG.PROCESSED_CLASS);
    }

    console.groupEnd();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCAN ET DÉTECTION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Scan toutes les tables et traite les tables déclencheuses
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);

    allTables.forEach((table) => {
      const { isTrigger, type, config } = isTriggerTable(table);

      if (isTrigger && !table.classList.contains(CONFIG.PROCESSED_CLASS)) {
        // Traiter la table automatiquement
        processTriggerTable(table, type, config);
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
        }, 500);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log("👁️ MutationObserver configuré");
  }

  // ═══════════════════════════════════════════════════════════════════════
  // API GLOBALE
  // ═══════════════════════════════════════════════════════════════════════

  window.AutoUploadHandler = {
    scan: scanAndProcess,
    config: CONFIG,
    version: "2.0.0",
    
    // Ajouter une nouvelle configuration
    addConfig: function(key, config) {
      CONFIG.UPLOAD_CONFIGS[key] = config;
      console.log(`✅ Configuration ajoutée: ${key}`);
    },
    
    // Réinitialiser les tables traitées
    reset: function() {
      document.querySelectorAll("." + CONFIG.PROCESSED_CLASS).forEach(t => {
        t.classList.remove(CONFIG.PROCESSED_CLASS);
      });
      console.log("✅ Reset effectué");
    },
    
    // Test manuel
    test: function() {
      console.log("🧪 TEST MANUEL");
      scanAndProcess();
    }
  };

  console.log("🌐 API: AutoUploadHandler.test() / AutoUploadHandler.reset() / AutoUploadHandler.addConfig()");

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════

  function init() {
    setupMutationObserver();
    
    // Scan initial après un délai
    setTimeout(scanAndProcess, 2000);
    
    // Scan périodique (backup)
    setInterval(() => {
      const tables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
      const unprocessed = Array.from(tables).filter(t => {
        const { isTrigger } = isTriggerTable(t);
        return isTrigger && !t.classList.contains(CONFIG.PROCESSED_CLASS);
      });
      
      if (unprocessed.length > 0) {
        scanAndProcess();
      }
    }, 3000);
    
    console.log("✅ AUTO UPLOAD HANDLER V2.0 INITIALISÉ");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
