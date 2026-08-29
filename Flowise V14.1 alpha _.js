/**
 * Script dynamique pour les tables de critères dans Claraverse - V14.1 (Affichage CSS corrigé)
 * @version 14.1.0
 * @description
 * - Détecte dynamiquement un mot-clé dans une table "Flowise".
 * - Collecte toutes les tables des divs correspondantes basées sur ce mot-clé.
 * - Envoie les données HTML consolidées à l'endpoint Flowise.
 * - Intègre les tables avec espacement correct et URLs fonctionnelles.
 * - Supprime les lignes vides et améliore le formatage CSS.
 * - Traitement spécifique du markdown retourné par Flowise.
 * - Évite les doublons avec un système de marquage robuste.
 * - Correction des problèmes d'affichage CSS et d'espacement des tables.
 */
(function () {
  "use strict";

  console.log(
    "🚀 Initialisation du script dynamique de tables V14.1 (CSS corrigé)"
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
    
    console.log("🔍 Analyse de la réponse Flowise:");
    console.log("Longueur:", responseText.length);
    console.log("Contenu (200 premiers caractères):", responseText.substring(0, 200));
    console.log("Contient des pipes |:", responseText.includes('|'));
    console.log("Contient <table>:", responseText.includes('<table>'));

    // Méthode 1: Extraction directe de tables HTML existantes
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    const existingTables = tempDiv.querySelectorAll("table");

    if (existingTables.length > 0) {
      console.log(
        `📋 ${existingTables.length} table(s) HTML trouvée(s) dans la réponse`
      );
      existingTables.forEach((table) => {
        // Appliquer le style Claraverse avec CSS amélioré
        table.className =
          "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
        table.style.cssText = "margin-bottom: 1.5rem; border-collapse: separate; border-spacing: 0;";
        
        // Nettoyer les lignes vides
        cleanEmptyRows(table);
        // Améliorer les URLs dans les cellules
        enhanceTableUrls(table);
        
        tables.push(table.cloneNode(true));
      });
      return tables;
    }

    // Méthode 2: Conversion du markdown en HTML
    console.log("📄 Conversion du markdown en tables HTML...");
    
    // Essayer plusieurs regex pour capturer les tables markdown
    const regexPatterns = [
      // Pattern original amélioré
      /^\s*\|(.+)\|\s*\n\s*\|(\s*:?-+:?\s*\|)+\s*\n([\s\S]*?)(?=\n\s*\n|\n\s*[^|]|$)/gm,
      // Pattern plus simple
      /\|[^\n]*\|[\s\S]*?(?=\n\s*\n|\n\s*[^|\s]|$)/gm,
      // Pattern très permissif
      /\|.*\|[\s\S]*?(?=\n\n|$)/gm
    ];
    
    for (let i = 0; i < regexPatterns.length; i++) {
      const regex = regexPatterns[i];
      console.log(`🔍 Essai du pattern ${i + 1}:`, regex.source);
      
      let match;
      let matchCount = 0;
      
      // Reset regex
      regex.lastIndex = 0;

      while ((match = regex.exec(responseText)) !== null) {
        matchCount++;
        console.log(`Match ${matchCount}:`, match[0].substring(0, 100) + "...");
        
        let tableContent, headerRow, dataRows;
        
        if (i === 0) {
          // Pattern original avec groupes de capture
          headerRow = match[1];
          const contentRows = match[3] || "";
          dataRows = contentRows.trim().split("\n")
            .map(line => line.trim())
            .filter(line => line.includes('|') && !isEmptyRow(line));
        } else {
          // Patterns simples sans groupes de capture
          tableContent = match[0].trim();
          const lines = tableContent.split('\n').map(line => line.trim()).filter(line => line.includes('|'));
          
          if (lines.length < 2) continue;
          
          headerRow = lines[0];
          dataRows = lines.slice(1).filter(line => {
            const trimmed = line.trim();
            return !(/^\|[\s:|-]+\|$/.test(trimmed));
          });
        }
        
        console.log("🔍 Table détectée:");
        console.log("En-tête:", headerRow);
        console.log("Lignes de données:", dataRows);

        if (!headerRow || !dataRows || dataRows.length === 0) {
          console.warn("⚠️ Table ignorée: en-tête ou données manquantes");
          continue;
        }

        const table = document.createElement("table");
        table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
        table.style.cssText = "margin-bottom: 1.5rem; border-collapse: separate; border-spacing: 0;";

        // Création de l'en-tête
        const thead = document.createElement("thead");
        const headerTr = document.createElement("tr");

        headerRow.split("|").forEach((cellText, index) => {
          const trimmed = cellText.trim();
          const th = document.createElement("th");
          th.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold";
          th.style.cssText = "max-width: 200px; overflow-wrap: break-word;";
          th.textContent = trimmed || "";
          headerTr.appendChild(th);
        });

        thead.appendChild(headerTr);
        table.appendChild(thead);

        // Création du corps
        const tbody = document.createElement("tbody");
        console.log("📋 Traitement des lignes de données:", dataRows.length, dataRows);

        dataRows.forEach((rowText, rowIndex) => {
          const tr = document.createElement("tr");
          tr.className = rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800";
          
          let cells = rowText.split("|");
          if (cells[0].trim() === '') cells = cells.slice(1);
          if (cells[cells.length - 1].trim() === '') cells = cells.slice(0, -1);
          
          console.log("🔧 Cellules extraites:", rowText, "=>", cells);

          cells.forEach((cellText, cellIndex) => {
            const td = document.createElement("td");
            td.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm word-wrap break-words";
            td.style.cssText = "max-width: 200px; overflow-wrap: break-word;";
            
            const trimmedText = cellText.trim();
            
            if (trimmedText && isUrl(trimmedText)) {
              const link = document.createElement("a");
              link.href = trimmedText;
              link.textContent = trimmedText;
              link.className = "text-blue-600 dark:text-blue-400 hover:underline break-all";
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              td.appendChild(link);
            } else {
              td.textContent = trimmedText || "";
            }
            
            tr.appendChild(td);
          });

          if (tr.children.length > 0) {
            tbody.appendChild(tr);
          }
        });

        if (tbody.children.length > 0) {
          table.appendChild(tbody);
          tables.push(table);
          console.log(`✅ Table créée avec ${tbody.children.length} lignes`);
        }
      }
      
      if (matchCount > 0) {
        console.log(`📊 Pattern ${i + 1} a trouvé ${matchCount} match(es)`);
        break; // Sortir de la boucle si on a trouvé des matches
      }
    }

    console.log(`📊 Résultat final: ${tables.length} table(s) créée(s)`);
    
    if (tables.length === 0) {
      console.error("❌ Aucune table détectée. Contenu de la réponse:");
      console.error(responseText);
    }
    
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
   * Intègre les tables Flowise dans le DOM avec un formatage CSS correct.
   * @param {HTMLElement[]} flowiseTables - Les tables à insérer.
   * @param {HTMLElement} targetContainer - Le conteneur où insérer les tables.
   */
  function integrateTablesOnly(flowiseTables, targetContainer) {
    if (!flowiseTables.length || !targetContainer) {
      console.warn("⚠️ Aucune table à intégrer ou conteneur invalide");
      return;
    }

    console.log(`🔧 Intégration de ${flowiseTables.length} table(s) avec CSS corrigé`);

    // Insérer chaque table avec un espacement approprié
    flowiseTables.forEach((table, index) => {
      console.log(`📋 Intégration de la table ${index + 1}`);

      // Créer un conteneur simple sans encadré visible
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "overflow-x-auto my-4";
      tableWrapper.style.cssText = "margin-top: 1rem; margin-bottom: 1rem;";

      // Cloner et améliorer la table
      const clonedTable = table.cloneNode(true);
      
      // Appliquer les styles CSS sans bordures supplémentaires
      clonedTable.style.cssText += "width: 100%; border-collapse: separate; border-spacing: 0; table-layout: auto;";
      
      // Nettoyer et améliorer le contenu de la table
      cleanEmptyRows(clonedTable);
      enhanceTableUrls(clonedTable);
      
      tableWrapper.appendChild(clonedTable);

      // Insérer dans le conteneur cible
      targetContainer.appendChild(tableWrapper);
    });

    console.log(`✅ ${flowiseTables.length} table(s) intégrée(s) avec CSS corrigé`);
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

      // 3. Extraire les tables de la réponse
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

      // 5. Intégrer les tables dans le DOM
      integrateTablesOnly(flowiseTables, targetContainer);

      console.log(`🎉 Traitement complet réussi pour "${targetKeyword}" - Tables intégrées avec CSS corrigé`);
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
    console.log("🔧 Initialisation du script V14.1...");

    // Scan initial au cas où des tables sont déjà présentes au chargement
    setTimeout(scanAndProcess, 800);

    // Démarrage de l'observation des changements dans le corps du document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log(
      "✅ Script V14.1 initialisé - CSS et affichage des tables corrigés"
    );
  }

  // Lancement de l'initialisation une fois le DOM prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Fonctions utilitaires pour le nettoyage et l'amélioration des tables
  
  /**
   * Nettoie les lignes vides d'une table
   * @param {HTMLElement} table - L'élément table à nettoyer
   */
  function cleanEmptyRows(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const isEmpty = Array.from(cells).every(cell => {
        const text = cell.textContent.trim();
        return text === '' || text === '---';
      });
      
      // Ne supprimer que si toutes les cellules sont vraiment vides
      if (isEmpty && cells.length > 0) {
        row.remove();
      }
    });
  }
  
  /**
   * Vérifie si une ligne est vide ou ne contient que des caractères de remplissage
   * @param {string} rowText - Le texte de la ligne
   * @returns {boolean} True si la ligne est vide
   */
  function isEmptyRow(rowText) {
    if (!rowText || !rowText.includes('|')) return true;
    
    let cells = rowText.split('|');
    // Nettoyer les cellules vides au début et à la fin
    if (cells[0].trim() === '') cells = cells.slice(1);
    if (cells[cells.length - 1].trim() === '') cells = cells.slice(0, -1);
    
    // Une ligne est vide seulement si TOUTES les cellules sont vides ou contiennent uniquement ---
    const isEmpty = cells.every(cell => {
      const trimmed = cell.trim();
      return trimmed === '' || trimmed === '---' || trimmed === ':---:' || trimmed === ':---' || trimmed === '---:';
    });
    
    console.log("🔍 isEmptyRow pour:", rowText, "=> cellules:", cells, "=> vide:", isEmpty);
    return isEmpty;
  }
  
  /**
   * Vérifie si un texte est une URL
   * @param {string} text - Le texte à vérifier
   * @returns {boolean} True si c'est une URL
   */
  function isUrl(text) {
    try {
      new URL(text);
      return true;
    } catch {
      return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
    }
  }
  
  /**
   * Améliore l'affichage des URLs dans une table
   * @param {HTMLElement} table - L'élément table à améliorer
   */
  function enhanceTableUrls(table) {
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      const text = cell.textContent.trim();
      if (isUrl(text) && !cell.querySelector('a')) {
        cell.innerHTML = '';
        const link = document.createElement('a');
        link.href = text;
        link.textContent = text;
        link.className = 'text-blue-600 dark:text-blue-400 hover:underline break-all';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        cell.appendChild(link);
      }
    });
  }

  // API de débogage
  window.ClaraverseFlowiseV14_1 = {
    scanAndProcess,
    CONFIG,
    extractTablesFromResponse,
    integrateTablesOnly,
    cleanEmptyRows,
    enhanceTableUrls,
    isUrl,
    version: "14.1.0 - CSS et affichage des tables corrigés",
  };
})();