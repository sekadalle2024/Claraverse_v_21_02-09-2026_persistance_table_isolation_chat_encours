/**
 * Script dynamique pour les tables de critères dans Claraverse - V13.2 (Affichage corrigé)
 * @version 13.2.0
 * @description
 * - Détecte dynamiquement un mot-clé dans une table "Flowise".
 * - Collecte toutes les tables des divs correspondantes basées sur ce mot-clé.
 * - Envoie les données HTML consolidées à l'endpoint Flowise.
 * - Intègre les tables avec espacement correct et URLs fonctionnelles.
 * - Supprime les lignes vides et améliore le formatage CSS.
 * - Traitement spécifique du markdown retourné par Flowise.
 * - Évite les doublons avec un système de marquage robuste.
 */
(function () {
  "use strict";

  console.log(
    "🚀 Initialisation du script dynamique de tables V13.1 (Tables sans mise en forme)"
  );

  // --- CONFIGURATION CENTRALE ---
  const CONFIG = {
    FLOWISE_ENDPOINT_URL:
      "https://r534c2br.rpcld.co/api/v1/prediction/88b7c023-429e-4c81-b917-c65c56769be1",
    // Mots-clés pour la détection dans les tables sources
    SEARCH_KEYWORDS: {
      frap: ["frap", "FRAP", "Frap"],
      synthese: ["synthese", "SYNTHESE", "Synthèse", "Synthese", "synth"],
      rapport: [
        "rapport",
        "RAPPORT",
        "Rapport",
        "rapport provisoire",
        "rapport final",
      ],
      suivi: ["suivi", "SUIVI", "Suivi", "suivi recos", "SUIVI RECOS"],
    },
    // Sélecteurs CSS pour cibler les éléments dans Claraverse
    SELECTORS: {
      CHAT_TABLES:
        "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
      OVERFLOW_CONTAINER: "div.overflow-x-auto.my-4",
    },
    // Marqueur pour les tables déjà traitées
    PROCESSED_CLASS: "flowise-processed",
  };

  /**
   * Interroge l'endpoint Flowise avec les données collectées.
   * @param {string} tablesHTML - La chaîne HTML contenant toutes les tables de critères.
   * @returns {Promise<object|null>} La réponse JSON de l'API ou null en cas d'erreur.
   */
  async function queryFlowiseEndpoint(tablesHTML) {
    try {
      console.log("📡 Envoi des données vers Flowise...");
      const response = await fetch(CONFIG.FLOWISE_ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: tablesHTML }),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      console.log(
        `✅ Données reçues de l'endpoint Flowise ! Statut: ${response.status} OK`
      );

      return await response.json();
    } catch (error) {
      console.error("❌ Erreur lors de l'appel à l'API Flowise:", error);
      throw error;
    }
  }

  /**
   * Détecte le mot-clé cible [critère table cible] dans une table "Flowise".
   * @param {HTMLElement} flowiseTable - L'élément de la table déclencheuse.
   * @returns {string|null} Le groupe de mots-clés trouvé (ex: "frap") ou null.
   */
  function detectTargetKeyword(flowiseTable) {
    const allCells = flowiseTable.querySelectorAll("td");
    for (const [keywordGroup, variations] of Object.entries(
      CONFIG.SEARCH_KEYWORDS
    )) {
      for (const cell of allCells) {
        const cellText = cell.textContent.trim().toLowerCase();
        if (
          variations.some((variation) =>
            cellText.includes(variation.toLowerCase())
          )
        ) {
          console.log(
            `🎯 Mot-clé détecté: "${keywordGroup}" dans la cellule: "${cell.textContent.trim()}"`
          );
          return keywordGroup;
        }
      }
    }
    return null;
  }

  /**
   * Collecte les tables de critères basées sur un mot-clé dynamique.
   * @param {string} targetKeyword - Le mot-clé à rechercher (ex: "frap").
   * @returns {string} Une chaîne HTML contenant toutes les tables trouvées.
   */
  function collectCriteriaTables(targetKeyword) {
    const allDivs = document.querySelectorAll(CONFIG.SELECTORS.PARENT_DIV);
    const collectedTablesHTML = [];

    allDivs.forEach((div) => {
      const firstTable = div.querySelector(CONFIG.SELECTORS.CHAT_TABLES);
      if (!firstTable) return;

      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      const hasRequiredHeaders =
        headers.includes("rubrique") && headers.includes("description");

      if (!hasRequiredHeaders) return;

      // Chercher le mot-clé dans la première table de cette div
      const cellsOfFirstTable = firstTable.querySelectorAll("td");
      const keywordFound = Array.from(cellsOfFirstTable).some((cell) => {
        const cellText = cell.textContent.trim().toLowerCase();
        const keywords = CONFIG.SEARCH_KEYWORDS[targetKeyword] || [];
        return keywords.some((kw) => cellText.includes(kw.toLowerCase()));
      });

      if (keywordFound) {
        console.log(
          `✅ Div correspondante trouvée pour le mot-clé "${targetKeyword}". Collecte des tables...`
        );
        const allTablesInDiv = div.querySelectorAll(
          CONFIG.SELECTORS.CHAT_TABLES
        );
        allTablesInDiv.forEach((table) => {
          collectedTablesHTML.push(table.outerHTML);
        });
      }
    });

    return collectedTablesHTML.join("\n");
  }

  /**
   * Extrait les tables HTML du texte de réponse Flowise (format markdown ou HTML).
   * @param {string} responseText - Le texte brut de la réponse de l'API.
   * @returns {HTMLElement[]} Un tableau d'éléments de table HTML.
   */
  function extractTablesFromResponse(responseText) {
    const tables = [];

    // Méthode 1: Extraction directe de tables HTML existantes
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    const existingTables = tempDiv.querySelectorAll("table");

    if (existingTables.length > 0) {
      console.log(
        `📋 ${existingTables.length} table(s) HTML trouvée(s) dans la réponse`
      );
      existingTables.forEach((table) => {
        // Appliquer UNIQUEMENT le style de base Claraverse (sans mise en forme supplémentaire)
        table.className =
          "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
        tables.push(table.cloneNode(true));
      });
      return tables;
    }

    // Méthode 2: Conversion du markdown en HTML
    console.log("📄 Conversion du markdown en tables HTML...");
    const markdownTableRegex =
      /^\s*\|(.+)\|\s*\n\s*\|(\s*:?-+:?\s*\|)+\s*\n((?:\s*\|.*\|\s*\n)*)/gm;
    let match;

    while ((match = markdownTableRegex.exec(responseText)) !== null) {
      const [, headerRow, , contentRows] = match;

      const table = document.createElement("table");
      // Style de base Claraverse UNIQUEMENT
      table.className =
        "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";

      // Création de l'en-tête
      const thead = document.createElement("thead");
      const headerTr = document.createElement("tr");

      headerRow.split("|").forEach((cellText) => {
        const trimmed = cellText.trim();
        if (trimmed) {
          const th = document.createElement("th");
          th.className =
            "px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left";
          th.textContent = trimmed;
          headerTr.appendChild(th);
        }
      });

      thead.appendChild(headerTr);
      table.appendChild(thead);

      // Création du corps
      const tbody = document.createElement("tbody");
      const rows = contentRows
        .trim()
        .split("\n")
        .filter((row) => row.trim());

      rows.forEach((rowText) => {
        const tr = document.createElement("tr");
        // Extraire les cellules (ignorer les pipes de début/fin vides)
        const cells = rowText.split("|").slice(1, -1);

        cells.forEach((cellText) => {
          const td = document.createElement("td");
          td.className =
            "px-4 py-3 border-b border-gray-200 dark:border-gray-700";
          td.textContent = cellText.trim();
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tables.push(table);
    }

    console.log(`📊 ${tables.length} table(s) créée(s) à partir du markdown`);
    return tables;
  }

  /**
   * Trouve le conteneur cible où insérer les tables Flowise (la div contenant la table déclencheuse).
   * @param {HTMLElement} triggerTable - La table qui a déclenché le processus.
   * @returns {HTMLElement|null} Le conteneur où insérer les tables.
   */
  function findTargetContainer(triggerTable) {
    // Trouver la div prose qui contient la table déclencheuse
    const targetDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (targetDiv) {
      console.log("🎯 Conteneur cible trouvé (div prose)");
      return targetDiv;
    }

    console.warn("⚠️ Impossible de trouver le conteneur cible");
    return null;
  }

  /**
   * Intègre UNIQUEMENT les tables Flowise dans le DOM sans mise en forme supplémentaire.
   * @param {HTMLElement[]} flowiseTables - Les tables à insérer.
   * @param {HTMLElement} targetContainer - Le conteneur où insérer les tables.
   */
  function integrateTablesOnly(flowiseTables, targetContainer) {
    if (!flowiseTables.length || !targetContainer) {
      console.warn("⚠️ Aucune table à intégrer ou conteneur invalide");
      return;
    }

    console.log(`🔧 Intégration de ${flowiseTables.length} table(s) pure(s)`);

    // Insérer directement chaque table dans le conteneur cible
    flowiseTables.forEach((table, index) => {
      console.log(`📋 Intégration de la table ${index + 1}`);

      // Créer UNIQUEMENT un conteneur overflow pour la table (standard Claraverse)
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "overflow-x-auto my-4";

      // Cloner la table pour éviter les problèmes de référence
      const clonedTable = table.cloneNode(true);
      tableWrapper.appendChild(clonedTable);

      // Insérer directement dans le conteneur cible
      targetContainer.appendChild(tableWrapper);
    });

    console.log(`✅ ${flowiseTables.length} table(s) intégrée(s) sans mise en forme supplémentaire`);
  }

  /**
   * Orchestre le processus complet pour une table "Flowise" détectée.
   * @param {HTMLElement} triggerTable - La table qui a déclenché le processus.
   */
  async function processFlowiseTrigger(triggerTable) {
    const parentDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (!parentDiv || parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
      return; // Déjà traité ou parent non trouvé
    }

    const targetKeyword = detectTargetKeyword(triggerTable);
    if (!targetKeyword) {
      console.log("ℹ️ Table Flowise sans mot-clé cible, ignorée.");
      return;
    }

    // Marquer comme traité pour éviter les répétitions
    parentDiv.classList.add(CONFIG.PROCESSED_CLASS);

    try {
      // 1. Collecter les tables
      const criteriaTablesHTML = collectCriteriaTables(targetKeyword);
      if (!criteriaTablesHTML) {
        throw new Error(
          `Aucune table de critère trouvée pour le mot-clé : "${targetKeyword}"`
        );
      }

      const tableCount = (criteriaTablesHTML.match(/<table/g) || []).length;
      console.log(
        `📋 ${tableCount} table(s) collectée(s) pour le mot-clé "${targetKeyword}"`
      );

      // 2. Envoyer à l'endpoint Flowise
      const response = await queryFlowiseEndpoint(criteriaTablesHTML);
      if (!response || !response.text) {
        throw new Error("Réponse de Flowise invalide ou vide");
      }

      console.log(
        "📥 Réponse Flowise reçue:",
        response.text.substring(0, 200) + "..."
      );

      // 3. Extraire UNIQUEMENT les tables de la réponse
      const flowiseTables = extractTablesFromResponse(response.text);
      if (!flowiseTables.length) {
        throw new Error("Aucune table trouvée dans la réponse Flowise");
      }

      // 4. Trouver le conteneur cible
      const targetContainer = findTargetContainer(triggerTable);
      if (!targetContainer) {
        throw new Error(
          "Impossible de trouver le conteneur cible"
        );
      }

      // 5. Intégrer UNIQUEMENT les tables dans le DOM
      integrateTablesOnly(flowiseTables, targetContainer);

      console.log(`🎉 Traitement complet réussi pour "${targetKeyword}" - Tables intégrées sans mise en forme`);
    } catch (error) {
      console.error(
        `❌ Erreur lors du traitement pour "${targetKeyword}":`,
        error
      );

      // Afficher un message d'erreur simple dans l'interface
      const errorMessage = document.createElement("div");
      errorMessage.className = "my-4 p-2 text-red-600 dark:text-red-400 text-sm";
      errorMessage.textContent = `❌ Erreur Flowise: ${error.message}`;

      const targetContainer = findTargetContainer(triggerTable);
      if (targetContainer) {
        targetContainer.appendChild(errorMessage);
      }
    }
  }

  /**
   * Scanne le document à la recherche de tables "Flowise" non traitées.
   */
  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    let processedCount = 0;

    allTables.forEach((table) => {
      // Vérifier si la table parent n'est pas déjà traitée
      const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
      if (parentDiv && parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
        return; // Skip déjà traité
      }

      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );
      if (headers.includes("flowise")) {
        processFlowiseTrigger(table);
        processedCount++;
      }
    });

    if (processedCount > 0) {
      console.log(
        `🔍 Scanner: ${processedCount} nouvelles tables Flowise détectées`
      );
    }
  }

  // --- OBSERVATEUR DE MUTATIONS DOM ---
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Vérifier si une table a été ajoutée
            if (node.matches && node.matches(CONFIG.SELECTORS.CHAT_TABLES)) {
              shouldScan = true;
            } else if (node.querySelector) {
              const tables = node.querySelectorAll(
                CONFIG.SELECTORS.CHAT_TABLES
              );
              if (tables.length > 0) {
                shouldScan = true;
              }
            }
          }
        });
      }
    });

    if (shouldScan) {
      console.log("🔄 Nouvelles tables détectées, analyse en cours...");
      // Délai pour s'assurer que le DOM est stable
      setTimeout(scanAndProcess, 150);
    }
  });

  /**
   * Initialise le script, lance le scan initial et démarre l'observateur.
   */
  function initialize() {
    console.log("🔧 Initialisation du script V13.1...");

    // Scan initial au cas où des tables sont déjà présentes au chargement
    setTimeout(scanAndProcess, 800);

    // Démarrage de l'observation des changements dans le corps du document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log(
      "✅ Script V13.1 initialisé - Tables sans mise en forme supplémentaire"
    );
  }

  // Lancement de l'initialisation une fois le DOM prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // API de débogage
  window.ClaraverseFlowiseV13_3 = {
    scanAndProcess,
    CONFIG,
    extractTablesFromResponse,
    integrateTablesOnly,
    forceTableFormatting,
    createFormattedTable,
    version: "13.3.0 - Formatage CSS forcé avec styles inline",
  };
})();