/**
 * Script dynamique pour les tables de critères dans Claraverse - V17.3 (Table Notification remplace erreur)
 * @version 17.3.0
 * @description
 * - FIX V17.3: Remplacement du div d'erreur rouge par une table "Notification" conviviale
 *   Lorsqu'aucune table de critère n'est trouvée ou que n8n ne retourne pas de tables,
 *   la table Flowise est remplacée par une table à 1 colonne/1 ligne avec l'en-tête
 *   "Notification" et un message d'aide invitant l'utilisateur à vérifier les étapes de mission.
 * - FIX V17.2: Suppression des lignes vides dans les tables de réponse n8n pour les rapports
 *   (Rapport final, Rapport provisoire, Synthèse) détectés dans la colonne Description
 * - FIX V17.1: Gestion correcte de tous les formats de réponse n8n (Array, Object, data, output, tables)
 * - Détecte dynamiquement le mot-clé depuis la table "Flowise" elle-même
 * - Plus besoin de SEARCH_KEYWORDS statiques - le mot-clé est extrait de la première ligne de la colonne "Flowise"
 * - Collecte toutes les tables des divs correspondantes basées sur ce mot-clé dynamique
 * - Capture le message utilisateur précédant la table déclencheuse et l'inclut dans l'envoi
 * - Envoie les données HTML consolidées (critères + déclencheur + message utilisateur) à l'endpoint n8n
 * - Intègre les tables avec espacement correct et URLs fonctionnelles
 * - Traitement spécifique du markdown retourné par n8n
 * - Évite les doublons avec un système de marquage robuste
 * - Système de cache intelligent avec localStorage
 */
(function () {
  "use strict";

  console.log(
    "🚀 Initialisation du script dynamique de tables V17.3 (Table Notification remplace erreur)"
  );

  //http://localhost:5678/webhook/htlm_processor
  // --- CONFIGURATION CENTRALE ---
  const CONFIG = {
    N8N_ENDPOINT_URL: "https://n8nsqlite.zeabur.app/webhook/htlm_processor",
    DEBUG_LOG_HTML: true, // ⭐ Toujours logger le HTML dans la console (systématique)
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
        th.textContent.trim()
      );

      console.log("📋 En-têtes de la table détectés:", headers);

      // Recherche insensible à la casse de la colonne "Flowise"
      const flowiseColumnIndex = headers.findIndex(h =>
        h.toLowerCase() === "flowise"
      );

      if (flowiseColumnIndex === -1) {
        console.warn("⚠️ Colonne 'Flowise' non trouvée dans la table");
        console.warn("📋 En-têtes disponibles:", headers);
        return null;
      }

      console.log(`✅ Colonne 'Flowise' trouvée à l'index ${flowiseColumnIndex}`);

      const firstDataRow = flowiseTable.querySelector("tbody tr");
      if (!firstDataRow) {
        console.warn("⚠️ Aucune ligne de données dans la table Flowise");
        return null;
      }

      const cells = firstDataRow.querySelectorAll("td");
      console.log(`📊 Nombre de cellules dans la première ligne: ${cells.length}`);

      if (flowiseColumnIndex >= cells.length) {
        console.warn(`⚠️ Index de colonne invalide: ${flowiseColumnIndex} >= ${cells.length}`);
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
   * Normalise les différents formats de réponse n8n
   * @param {any} response - La réponse brute de n8n
   * @returns {Object} {output: string, metadata: Object}
   */
  function normalizeN8nResponse(response) {
    console.log("🔍 ========== NORMALISATION RÉPONSE N8N ==========");
    console.log("📦 Type de réponse:", Array.isArray(response) ? "Array" : typeof response);
    console.log("📦 Réponse complète (1000 premiers caractères):", JSON.stringify(response, null, 2).substring(0, 1000));

    // ⭐ NOUVEAU FORMAT: Array avec objet contenant 'response.body[0].output'
    // Format: [{ "response": { "body": [{ "output": "...", "status": "success", ... }], ... } }]
    if (Array.isArray(response) && response.length > 0) {
      console.log("✅ Réponse est un Array avec", response.length, "élément(s)");
      const firstItem = response[0];
      console.log("📦 Premier élément - Type:", typeof firstItem);
      console.log("📦 Premier élément - Clés:", firstItem ? Object.keys(firstItem) : "null");

      // ⭐ NOUVEAU FORMAT HTLM_PROCESSOR: Array avec output + tables + status direct
      // Format: [{ "output": "...", "tables": [...], "status": "success", "tables_found": 1, ... }]
      if (firstItem && typeof firstItem === 'object' &&
        'output' in firstItem &&
        'tables' in firstItem &&
        'status' in firstItem &&
        !('response' in firstItem) &&
        !('body' in firstItem)) {
        console.log("🔍 Détection du format htlm_processor (output + tables + status direct)...");
        console.log("📦 firstItem.output - Type:", typeof firstItem.output);
        console.log("📦 firstItem.output - Longueur:", firstItem.output?.length || 0);
        console.log("📦 firstItem.tables - Type:", Array.isArray(firstItem.tables) ? `Array[${firstItem.tables.length}]` : typeof firstItem.tables);
        console.log("📦 firstItem.status:", firstItem.status);
        console.log("📦 firstItem.tables_found:", firstItem.tables_found);

        if (firstItem.status === 'success' && firstItem.output) {
          console.log("✅ ✅ ✅ FORMAT DÉTECTÉ: Workflow htlm_processor (output + tables direct)");
          console.log("📊 Status:", firstItem.status);
          console.log("📋 Content length:", firstItem.output?.length || 0);
          console.log("📋 Tables found:", firstItem.tables_found);
          console.log("📋 Timestamp:", firstItem.timestamp);

          return {
            output: firstItem.output,
            metadata: {
              status: firstItem.status,
              timestamp: firstItem.timestamp,
              contentLength: firstItem.output?.length || 0,
              tables_found: firstItem.tables_found,
              rows_processed: firstItem.rows_processed,
              tables: firstItem.tables
            }
          };
        } else if (firstItem.status === 'error') {
          console.error("❌ Erreur dans la réponse htlm_processor:", firstItem);
          return {
            output: null,
            metadata: { error: "Erreur htlm_processor", details: firstItem }
          };
        } else {
          console.warn("⚠️ firstItem.output est vide ou status n'est pas 'success'");
        }
      }

      // ⭐ NOUVEAU: Format avec body directement (sans response wrapper)
      // Format: [{ "body": [{ "output": "...", "status": "success", ... }], "headers": {...}, "statusCode": 200 }]
      if (firstItem && typeof firstItem === 'object' && 'body' in firstItem && !('response' in firstItem)) {
        console.log("🔍 Détection du format body direct (sans response wrapper)...");
        const body = firstItem.body;
        console.log("📦 Body détecté - Type:", Array.isArray(body) ? `Array[${body.length}]` : typeof body);

        if (Array.isArray(body) && body.length > 0) {
          console.log("📦 Body[0] - Type:", typeof body[0]);
          console.log("📦 Body[0] - Clés:", body[0] ? Object.keys(body[0]) : "null");
          console.log("📦 Body[0].output existe?", 'output' in body[0]);
          console.log("📦 Body[0].output - Type:", typeof body[0].output);
          console.log("📦 Body[0].output - Longueur:", body[0].output?.length || 0);
          console.log("📦 Body[0].output - Aperçu (200 premiers caractères):", body[0].output?.substring(0, 200) || "vide");

          if (body[0].output) {
            console.log("✅ ✅ ✅ FORMAT DÉTECTÉ: Webhook htlm_processor (body[0].output direct)");
            console.log("📊 Status:", body[0].status);
            console.log("📋 Content length:", body[0].output?.length || 0);
            console.log("📋 Timestamp:", body[0].timestamp);

            return {
              output: body[0].output,
              metadata: {
                status: body[0].status,
                timestamp: body[0].timestamp,
                contentLength: body[0].output?.length || 0,
                tables_found: body[0].tables_found,
                headers: firstItem.headers,
                statusCode: firstItem.statusCode
              }
            };
          } else {
            console.warn("⚠️ body[0].output est vide ou undefined");
          }
        } else {
          console.warn("⚠️ body n'est pas un Array ou est vide");
        }
      }

      // Format avec response.body[0].output (webhook htlm_processor)
      if (firstItem && typeof firstItem === 'object' && 'response' in firstItem) {
        console.log("🔍 Détection du format response.body...");
        console.log("📦 firstItem.response - Type:", typeof firstItem.response);
        console.log("📦 firstItem.response - Clés:", firstItem.response ? Object.keys(firstItem.response) : "null");

        if (firstItem.response && typeof firstItem.response === 'object' && 'body' in firstItem.response) {
          const body = firstItem.response.body;
          console.log("� Bodoy détecté - Type:", Array.isArray(body) ? `Array[${body.length}]` : typeof body);

          if (Array.isArray(body) && body.length > 0) {
            console.log("📦 Body[0] - Type:", typeof body[0]);
            console.log("📦 Body[0] - Clés:", body[0] ? Object.keys(body[0]) : "null");
            console.log("📦 Body[0].output existe?", 'output' in body[0]);
            console.log("📦 Body[0].output - Type:", typeof body[0].output);
            console.log("📦 Body[0].output - Longueur:", body[0].output?.length || 0);
            console.log("📦 Body[0].output - Aperçu (200 premiers caractères):", body[0].output?.substring(0, 200) || "vide");

            if (body[0].output) {
              console.log("✅ ✅ ✅ FORMAT DÉTECTÉ: Webhook htlm_processor (response.body[0].output)");
              console.log("📊 Status:", body[0].status);
              console.log("📋 Content length:", body[0].output?.length || 0);
              console.log("📋 Timestamp:", body[0].timestamp);

              return {
                output: body[0].output,
                metadata: {
                  status: body[0].status,
                  timestamp: body[0].timestamp,
                  contentLength: body[0].output?.length || 0,
                  headers: firstItem.response.headers,
                  statusCode: firstItem.response.statusCode
                }
              };
            } else {
              console.warn("⚠️ body[0].output est vide ou undefined");
            }
          } else {
            console.warn("⚠️ body n'est pas un Array ou est vide");
          }
        } else {
          console.warn("⚠️ firstItem.response n'a pas de propriété 'body'");
        }
      } else {
        console.log("ℹ️ firstItem n'a pas de propriété 'response', test des autres formats...");
      }

      // Format avec 'data' (Programme de travail)
      if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
        console.log("✅ Format détecté: Programme de travail (data)");
        return {
          output: convertStructuredDataToMarkdown(firstItem.data),
          metadata: firstItem
        };
      }

      // Format avec 'output' + 'status' + 'table_format' (Workflow htlm_processor)
      if (firstItem && typeof firstItem === 'object' && 'output' in firstItem && 'status' in firstItem) {
        console.log("✅ Format détecté: Workflow htlm_processor (output + status + table_format)");
        console.log("📊 Status:", firstItem.status);
        console.log("📋 Table format:", firstItem.table_format);

        // Vérifier que le status est success
        if (firstItem.status === 'success' && firstItem.output) {
          return {
            output: firstItem.output,
            metadata: {
              status: firstItem.status,
              table_format: firstItem.table_format,
              processing_stats: firstItem.processing_stats,
              timestamp: firstItem.timestamp
            }
          };
        } else if (firstItem.status === 'error') {
          console.error("❌ Erreur dans la réponse n8n:", firstItem);
          return {
            output: null,
            metadata: { error: "Erreur n8n", details: firstItem }
          };
        }
      }

      // Format avec 'output' standard (sans status)
      if (firstItem && typeof firstItem === 'object' && 'output' in firstItem) {
        console.log("✅ Format détecté: Standard (output dans array)");
        return {
          output: firstItem.output,
          metadata: firstItem
        };
      }
    }

    // Format 2: Objet direct avec 'output'
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      // Format avec response.body[0].output (objet direct)
      if ('response' in response && response.response && 'body' in response.response) {
        const body = response.response.body;
        if (Array.isArray(body) && body.length > 0 && body[0].output) {
          console.log("✅ Format détecté: Webhook htlm_processor (objet direct avec response.body)");
          return {
            output: body[0].output,
            metadata: {
              status: body[0].status,
              timestamp: body[0].timestamp,
              headers: response.response.headers,
              statusCode: response.response.statusCode
            }
          };
        }
      }

      // Format avec 'output' + 'status' (objet direct)
      if ('output' in response && 'status' in response) {
        console.log("✅ Format détecté: Workflow htlm_processor (objet direct)");
        if (response.status === 'success' && response.output) {
          return {
            output: response.output,
            metadata: {
              status: response.status,
              table_format: response.table_format,
              processing_stats: response.processing_stats,
              timestamp: response.timestamp
            }
          };
        }
      }

      if ('output' in response) {
        console.log("✅ Format détecté: Output direct");
        return {
          output: response.output,
          metadata: response
        };
      }

      // Format avec 'tables'
      if ('tables' in response && Array.isArray(response.tables)) {
        console.log("✅ Format détecté: Tables array");
        const output = response.tables
          .map(table => table?.markdown || '')
          .filter(content => content.trim() !== '')
          .join('\n\n---\n\n');
        return {
          output: output,
          metadata: response
        };
      }
    }

    console.error("❌ Format de réponse non reconnu:", response);
    console.error("📦 Structure complète:", JSON.stringify(response, null, 2));
    return {
      output: null,
      metadata: { error: "Format inconnu", rawResponse: response }
    };
  }

  /**
   * Conversion des données structurées en Markdown
   * @param {Object} data - Les données structurées à convertir
   * @returns {string} Le markdown généré
   */
  function convertStructuredDataToMarkdown(data) {
    let markdown = "";

    try {
      const mainKey = Object.keys(data).find(key =>
        key.toLowerCase().includes("etape") ||
        key.toLowerCase().includes("mission") ||
        key.toLowerCase().includes("programme")
      ) || Object.keys(data)[0];

      const dataArray = data[mainKey];
      if (!Array.isArray(dataArray)) {
        console.warn("⚠️ Format de données non-array, retour JSON brut");
        return JSON.stringify(data, null, 2);
      }

      console.log(`📊 Conversion de ${dataArray.length} tables structurées...`);

      dataArray.forEach((tableObj) => {
        const tableKey = Object.keys(tableObj)[0];
        const tableData = tableObj[tableKey];

        // Table d'en-tête (objet simple)
        if (typeof tableData === 'object' && !Array.isArray(tableData)) {
          markdown += "| Rubrique | Description |\n";
          markdown += "|----------|-------------|\n";
          Object.entries(tableData).forEach(([key, value]) => {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            markdown += `| **${formattedKey}** | ${value} |\n`;
          });
          markdown += "\n\n";
        }

        // Table de données (array)
        else if (Array.isArray(tableData) && tableData.length > 0) {
          const columns = Object.keys(tableData[0]);
          const headers = columns.map(col =>
            col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ')
          );

          markdown += "| " + headers.join(" | ") + " |\n";
          markdown += "|" + columns.map(() => "---").join("|") + "|\n";

          tableData.forEach(row => {
            const cells = columns.map(col => {
              const value = row[col];
              if (value === null || value === undefined) return "-";
              return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ").trim() || "-";
            });
            markdown += "| " + cells.join(" | ") + " |\n";
          });
          markdown += "\n";
        }
      });

      console.log(`✅ Conversion terminée: ${markdown.length} caractères générés`);
    } catch (error) {
      console.error("❌ Erreur conversion markdown:", error);
      return JSON.stringify(data, null, 2);
    }

    return markdown;
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
    console.log(`📊 Nombre total de divs à analyser: ${allDivs.length}`);
    console.log(`🔄 Variations du mot-clé:`, keywordVariations);

    let divsAnalyzed = 0;
    let divsWithTables = 0;
    let divsWithRequiredHeaders = 0;
    let divsMatching = 0;

    allDivs.forEach((div, divIndex) => {
      divsAnalyzed++;

      const firstTable = div.querySelector(CONFIG.SELECTORS.CHAT_TABLES);
      if (!firstTable) {
        console.log(`⏭️ Div ${divIndex + 1}: Pas de table, ignorée`);
        return;
      }

      divsWithTables++;

      const headers = Array.from(firstTable.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      console.log(`📋 Div ${divIndex + 1} - En-têtes de la première table:`, headers);

      const hasRequiredHeaders = headers.includes("rubrique") && headers.includes("description");
      if (!hasRequiredHeaders) {
        console.log(`⏭️ Div ${divIndex + 1}: Pas d'en-têtes 'Rubrique' et 'Description', ignorée`);
        return;
      }

      divsWithRequiredHeaders++;

      const cellsOfFirstTable = firstTable.querySelectorAll("td");
      const cellTexts = Array.from(cellsOfFirstTable).map(cell => cell.textContent.trim());

      console.log(`📊 Div ${divIndex + 1} - Contenu des cellules:`, cellTexts);

      const keywordFound = Array.from(cellsOfFirstTable).some((cell) => {
        const cellText = cell.textContent.trim();
        const found = keywordVariations.some((variation) =>
          cellText.toLowerCase().includes(variation.toLowerCase())
        );
        if (found) {
          console.log(`✅ Div ${divIndex + 1} - Mot-clé trouvé dans la cellule: "${cellText}"`);
        }
        return found;
      });

      if (keywordFound) {
        divsMatching++;
        console.log(`✅ Div ${divIndex + 1}: Correspondance trouvée pour le mot-clé "${dynamicKeyword}". Collecte des tables...`);
        const allTablesInDiv = div.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
        console.log(`📋 Div ${divIndex + 1}: ${allTablesInDiv.length} table(s) collectée(s)`);
        allTablesInDiv.forEach((table) => {
          collectedTablesHTML.push(table.outerHTML);
        });
      } else {
        console.log(`⏭️ Div ${divIndex + 1}: Aucune correspondance avec le mot-clé "${dynamicKeyword}"`);
      }
    });

    console.log(`📊 Statistiques de collecte:`);
    console.log(`   - Divs analysées: ${divsAnalyzed}`);
    console.log(`   - Divs avec tables: ${divsWithTables}`);
    console.log(`   - Divs avec en-têtes requis: ${divsWithRequiredHeaders}`);
    console.log(`   - Divs correspondantes: ${divsMatching}`);

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

  /**
   * Affiche le contenu HTML envoyé vers n8n dans la console (systématique)
   * @param {string} tablesHTML - Le contenu HTML à afficher
   * @param {string} targetKeyword - Le mot-clé cible
   */
  function logHTMLToConsole(tablesHTML, targetKeyword) {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("🔍 CONTENU HTML ENVOYÉ VERS N8N");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");
    console.log("🎯 Mot-clé:", targetKeyword);
    console.log("📊 Taille totale:", tablesHTML.length, "caractères");
    console.log("📡 Endpoint:", CONFIG.N8N_ENDPOINT_URL);
    console.log("⏰ Timestamp:", new Date().toISOString());
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("📋 CONTENU HTML COMPLET:");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");
    console.log(tablesHTML);
    console.log("");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("💡 ASTUCE: Clic droit sur le HTML ci-dessus → 'Copy string contents'");
    console.log("💡 Puis testez dans n8n avec curl ou fetch");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("\n");
  }

  /**
   * Affiche une alert avec la réponse de l'endpoint n8n
   * @param {string} output - Le contenu de la réponse normalisée
   * @param {Object} metadata - Les métadonnées de la réponse
   * @param {string} targetKeyword - Le mot-clé cible
   */
  function showN8nResponseAlert(output, metadata, targetKeyword) {
    const maxLength = 3000;
    const truncated = output.length > maxLength;
    const displayOutput = truncated ? output.substring(0, maxLength) + '\n\n... (tronqué)' : output;

    const message = `
═══════════════════════════════════════════════════════════════════
📥 RÉPONSE REÇUE DE N8N
═══════════════════════════════════════════════════════════════════

🎯 Mot-clé: ${targetKeyword}
📊 Taille de l'output: ${output.length} caractères
📡 Endpoint: ${CONFIG.N8N_ENDPOINT_URL}
✅ Status: ${metadata.status || 'N/A'}
🕐 Timestamp: ${metadata.timestamp || 'N/A'}
${truncated ? '⚠️ Contenu tronqué (affichage limité à ' + maxLength + ' caractères)' : ''}

═══════════════════════════════════════════════════════════════════
📋 CONTENU DE LA RÉPONSE (Markdown):
═══════════════════════════════════════════════════════════════════

${displayOutput}

═══════════════════════════════════════════════════════════════════
📊 MÉTADONNÉES:
═══════════════════════════════════════════════════════════════════

${JSON.stringify(metadata, null, 2)}

═══════════════════════════════════════════════════════════════════
💡 ASTUCE: Le contenu complet est dans la console
═══════════════════════════════════════════════════════════════════
    `.trim();

    alert(message);

    console.log("📥 ========== RÉPONSE N8N COMPLÈTE ==========");
    console.log("Output:", output);
    console.log("Metadata:", metadata);
    console.log("📥 ========== FIN DE LA RÉPONSE N8N ==========");
  }

  /**
   * Affiche une alert avec le résultat final de l'affichage
   * @param {Array} n8nTables - Les tables HTML extraites
   * @param {string} targetKeyword - Le mot-clé cible
   * @param {HTMLElement} targetContainer - Le conteneur cible
   */
  function showFinalResultAlert(n8nTables, targetKeyword, targetContainer) {
    const tablesHTML = n8nTables.map((table, index) => {
      const tableHTML = table.outerHTML;
      const preview = tableHTML.substring(0, 300);
      return `Table ${index + 1}:\n${preview}${tableHTML.length > 300 ? '...' : ''}`;
    }).join('\n\n');

    const maxLength = 3000;
    const truncated = tablesHTML.length > maxLength;
    const displayHTML = truncated ? tablesHTML.substring(0, maxLength) + '\n\n... (tronqué)' : tablesHTML;

    const message = `
═══════════════════════════════════════════════════════════════════
🎉 AFFICHAGE FINAL DANS LE CHAT
═══════════════════════════════════════════════════════════════════

🎯 Mot-clé: ${targetKeyword}
📊 Nombre de tables affichées: ${n8nTables.length}
📍 Conteneur: ${targetContainer.className}
${truncated ? '⚠️ Aperçu tronqué (affichage limité à ' + maxLength + ' caractères)' : ''}

═══════════════════════════════════════════════════════════════════
📋 APERÇU DES TABLES AFFICHÉES:
═══════════════════════════════════════════════════════════════════

${displayHTML}

═══════════════════════════════════════════════════════════════════
✅ RÉSULTAT:
═══════════════════════════════════════════════════════════════════

✅ ${n8nTables.length} table(s) ont été affichées dans le chat
✅ La table déclencheuse a été supprimée
✅ Le traitement est terminé avec succès

═══════════════════════════════════════════════════════════════════
💡 ASTUCE: Vérifiez le chat pour voir les tables affichées
═══════════════════════════════════════════════════════════════════
    `.trim();

    alert(message);

    console.log("🎉 ========== AFFICHAGE FINAL ==========");
    console.log(`${n8nTables.length} table(s) affichée(s)`);
    n8nTables.forEach((table, index) => {
      console.log(`Table ${index + 1}:`, table.outerHTML);
    });
    console.log("🎉 ========== FIN DE L'AFFICHAGE ==========");
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
      console.log("🔗 Endpoint:", CONFIG.N8N_ENDPOINT_URL);
      console.log("📊 Taille des données:", tablesHTML.length, "caractères");
      console.log("🎯 Mot-clé cible:", targetKeyword);

      const payload = { question: tablesHTML };
      console.log("📦 Payload envoyé:", JSON.stringify(payload).substring(0, 300) + "...");

      // ⭐ LOG SYSTÉMATIQUE: Afficher le contenu HTML envoyé dans la console
      if (CONFIG.DEBUG_LOG_HTML) {
        logHTMLToConsole(tablesHTML, targetKeyword);
      }

      const response = await fetch(CONFIG.N8N_ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      console.log("� Réponsee HTTP reçue:");
      console.log("   - Status:", response.status);
      console.log("   - Status Text:", response.statusText);
      console.log("   - Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erreur HTTP:", errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Données reçues de l'endpoint n8n ! Statut: ${response.status} OK`);

      // 🚨 FIX V17.2: Toujours essayer de parser le JSON, même si content-length est 0
      // Car n8n peut envoyer des données sans mettre à jour ce header correctement
      const contentLength = response.headers.get('content-length');
      console.log("📏 Content-Length:", contentLength);

      if (contentLength === '0' || contentLength === 0) {
        console.warn('⚠️ Content-Length est 0, mais tentative de parsing JSON quand même...');
      }

      // Toujours essayer de lire le body
      let responseData;
      try {
        const responseText = await response.text();
        console.log("📄 Response text length:", responseText.length);
        console.log("📄 Response text preview:", responseText.substring(0, 500));

        if (!responseText || responseText.trim() === '') {
          console.error('❌ RÉPONSE VRAIMENT VIDE DE N8N');
          console.error('💡 Vérifier la configuration du node "Respond to Webhook" dans n8n');
          console.error('💡 Le node doit avoir "Respond With" = "All Incoming Items"');
          console.error('💡 Ou "Respond With" = "First Incoming Item"');

          return {
            output: "⚠️ Réponse vide de n8n. Vérifier la configuration du workflow.",
            status: "empty_response",
            timestamp: new Date().toISOString(),
            error: "response body is empty"
          };
        }

        responseData = JSON.parse(responseText);
        console.log("✅ JSON parsé avec succès");
      } catch (parseError) {
        console.error("❌ Erreur lors du parsing JSON:", parseError);
        console.error("📄 Contenu reçu:", responseText?.substring(0, 1000));
        throw new Error(`Impossible de parser la réponse JSON: ${parseError.message}`);
      }

      console.log("📦 Réponse brute n8n (type):", Array.isArray(responseData) ? "Array" : typeof responseData);
      console.log("📦 Réponse brute n8n (structure):", JSON.stringify(responseData, null, 2).substring(0, 500) + "...");

      // ⭐ IMPORTANT: Ne plus extraire directement, laisser normalizeN8nResponse gérer
      // La fonction normalizeN8nResponse va gérer tous les formats
      console.log("🔄 Passage de la réponse brute à normalizeN8nResponse");

      saveToCache(cacheKey, responseData, targetKeyword);

      return responseData;
    } catch (error) {
      console.error("❌ Erreur lors de l'appel à l'API n8n:", error);
      console.error("📍 Stack trace:", error.stack);
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

  /**
   * FIX V17.2 ROBUST - Détecte si la réponse n8n correspond à un rapport
   * en scannant TOUTES les cellules (td ET th) de TOUTES les tables de la réponse.
   * @param {Array<HTMLElement>} tables - Les tables extraites de la réponse
   * @returns {boolean} true si un mot-clé de rapport est détecté
   */
  function detectReportKeywordInFirstTable(tables) {
    const REPORT_KEYWORDS = [
      /rapport\s+final/i,
      /rapport\s+provisoire/i,
      /synth[eè]se/i
    ];

    if (!tables || tables.length === 0) return false;

    console.log(`🔍 [V17.2] Scan de ${tables.length} table(s) pour détecter un mot-clé rapport...`);

    // Scanner TOUTES les tables (pas seulement la 1ère) et TOUTES les cellules (td + th)
    for (let t = 0; t < tables.length; t++) {
      const allCells = tables[t].querySelectorAll('td, th');
      for (const cell of allCells) {
        const text = cell.textContent.trim();
        if (!text) continue;
        for (const pattern of REPORT_KEYWORDS) {
          if (pattern.test(text)) {
            console.log(`✅ [V17.2] Mot-clé rapport détecté dans table[${t}], cellule: "${text.substring(0, 80)}" → Nettoyage activé`);
            return true;
          }
        }
      }
    }

    console.log('ℹ️ [V17.2] Aucun mot-clé rapport détecté dans la réponse n8n');
    return false;
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

      // ⭐ FIX V17.2: Nettoyage des lignes vides pour les rapports (à partir de la 2ème table)
      applyReportEmptyRowsCleanup(tables);

      return tables;
    }

    console.log("🔄 Conversion du markdown en tables HTML...");

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

    if (tables.length === 0) {
      console.error("❌ Aucune table détectée dans la réponse");
      console.log("📄 Contenu analysé:", responseText.substring(0, 500));
    } else {
      console.log(`✅ ${tables.length} table(s) extraite(s) du markdown`);
      // ⭐ FIX V17.2: Nettoyage des lignes vides pour les rapports (à partir de la 2ème table)
      applyReportEmptyRowsCleanup(tables);
    }

    return tables;
  }

  /**
   * FIX V17.2 - Applique le nettoyage des lignes vides sur les tables à partir de la 2ème
   * uniquement si la première table contient un mot-clé de rapport dans la colonne Description
   * @param {Array<HTMLElement>} tables - Les tables à analyser et nettoyer
   */
  function applyReportEmptyRowsCleanup(tables) {
    if (!tables || tables.length < 2) {
      console.log('ℹ️ [V17.2] Moins de 2 tables → pas de nettoyage conditionnel nécessaire');
      return;
    }

    const isReport = detectReportKeywordInFirstTable(tables);

    if (!isReport) {
      console.log('ℹ️ [V17.2] Pas de rapport détecté → pas de nettoyage supplémentaire');
      return;
    }

    console.log(`🧹 [V17.2] Nettoyage des lignes vides (mode rapport) sur ${tables.length - 1} table(s) (index 1 à ${tables.length - 1})`);

    for (let i = 1; i < tables.length; i++) {
      const rowsBefore = tables[i].querySelectorAll('tbody tr').length;
      cleanEmptyRowsForReport(tables[i]);
      const rowsAfter = tables[i].querySelectorAll('tbody tr').length;
      const removed = rowsBefore - rowsAfter;
      if (removed > 0) {
        console.log(`✅ [V17.2] Table ${i + 1}: ${removed} ligne(s) vide(s) supprimée(s) (${rowsBefore} → ${rowsAfter})`);
      } else {
        console.log(`ℹ️ [V17.2] Table ${i + 1}: Aucune ligne vide à supprimer`);
      }
    }
  }

  /**
   * FIX V17.2 - Nettoyage étendu des lignes vides pour les tables de rapport.
   * Supprime une ligne si :
   *   (a) Toutes les cellules sont vides ou '---' (comportement existant)
   *   (b) Seule la 1ère cellule contient un numéro (ex: "2", "6") et toutes
   *       les autres cellules sont vides — cas typique des lignes "fantômes" de n8n
   * @param {HTMLElement} table - La table à nettoyer
   */
  function cleanEmptyRowsForReport(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length === 0) return;

      // Cas (a) : toutes les cellules sont vides ou '---'
      const allEmpty = cells.every(cell => {
        const text = cell.textContent.trim();
        return text === '' || text === '---';
      });

      if (allEmpty) {
        console.log(`🗑️ [V17.2] Ligne supprimée (toutes cellules vides): "${row.textContent.trim().substring(0, 60)}"`);
        row.remove();
        return;
      }

      // Cas (b) : seule la 1ère cellule a du contenu (un numéro)
      // et soit c'est la SEULE cellule, soit toutes les autres sont vides
      const firstCellText = cells[0].textContent.trim();
      const isFirstCellNumeric = /^\d+$/.test(firstCellText);
      
      const isRestEmptyOrMissing = cells.length === 1 || cells.slice(1).every(cell => {
        const text = cell.textContent.trim();
        return text === '' || text === '---';
      });

      if (isFirstCellNumeric && isRestEmptyOrMissing) {
        console.log(`🗑️ [V17.2] Ligne supprimée (numéro "${firstCellText}" seul)`);
        row.remove();
      }
    });
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

    const headerCount = cleanHeaderCells.length;
    const tbody = document.createElement("tbody");

    dataRows.forEach((rowText, rowIndex) => {
      const tr = document.createElement("tr");
      tr.className = rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800";

      // ⭐ FIX V17.2 ROBUST PADDING:
      // 1. Nettoyer les pipes de bordure (|) avant de split
      let rowContent = rowText.trim();
      if (rowContent.startsWith('|')) rowContent = rowContent.substring(1);
      if (rowContent.endsWith('|')) rowContent = rowContent.substring(0, rowContent.length - 1);

      // 2. Split sans filter pour garder les cellules vides
      let cells = rowContent.split("|");

      // 3. Créer les cellules existantes
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
          td.textContent = trimmedText || ""; // On laisse vide si vide (pas de "-")
        }

        tr.appendChild(td);
      });

      // 4. ⭐ PADDING : Si le LLM a oublié des colonnes (ex: Recommandation), on les rajoute vides
      while (tr.children.length < headerCount) {
        const emptyTd = document.createElement("td");
        emptyTd.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm";
        emptyTd.textContent = "";
        tr.appendChild(emptyTd);
      }

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
      tableWrapper.className = "overflow-x-auto my-4 prose prose-base dark:prose-invert max-w-none";
      tableWrapper.style.cssText = "margin-top: 1rem; margin-bottom: 1rem;";
      tableWrapper.setAttribute('data-n8n-table', 'true');
      tableWrapper.setAttribute('data-n8n-keyword', targetKeyword);
      // ⭐ AJOUT: data-container-id pour la persistance
      tableWrapper.setAttribute('data-container-id', `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

      const clonedTable = table.cloneNode(true);
      cleanEmptyRows(clonedTable);
      enhanceTableUrls(clonedTable);

      tableWrapper.appendChild(clonedTable);
      targetContainer.appendChild(tableWrapper);
    });

    console.log(`✅ ${n8nTables.length} table(s) intégrée(s)`);
  }

  /**
   * Traite une table Flowise détectée
   * VERSION CORRIGÉE avec normalizeN8nResponse
   */
  async function processN8nTrigger(triggerTable) {
    console.log("🎬 === DÉBUT DU TRAITEMENT D'UNE TABLE FLOWISE ===");

    const parentDiv = triggerTable.closest(CONFIG.SELECTORS.PARENT_DIV);
    if (!parentDiv || parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
      console.log("⏭️ Table déjà traitée ou parent invalide, ignorée");
      return;
    }

    const dynamicKeyword = extractDynamicKeyword(triggerTable);
    if (!dynamicKeyword) {
      console.log("ℹ️ Table Flowise sans mot-clé valide, ignorée");
      return;
    }

    console.log(`🎯 Mot-clé dynamique détecté: "${dynamicKeyword}"`);
    parentDiv.classList.add(CONFIG.PROCESSED_CLASS);

    try {
      console.log("📝 Étape 1: Extraction du message utilisateur...");
      const userMessageContent = findAndExtractUserMessage(triggerTable);
      let userMessageTableHTML = "";

      if (userMessageContent) {
        console.log("✅ Message utilisateur trouvé:", userMessageContent.substring(0, 100) + "...");
        userMessageTableHTML = createUserMessageTableHTML(userMessageContent);
      } else {
        console.log("ℹ️ Aucun message utilisateur trouvé");
      }

      console.log("📊 Étape 2: Collecte des tables de critères...");
      const criteriaTablesHTML = collectCriteriaTables(dynamicKeyword, triggerTable, userMessageTableHTML);

      if (!criteriaTablesHTML) {
        throw new Error(`Aucune table de critère trouvée pour le mot-clé : "${dynamicKeyword}"`);
      }

      console.log(`✅ Tables collectées: ${criteriaTablesHTML.length} caractères`);

      // Appel à l'endpoint n8n
      console.log("� Étapde 3: Envoi vers l'endpoint n8n...");
      const response = await queryN8nEndpoint(criteriaTablesHTML, dynamicKeyword);
      console.log("✅ Réponse reçue de n8n");

      // ⭐ NOUVEAU: Normaliser la réponse pour gérer tous les formats
      console.log("🔄 Étape 4: Normalisation de la réponse n8n...");
      const { output, metadata } = normalizeN8nResponse(response);

      if (!output || output.trim() === '') {
        console.error("❌ Output vide ou null après normalisation");
        console.error("📦 Réponse n8n brute:", JSON.stringify(response, null, 2).substring(0, 500));
        throw new Error("Réponse de n8n invalide ou vide");
      }

      console.log("✅ Réponse normalisée avec succès");
      console.log("📊 Taille de l'output:", output.length, "caractères");
      console.log("🔥 Aperçu de l'output:", output.substring(0, 200) + "...");
      console.log("📊 Métadonnées:", metadata);

      // ⭐ ALERT: Afficher la réponse n8n (si activé)
      if (CONFIG.DEBUG_ALERT_HTML) {
        showN8nResponseAlert(output, metadata, dynamicKeyword);
      }

      console.log("🔧 Étape 5: Extraction des tables depuis l'output...");
      const n8nTables = extractTablesFromResponse(output);

      if (!n8nTables.length) {
        console.warn("⚠️ Aucune table trouvée dans la réponse");
        console.log("📄 Contenu complet reçu:", output.substring(0, 1000));
        throw new Error("Aucune table trouvée dans la réponse n8n");
      }

      console.log(`✅ ${n8nTables.length} table(s) extraite(s)`);

      console.log("🎯 Étape 6: Recherche du conteneur cible...");
      const targetContainer = findTargetContainer(triggerTable);

      if (!targetContainer) {
        throw new Error("Impossible de trouver le conteneur cible");
      }

      console.log("✅ Conteneur cible trouvé");

      console.log("🔧 Étape 7: Intégration des tables dans le DOM...");
      integrateTablesOnly(n8nTables, targetContainer, dynamicKeyword);

      console.log("🗑️ Étape 8: Suppression de la table déclencheuse...");
      removeTriggerTable(triggerTable, dynamicKeyword);

      console.log(`🎉 === TRAITEMENT COMPLET RÉUSSI POUR "${dynamicKeyword}" ===`);

      // ⭐ ALERT: Afficher le résultat final (si activé)
      if (CONFIG.DEBUG_ALERT_HTML) {
        showFinalResultAlert(n8nTables, dynamicKeyword, targetContainer);
      }

    } catch (error) {
      console.error(`❌ === ERREUR LORS DU TRAITEMENT POUR "${dynamicKeyword}" ===`);
      console.error("📍 Message d'erreur:", error.message);
      console.error("📍 Stack trace:", error.stack);

      // ⭐ FIX V17.3: Remplacer la table Flowise + le message d'erreur par une table de notification unique
      // Au lieu d'afficher un div d'erreur rouge en dessous de la table, on transforme la table Flowise
      // en une table "Notification" avec un message convivial, et on ne génère plus d'erreur visible.
      const targetContainer = findTargetContainer(triggerTable);

      if (targetContainer) {
        // Construire la table de notification
        const notifTable = document.createElement("table");
        notifTable.className = "min-w-full border border-gray-200 dark:border-gray-700 rounded-lg";
        notifTable.style.cssText = "margin-bottom: 1.5rem; border-collapse: separate; border-spacing: 0;";

        // En-tête : "Notification"
        const notifThead = document.createElement("thead");
        const notifHeaderTr = document.createElement("tr");
        const notifTh = document.createElement("th");
        notifTh.textContent = "Notification";
        notifTh.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-semibold";
        notifHeaderTr.appendChild(notifTh);
        notifThead.appendChild(notifHeaderTr);
        notifTable.appendChild(notifThead);

        // Corps : une seule ligne avec le message convivial
        const notifTbody = document.createElement("tbody");
        const notifTr = document.createElement("tr");
        notifTr.className = "bg-white dark:bg-gray-900";
        const notifTd = document.createElement("td");
        notifTd.textContent = "Merci de vous assurer que l'une des etapes de mission suivante existe dans l'interface : Frap, Synthèse, Rapport provisoire, Rapport Final";
        notifTd.className = "px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm";
        notifTd.style.cssText = "overflow-wrap: break-word; white-space: pre-wrap;";
        notifTr.appendChild(notifTd);
        notifTbody.appendChild(notifTr);
        notifTable.appendChild(notifTbody);

        // Envelopper la table dans un overflow-x-auto
        const notifWrapper = document.createElement("div");
        notifWrapper.className = "overflow-x-auto my-4";

        notifWrapper.appendChild(notifTable);

        // Trouver et supprimer la table Flowise originale (et son wrapper overflow-x-auto si présent)
        const triggerWrapper = triggerTable.closest(".overflow-x-auto") || triggerTable;
        if (triggerWrapper && targetContainer.contains(triggerWrapper)) {
          targetContainer.replaceChild(notifWrapper, triggerWrapper);
          console.log("✅ Table Flowise remplacée par la table de notification");
        } else {
          // Si on ne peut pas remplacer, on insère avant et supprime la trigger table
          targetContainer.insertBefore(notifWrapper, triggerTable);
          triggerTable.parentNode && triggerTable.parentNode.removeChild(triggerTable);
          console.log("✅ Table de notification insérée, table Flowise supprimée");
        }
      }

      console.log(`ℹ️ Traitement terminé avec notification pour "${dynamicKeyword}"`);
      // Ne pas retirer la classe processed : la table a été remplacée, pas besoin de retraiter
    }
  }

  function scanAndProcess() {
    const allTables = document.querySelectorAll(CONFIG.SELECTORS.CHAT_TABLES);
    let processedCount = 0;
    let totalTablesScanned = 0;

    console.log(`🔎 Scanner: Analyse de ${allTables.length} table(s) dans le DOM...`);

    allTables.forEach((table, index) => {
      totalTablesScanned++;

      const parentDiv = table.closest(CONFIG.SELECTORS.PARENT_DIV);
      if (parentDiv && parentDiv.classList.contains(CONFIG.PROCESSED_CLASS)) {
        console.log(`⏭️ Table ${index + 1}: Déjà traitée, ignorée`);
        return;
      }

      const headers = Array.from(table.querySelectorAll("th")).map((th) =>
        th.textContent.trim().toLowerCase()
      );

      console.log(`📋 Table ${index + 1} - En-têtes:`, headers);

      if (headers.includes("flowise")) {
        console.log(`✅ Table ${index + 1}: Colonne 'Flowise' détectée ! Traitement en cours...`);
        processN8nTrigger(table);
        processedCount++;
      } else {
        console.log(`⏭️ Table ${index + 1}: Pas de colonne 'Flowise', ignorée`);
      }
    });

    console.log(`📊 Scanner terminé: ${processedCount} table(s) Flowise traitée(s) sur ${totalTablesScanned} table(s) analysée(s)`);
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
    console.log("🔧 Initialisation du script V17.1...");

    setTimeout(scanAndProcess, 800);
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("✅ Script V17.1 initialisé - Détection dynamique des mots-clés activée");
    console.log("🌐 Endpoint configuré:", CONFIG.N8N_ENDPOINT_URL);
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

  // API publique pour debugging
  window.ClaraverseN8nV17 = {
    scanAndProcess,
    CONFIG,
    extractDynamicKeyword,
    generateKeywordVariations,
    normalizeN8nResponse,
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
    enableHTMLLog: () => {
      CONFIG.DEBUG_LOG_HTML = true;
      console.log('✅ Log HTML activé - Le HTML sera affiché dans la console');
      console.log('💡 Pour désactiver: window.ClaraverseN8nV17.disableHTMLLog()');
    },
    disableHTMLLog: () => {
      CONFIG.DEBUG_LOG_HTML = false;
      console.log('✅ Log HTML désactivé');
    },
    logHTMLToConsole: logHTMLToConsole,
    testN8nConnection: async () => {
      try {
        console.log("🧪 Test de connexion n8n...");
        const response = await fetch(CONFIG.N8N_ENDPOINT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ question: '<table><tr><th>Test</th></tr><tr><td>Connexion</td></tr></table>' })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Connexion réussie!");
        console.log("📦 Réponse:", data);
        return { success: true, data: data };
      } catch (error) {
        console.error("❌ Erreur de connexion:", error);
        return { success: false, error: error.message };
      }
    },
    version: "17.2.0 - Fix lignes vides rapport (Rapport final/provisoire/Synthèse)",
  };

  console.log("🎉 Flowise.js V17.2 chargé avec succès!");
  console.log("💡 Commandes disponibles:");
  console.log("   - window.ClaraverseN8nV17.testN8nConnection()");
  console.log("   - window.ClaraverseN8nV17.getCacheInfo()");
  console.log("   - window.ClaraverseN8nV17.clearAllCache()");
  console.log("   - window.ClaraverseN8nV17.scanAndProcess()");
  console.log("   - window.ClaraverseN8nV17.enableHTMLLog() ⭐ Activer/désactiver le log HTML");
  console.log("   - window.ClaraverseN8nV17.disableHTMLLog()");
  console.log("💡 Le HTML envoyé est TOUJOURS loggé dans la console (CONFIG.DEBUG_LOG_HTML = true)");

})();