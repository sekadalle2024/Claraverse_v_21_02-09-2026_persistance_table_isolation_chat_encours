/**
 * Script dynamique pour les tables de critères dans Claraverse - V12.3 (Avec persistance des données)
 * @version 12.3.0
 * @description
 * - Détecte dynamiquement un mot-clé dans une table "Flowise".
 * - Collecte toutes les tables des divs correspondantes basées sur ce mot-clé.
 * - Envoie les données HTML consolidées à l'endpoint Flowise.
 * - Intègre correctement les données reçues dans la div contenant la table critère.
 * - PERSISTANCE : Sauvegarde les données dans le stockage en mémoire et les restaure après actualisation.
 * - Signature unique pour chaque contexte (chat + contenu) pour éviter les conflits.
 * - Restauration automatique des données au chargement de la page.
 */
(function () {
  "use strict";

  console.log("Initialisation du script dynamique de tables V12.3 (Avec persistance des données)");

  // --- CONFIGURATION CENTRALE ---
  const CONFIG = {
    FLOWISE_ENDPOINT_URL: "https://r534c2br.rpcld.co/api/v1/prediction/e5c3313d-cc30-461f-8ea6-f6e8dd715854",
    // Mots-clés pour la détection dans les tables sources
    SEARCH_KEYWORDS: {
      frap: ["frap", "FRAP", "Frap"],
      synthese: ["synthese", "SYNTHESE", "Synthèse", "Synthese", "synth"],
      rapport: ["rapport", "RAPPORT", "Rapport", "rapport provisoire", "rapport final"],
      suivi: ["suivi", "SUIVI", "Suivi", "suivi recos", "SUIVI RECOS"],
    },
    // Sélecteurs CSS pour cibler les éléments dans Claraverse
    SELECTORS: {
      CHAT_TABLES: "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
      OVERFLOW_CONTAINER: "div.overflow-x-auto.my-4",
    },
    // Marqueurs pour la gestion de l'état
    PROCESSED_CLASS: "flowise-processed",
    RESPONSE_CONTAINER_CLASS: "flowise-response-container",
    STORAGE_PREFIX: "claraverse_flowise_v12_3_",
  };

  // --- SYSTÈME DE PERSISTANCE ---
  const PersistenceManager = {
    // Stockage en mémoire pour la session courante
    sessionData: new Map(),
    
    /**
     * Génère une signature unique pour une table/contexte
     */
    generateSignature(table, keyword) {
      const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
      if (!parentDiv) return null;
      
      // Créer une signature basée sur le contenu de la div parente
      const divContent = this.extractDivTextContent(parentDiv);
      const contentHash = this.hashString(divContent + keyword);
      const chatId = this.getCurrentChatId();
      
      return `${chatId}_${keyword}_${contentHash}`;
    },

    /**
     * Extrait le contenu textuel d'une div pour créer une signature
     */
    extractDivTextContent(div) {
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

    /**
     * Génère un hash simple à partir d'une chaîne
     */
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(36);
    },

    /**
     * Récupère l'ID du chat actuel depuis l'URL
     */
    getCurrentChatId() {
      const urlPath = window.location.pathname;
      const chatMatch = urlPath.match(/\/chat\/([^\/]+)/);
      if (chatMatch) return chatMatch[1];
      
      // Fallback basé sur l'URL complète
      return btoa(urlPath).replace(/[^a-zA-Z0-9]/g, "").substring(0, 12) || "default";
    },

    /**
     * Sauvegarde les données Flowise
     */
    saveFlowiseData(signature, data) {
      const record = {
        signature,
        flowiseHTML: data.flowiseHTML,
        keyword: data.keyword,
        timestamp: Date.now(),
        chatId: this.getCurrentChatId(),
        url: window.location.href
      };

      // Stockage en mémoire
      this.sessionData.set(signature, record);
      
      console.log(`Données Flowise sauvegardées pour: ${signature}`);
    },

    /**
     * Récupère les données Flowise sauvegardées
     */
    getFlowiseData(signature) {
      return this.sessionData.get(signature) || null;
    },

    /**
     * Vérifie si des données existent pour cette signature
     */
    hasData(signature) {
      return this.sessionData.has(signature);
    },

    /**
     * Récupère toutes les données du chat actuel
     */
    getAllChatData() {
      const chatId = this.getCurrentChatId();
      const chatData = [];
      
      for (const [signature, data] of this.sessionData.entries()) {
        if (data.chatId === chatId) {
          chatData.push(data);
        }
      }
      
      return chatData;
    },

    /**
     * Nettoie les anciennes données
     */
    cleanup() {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      for (const [signature, data] of this.sessionData.entries()) {
        if (now - data.timestamp > maxAge) {
          this.sessionData.delete(signature);
        }
      }
    }
  };

  /**
   * Interroge l'endpoint Flowise avec les données collectées.
   */
  async function queryFlowiseEndpoint(tablesHTML) {
    try {
      console.log("Envoi des données vers Flowise...");
      const response = await fetch(CONFIG.FLOWISE_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: tablesHTML }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`Données reçues de l'endpoint Flowise ! Statut: ${response.status} OK`);
      
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API Flowise:", error);
      throw error;
    }
  }

  /**
   * Détecte le mot-clé cible dans une table "Flowise".
   */
  function detectTargetKeyword(flowiseTable) {
    const allCells = flowiseTable.querySelectorAll("td");
    for (const [keywordGroup, variations] of Object.entries(CONFIG.SEARCH_KEYWORDS)) {
      for (const cell of allCells) {
        const cellText = cell.textContent.trim().toLowerCase();
        if (variations.some(variation => cellText.includes(variation.toLowerCase()))) {
          console.log(`Mot-clé détecté: "${keywordGroup}" dans la cellule: "${cell.textContent.trim()}"`);
          return keywordGroup;
        }
      }
    }
    return null;
  }

  /**
   * Collecte les tables de critères basées sur un mot-clé dynamique.
   */
  function collectCriteriaTables(targetKeyword) {
    const allDivs = document.querySelectorAll(CONFIG.SELECTORS.PARENT_DIV);
    const collectedTablesHTML = [];

    allDivs.forEach(div => {
      const firstTable = div.querySelector(CONFIG.SELECTORS.CHAT_TABLES);
      if (!firstTable) return;

      const headers = Array.from(firstTable.querySelectorAll("th")).map(th => th.textContent.trim().toLowerCase());
      const hasRequiredHeaders = headers.includes("rubrique") && headers.includes("description");
      
      if (!hasRequiredHeaders) return;

      // Chercher le mot-clé dans la première table de cette div
      const cellsOfFirstTable = firstTable.querySelectorAll("td");
      const keywordFound = Array.from(cellsOfFirstTable).some(cell => {
        const cellText = cell.textContent.trim().toLowerCase();
        const keywords = CONFIG.SEARCH_KEYWORDS[targetKeyword] || [];
        return keywords.some(kw => cellText.includes(kw.toLowerCase()));
      });

      if (keywordFound) {
        console.log(`Div correspondante trouvée pour le mot-clé "${targetKeyword}". Collecte des tables...`);
        const allTablesInDiv = div.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
        allTablesInDiv.forEach(table => {
          collectedTablesHTML.push(table.outerHTML);
        });
      }
    });
    
    return collectedTablesHTML.join("\n");
  }

  /**
   * Extrait les tables HTML du texte de réponse Flowise.
   */
  function extractTablesFromResponse(responseText) {
    const tables = [];
    
    // Méthode 1: Extraction directe de tables HTML existantes
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    const existingTables = tempDiv.querySelectorAll("table");
    
    if (existingTables.length > 0) {
      console.log(`${existingTables.length} table(s) HTML trouvée(s) dans la réponse`);
      existingTables.forEach(table => {
        table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-4";
        tables.push(table.cloneNode(true));
      });
      return tables;
    }

    // Méthode 2: Conversion du markdown en HTML
    console.log("Conversion du markdown en tables HTML...");
    const markdownTableRegex = /^\s*\|(.+)\|\s*\n\s*\|(\s*:?-+:?\s*\|)+\s*\n((?:\s*\|.*\|\s*\n)*)/gm;
    let match;

    while ((match = markdownTableRegex.exec(responseText)) !== null) {
      const [, headerRow, , contentRows] = match;

      const table = document.createElement("table");
      table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-4";

      // Création de l'en-tête
      const thead = document.createElement("thead");
      const headerTr = document.createElement("tr");
      
      headerRow.split('|').forEach(cellText => {
        const trimmed = cellText.trim();
        if (trimmed) {
          const th = document.createElement("th");
          th.className = "px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left";
          th.textContent = trimmed;
          headerTr.appendChild(th);
        }
      });
      
      thead.appendChild(headerTr);
      table.appendChild(thead);

      // Création du corps
      const tbody = document.createElement("tbody");
      const rows = contentRows.trim().split('\n').filter(row => row.trim());
      
      rows.forEach(rowText => {
        const tr = document.createElement("tr");
        const cells = rowText.split('|').slice(1, -1);
        
        cells.forEach(cellText => {
          const td = document.createElement("td");
          td.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700";
          td.textContent = cellText.trim();
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
      tables.push(table);
    }

    console.log(`${tables.length} table(s) créée(s) à partir du markdown`);
    return tables;
  }

  /**
   * Trouve le bon conteneur pour insérer la réponse Flowise.
   */
  function findInsertionContainer(triggerTable) {
    let container = triggerTable.closest(CONFIG.SELECTORS.OVERFLOW_CONTAINER);
    if (container) {
      console.log("Conteneur overflow-x-auto trouvé");
      return container.parentElement;
    }

    container = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (container) {
      console.log("Conteneur prose trouvé");
      return container;
    }

    console.warn("Aucun conteneur approprié trouvé");
    return null;
  }

  /**
   * Intègre les données Flowise dans le DOM avec sauvegarde persistante.
   */
  function integrateFLowiseDataIntoDOM(flowiseTables, insertionPoint, keyword, signature) {
    if (!flowiseTables.length || !insertionPoint) {
      console.warn("Aucune donnée à intégrer ou point d'insertion invalide");
      return;
    }

    // Créer un conteneur pour la réponse Flowise
    const responseContainer = document.createElement("div");
    responseContainer.className = `${CONFIG.RESPONSE_CONTAINER_CLASS} mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700`;
    responseContainer.setAttribute('data-flowise-signature', signature);
    
    // Ajouter un titre
    const title = document.createElement("h3");
    title.className = "text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3";
    title.textContent = `Réponse Flowise (${keyword.toUpperCase()})`;
    responseContainer.appendChild(title);

    // Insérer chaque table
    flowiseTables.forEach((table, index) => {
      console.log(`Intégration de la table ${index + 1}`);
      
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "overflow-x-auto my-4";
      
      const clonedTable = table.cloneNode(true);
      tableWrapper.appendChild(clonedTable);
      
      responseContainer.appendChild(tableWrapper);
    });

    // Insérer dans le DOM
    insertionPoint.appendChild(responseContainer);
    
    // SAUVEGARDER LES DONNÉES POUR LA PERSISTANCE
    const flowiseHTML = responseContainer.outerHTML;
    PersistenceManager.saveFlowiseData(signature, {
      flowiseHTML,
      keyword,
      insertionPointIndex: Array.from(document.querySelectorAll(CONFIG.SELECTORS.PARENT_DIV)).indexOf(insertionPoint)
    });

    console.log(`${flowiseTables.length} table(s) intégrée(s) dans le DOM et sauvegardée(s)`);
  }

  /**
   * Restaure les données Flowise sauvegardées au chargement de la page.
   */
  function restoreFlowiseData() {
    console.log("Restauration des données Flowise...");
    const chatData = PersistenceManager.getAllChatData();
    
    if (chatData.length === 0) {
      console.log("Aucune donnée à restaurer");
      return;
    }

    console.log(`Restauration de ${chatData.length} élément(s) Flowise`);

    chatData.forEach(data => {
      // Trouver le point d'insertion approprié
      const allDivs = document.querySelectorAll(CONFIG.SELECTORS.PARENT_DIV);
      
      // Essayer de trouver la div correspondante
      for (const div of allDivs) {
        // Vérifier si cette div contient déjà des données Flowise
        if (div.querySelector(`[data-flowise-signature="${data.signature}"]`)) {
          console.log(`Données déjà présentes pour ${data.signature}`);
          continue;
        }

        // Vérifier si cette div correspond au contexte sauvegardé
        const divContent = PersistenceManager.extractDivTextContent(div);
        const divSignature = PersistenceManager.hashString(divContent + data.keyword);
        
        if (data.signature.includes(divSignature)) {
          console.log(`Restauration des données pour ${data.keyword} dans la div correspondante`);
          
          // Créer et insérer le conteneur restauré
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = data.flowiseHTML;
          const restoredElement = tempDiv.firstElementChild;
          
          if (restoredElement) {
            div.appendChild(restoredElement);
            div.classList.add(CONFIG.PROCESSED_CLASS); // Marquer comme traité
          }
          
          break;
        }
      }
    });
  }

  /**
   * Orchestre le processus complet pour une table "Flowise" détectée.
   */
  async function processFlowiseTrigger(triggerTable) {
    const parentDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (!parentDiv || parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
      return;
    }

    const targetKeyword = detectTargetKeyword(triggerTable);
    if (!targetKeyword) {
      console.log("Table Flowise sans mot-clé cible, ignorée.");
      return;
    }

    // Générer une signature unique pour cette table/contexte
    const signature = PersistenceManager.generateSignature(triggerTable, targetKeyword);
    if (!signature) {
      console.warn("Impossible de générer une signature");
      return;
    }

    // Vérifier si les données existent déjà
    if (PersistenceManager.hasData(signature)) {
      console.log(`Données déjà traitées pour ${targetKeyword} (${signature})`);
      return;
    }

    // Marquer comme traité pour éviter les répétitions
    parentDiv.classList.add(CONFIG.PROCESSED_CLASS);
    
    try {
      // Collecter les tables
      const criteriaTablesHTML = collectCriteriaTables(targetKeyword);
      if (!criteriaTablesHTML) {
        throw new Error(`Aucune table de critère trouvée pour le mot-clé : "${targetKeyword}"`);
      }

      const tableCount = (criteriaTablesHTML.match(/<table/g) || []).length;
      console.log(`${tableCount} table(s) collectée(s) pour le mot-clé "${targetKeyword}"`);

      // Envoyer à l'endpoint Flowise
      const response = await queryFlowiseEndpoint(criteriaTablesHTML);
      if (!response || !response.text) {
        throw new Error("Réponse de Flowise invalide ou vide");
      }

      console.log("Réponse Flowise reçue:", response.text.substring(0, 200) + "...");

      // Extraire et convertir les tables de la réponse
      const flowiseTables = extractTablesFromResponse(response.text);
      if (!flowiseTables.length) {
        throw new Error("Aucune table trouvée dans la réponse Flowise");
      }

      // Trouver le point d'insertion approprié
      const insertionContainer = findInsertionContainer(triggerTable);
      if (!insertionContainer) {
        throw new Error("Impossible de trouver un conteneur d'insertion approprié");
      }

      // Intégrer les données dans le DOM avec persistance
      integrateFLowiseDataIntoDOM(flowiseTables, insertionContainer, targetKeyword, signature);

      console.log(`Traitement complet réussi pour "${targetKeyword}"`);

    } catch (error) {
      console.error(`Erreur lors du traitement pour "${targetKeyword}":`, error);
      
      const errorContainer = document.createElement("div");
      errorContainer.className = "mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700";
      errorContainer.innerHTML = `
        <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Erreur Flowise</h3>
        <p class="text-red-700 dark:text-red-300">${error.message}</p>
      `;
      
      const insertionContainer = findInsertionContainer(triggerTable);
      if (insertionContainer) {
        insertionContainer.appendChild(errorContainer);
      }
    }
  }

  /**
   * Scanne le document à la recherche de tables "Flowise" non traitées.
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    let processedCount = 0;

    allTables.forEach(table => {
      const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
      if (parentDiv && parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
        return;
      }

      const headers = Array.from(table.querySelectorAll("th")).map(th => th.textContent.trim().toLowerCase());
      if (headers.includes("flowise")) {
        processFlowiseTrigger(table);
        processedCount++;
      }
    });

    if (processedCount > 0) {
      console.log(`Scanner: ${processedCount} nouvelles tables Flowise détectées`);
    }
  }

  // Observateur de mutations DOM
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches(CONFIG.SELECTORS.CHAT_TABLES)) {
              shouldScan = true;
            } else if (node.querySelector) {
              const tables = node.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
              if (tables.length > 0) {
                shouldScan = true;
              }
            }
          }
        });
      }
    });

    if (shouldScan) {
      console.log("Nouvelles tables détectées, analyse en cours...");
      setTimeout(scanAndProcess, 150);
    }
  });

  /**
   * Initialise le script avec restauration des données.
   */
  function initialize() {
    console.log("Initialisation du script V12.3 avec persistance...");
    
    // Nettoyage initial
    PersistenceManager.cleanup();
    
    // Restaurer les données existantes
    setTimeout(restoreFlowiseData, 500);
    
    // Scan initial
    setTimeout(scanAndProcess, 800);

    // Démarrage de l'observateur
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log("Script V12.3 initialisé avec persistance des données");
  }

  // Lancement de l'initialisation
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // API de débogage
  window.ClaraverseFlowiseV12_3 = {
    PersistenceManager,
    scanAndProcess,
    restoreFlowiseData,
    CONFIG,
    version: "12.3.0 - Avec persistance des données"
  };

})();