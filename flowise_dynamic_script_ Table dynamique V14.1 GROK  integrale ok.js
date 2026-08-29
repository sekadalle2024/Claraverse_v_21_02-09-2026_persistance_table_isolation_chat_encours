/**
 * Script dynamique pour les tables de critères dans Claraverse - V19 (Isolation par Chat & Distinction des Divs)
 * @version 19.0.0
 * @description
 * - Isolation complète des données par chat via inclusion du chatId dans les clés de stockage.
 * - Nettoyage automatique des anciens contextes d'autres chats.
 * - Distinction claire des divs traitées via classe "flowise" sur le parentDiv.
 * - Évite la réutilisation de données entre différents contextes/chat/FRAP.
 * - Suppression définitive des tables [critère table cible] après enregistrement.
 * - Maintien de la persistance ultra-robuste avec signature DOM.
 */

(function () {
  "use strict";

  console.log("🚀 Initialisation V19 - Isolation par Chat & Distinction Divs");

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
    STORAGE_PREFIX: "claraverse_v19_",
    PROCESSED_DIV_CLASS: "flowise",
    PROCESSED_MARKER_CLASS: "flowise-data-injected",
    OBSERVER_THROTTLE: 100,
    CLEANUP_MAX_AGE: 14 * 24 * 60 * 60 * 1000, // 14 jours
  };

  // ================================
  // SYSTÈME DE SIGNATURE DOM ULTRA-ROBUSTE
  // ================================
  const DOMSignature = {
    // Génère une signature ultra-précise d'une table Flowise
    generateTableSignature(table) {
      const parentDiv = table.closest(
        "div.prose.prose-base.dark\\:prose-invert.max-w-none"
      );
      if (!parentDiv) return null;

      // Collecte TOUS les éléments textuels de la div parente
      const allText = this.extractAllTextContent(parentDiv);

      // Signature basée sur le contenu COMPLET de la div
      const signature = {
        divTextHash: this.hashString(allText),
        tableCount: parentDiv.querySelectorAll("table").length,
        hasFlowiseHeader: this.hasFlowiseHeader(table),
        keyword: this.detectKeyword(table),
        divIndex: this.getDivIndex(parentDiv),
      };

      return this.createSignatureString(signature);
    },

    extractAllTextContent(div) {
      // Extraction de TOUT le texte de la div, normalisé
      const walker = document.createTreeWalker(
        div,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let textContent = "";
      let node;
      while ((node = walker.nextNode())) {
        textContent += node.nodeValue.trim() + " ";
      }

      return textContent.trim().replace(/\s+/g, " ");
    },

    hasFlowiseHeader(table) {
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      return headers.includes("flowise");
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

    getDivIndex(div) {
      return Array.from(
        document.querySelectorAll(
          "div.prose.prose-base.dark\\:prose-invert.max-w-none"
        )
      ).indexOf(div);
    },

    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(36);
    },

    createSignatureString(signature) {
      return `sig_${signature.divTextHash}_${signature.keyword}_${signature.divIndex}_${signature.tableCount}`;
    },
  };

  // ================================
  // GESTIONNAIRE DE PERSISTANCE ULTRA-ROBUSTE (ISOLÉ PAR CHAT)
  // ================================
  const PersistenceManager = {
    // Génère la clé de stockage incluant le chatId pour isolation
    getStorageKey(signature, chatId) {
      return CONFIG.STORAGE_PREFIX + chatId + "_" + signature;
    },

    // Marque une div comme définitivement traitée
    markDivAsProcessed(signature, flowiseData) {
      const chatId = this.getCurrentChatId();
      const key = this.getStorageKey(signature, chatId);
      const record = {
        signature,
        processed: true,
        timestamp: Date.now(),
        chatId: chatId,
        flowiseData,
        url: window.location.href,
      };

      localStorage.setItem(key, JSON.stringify(record));
      console.log(`🔒 Div marquée comme traitée définitivement: ${key}`);
    },

    isDivProcessed(signature) {
      const chatId = this.getCurrentChatId();
      const key = this.getStorageKey(signature, chatId);
      const record = localStorage.getItem(key);
      if (!record) return false;

      try {
        const data = JSON.parse(record);
        return data.processed === true && data.chatId === chatId;
      } catch (e) {
        return false;
      }
    },

    getProcessedData(signature) {
      const chatId = this.getCurrentChatId();
      const key = this.getStorageKey(signature, chatId);
      const record = localStorage.getItem(key);
      if (!record) return null;

      try {
        const data = JSON.parse(record);
        if (data.chatId === chatId) {
          return data;
        }
        return null;
      } catch (e) {
        return null;
      }
    },

    getCurrentChatId() {
      const urlPath = window.location.pathname;
      const chatMatch = urlPath.match(/\/chat\/([^\/]+)/);
      if (chatMatch) return chatMatch[1];

      return (
        btoa(urlPath)
          .replace(/[^a-zA-Z0-9]/g, "")
          .substring(0, 12) || "default"
      );
    },

    cleanup() {
      const now = Date.now();
      const currentChatId = this.getCurrentChatId();
      let cleaned = 0;

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CONFIG.STORAGE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            const isOld = now - data.timestamp > CONFIG.CLEANUP_MAX_AGE;
            const isOtherChat = data.chatId !== currentChatId;

            if (isOld || isOtherChat) {
              localStorage.removeItem(key);
              cleaned++;
            }
          } catch (e) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }

      if (cleaned > 0) {
        console.log(
          `🧹 Nettoyage: ${cleaned} enregistrements supprimés (anciens ou autres chats)`
        );
      }
    },
  };

  // ================================
  // PROCESSEUR FLOWISE
  // ================================
  async function queryFlowiseEndpoint(question) {
    try {
      console.log("📡 Appel Flowise endpoint...");
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

  function collectCriteriaTables(targetKeyword) {
    const tablesHTML = [];
    const allDivs = document.querySelectorAll(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );

    for (const div of allDivs) {
      const firstTable = div.querySelector("table");
      if (!firstTable) continue;

      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      if (headers.includes("rubrique") && headers.includes("description")) {
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
          div.querySelectorAll("table").forEach((table) => {
            tablesHTML.push(table.outerHTML);
          });
        }
      }
    }

    return tablesHTML.join("\n");
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
  // PROCESSEUR PRINCIPAL ULTRA-ROBUSTE
  // ================================
  async function processFlowiseTableUltraRobust(table) {
    const signature = DOMSignature.generateTableSignature(table);
    if (!signature) {
      console.log("⚠️ Impossible de générer une signature pour la table");
      return;
    }

    const keyword = DOMSignature.detectKeyword(table);
    if (!keyword) {
      console.log("❓ Aucun mot-clé détecté");
      return;
    }

    const parentDiv = table.closest(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );
    if (!parentDiv) {
      console.error("❌ Parent div introuvable");
      return;
    }

    // VÉRIFICATION CRITIQUE : Cette div a-t-elle déjà été traitée ? (Classe DOM ou Storage)
    const isProcessedInDOM = parentDiv.classList.contains(
      CONFIG.PROCESSED_DIV_CLASS
    );
    const isProcessedInStorage = PersistenceManager.isDivProcessed(signature);

    if (isProcessedInDOM || isProcessedInStorage) {
      console.log(`🚫 DIV DÉJÀ TRAITÉE DÉTECTÉE - Restauration: ${signature}`);

      // Restaurer les données depuis le cache si pas déjà affichées
      const processedData = PersistenceManager.getProcessedData(signature);
      if (processedData && processedData.flowiseData) {
        // Vérifier si les données ne sont pas déjà affichées
        if (!parentDiv.querySelector(`.${CONFIG.PROCESSED_MARKER_CLASS}`)) {
          const container = document.createElement("div");
          container.className = `flowise-restored-data ${CONFIG.PROCESSED_MARKER_CLASS}`;
          container.innerHTML = processedData.flowiseData;
          parentDiv.appendChild(container);
          console.log(`📦 Données Flowise restaurées pour: ${keyword}`);
        }
      }

      // Supprimer définitivement la table trigger
      table.remove();
      return;
    }

    console.log(`🎯 NOUVEAU TRAITEMENT: ${keyword} (${signature})`);

    // Créer l'indicateur de chargement
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "claraverse-loading";
    loadingIndicator.innerHTML = `
          <div class="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span class="text-blue-700 dark:text-blue-300 font-medium">
                  Traitement ${keyword.toUpperCase()} en cours...
              </span>
          </div>
      `;

    parentDiv.appendChild(loadingIndicator);

    try {
      // Collecte et traitement
      const criteriaTablesHTML = collectCriteriaTables(keyword);
      if (!criteriaTablesHTML) {
        throw new Error(`Aucune table de critères trouvée pour: ${keyword}`);
      }

      const response = await queryFlowiseEndpoint(criteriaTablesHTML);
      if (!response || !response.text) {
        throw new Error("Réponse Flowise vide");
      }

      const flowiseTables = extractTablesFromResponse(response.text);
      const flowiseHTML = flowiseTables.map((t) => t.outerHTML).join("");

      if (flowiseHTML) {
        // Marquer cette div comme définitivement traitée dans storage
        PersistenceManager.markDivAsProcessed(signature, flowiseHTML);

        // Ajouter la classe "flowise" au parentDiv
        parentDiv.classList.add(CONFIG.PROCESSED_DIV_CLASS);

        // Afficher les résultats
        const container = document.createElement("div");
        container.className = `flowise-results ${CONFIG.PROCESSED_MARKER_CLASS}`;
        container.innerHTML = flowiseHTML;

        parentDiv.appendChild(container);
        console.log(`✅ SUCCÈS: ${keyword} traité et marqué définitivement`);

        // Supprimer définitivement la table trigger
        table.remove();
      } else {
        throw new Error("Aucune table exploitable trouvée");
      }
    } catch (error) {
      console.error(`❌ ERREUR ${keyword}:`, error);

      loadingIndicator.innerHTML = `
              <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <div class="text-red-700 dark:text-red-300 font-medium">Erreur de traitement</div>
                  <div class="text-red-600 dark:text-red-400 text-sm mt-1">${error.message}</div>
              </div>
          `;

      setTimeout(() => loadingIndicator.remove(), 8000);
    } finally {
      // Supprimer l'indicateur de chargement s'il existe encore
      if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.remove();
      }
      // Assurer la suppression de la table en cas d'erreur aussi
      if (table && table.parentNode) {
        table.remove();
      }
    }
  }

  // ================================
  // SCANNER ULTRA-AGRESSIF
  // ================================
  function scanAndProcessAllTables() {
    // Scanner les nouvelles tables Flowise
    const flowiseTables = document.querySelectorAll("table");
    let processed = 0;

    flowiseTables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      if (headers.includes("flowise")) {
        processFlowiseTableUltraRobust(table);
        processed++;
      }
    });

    if (processed > 0) {
      console.log(`🔍 Scanner: ${processed} tables Flowise détectées`);
    }
  }

  // ================================
  // OBSERVATEUR DOM ULTRA-PERFORMANT
  // ================================
  let observerTimeout;
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
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
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(
        scanAndProcessAllTables,
        CONFIG.OBSERVER_THROTTLE
      );
    }
  });

  // ================================
  // INITIALISATION FINALE
  // ================================
  function initialize() {
    console.log("🏁 Initialisation V19 - Isolation par Chat");

    // Nettoyage initial (inclut suppression des anciens/autres chats)
    PersistenceManager.cleanup();

    // Scanner initial après un court délai
    setTimeout(scanAndProcessAllTables, 800);

    // Lancer l'observateur
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Scanner de sécurité périodique
    setInterval(() => {
      const unprocessedFlowise = document.querySelectorAll("table");
      let needsScan = false;

      unprocessedFlowise.forEach((table) => {
        const headers = Array.from(table.querySelectorAll("th")).map((th) =>
          th.textContent.trim().toLowerCase()
        );
        if (headers.includes("flowise")) {
          needsScan = true;
        }
      });

      if (needsScan) {
        console.log("⏰ Scanner de sécurité activé");
        scanAndProcessAllTables();
      }
    }, 3000);

    console.log("✅ V19 initialisée - Isolation par chat active");
  }

  // Point d'entrée
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // API de débogage
  window.ClaraverseV19Debug = {
    DOMSignature,
    PersistenceManager,
    scanAndProcessAllTables,
    CONFIG,
    version: "19.0.0 - Isolation par Chat & Distinction Divs",
  };
})();
