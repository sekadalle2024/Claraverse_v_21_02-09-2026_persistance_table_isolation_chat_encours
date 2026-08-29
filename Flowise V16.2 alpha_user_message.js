/**
 * Script dynamique pour les tables de critères dans Claraverse - V17.0 (Détection dynamique des mots-clés)
 * @version 17.0.0
 * @description
 * - NOUVEAU V17: Détecte dynamiquement le mot-clé depuis la table "Flowise" elle-même
 * - Plus besoin de SEARCH_KEYWORDS statiques - le mot-clé est extrait de la première ligne de la colonne "Flowise"
 * - Collecte toutes les tables des divs correspondantes basées sur ce mot-clé dynamique
 * - Capture le message utilisateur précédent la table déclencheuse et l'inclut dans l'envoi
 * - Envoie les données HTML consolidées (critères + déclencheur + message utilisateur) à l'endpoint n8n
 * - Intègre les tables avec espacement correct et URLs fonctionnelles
 * - Traitement spécifique du markdown retourné par n8n
 * - Évite les doublons avec un système de marquage robuste
 * - Système de cache intelligent avec localStorage
 */
(function () {
  "use strict";

  console.log(
    "🚀 Initialisation du script dynamique de tables V17.0 (Détection dynamique des mots-clés)"
  );

  // --- CONFIGURATION CENTRALE ---
  const CONFIG = {
    N8N_ENDPOINT_URL: "https://0ngdph0y.rpcld.co/webhook/template",
    SELECTORS: {
      CHAT_TABLES:
        "table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
      PARENT_DIV: "div.prose.prose-base.dark\\:prose-invert.max-w-none",
      OVERFLOW_CONTAINER: "div.overflow-x-auto.my-4",
    },
    PROCESSED_CLASS: "n8n-processed",
    PERSISTENCE: {
      STORAGE_KEY: "claraverse_n8n_data_v17",
      CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures
      MAX_CACHE_SIZE: 50,
    },
  };

  /**
   * Extrait dynamiquement le mot-clé de la table déclencheuse "Flowise"
   * @param {HTMLElement} flowiseTable - La table avec l'en-tête "Flowise"
   * @returns {string|null} Le mot-clé extrait ou null
   */
  function extractDynamicKeyword(flowiseTable) {
    console.log("🔍 Extraction du mot-clé dynamique depuis la table Flowise...");
    
    try {
      const headers = Array.from(flowiseTable.querySelectorAll("th")).map((th) => 
        th.textContent.trim().toLowerCase()
      );
      
      const flowiseColumnIndex = headers.findIndex(h => 
        h === "flowise" || h === "FLOWISE" || h.toLowerCase() === "flowise"
      );
      
      if (flowiseColumnIndex === -1) {
        console.warn("⚠️ Colonne 'Flowise' non trouvée dans la table");
        return null;
      }
      
      const firstDataRow = flowiseTable.querySelector("tbody tr");
      if (!firstDataRow) {
        console.warn("⚠️ Aucune ligne de données dans la table Flowise");
        return null;
      }
      
      const cells = firstDataRow.querySelectorAll("td");
      if (flowiseColumnIndex >= cells.length) {
        console.warn("⚠️ Index de colonne invalide");
        return null;
      }
      
      const keyword = cells[flowiseColumnIndex].textContent.trim();
      
      if (!keyword) {
        console.warn("⚠️ Mot-clé vide dans la colonne Flowise");
        return null;
      }
      
      console.log(`✅ Mot-clé dynamique extrait: "${keyword}"`);
      return keyword;
      
    } catch (error) {
      console.error("❌ Erreur lors de l'extraction du mot-clé:", error);
      return null;
    }
  }

  /**
   * Génère des variations du mot-clé pour une recherche flexible
   * @param {string} keyword - Le mot-clé de base
   * @returns {Array<string>} Tableau de variations
   */
  function generateKeywordVariations(keyword) {
    if (!keyword) return [];
    
    const variations = new Set();
    const normalized = keyword.trim();
    
    variations.add(normalized);
    variations.add(normalized.toLowerCase());
    variations.add(normalized.toUpperCase());
    variations.add(normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase());
    
    const words = normalized.split(/\s+/);
    if (words.length > 1) {
      words.forEach(word => {
        variations.add(word);
        variations.add(word.toLowerCase());
        variations.add(word.toUpperCase());
      });
    }
    
    console.log(`🔄 Variations générées pour "${keyword}":`, Array.from(variations));
    return Array.from(variations);
  }

  /**
   * Trouve le message utilisateur précédant la table déclencheuse
   * @param {HTMLElement} triggerTable - La table qui a déclenché le processus
   * @returns {string|null} Le contenu textuel du message ou null
   */
  function findAndExtractUserMessage(triggerTable) {
    console.log("🔎 Recherche du message utilisateur précédant la table déclencheuse...");
    
    const messageKeywords = ["/", "[command]", "[processus]", "modele", "directive", "etape", "[", "]", "="];

    try {
      const triggerContainer = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
      if (!triggerContainer) {
        console.warn("⚠️ Conteneur de la table déclencheuse non trouvé.");
        return null;
      }

      const allProseDivs = Array.from(document.querySelectorAll(CONFIG.SELECTORS.PARENT_DIV));
      const triggerDivIndex = allProseDivs.findIndex(div => div === triggerContainer);

      if (triggerDivIndex > 0) {
        const precedingDiv = allProseDivs[triggerDivIndex - 1];
        const messageContent = precedingDiv.textContent.trim();
        const messageContentLower = messageContent.toLowerCase();

        const hasKeywords = messageKeywords.some(kw => messageContentLower.includes(kw));

        if (hasKeywords) {
          console.log("✅ Message utilisateur trouvé et validé:", messageContent);
          return messageContent;
        } else {
          console.log("ℹ️ Le div précédent ne semble pas contenir un message utilisateur attendu");
        }
      } else {
        console.log("ℹ️ Aucune div 'prose' ne précède la table déclencheuse");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la recherche du message utilisateur:", error);
    }

    return null;
  }

  /**
   * Crée une table HTML pour le message utilisateur
   * @param {string} messageContent - Le contenu du message utilisateur
   * @returns {string} La chaîne HTML de la table créée
   */
  function createUserMessageTableHTML(messageContent) {
    const table = document.createElement("table");
    table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
    table.style.marginBottom = "1.5rem";

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const th = document.createElement("th");
    th.textContent = "user_message";
    th.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold";
    headerRow.appendChild(th);

    const tbody = table.createTBody();
    const bodyRow = tbody.insertRow();
    const td = bodyRow.insertCell();
    td.textContent = messageContent;
    td.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm";
    td.style.whiteSpace = "pre-wrap";

    console.log("✅ Table 'user_message' créée dynamiquement");
    return table.outerHTML;
  }

  /**
   * Collecte les tables de critères basées sur le mot-clé dynamique
   * @param {string} dynamicKeyword - Le mot-clé extrait dynamiquement
   * @param {HTMLElement} triggerTable - La table déclencheuse
   * @param {string} userMessageTableHTML - HTML de la table du message utilisateur
   * @returns {string} HTML consolidé de toutes les tables
   */
  function collectCriteriaTables(dynamicKeyword, triggerTable = null, userMessageTableHTML = '') {
    const allDivs = document.querySelectorAll(CONFIG.SELECTORS.PARENT_DIV);
    const collectedTablesHTML = [];
    const keywordVariations = generateKeywordVariations(dynamicKeyword);
    
    console.log(`🔍 Recherche de divs contenant le mot-clé "${dynamicKeyword}"...`);
    
    allDivs.forEach((div) => {
      const firstTable = div.querySelector(CONFIG.SELECTORS.CHAT_TABLES);
      if (!firstTable) return;

      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) => 
        th.textContent.trim().toLowerCase()
      );
      
      const hasRequiredHeaders = headers.includes("rubrique") && headers.includes("description");
      if (!hasRequiredHeaders) return;

      const cellsOfFirstTable = firstTable.querySelectorAll("td");
      const keywordFound = Array.from(cellsOfFirstTable).some((cell) => {
        const cellText = cell.textContent.trim();
        return keywordVariations.some((variation) => 
          cellText.toLowerCase().includes(variation.toLowerCase())
        );
      });

      if (keywordFound) {
        console.log(`✅ Div correspondante trouvée pour le mot-clé "${dynamicKeyword}". Collecte des tables...`);
        const allTablesInDiv = div.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
        allTablesInDiv.forEach((table) => {
          collectedTablesHTML.push(table.outerHTML);
        });
      }
    });

    if (triggerTable) {
      console.log(`📋 Ajout de la table déclencheuse pour le mot-clé "${dynamicKeyword}"`);
      collectedTablesHTML.push(triggerTable.outerHTML);
    }

    if (userMessageTableHTML) {
      console.log("📋 Ajout de la table 'user_message' à la collecte");
      collectedTablesHTML.push(userMessageTableHTML);
    }

    const finalHTML = collectedTablesHTML.join("\n");
    const totalTableCount = (finalHTML.match(/<table/g) || []).length;
    console.log(`📊 Collecte terminée: ${totalTableCount} table(s) au total`);
    
    return finalHTML;
  }

  function generateCacheKey(tablesHTML) {
    let hash = 0;
    for (let i = 0; i < tablesHTML.length; i++) {
      const char = tablesHTML.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `n8n_${Math.abs(hash)}`;
  }

  async function queryN8nEndpoint(tablesHTML, targetKeyword) {
    try {
      const cacheKey = generateCacheKey(tablesHTML);
      const cachedData = loadFromCache(cacheKey);
      
      if (cachedData) {
        console.log(`📦 Utilisation des données en cache pour "${targetKeyword}"`);
        return cachedData.data;
      }

      console.log("📡 Envoi des données vers n8n...");
      const response = await fetch(CONFIG.N8N_ENDPOINT_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ question: tablesHTML }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Données reçues de l'endpoint n8n ! Statut: ${response.status} OK`);
      const responseData = await response.json();
      
      saveToCache(cacheKey, responseData, targetKeyword);
      
      return responseData;
    } catch (error) {
      console.error("❌ Erreur lors de l'appel à l'API n8n:", error);
      throw error;
    }
  }

  function saveToCache(cacheKey, data, targetKeyword) {
    try {
      const storageData = JSON.parse(localStorage.getItem(CONFIG.PERSISTENCE.STORAGE_KEY) || '{}');
      
      const entries = Object.keys(storageData);
      if (entries.length >= CONFIG.PERSISTENCE.MAX_CACHE_SIZE) {
        entries
          .sort((a, b) => (storageData[a].timestamp || 0) - (storageData[b].timestamp || 0))
          .slice(0, entries.length - CONFIG.PERSISTENCE.MAX_CACHE_SIZE + 1)
          .forEach(key => delete storageData[key]);
      }

      storageData[cacheKey] = {
        data: data,
        timestamp: Date.now(),
        targetKeyword: targetKeyword,
        url: window.location.href
      };

      localStorage.setItem(CONFIG.PERSISTENCE.STORAGE_KEY, JSON.stringify(storageData));
      console.log(`💾 Données sauvegardées en cache pour "${targetKeyword}"`);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde en cache:', error);
    }
  }

  function loadFromCache(cacheKey) {
    try {
      const storageData = JSON.parse(localStorage.getItem(CONFIG.PERSISTENCE.STORAGE_KEY) || '{}');
      const entry = storageData[cacheKey];
      
      if (!entry) return null;

      const isExpired = (Date.now() - entry.timestamp) > CONFIG.PERSISTENCE.CACHE_DURATION;
      
      if (isExpired) {
        delete storageData[cacheKey];
        localStorage.setItem(CONFIG.PERSISTENCE.STORAGE_KEY, JSON.stringify(storageData));
        console.log(`🗑️ Données expirées supprimées pour la clé: ${cacheKey}`);
        return null;
      }

      console.log(`📦 Données récupérées du cache pour la clé: ${cacheKey}`);
      return entry;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération depuis le cache:', error);
      return null;
    }
  }

  function extractTablesFromResponse(responseText) {
    const tables = [];
    console.log("🔍 Analyse de la réponse n8n:");
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = responseText;
    const existingTables = tempDiv.querySelectorAll("table");
    
    if (existingTables.length > 0) {
      console.log(`📋 ${existingTables.length} table(s) HTML trouvée(s) dans la réponse`);
      existingTables.forEach((table) => {
        table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
        table.style.cssText = "margin-bottom: 1.5rem; border-collapse: separate; border-spacing: 0;";
        cleanEmptyRows(table);
        enhanceTableUrls(table);
        tables.push(table.cloneNode(true));
      });
      return tables;
    }

    console.log("📄 Conversion du markdown en tables HTML...");
    
    const regexPatterns = [
      /\|[^\n]*\|(?:\n\|[^\n]*\|)*/gm,
      /^\s*\|(.+)\|\s*\n\s*\|(\s*:?-+:?\s*\|)+\s*\n([\s\S]*?)(?=\n\s*\n|\n\s*[^|]|$)/gm,
    ];

    for (const regex of regexPatterns) {
      let match;
      regex.lastIndex = 0;
      
      while ((match = regex.exec(responseText)) !== null) {
        const tableContent = match[0].trim();
        const lines = tableContent.split('\n').map(line => line.trim()).filter(line => line.includes('|'));
        
        if (lines.length < 2) continue;

        const headerRow = lines[0];
        const dataRows = lines.slice(1).filter(line => !/^\|[\s:|-]+\|$/.test(line.trim()));

        if (!headerRow || dataRows.length === 0) continue;

        const table = createTableFromMarkdown(headerRow, dataRows);
        if (table) tables.push(table);
      }
      
      if (tables.length > 0) break;
    }

    if (tables.length === 0) console.error("❌ Aucune table détectée");
    return tables;
  }

  function createTableFromMarkdown(headerRow, dataRows) {
    const table = document.createElement("table");
    table.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
    table.style.cssText = "margin-bottom: 1.5rem; border-collapse: separate; border-spacing: 0;";

    const thead = document.createElement("thead");
    const headerTr = document.createElement("tr");
    
    let cleanHeaderCells = headerRow.split("|").filter(cell => cell.trim() !== '');
    
    cleanHeaderCells.forEach((cellText, index) => {
      const th = document.createElement("th");
      th.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold";
      th.textContent = cellText.trim() || `Colonne ${index + 1}`;
      headerTr.appendChild(th);
    });
    
    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    
    dataRows.forEach((rowText, rowIndex) => {
      const tr = document.createElement("tr");
      tr.className = rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800";
      
      let cells = rowText.split("|").filter(cell => cell.trim() !== '');
      
      cells.forEach((cellText) => {
        const td = document.createElement("td");
        td.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm";
        td.style.cssText = "overflow-wrap: break-word; white-space: pre-wrap;";
        
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
          td.textContent = trimmedText || "-";
        }
        
        tr.appendChild(td);
      });
      
      if (tr.children.length > 0) tbody.appendChild(tr);
    });

    if (tbody.children.length > 0) {
      table.appendChild(tbody);
      return table;
    }
    
    return null;
  }

  function findTargetContainer(triggerTable) {
    const targetDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (targetDiv) {
      console.log("🎯 Conteneur cible trouvé (div prose)");
      return targetDiv;
    }
    console.warn("⚠️ Impossible de trouver le conteneur cible");
    return null;
  }

  function integrateTablesOnly(n8nTables, targetContainer, targetKeyword) {
    if (!n8nTables.length || !targetContainer) {
      console.warn("⚠️ Aucune table à intégrer ou conteneur invalide");
      return;
    }

    console.log(`🔧 Intégration de ${n8nTables.length} table(s)`);

    n8nTables.forEach((table, index) => {
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "overflow-x-auto my-4";
      tableWrapper.style.cssText = "margin-top: 1rem; margin-bottom: 1rem;";
      tableWrapper.setAttribute('data-n8n-table', 'true');
      tableWrapper.setAttribute('data-n8n-keyword', targetKeyword);

      const clonedTable = table.cloneNode(true);
      cleanEmptyRows(clonedTable);
      enhanceTableUrls(clonedTable);
      
      tableWrapper.appendChild(clonedTable);
      targetContainer.appendChild(tableWrapper);
    });

    console.log(`✅ ${n8nTables.length} table(s) intégrée(s)`);
  }

  async function processN8nTrigger(triggerTable) {
    const parentDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (!parentDiv || parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
      return;
    }

    const dynamicKeyword = extractDynamicKeyword(triggerTable);
    if (!dynamicKeyword) {
      console.log("ℹ️ Table Flowise sans mot-clé valide, ignorée");
      return;
    }

    parentDiv.classList.add(CONFIG.PROCESSED_CLASS);

    try {
      const userMessageContent = findAndExtractUserMessage(triggerTable);
      let userMessageTableHTML = "";
      
      if (userMessageContent) {
        userMessageTableHTML = createUserMessageTableHTML(userMessageContent);
      }

      const criteriaTablesHTML = collectCriteriaTables(dynamicKeyword, triggerTable, userMessageTableHTML);
      
      if (!criteriaTablesHTML) {
        throw new Error(`Aucune table de critère trouvée pour le mot-clé : "${dynamicKeyword}"`);
      }

      const response = await queryN8nEndpoint(criteriaTablesHTML, dynamicKeyword);
      
      if (!response || !response.output) {
        throw new Error("Réponse de n8n invalide ou vide");
      }

      console.log("📥 Réponse n8n reçue:", response.output.substring(0, 200) + "...");

      const n8nTables = extractTablesFromResponse(response.output);
      
      if (!n8nTables.length) {
        throw new Error("Aucune table trouvée dans la réponse n8n");
      }

      const targetContainer = findTargetContainer(triggerTable);
      
      if (!targetContainer) {
        throw new Error("Impossible de trouver le conteneur cible");
      }

      integrateTablesOnly(n8nTables, targetContainer, dynamicKeyword);
      removeTriggerTable(triggerTable, dynamicKeyword);

      console.log(`🎉 Traitement complet réussi pour "${dynamicKeyword}"`);
      
    } catch (error) {
      console.error(`❌ Erreur lors du traitement pour le mot-clé dynamique:`, error);
      
      const errorMessage = document.createElement("div");
      errorMessage.className = "my-4 p-2 text-red-600 dark:text-red-400 text-sm";
      errorMessage.textContent = `❌ Erreur n8n: ${error.message}`;
      
      const targetContainer = findTargetContainer(triggerTable);
      if (targetContainer) {
        targetContainer.appendChild(errorMessage);
      }
    }
  }

  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    let processedCount = 0;

    allTables.forEach((table) => {
      const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
      if (parentDiv && parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
        return;
      }

      const headers = Array.from(table.querySelectorAll("th")).map((th) => 
        th.textContent.trim().toLowerCase()
      );
      
      if (headers.includes("flowise")) {
        processN8nTrigger(table);
        processedCount++;
      }
    });

    if (processedCount > 0) {
      console.log(`🔎 Scanner: ${processedCount} nouvelles tables Flowise détectées`);
    }
  }

  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
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
      console.log("🔄 Nouvelles tables détectées, analyse en cours...");
      setTimeout(scanAndProcess, 150);
    }
  });

  function initialize() {
    console.log("🔧 Initialisation du script V17.0...");
    
    setTimeout(scanAndProcess, 800);
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log("✅ Script V17.0 initialisé - Détection dynamique des mots-clés activée");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  function removeTriggerTable(triggerTable, targetKeyword) {
    try {
      const tableWrapper = triggerTable.closest('div.overflow-x-auto');
      if (tableWrapper) {
        console.log(`🗑️ Suppression de la table déclencheuse pour "${targetKeyword}"`);
        tableWrapper.style.transition = 'opacity 0.3s ease-out';
        tableWrapper.style.opacity = '0';
        setTimeout(() => {
          if (tableWrapper.parentNode) {
            tableWrapper.parentNode.removeChild(tableWrapper);
          }
        }, 300);
      } else if (triggerTable.parentNode) {
        triggerTable.parentNode.removeChild(triggerTable);
      }
    } catch (error) {
      console.error(`⚠️ Erreur lors de la suppression de la table:`, error);
    }
  }
  
  function cleanEmptyRows(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const isEmpty = Array.from(cells).every(cell => {
        const text = cell.textContent.trim();
        return text === '' || text === '---';
      });
      if (isEmpty && cells.length > 0) {
        row.remove();
      }
    });
  }
  
  function isUrl(text) {
    try {
      new URL(text);
      return true;
    } catch {
      return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
    }
  }
  
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

  window.ClaraverseN8nV17 = {
    scanAndProcess,
    CONFIG,
    extractDynamicKeyword,
    generateKeywordVariations,
    extractTablesFromResponse,
    integrateTablesOnly,
    clearAllCache: () => {
      localStorage.removeItem(CONFIG.PERSISTENCE.STORAGE_KEY);
      console.log('🗑️ Cache complet supprimé');
    },
    getCacheInfo: () => {
      const data = JSON.parse(localStorage.getItem(CONFIG.PERSISTENCE.STORAGE_KEY) || '{}');
      console.log('📊 Informations du cache:', {
        entries: Object.keys(data).length,
        size: JSON.stringify(data).length + ' caractères',
        data: data
      });
      return data;
    },
    version: "17.0.0 - Détection dynamique des mots-clés depuis la table Flowise",
  };
})();