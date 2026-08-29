/**
 * Script dynamique pour les tables de critères dans Claraverse - V15.1 (Intégration DOM Pure - Corrigé)
 * @version 15.1.0
 * @description
 * - SUPPRESSION COMPLÈTE du localStorage - Intégration DOM pure
 * - Utilisation exclusive de createElement, innerHTML, appendChild, insertBefore
 * - Marquage DOM permanent avec classes CSS et attributs data-*
 * - Persistance via DOM uniquement (comme OpenWebUI)
 * - Évite tous les problèmes de synchronisation localStorage
 * - Prévention absolue des doublons et exécutions multiples
 * - Correction des erreurs de logique V15.0
 */

(function () {
  "use strict";

  console.log("Initialisation V15.1 - DOM Pure Corrigé");

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
    PROCESSED_DIV_CLASS: "flowise-processed",
    FLOWISE_DATA_CLASS: "flowise-data-container",
    PROCESSING_CLASS: "flowise-processing",
    OBSERVER_THROTTLE: 100,
  };

  // ================================
  // SYSTÈME DE SIGNATURE DOM SIMPLIFIÉ
  // ================================
  const DOMSignature = {
    generateTableSignature(table) {
      const parentDiv = table.closest(
        "div.prose.prose-base.dark\\:prose-invert.max-w-none"
      );
      if (!parentDiv) return null;

      const allText = this.extractAllTextContent(parentDiv);
      const keyword = this.detectKeyword(table);

      return {
        divTextHash: this.hashString(allText),
        keyword: keyword,
        divIndex: this.getDivIndex(parentDiv),
        timestamp: Date.now(),
      };
    },

    extractAllTextContent(div) {
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
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    },
  };

  // ================================
  // GESTIONNAIRE DOM PUR
  // ================================
  const DOMPersistence = {
    // Vérifier si une div est déjà traitée
    isDivProcessed(parentDiv) {
      if (!parentDiv) return false;

      const hasProcessedClass = parentDiv.classList.contains(
        CONFIG.PROCESSED_DIV_CLASS
      );
      const hasProcessedAttr =
        parentDiv.getAttribute("data-flowise-processed") === "true";
      const hasDataContainer = parentDiv.querySelector(
        `.${CONFIG.FLOWISE_DATA_CLASS}`
      );

      return hasProcessedClass && hasProcessedAttr && hasDataContainer;
    },

    // Vérifier si une div est en cours de traitement
    isDivProcessing(parentDiv) {
      if (!parentDiv) return false;
      return parentDiv.classList.contains(CONFIG.PROCESSING_CLASS);
    },

    // Nettoyer tous les anciens conteneurs
    cleanupDivContainers(parentDiv) {
      // Supprimer tous les anciens conteneurs de données
      const oldContainers = parentDiv.querySelectorAll(
        `.${CONFIG.FLOWISE_DATA_CLASS}`
      );
      oldContainers.forEach((container) => container.remove());

      // Supprimer tous les indicateurs de chargement
      const loadingIndicators = parentDiv.querySelectorAll(
        ".claraverse-loading"
      );
      loadingIndicators.forEach((indicator) => indicator.remove());

      console.log("Nettoyage des anciens conteneurs effectué");
    },

    // Marquer une div comme traitée
    markDivAsProcessed(parentDiv, keyword, flowiseData) {
      // Nettoyer d'abord
      this.cleanupDivContainers(parentDiv);

      // Ajouter les marqueurs
      parentDiv.classList.add(CONFIG.PROCESSED_DIV_CLASS);
      parentDiv.setAttribute("data-flowise-processed", "true");
      parentDiv.setAttribute("data-flowise-keyword", keyword);
      parentDiv.setAttribute("data-flowise-timestamp", Date.now().toString());

      // Créer le conteneur de données
      const dataContainer = document.createElement("div");
      dataContainer.className = CONFIG.FLOWISE_DATA_CLASS;
      dataContainer.setAttribute("data-keyword", keyword);
      dataContainer.innerHTML = flowiseData;

      // Ajouter au DOM
      parentDiv.appendChild(dataContainer);

      console.log(`Div marquée comme traitée: ${keyword}`);
    },

    // Marquer comme en cours de traitement
    markAsProcessing(parentDiv) {
      parentDiv.classList.add(CONFIG.PROCESSING_CLASS);
    },

    // Supprimer le marqueur de traitement
    removeProcessingMark(parentDiv) {
      parentDiv.classList.remove(CONFIG.PROCESSING_CLASS);
    },
  };

  // ================================
  // PROCESSEUR FLOWISE
  // ================================
  async function queryFlowiseEndpoint(question) {
    try {
      console.log("Appel Flowise endpoint...");
      const response = await fetch(CONFIG.FLOWISE_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Réponse Flowise reçue");
      return result;
    } catch (error) {
      console.error("Erreur Flowise:", error);
      throw error;
    }
  }

  function collectCriteriaTables(targetKeyword) {
    const tablesHTML = [];
    const allDivs = document.querySelectorAll(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );

    for (const div of allDivs) {
      // Skip les divs déjà traitées
      if (DOMPersistence.isDivProcessed(div)) continue;

      const firstTable = div.querySelector(
        "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg"
      );
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
          div
            .querySelectorAll(
              "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg"
            )
            .forEach((table) => {
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

      doc
        .querySelectorAll(
          "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg"
        )
        .forEach((table) => {
          tables.push(table.cloneNode(true));
        });
    } catch (error) {
      console.error("Erreur extraction tables:", error);
    }

    return tables;
  }

  // ================================
  // PROCESSEUR PRINCIPAL
  // ================================
  async function processFlowiseTable(table) {
    const signature = DOMSignature.generateTableSignature(table);
    if (!signature) {
      console.log("Impossible de générer une signature");
      return;
    }

    const keyword = signature.keyword;
    if (!keyword) {
      console.log("Aucun mot-clé détecté");
      return;
    }

    const parentDiv = table.closest(
      "div.prose.prose-base.dark\\:prose-invert.max-w-none"
    );
    if (!parentDiv) {
      console.error("Parent div introuvable");
      return;
    }

    // Vérifications préliminaires
    if (DOMPersistence.isDivProcessed(parentDiv)) {
      console.log(`Div déjà traitée - Skip: ${keyword}`);
      if (table && table.parentNode) {
        table.remove();
      }
      return;
    }

    if (DOMPersistence.isDivProcessing(parentDiv)) {
      console.log(`Div en cours de traitement - Skip: ${keyword}`);
      return;
    }

    console.log(`Nouveau traitement: ${keyword}`);

    // Marquer comme en traitement
    DOMPersistence.markAsProcessing(parentDiv);

    // Créer indicateur de chargement
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
      // Collecter et envoyer à Flowise
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
        // Marquer comme traité et injecter les données
        DOMPersistence.markDivAsProcessed(parentDiv, keyword, flowiseHTML);

        console.log(`Succès: ${keyword} traité`);

        // Supprimer la table trigger
        if (table && table.parentNode) {
          table.remove();
        }
      } else {
        throw new Error("Aucune table exploitable trouvée");
      }
    } catch (error) {
      console.error(`Erreur ${keyword}:`, error);

      // Afficher l'erreur
      loadingIndicator.innerHTML = `
        <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
          <div class="text-red-700 dark:text-red-300 font-medium">Erreur de traitement</div>
          <div class="text-red-600 dark:text-red-400 text-sm mt-1">${error.message}</div>
        </div>
      `;

      setTimeout(() => {
        if (loadingIndicator && loadingIndicator.parentNode) {
          loadingIndicator.remove();
        }
      }, 5000);
    } finally {
      // Nettoyer
      DOMPersistence.removeProcessingMark(parentDiv);

      if (table && table.parentNode) {
        table.remove();
      }

      // Supprimer le loading si pas d'erreur
      setTimeout(() => {
        const loading = parentDiv.querySelector(".claraverse-loading");
        if (loading && !loading.querySelector(".bg-red-50")) {
          loading.remove();
        }
      }, 500);
    }
  }

  // ================================
  // SCANNER
  // ================================
  function scanAndProcessAllTables() {
    const flowiseTables = document.querySelectorAll(
      "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg"
    );

    let processed = 0;

    flowiseTables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      const isFlowiseTable = headers.some((header) =>
        ["flowise", "FLOWISE", "Flowise"].includes(header)
      );

      if (isFlowiseTable) {
        const parentDiv = table.closest(
          "div.prose.prose-base.dark\\:prose-invert.max-w-none"
        );

        if (
          parentDiv &&
          !DOMPersistence.isDivProcessed(parentDiv) &&
          !DOMPersistence.isDivProcessing(parentDiv)
        ) {
          processFlowiseTable(table);
          processed++;
        }
      }
    });

    if (processed > 0) {
      console.log(`Scanner: ${processed} nouvelles tables détectées`);
    }
  }

  // ================================
  // OBSERVATEUR DOM
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
  // INITIALISATION
  // ================================
  function initialize() {
    console.log("Initialisation V15.1 - DOM Pure");

    // Scanner initial
    setTimeout(scanAndProcessAllTables, 800);

    // Lancer l'observateur
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Scanner de sécurité
    setInterval(() => {
      const unprocessedTables = document.querySelectorAll(
        "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg"
      );

      let needsScan = false;
      unprocessedTables.forEach((table) => {
        const headers = Array.from(table.querySelectorAll("th")).map((th) =>
          th.textContent.trim().toLowerCase()
        );

        if (
          headers.some((header) =>
            ["flowise", "FLOWISE", "Flowise"].includes(header)
          )
        ) {
          const parentDiv = table.closest(
            "div.prose.prose-base.dark\\:prose-invert.max-w-none"
          );
          if (parentDiv && !DOMPersistence.isDivProcessed(parentDiv)) {
            needsScan = true;
          }
        }
      });

      if (needsScan) {
        console.log("Scanner de sécurité activé");
        scanAndProcessAllTables();
      }
    }, 3000);

    console.log("V15.1 initialisée avec succès");
  }

  // Point d'entrée
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // API de débogage
  window.ClaraverseV15Debug = {
    DOMSignature,
    DOMPersistence,
    InitialTableTracker,
    scanAndProcessNewTablesOnly,
    CONFIG,
    version: "15.1.0 - DOM Pure - Événement 1 Résolu",
  };
})();
