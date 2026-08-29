/**
 * Script dynamique pour les tables Data dans Claraverse - V2.0
 * @version 2.0.0
 * @description
 * - Détecte les tables avec entête de colonne "Data" (même si c'est la seule colonne)
 * - Collecte toutes les tables des divs correspondantes basées sur le mot-clé dynamique
 * - Envoie les données vers l'endpoint Python pandas_agent
 * - Logs détaillés identiques au menu contextuel
 */
(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // 🚀 INITIALISATION DATA.JS V2.0
  // ═══════════════════════════════════════════════════════════════
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🚀 DATA.JS V2.0 - INITIALISATION");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log("📋 Description: Script pour tables avec entête 'Data'");
  console.log("🔗 Endpoint: Python pandas_agent");
  console.log("═══════════════════════════════════════════════════════════════");

  // --- CONFIGURATION CENTRALE ---
  const CONFIG = {
    PANDAS_ENDPOINT_URL: "http://127.0.0.1:5000/pandas-agent/process-json",
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
      OVERFLOW_CONTAINER: "div.overflow-x-auto.my-4",
    },
    PROCESSED_CLASS: "data-processed",
    TRIGGER_HEADERS: ["data", "DATA", "Data"],
    SCAN_INTERVAL: 2000,
    SCAN_DELAY_INITIAL: 1500,
  };

  console.log("⚙️ Configuration chargée:");
  console.log(`   - Endpoint: ${CONFIG.PANDAS_ENDPOINT_URL}`);
  console.log(`   - Sélecteur tables: ${CONFIG.SELECTORS.CHAT_TABLES}`);
  console.log(`   - Headers déclencheurs: ${CONFIG.TRIGGER_HEADERS.join(", ")}`);

  /**
   * Vérifie si une table a une colonne avec entête "Data"
   */
  function hasDataHeader(table) {
    const headers = Array.from(table.querySelectorAll("th")).map((th) =>
      th.textContent.trim().toLowerCase()
    );
    
    const hasData = headers.some((h) =>
      CONFIG.TRIGGER_HEADERS.some((trigger) => h === trigger.toLowerCase())
    );
    
    return hasData;
  }

  /**
   * Diagnostic complet d'une table
   */
  function diagnoseTable(table, index) {
    console.log("");
    console.log(`📋 [DIAGNOSTIC TABLE ${index}]`);
    
    const headers = Array.from(table.querySelectorAll("th")).map((th) => th.textContent.trim());
    console.log(`   - Headers: [${headers.join(", ")}]`);
    
    const rows = table.querySelectorAll("tbody tr");
    console.log(`   - Nombre de lignes: ${rows.length}`);
    
    const hasData = hasDataHeader(table);
    console.log(`   - Contient 'Data': ${hasData ? "✅ OUI" : "❌ NON"}`);
    
    const isProcessed = table.classList.contains(CONFIG.PROCESSED_CLASS);
    console.log(`   - Déjà traitée: ${isProcessed ? "⏭️ OUI" : "🆕 NON"}`);
    
    const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
    console.log(`   - Dans div.prose: ${parentDiv ? "✅ OUI" : "❌ NON"}`);
    
    return { headers, rows: rows.length, hasData, isProcessed, parentDiv };
  }

  /**
   * Scan toutes les tables et affiche un diagnostic
   */
  function scanAllTables() {
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🔍 DATA.JS - SCAN DES TABLES");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    console.log(`📊 Tables trouvées avec sélecteur CSS: ${allTables.length}`);
    
    if (allTables.length === 0) {
      console.log("⚠️ Aucune table trouvée. Vérifiez le sélecteur CSS.");
      
      // Essayer un sélecteur plus large
      const anyTables = document.querySelectorAll("table");
      console.log(`📊 Tables totales dans le DOM: ${anyTables.length}`);
      
      anyTables.forEach((t, i) => {
        const classes = t.className;
        const headers = Array.from(t.querySelectorAll("th")).map(th => th.textContent.trim());
        console.log(`   Table ${i}: classes="${classes}", headers=[${headers.join(", ")}]`);
      });
      
      return [];
    }
    
    const dataTables = [];
    
    allTables.forEach((table, index) => {
      const diag = diagnoseTable(table, index);
      
      if (diag.hasData && !diag.isProcessed) {
        dataTables.push(table);
        console.log(`   ✅ Table ${index} ajoutée à la liste de traitement`);
      }
    });
    
    console.log("");
    console.log(`📊 RÉSULTAT DU SCAN:`);
    console.log(`   - Tables totales: ${allTables.length}`);
    console.log(`   - Tables Data non traitées: ${dataTables.length}`);
    
    return dataTables;
  }

  /**
   * Extrait le mot-clé de la première cellule de données
   */
  function extractKeywordFromTable(table) {
    console.log("");
    console.log("🔍 [EXTRACTION MOT-CLÉ]");
    
    const headers = Array.from(table.querySelectorAll("th")).map((th) =>
      th.textContent.trim()
    );
    console.log(`   - Headers: [${headers.join(", ")}]`);
    
    // Trouver l'index de la colonne "Data"
    const dataIndex = headers.findIndex((h) =>
      CONFIG.TRIGGER_HEADERS.some((trigger) => h.toLowerCase() === trigger.toLowerCase())
    );
    
    console.log(`   - Index colonne Data: ${dataIndex}`);
    
    if (dataIndex === -1) {
      console.warn("   ⚠️ Colonne 'Data' non trouvée");
      return null;
    }
    
    // Récupérer la première ligne de données
    const firstRow = table.querySelector("tbody tr");
    if (!firstRow) {
      console.warn("   ⚠️ Aucune ligne de données");
      return null;
    }
    
    const cells = firstRow.querySelectorAll("td");
    console.log(`   - Nombre de cellules: ${cells.length}`);
    
    if (dataIndex >= cells.length) {
      // Si une seule colonne, prendre la première cellule
      if (cells.length > 0) {
        const keyword = cells[0].textContent.trim();
        console.log(`   ✅ Mot-clé extrait (1ère cellule): "${keyword}"`);
        return keyword;
      }
      console.warn("   ⚠️ Index de colonne invalide");
      return null;
    }
    
    const keyword = cells[dataIndex].textContent.trim();
    console.log(`   ✅ Mot-clé extrait: "${keyword}"`);
    return keyword;
  }

  /**
   * Collecte les données de la table pour envoi
   */
  function collectTableData(table) {
    console.log("");
    console.log("📦 [COLLECTE DONNÉES TABLE]");
    
    const headers = [];
    const rows = [];
    
    // Collecter les headers
    const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
    if (headerRow) {
      headerRow.querySelectorAll("th, td").forEach((cell) => {
        headers.push(cell.textContent.trim());
      });
    }
    console.log(`   - Headers collectés: [${headers.join(", ")}]`);
    
    // Collecter les lignes
    const tbody = table.querySelector("tbody");
    const dataRows = tbody ? tbody.querySelectorAll("tr") : table.querySelectorAll("tr:not(:first-child)");
    
    dataRows.forEach((row, i) => {
      const rowData = [];
      row.querySelectorAll("td, th").forEach((cell) => {
        rowData.push(cell.textContent.trim());
      });
      if (rowData.length > 0) {
        rows.push(rowData);
        if (i < 3) console.log(`   - Ligne ${i}: [${rowData.join(", ")}]`);
      }
    });
    
    if (rows.length > 3) {
      console.log(`   - ... et ${rows.length - 3} autres lignes`);
    }
    
    console.log(`   ✅ Total: ${headers.length} colonnes, ${rows.length} lignes`);
    
    return { headers, rows };
  }

  /**
   * Trouve la colonne Ecart
   */
  function findEcartColumn(headers) {
    for (const h of headers) {
      const lower = h.toLowerCase();
      if (lower === "ecart" || lower === "écart") {
        return h;
      }
    }
    return null;
  }

  /**
   * Envoie les données vers l'endpoint Pandas
   */
  async function sendToPandasAgent(tableData, tableId) {
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🐼 [PANDAS AGENT] ENVOI DES DONNÉES");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const targetColumn = findEcartColumn(tableData.headers);
    
    const payload = {
      tables: [{
        tableId: tableId,
        headers: tableData.headers,
        rows: tableData.rows
      }],
      targetTableId: tableId,
      action: "calculate_ecart",
      targetColumn: targetColumn
    };
    
    console.log("📤 [ENVOI] Détails de la requête:");
    console.log(`   - Endpoint: ${CONFIG.PANDAS_ENDPOINT_URL}`);
    console.log(`   - Table ID: ${tableId}`);
    console.log(`   - Headers: [${tableData.headers.join(", ")}]`);
    console.log(`   - Nombre de lignes: ${tableData.rows.length}`);
    console.log(`   - Colonne cible: ${targetColumn || "auto-détection"}`);
    console.log(`   - Action: calculate_ecart`);
    
    const payloadStr = JSON.stringify(payload);
    console.log(`   - Taille payload: ${payloadStr.length} caractères`);
    
    const startTime = Date.now();
    
    try {
      console.log("");
      console.log("📡 Envoi en cours...");
      
      const response = await fetch(CONFIG.PANDAS_ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: payloadStr
      });
      
      const duration = Date.now() - startTime;
      
      console.log("");
      console.log("📥 [RÉCEPTION] Réponse du serveur:");
      console.log(`   - Statut HTTP: ${response.status} ${response.statusText}`);
      console.log(`   - Durée: ${duration}ms`);
      console.log(`   - OK: ${response.ok ? "✅ OUI" : "❌ NON"}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Erreur HTTP: ${errorText}`);
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log("");
      console.log("📊 [RÉSULTAT] Données reçues:");
      console.log(`   - Success: ${result.success}`);
      console.log(`   - Message: ${result.message}`);
      
      if (result.headers) {
        console.log(`   - Headers résultat: [${result.headers.join(", ")}]`);
      }
      if (result.rows) {
        console.log(`   - Lignes résultat: ${result.rows.length}`);
        result.rows.slice(0, 3).forEach((row, i) => {
          console.log(`      Ligne ${i}: [${row.join(", ")}]`);
        });
      }
      if (result.calculations) {
        console.log(`   - Calculs: ${JSON.stringify(result.calculations)}`);
      }
      
      console.log("");
      console.log("╔═══════════════════════════════════════════════════════════╗");
      console.log("║  ✅ COMMUNICATION PANDAS AGENT RÉUSSIE                    ║");
      console.log("╚═══════════════════════════════════════════════════════════╝");
      
      return result;
      
    } catch (error) {
      console.error("");
      console.error("╔═══════════════════════════════════════════════════════════╗");
      console.error("║  ❌ ERREUR PANDAS AGENT                                   ║");
      console.error("╚═══════════════════════════════════════════════════════════╝");
      console.error(`   - Message: ${error.message}`);
      console.error(`   - Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Met à jour la table avec les résultats
   */
  function updateTableWithResults(table, result) {
    console.log("");
    console.log("🔄 [MISE À JOUR TABLE]");
    
    if (!result.success || !result.rows) {
      console.warn("   ⚠️ Pas de données à mettre à jour");
      return false;
    }
    
    const tbody = table.querySelector("tbody");
    if (!tbody) {
      console.warn("   ⚠️ Tbody non trouvé");
      return false;
    }
    
    const existingRows = tbody.querySelectorAll("tr");
    console.log(`   - Lignes existantes: ${existingRows.length}`);
    console.log(`   - Lignes résultat: ${result.rows.length}`);
    
    result.rows.forEach((rowData, rowIndex) => {
      if (rowIndex < existingRows.length) {
        const cells = existingRows[rowIndex].querySelectorAll("td");
        
        rowData.forEach((val, cellIndex) => {
          if (cellIndex < cells.length) {
            cells[cellIndex].textContent = val;
            
            // Colorer les écarts
            const headerName = result.headers[cellIndex]?.toLowerCase() || "";
            if (headerName === "ecart" || headerName === "écart") {
              const numValue = parseFloat(String(val).replace(/,/g, "").replace(/\s/g, ""));
              if (!isNaN(numValue)) {
                cells[cellIndex].style.color = numValue >= 0 ? "green" : "red";
                cells[cellIndex].style.fontWeight = "bold";
                console.log(`   - Écart ligne ${rowIndex}: ${numValue} (${numValue >= 0 ? "vert" : "rouge"})`);
              }
            }
          }
        });
      }
    });
    
    console.log("   ✅ Table mise à jour avec succès");
    return true;
  }

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
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 20000;
      font-size: 14px;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s;
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
    }, 3000);
  }

  /**
   * Traite une table Data
   */
  async function processDataTable(table) {
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🎯 DATA.JS - TRAITEMENT TABLE DATA");
    console.log("═══════════════════════════════════════════════════════════════");
    
    // Vérifier si déjà traitée
    if (table.classList.contains(CONFIG.PROCESSED_CLASS)) {
      console.log("⏭️ Table déjà traitée, ignorée");
      return;
    }
    
    try {
      // Marquer comme en cours
      table.classList.add(CONFIG.PROCESSED_CLASS);
      showNotification("🐼 Envoi vers l'agent Pandas...", "info");
      
      // Extraire le mot-clé
      const keyword = extractKeywordFromTable(table);
      console.log(`📝 Mot-clé extrait: "${keyword}"`);
      
      // Collecter les données
      const tableData = collectTableData(table);
      
      // Générer un ID
      const tableId = `data_table_${Date.now()}`;
      
      // Envoyer vers Pandas
      const result = await sendToPandasAgent(tableData, tableId);
      
      // Mettre à jour la table
      if (result.success) {
        updateTableWithResults(table, result);
        showNotification(`✅ ${result.message}`, "success");
        
        // Émettre un événement
        document.dispatchEvent(new CustomEvent("claraverse:table:updated", {
          detail: {
            tableId: tableId,
            table: table,
            source: "data_agent",
            timestamp: Date.now()
          }
        }));
      } else {
        throw new Error(result.message || "Erreur inconnue");
      }
      
    } catch (error) {
      console.error("❌ Erreur traitement:", error);
      showNotification(`❌ Erreur: ${error.message}`, "error");
      // Retirer le marquage pour permettre un nouveau traitement
      table.classList.remove(CONFIG.PROCESSED_CLASS);
    }
  }

  /**
   * Scan et traite les tables Data
   */
  function scanAndProcess() {
    const dataTables = scanAllTables();
    
    if (dataTables.length > 0) {
      console.log(`🚀 Traitement de ${dataTables.length} table(s) Data...`);
      dataTables.forEach((table, i) => {
        console.log(`   Traitement table ${i + 1}/${dataTables.length}`);
        processDataTable(table);
      });
    }
  }

  /**
   * Configure l'observateur de mutations
   */
  function setupMutationObserver() {
    console.log("");
    console.log("👁️ Configuration de l'observateur de mutations...");
    
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
      
      if (shouldScan) {
        console.log("🔔 Nouvelle table détectée, scan dans 500ms...");
        setTimeout(scanAndProcess, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("   ✅ Observateur configuré");
  }

  /**
   * API globale
   */
  function exposeGlobalAPI() {
    window.DataAgent = {
      scan: scanAllTables,
      process: scanAndProcess,
      processTable: processDataTable,
      config: CONFIG,
      
      // Fonction de test manuel
      test: function() {
        console.log("");
        console.log("═══════════════════════════════════════════════════════════════");
        console.log("🧪 DATA.JS - TEST MANUEL");
        console.log("═══════════════════════════════════════════════════════════════");
        scanAndProcess();
      },
      
      // Forcer le traitement d'une table spécifique
      forceProcess: function(tableIndex = 0) {
        const tables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
        if (tableIndex < tables.length) {
          const table = tables[tableIndex];
          table.classList.remove(CONFIG.PROCESSED_CLASS);
          processDataTable(table);
        } else {
          console.error(`Table index ${tableIndex} non trouvée (${tables.length} tables)`);
        }
      }
    };
    
    console.log("");
    console.log("🌐 API globale exposée: window.DataAgent");
    console.log("   - DataAgent.scan() : Scanner les tables");
    console.log("   - DataAgent.process() : Scanner et traiter");
    console.log("   - DataAgent.test() : Test manuel complet");
    console.log("   - DataAgent.forceProcess(index) : Forcer traitement d'une table");
  }

  // ═══════════════════════════════════════════════════════════════
  // 🚀 INITIALISATION
  // ═══════════════════════════════════════════════════════════════
  function init() {
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🚀 DATA.JS V2.0 - DÉMARRAGE");
    console.log("═══════════════════════════════════════════════════════════════");
    
    // Exposer l'API
    exposeGlobalAPI();
    
    // Configurer l'observateur
    setupMutationObserver();
    
    // Premier scan après délai
    console.log(`⏱️ Premier scan dans ${CONFIG.SCAN_DELAY_INITIAL}ms...`);
    setTimeout(scanAndProcess, CONFIG.SCAN_DELAY_INITIAL);
    
    // Scan périodique
    setInterval(() => {
      const tables = scanAllTables();
      if (tables.length > 0) {
        scanAndProcess();
      }
    }, CONFIG.SCAN_INTERVAL);
    
    console.log("");
    console.log("╔═══════════════════════════════════════════════════════════╗");
    console.log("║  ✅ DATA.JS V2.0 INITIALISÉ                               ║");
    console.log("║  📋 Tapez DataAgent.test() dans la console pour tester    ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
  }

  // Démarrer
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
