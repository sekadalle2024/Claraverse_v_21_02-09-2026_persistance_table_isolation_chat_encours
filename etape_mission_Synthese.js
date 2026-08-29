/**
 * Script dynamique pour les tables de critères dans Claraverse - V20 (Traitement Séquentiel)
 * @version 20.0.0
 * @description
 * - Traitement UNIQUEMENT de la dernière table [critère table cible] apparue
 * - Suppression COMPLÈTE des tables critères après traitement
 * - Sauvegarde permanente dans le DOM avec marqueurs persistants
 * - Prévention du retraitement via suppression immédiate
 * - Une seule table traitée à la fois, dans l'ordre chronologique
 */

(function () {
  "use strict";

  console.log(
    "🚀 Initialisation V20 - Traitement Séquentiel et Suppression Complète"
  );

  // Configuration globale
  const CONFIG = {
    FLOWISE_ENDPOINT_URL:
      "https://r534c2br.rpcld.co/api/v1/prediction/e5c3313d-cc30-461f-8ea6-f6e8dd715854",
    SEARCH_KEYWORDS: {
      frap: ["frap", "FRAP", "Frap"],
      synthese: [
        "synthese",
        "SYNTHESE",
        "Synthèse",
        "Synthese",
        "synth",
        "SYNTH",
        "Synth",
      ],
      rapport: [
        "rapport",
        "RAPPORT",
        "Rapport",
        "rapport provisoire",
        "rapport final",
      ],
      suivi: ["suivi", "SUIVI", "Suivi", "suivi recos", "SUIVI RECOS"],
    },
    STORAGE_PREFIX: "claraverse_v20_",
    PROCESSED_DIV_CLASS: "claraverse-processed-div-v20",
    FLOWISE_RESULT_CLASS: "claraverse-flowise-result-v20",
    PROCESSING_LOCK_CLASS: "claraverse-processing-v20",
    OBSERVER_THROTTLE: 150,
  };

  // Variable globale pour empêcher les traitements simultanés
  let isProcessingActive = false;
  let processingQueue = [];

  // ================================
  // GESTIONNAIRE DE DIV TRAITÉES (DOM-BASED)
  // ================================
  const DivTracker = {
    // Marque une div comme définitivement traitée dans le DOM
    markDivAsProcessed(divElement, keyword, flowiseData) {
      // Ajouter une classe permanente
      divElement.classList.add(CONFIG.PROCESSED_DIV_CLASS);

      // Ajouter un attribut de données pour traçabilité
      divElement.setAttribute("data-claraverse-processed", "true");
      divElement.setAttribute("data-claraverse-keyword", keyword);
      divElement.setAttribute("data-claraverse-timestamp", Date.now());
      divElement.setAttribute("data-claraverse-chat", this.getCurrentChatId());

      // Créer un conteneur permanent pour les données Flowise
      const permanentContainer = document.createElement("div");
      permanentContainer.className = `${CONFIG.FLOWISE_RESULT_CLASS} permanent-flowise-data`;
      permanentContainer.setAttribute("data-keyword", keyword);
      permanentContainer.setAttribute(
        "data-processed-time",
        new Date().toISOString()
      );
      permanentContainer.innerHTML = flowiseData;

      // Injecter les données de manière permanente dans le DOM
      divElement.appendChild(permanentContainer);

      console.log(`🔒 Div marquée définitivement dans le DOM: ${keyword}`);

      // Sauvegarde additionnelle en localStorage pour persistence cross-reload
      this.saveToLocalStorage(divElement, keyword, flowiseData);
    },

    // Vérifie si une div a déjà été traitée (basé sur le DOM)
    isDivProcessed(divElement) {
      return (
        divElement.classList.contains(CONFIG.PROCESSED_DIV_CLASS) ||
        divElement.hasAttribute("data-claraverse-processed") ||
        divElement.querySelector(`.${CONFIG.FLOWISE_RESULT_CLASS}`)
      );
    },

    // Sauvegarde en localStorage comme backup
    saveToLocalStorage(divElement, keyword, flowiseData) {
      const divSignature = this.generateDivSignature(divElement);
      const record = {
        signature: divSignature,
        keyword,
        flowiseData,
        timestamp: Date.now(),
        chatId: this.getCurrentChatId(),
        processed: true,
      };

      localStorage.setItem(
        CONFIG.STORAGE_PREFIX + divSignature,
        JSON.stringify(record)
      );
    },

    // Restaure les données depuis localStorage si nécessaire
    restoreFromLocalStorage(divElement) {
      const divSignature = this.generateDivSignature(divElement);
      const stored = localStorage.getItem(CONFIG.STORAGE_PREFIX + divSignature);

      if (!stored) return false;

      try {
        const data = JSON.parse(stored);
        if (data.processed && data.flowiseData) {
          // Restaurer dans le DOM si pas déjà présent
          if (!divElement.querySelector(`.${CONFIG.FLOWISE_RESULT_CLASS}`)) {
            const container = document.createElement("div");
            container.className = `${CONFIG.FLOWISE_RESULT_CLASS} restored-flowise-data`;
            container.innerHTML = data.flowiseData;
            divElement.appendChild(container);

            this.markDivAsProcessed(divElement, data.keyword, data.flowiseData);
            console.log(
              `📦 Données restaurées depuis localStorage: ${data.keyword}`
            );
            return true;
          }
        }
      } catch (e) {
        console.error("Erreur restauration:", e);
      }

      return false;
    },

    generateDivSignature(divElement) {
      // Signature basée sur la position et le contenu initial
      const allDivs = document.querySelectorAll(
        "div.prose.prose-base.dark\\:prose-invert.max-w-none"
      );
      const index = Array.from(allDivs).indexOf(divElement);
      const textContent = divElement.textContent.substring(0, 200);
      return `div_${index}_${this.hashString(textContent)}`;
    },

    getCurrentChatId() {
      const urlPath = window.location.pathname;
      const chatMatch = urlPath.match(/\/chat\/([^\/]+)/);
      return chatMatch ? chatMatch[1] : "default";
    },

    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36).substring(0, 8);
    },
  };

  // ================================
  // DÉTECTEUR DE DERNIÈRE TABLE
  // ================================
  const LastTableDetector = {
    // Trouve UNIQUEMENT la dernière table [critère table cible] non traitée
    findLatestUnprocessedFlowiseTable() {
      const allFlowiseTables = [];

      // Parcourir toutes les divs de chat
      const allDivs = document.querySelectorAll(
        "div.prose.prose-base.dark\\:prose-invert.max-w-none"
      );

      for (const div of allDivs) {
        // IGNORER les divs déjà traitées
        if (DivTracker.isDivProcessed(div)) {
          console.log("⏭️ Div déjà traitée ignorée");
          continue;
        }

        // Chercher les tables Flowise dans cette div
        const tables = div.querySelectorAll("table");
        for (const table of tables) {
          if (this.isFlowiseTable(table)) {
            const keyword = this.detectKeyword(table);
            if (keyword) {
              allFlowiseTables.push({
                table,
                div,
                keyword,
                timestamp: this.getTableTimestamp(table),
              });
            }
          }
        }
      }

      // Retourner UNIQUEMENT la plus récente
      if (allFlowiseTables.length === 0) {
        return null;
      }

      // Trier par timestamp (plus récent en dernier)
      allFlowiseTables.sort((a, b) => a.timestamp - b.timestamp);
      const latest = allFlowiseTables[allFlowiseTables.length - 1];

      console.log(
        `🎯 Dernière table détectée: ${latest.keyword} (${allFlowiseTables.length} total)`
      );
      return latest;
    },

    isFlowiseTable(table) {
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      return headers.some((header) => header.includes("flowise"));
    },

    detectKeyword(table) {
      const allCells = table.querySelectorAll("td, th");

      for (const [group, variations] of Object.entries(
        CONFIG.SEARCH_KEYWORDS
      )) {
        for (const cell of allCells) {
          const cellText = cell.textContent.trim().toLowerCase();
          if (variations.some((kw) => cellText.includes(kw.toLowerCase()))) {
            return group;
          }
        }
      }
      return null;
    },

    getTableTimestamp(table) {
      // Utilise la position dans le DOM comme indicateur temporel
      const allTables = document.querySelectorAll("table");
      return Array.from(allTables).indexOf(table);
    },
  };

  // ================================
  // COLLECTEUR DE DONNÉES CIBLÉ
  // ================================
  const DataCollector = {
    // Collecte UNIQUEMENT pour la div spécifique contenant la table cible
    collectDataForSpecificDiv(targetDiv, targetKeyword) {
      const tablesHTML = [];
      console.log(
        `📊 Collecte ciblée pour ${targetKeyword} dans div spécifique`
      );

      // Chercher le premier tableau avec colonnes Rubrique/Description dans cette div
      const firstTable = targetDiv.querySelector("table");
      if (!firstTable) {
        console.log("❌ Aucune table dans la div cible");
        return "";
      }

      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      if (headers.includes("rubrique") && headers.includes("description")) {
        console.log("✅ Table avec colonnes Rubrique/Description trouvée");

        // Vérifier la présence du keyword
        const allCells = firstTable.querySelectorAll("td");
        let keywordFound = false;

        for (const cell of allCells) {
          const cellText = cell.textContent.trim().toLowerCase();
          const keywords = CONFIG.SEARCH_KEYWORDS[targetKeyword] || [];

          if (keywords.some((kw) => cellText.includes(kw.toLowerCase()))) {
            keywordFound = true;
            break;
          }
        }

        if (keywordFound) {
          console.log(`✅ Keyword ${targetKeyword} confirmé dans la div`);

          // Collecter TOUTES les tables de cette div spécifique
          targetDiv.querySelectorAll("table").forEach((table) => {
            tablesHTML.push(table.outerHTML);
          });
        }
      }

      console.log(`📋 ${tablesHTML.length} tables collectées pour traitement`);
      return tablesHTML.join("\n");
    },
  };

  // ================================
  // PROCESSEUR FLOWISE
  // ================================
  async function queryFlowiseEndpoint(question) {
    try {
      console.log("📡 Envoi vers endpoint Flowise...");

      const response = await fetch(CONFIG.FLOWISE_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Réponse Flowise reçue");
      return result;
    } catch (error) {
      console.error("❌ Erreur Flowise:", error);
      throw error;
    }
  }

  function extractTablesFromResponse(responseText) {
    const tables = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(responseText, "text/html");

      doc.querySelectorAll("table").forEach((table) => {
        table.className =
          "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
        tables.push(table.cloneNode(true));
      });
    } catch (error) {
      console.error("Erreur extraction tables:", error);
    }

    return tables;
  }

  // ================================
  // PROCESSEUR PRINCIPAL SÉQUENTIEL
  // ================================
  async function processLatestFlowiseTable() {
    // VERROU : Une seule exécution à la fois
    if (isProcessingActive) {
      console.log("🔒 Traitement déjà en cours, ignoré");
      return;
    }

    isProcessingActive = true;
    console.log("🎯 === DÉBUT TRAITEMENT SÉQUENTIEL ===");

    try {
      // 1. Trouver UNIQUEMENT la dernière table non traitée
      const latestTable = LastTableDetector.findLatestUnprocessedFlowiseTable();

      if (!latestTable) {
        console.log("ℹ️ Aucune nouvelle table Flowise à traiter");
        return;
      }

      const { table, div, keyword } = latestTable;

      console.log(`🔄 TRAITEMENT: ${keyword} (dernière table détectée)`);

      // 2. Marquer la div comme en cours de traitement
      div.classList.add(CONFIG.PROCESSING_LOCK_CLASS);

      // 3. Créer l'indicateur de chargement
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "claraverse-loading-v20";
      loadingIndicator.innerHTML = `
        <div class="flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 my-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
          <div class="text-center">
            <div class="text-blue-700 dark:text-blue-300 font-medium text-lg">
              Traitement ${keyword.toUpperCase()} en cours...
            </div>
            <div class="text-blue-600 dark:text-blue-400 text-sm mt-1">
              Collecte et envoi vers Flowise
            </div>
          </div>
        </div>
      `;

      div.appendChild(loadingIndicator);

      // 4. Collecter les données pour cette div spécifique
      const criteriaData = DataCollector.collectDataForSpecificDiv(
        div,
        keyword
      );

      if (!criteriaData.trim()) {
        throw new Error(`Aucune donnée collectée pour ${keyword}`);
      }

      // 5. Envoyer vers Flowise
      console.log(`📤 Envoi vers Flowise pour ${keyword}`);
      const response = await queryFlowiseEndpoint(criteriaData);

      if (!response || !response.text) {
        throw new Error("Réponse Flowise vide");
      }

      // 6. Extraire et formater la réponse
      const flowiseTables = extractTablesFromResponse(response.text);
      const flowiseHTML = flowiseTables.map((t) => t.outerHTML).join("");

      if (!flowiseHTML.trim()) {
        throw new Error("Aucune table dans la réponse Flowise");
      }

      // 7. SUPPRESSION COMPLÈTE des tables [critère table cible]
      console.log("🗑️ Suppression des tables critères originales...");
      div.querySelectorAll("table").forEach((originalTable) => {
        if (LastTableDetector.isFlowiseTable(originalTable)) {
          console.log("❌ Suppression table Flowise originale");
          originalTable.remove();
        }
      });

      // 8. SAUVEGARDE PERMANENTE dans le DOM
      DivTracker.markDivAsProcessed(div, keyword, flowiseHTML);

      console.log(`✅ SUCCÈS: ${keyword} traité et sauvegardé définitivement`);
      console.log("🎯 === FIN TRAITEMENT SÉQUENTIEL ===");
    } catch (error) {
      console.error("❌ ERREUR TRAITEMENT:", error);

      // Afficher l'erreur dans l'interface
      const errorDiv = document.createElement("div");
      errorDiv.className = "claraverse-error-v20";
      errorDiv.innerHTML = `
        <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 my-4">
          <div class="text-red-700 dark:text-red-300 font-medium">Erreur de traitement</div>
          <div class="text-red-600 dark:text-red-400 text-sm mt-1">${error.message}</div>
        </div>
      `;

      // Ajouter l'erreur à la première div disponible
      const firstDiv = document.querySelector(
        "div.prose.prose-base.dark\\:prose-invert.max-w-none"
      );
      if (firstDiv) {
        firstDiv.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 10000);
      }
    } finally {
      // 9. NETTOYAGE : Supprimer les indicateurs temporaires
      document
        .querySelectorAll(".claraverse-loading-v20")
        .forEach((el) => el.remove());
      document
        .querySelectorAll(`.${CONFIG.PROCESSING_LOCK_CLASS}`)
        .forEach((el) => {
          el.classList.remove(CONFIG.PROCESSING_LOCK_CLASS);
        });

      isProcessingActive = false;
      console.log("🔓 Verrou de traitement libéré");
    }
  }

  // ================================
  // SCANNER DE NOUVELLES TABLES
  // ================================
  function scanForNewTables() {
    // D'abord restaurer les données depuis localStorage si nécessaire
    const allDivs = document.querySelectorAll(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );
    allDivs.forEach((div) => {
      if (!DivTracker.isDivProcessed(div)) {
        DivTracker.restoreFromLocalStorage(div);
      }
    });

    // Ensuite chercher de nouvelles tables à traiter
    const latestTable = LastTableDetector.findLatestUnprocessedFlowiseTable();

    if (latestTable) {
      console.log(`🆕 Nouvelle table détectée: ${latestTable.keyword}`);

      // Ajouter à la queue et traiter
      if (!isProcessingActive) {
        setTimeout(processLatestFlowiseTable, 500);
      }
    }
  }

  // ================================
  // OBSERVATEUR DOM OPTIMISÉ
  // ================================
  let scanTimeout;
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Détecter ajout de tables ou de divs contenant des tables
            if (node.tagName === "TABLE" || node.querySelector("table")) {
              shouldScan = true;
              break;
            }
          }
        }
      }
      if (shouldScan) break;
    }

    if (shouldScan) {
      clearTimeout(scanTimeout);
      scanTimeout = setTimeout(scanForNewTables, CONFIG.OBSERVER_THROTTLE);
    }
  });

  // ================================
  // INITIALISATION
  // ================================
  function initialize() {
    console.log("🎯 Initialisation V20 - Traitement Séquentiel");

    const currentChat = DivTracker.getCurrentChatId();
    console.log(`💬 Chat actuel: ${currentChat}`);

    // Scan initial avec délai pour laisser le DOM se stabiliser
    setTimeout(() => {
      console.log("🔍 Scan initial...");
      scanForNewTables();
    }, 1000);

    // Lancer l'observateur
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Scanner de sécurité périodique (moins agressif)
    setInterval(() => {
      if (!isProcessingActive) {
        const latestTable =
          LastTableDetector.findLatestUnprocessedFlowiseTable();
        if (latestTable) {
          console.log("⏰ Scanner de sécurité: nouvelle table détectée");
          processLatestFlowiseTable();
        }
      }
    }, 8000);

    console.log("✅ V20 initialisée - Traitement séquentiel actif");
  }

  // Point d'entrée
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // API de débogage
  window.ClaraverseV20Debug = {
    DivTracker,
    LastTableDetector,
    DataCollector,
    processLatestFlowiseTable,
    scanForNewTables,
    isProcessingActive,
    CONFIG,
    version: "20.0.0 - Traitement Séquentiel",

    // Utilitaires de debug
    showProcessedDivs() {
      const processed = document.querySelectorAll(
        `.${CONFIG.PROCESSED_DIV_CLASS}`
      );
      console.log(`📊 ${processed.length} divs traitées trouvées:`);
      processed.forEach((div, index) => {
        console.log(
          `  ${index + 1}. Keyword: ${div.getAttribute("data-claraverse-keyword")}`
        );
      });
      return processed;
    },

    clearAllProcessed() {
      const processed = document.querySelectorAll(
        `.${CONFIG.PROCESSED_DIV_CLASS}`
      );
      processed.forEach((div) => {
        div.classList.remove(CONFIG.PROCESSED_DIV_CLASS);
        div.removeAttribute("data-claraverse-processed");
        div
          .querySelectorAll(`.${CONFIG.FLOWISE_RESULT_CLASS}`)
          .forEach((el) => el.remove());
      });

      // Nettoyer localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CONFIG.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }

      console.log(`🧹 ${processed.length} divs nettoyées`);
    },

    forceProcessLatest() {
      if (isProcessingActive) {
        console.log("⚠️ Traitement déjà en cours");
        return;
      }
      processLatestFlowiseTable();
    },
  };
})();
