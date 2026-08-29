/**
 * ========================================
 * CLARAVERSE DEV.JS - SYSTÈME CENTRALISÉ
 * ========================================
 * Version: 3.0 - Synchronisation améliorée
 *
 * Fonctionnalités principales :
 * - Gestion centralisée du localStorage
 * - Synchronisation robuste entre scripts
 * - Restauration intelligente avec retry
 * - API unifiée pour menu.js et conso.js
 */

// Configuration centralisée
const CONFIG = {
  STORAGE_PREFIX: "claraverse_dev_",
  SYNC_PREFIX: "claraverse_sync_",
  META_PREFIX: "claraverse_meta_",
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 500,
  SYNC_DELAY: 200,
  RESTORE_TIMEOUT: 5000,
  DEBUG: true,
};

// État global de synchronisation
let syncState = {
  isInitialized: false,
  pendingRestores: new Set(),
  activeScripts: new Set(),
  lastSyncTimestamp: 0,
  retryQueue: new Map(),
};

// Log centralisé avec horodatage
function log(message, level = "info", context = "DEV") {
  if (!CONFIG.DEBUG && level !== "error") return;

  const timestamp = new Date().toLocaleTimeString();
  const emoji = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    debug: "🔍",
  };

  console.log(`[${timestamp}] ${emoji[level] || "📝"} [${context}] ${message}`);
}

/**
 * ========================================
 * GESTIONNAIRE DE STOCKAGE CENTRALISÉ
 * ========================================
 */
class CentralizedStorageManager {
  constructor() {
    this.storagePrefix = CONFIG.STORAGE_PREFIX;
    this.syncPrefix = CONFIG.SYNC_PREFIX;
    this.metaPrefix = CONFIG.META_PREFIX;
    this.pendingOperations = new Map();
  }

  // Générer une clé de stockage uniforme
  generateStorageKey(tableId, cellId = null, type = "data") {
    // Extraire les composants hiérarchiques de l'ID pour une meilleure organisation
    const parts = tableId.split("_");
    const userId = parts[0] || "unknown";
    const chatId = parts[1] || "unknown";

    // Structurer la clé avec hiérarchie pour éviter les collisions
    const base = `${this.storagePrefix}${userId}_${chatId}_${type}_${tableId}`;
    return cellId ? `${base}_${cellId}` : base;
  }

  // Sauvegarder avec métadonnées
  async saveWithMeta(key, data, metadata = {}) {
    try {
      const enrichedData = {
        ...data,
        timestamp: Date.now(),
        version: "3.0",
        source: metadata.source || "dev",
        ...metadata,
      };

      localStorage.setItem(key, JSON.stringify(enrichedData));

      // Sauvegarder les métadonnées séparément
      const metaKey = key.replace(this.storagePrefix, this.metaPrefix);
      const metaData = {
        key,
        timestamp: enrichedData.timestamp,
        source: enrichedData.source,
        size: JSON.stringify(enrichedData).length,
        version: enrichedData.version,
      };

      localStorage.setItem(metaKey, JSON.stringify(metaData));

      log(`💾 Sauvegardé: ${key} (${metaData.size} bytes)`, "success");
      return true;
    } catch (error) {
      log(`❌ Erreur sauvegarde ${key}: ${error.message}`, "error");
      return false;
    }
  }

  // Charger avec validation
  async loadWithValidation(key) {
    try {
      const dataStr = localStorage.getItem(key);
      if (!dataStr) return null;

      const data = JSON.parse(dataStr);

      // Validation de base
      if (!data.timestamp || !data.version) {
        log(`⚠️ Données invalides pour ${key}`, "warning");
        return null;
      }

      // Vérifier l'âge des données (24h max)
      const age = Date.now() - data.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        log(`⏰ Données expirées pour ${key}`, "warning");
        return null;
      }

      return data;
    } catch (error) {
      log(`❌ Erreur chargement ${key}: ${error.message}`, "error");
      return null;
    }
  }

  // Nettoyer les données corrompues
  async cleanCorruptedData() {
    let cleaned = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (!data || typeof data !== "object" || !data.timestamp) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch (error) {
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    }

    if (cleaned > 0) {
      log(`🧹 Nettoyage: ${cleaned} entrées corrompues supprimées`, "success");
    }

    return cleaned;
  }

  // Obtenir des statistiques de stockage hiérarchiques
  getStorageStats() {
    const stats = {
      totalItems: 0,
      totalSize: 0,
      bySource: {},
      byUser: {},
      byChat: {},
      byContainer: {},
      hierarchicalItems: 0,
      legacyItems: 0,
      oldestTimestamp: Date.now(),
      newestTimestamp: 0,
    };

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const dataStr = localStorage.getItem(key);
          const data = JSON.parse(dataStr);

          stats.totalItems++;
          stats.totalSize += dataStr.length;

          const source = data.source || "unknown";
          stats.bySource[source] = (stats.bySource[source] || 0) + 1;

          // Analyser la structure hiérarchique de la clé
          const keyParts = key.replace(this.storagePrefix, "").split("_");
          if (keyParts.length >= 3) {
            const userId = keyParts[0];
            const chatId = keyParts[1];
            const containerId = keyParts[3] || "unknown";

            stats.byUser[userId] = (stats.byUser[userId] || 0) + 1;
            stats.byChat[chatId] = (stats.byChat[chatId] || 0) + 1;
            stats.byContainer[containerId] =
              (stats.byContainer[containerId] || 0) + 1;
            stats.hierarchicalItems++;
          } else {
            stats.legacyItems++;
          }

          if (data.timestamp < stats.oldestTimestamp) {
            stats.oldestTimestamp = data.timestamp;
          }
          if (data.timestamp > stats.newestTimestamp) {
            stats.newestTimestamp = data.timestamp;
          }
        } catch (error) {
          // Ignorer les entrées corrompues
        }
      }
    });

    return stats;
  }

  // Nettoyer les données d'un utilisateur spécifique
  async cleanUserData(userId, maxAge = 7 * 24 * 60 * 60 * 1000) {
    let cleaned = 0;
    const keys = Object.keys(localStorage);
    const cutoffTime = Date.now() - maxAge;

    for (const key of keys) {
      if (key.startsWith(this.storagePrefix) && key.includes(`_${userId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (!data || !data.timestamp || data.timestamp < cutoffTime) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch (error) {
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    }

    log(
      `🧹 Nettoyage utilisateur ${userId}: ${cleaned} entrées supprimées`,
      "success",
    );
    return cleaned;
  }

  // Nettoyer les données d'un chat spécifique
  async cleanChatData(chatId, force = false) {
    let cleaned = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        const keyParts = key.replace(this.storagePrefix, "").split("_");
        if (keyParts.length >= 2 && keyParts[1] === chatId) {
          if (force) {
            localStorage.removeItem(key);
            cleaned++;
          } else {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              // Garder seulement les données récentes (dernières 24h)
              if (
                !data ||
                !data.timestamp ||
                Date.now() - data.timestamp > 24 * 60 * 60 * 1000
              ) {
                localStorage.removeItem(key);
                cleaned++;
              }
            } catch (error) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        }
      }
    }

    log(
      `🧹 Nettoyage chat ${chatId}: ${cleaned} entrées supprimées`,
      "success",
    );
    return cleaned;
  }

  // Migrer les anciennes données vers le nouveau format hiérarchique
  async migrateToHierarchicalFormat() {
    let migrated = 0;
    const keys = Object.keys(localStorage);
    const currentUserId = extractUserId();
    const currentChatId = extractChatId();

    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const keyParts = key.replace(this.storagePrefix, "").split("_");

          // Identifier les anciens formats (sans hiérarchie)
          if (keyParts.length < 3 || !keyParts[0].includes("user")) {
            const data = JSON.parse(localStorage.getItem(key));

            if (data && data.tableId) {
              // Créer une nouvelle clé hiérarchique
              const newKey = this.generateStorageKey(
                `${currentUserId}_${currentChatId}_container_legacy_${data.tableId}`,
                data.cellId,
                "data",
              );

              // Enrichir les données avec les métadonnées de migration
              data.migrated = true;
              data.originalKey = key;
              data.migrationTimestamp = Date.now();

              // Sauvegarder sous la nouvelle clé
              localStorage.setItem(newKey, JSON.stringify(data));

              // Supprimer l'ancienne clé après confirmation
              localStorage.removeItem(key);
              migrated++;
            }
          }
        } catch (error) {
          log(`⚠️ Erreur migration ${key}: ${error.message}`, "warning");
        }
      }
    }

    if (migrated > 0) {
      log(
        `🔄 Migration: ${migrated} entrées converties au format hiérarchique`,
        "success",
      );
    }

    return migrated;
  }

  // Valider la cohérence des données hiérarchiques
  async validateHierarchicalData() {
    const issues = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const keyParts = key.replace(this.storagePrefix, "").split("_");

          // Vérifier la structure hiérarchique
          if (keyParts.length >= 3) {
            const userId = keyParts[0];
            const chatId = keyParts[1];

            // Vérifier la cohérence avec les données
            if (data.tableId && !data.tableId.includes(userId)) {
              issues.push({
                type: "user_mismatch",
                key: key,
                expected: userId,
                found: data.tableId,
              });
            }

            if (data.tableId && !data.tableId.includes(chatId)) {
              issues.push({
                type: "chat_mismatch",
                key: key,
                expected: chatId,
                found: data.tableId,
              });
            }
          } else {
            issues.push({
              type: "invalid_hierarchy",
              key: key,
              reason: "Clé non hiérarchique",
            });
          }
        } catch (error) {
          issues.push({
            type: "corrupted_data",
            key: key,
            error: error.message,
          });
        }
      }
    }

    if (issues.length > 0) {
      log(`⚠️ Validation: ${issues.length} problèmes détectés`, "warning");
      console.table(issues.slice(0, 10)); // Afficher les 10 premiers problèmes
    }

    return issues;
  }

  // Obtenir les données filtrées par critères hiérarchiques
  async getDataByHierarchy(userId = null, chatId = null, containerId = null) {
    const results = [];
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        const keyParts = key.replace(this.storagePrefix, "").split("_");

        if (keyParts.length >= 3) {
          const keyUserId = keyParts[0];
          const keyChatId = keyParts[1];
          const keyContainerId = keyParts[3];

          // Filtrer selon les critères
          if (
            (!userId || keyUserId === userId) &&
            (!chatId || keyChatId === chatId) &&
            (!containerId || keyContainerId === containerId)
          ) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              results.push({
                key: key,
                userId: keyUserId,
                chatId: keyChatId,
                containerId: keyContainerId,
                data: data,
              });
            } catch (error) {
              // Ignorer les données corrompues
            }
          }
        }
      }
    }

    return results;
  }
}

/**
 * ========================================
 * SCANNER DE TABLES UNIVERSEL
 * ========================================
 */
function universalTableScan() {
  const selectors = [
    // Sélecteur principal Claraverse
    "div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg",
    // Sélecteurs de fallback
    "table.min-w-full.border",
    "table.claraverse-table",
    ".claraverse-conso-table",
    "table[data-claraverse]",
    // Sélecteur générique pour les tables dans les chats
    "div.prose table",
  ];

  let allTables = [];

  selectors.forEach((selector) => {
    try {
      const tables = document.querySelectorAll(selector);
      tables.forEach((table) => {
        if (!allTables.includes(table)) {
          allTables.push(table);
        }
      });
    } catch (error) {
      log(`⚠️ Erreur sélecteur ${selector}: ${error.message}`, "warning");
    }
  });

  log(`🔍 Scan: ${allTables.length} tables trouvées`);
  return allTables;
}

// Générer un ID unique pour les tables
// Fonctions utilitaires pour l'identification hiérarchique
function extractUserId() {
  try {
    // Essayer plusieurs méthodes pour obtenir l'ID utilisateur
    // 1. Depuis l'URL (ex: /user/123/chat ou ?userId=123)
    const urlMatch =
      window.location.pathname.match(/\/user\/([^\/]+)/) ||
      window.location.search.match(/[?&]userId=([^&]+)/);
    if (urlMatch) return urlMatch[1];

    // 2. Depuis le localStorage/sessionStorage
    const storedUserId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (storedUserId) return storedUserId;

    // 3. Depuis un élément DOM avec data-user-id
    const userElement = document.querySelector("[data-user-id]");
    if (userElement) return userElement.dataset.userId;

    // 4. Depuis les cookies
    const userCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("userId="));
    if (userCookie) return userCookie.split("=")[1];

    // Fallback: générer un ID temporaire
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } catch (error) {
    log(`⚠️ Impossible d'extraire userId: ${error.message}`, "warning");
    return `user_unknown_${Date.now()}`;
  }
}

function extractChatId() {
  try {
    // Essayer plusieurs méthodes pour obtenir l'ID du chat
    // 1. Depuis l'URL (ex: /chat/456 ou ?chatId=456)
    const urlMatch =
      window.location.pathname.match(/\/chat\/([^\/]+)/) ||
      window.location.search.match(/[?&]chatId=([^&]+)/);
    if (urlMatch) return urlMatch[1];

    // 2. Depuis un élément DOM parent avec data-chat-id
    const chatElement = document.querySelector("[data-chat-id]");
    if (chatElement) return chatElement.dataset.chatId;

    // 3. Depuis le title ou un élément identifiant
    const chatTitle = document.querySelector(
      'h1, .chat-title, [class*="chat-title"]',
    );
    if (chatTitle && chatTitle.textContent) {
      const titleHash = chatTitle.textContent
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 15);
      if (titleHash) return `chat_${titleHash}`;
    }

    // 4. Depuis l'hash de l'URL
    if (window.location.hash) {
      const hashMatch = window.location.hash.match(/#chat-?([^\/\?&]+)/);
      if (hashMatch) return hashMatch[1];
    }

    // Fallback: générer un ID basé sur l'URL actuelle
    const pathHash = window.location.pathname
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 15);
    return pathHash || `chat_${Date.now()}`;
  } catch (error) {
    log(`⚠️ Impossible d'extraire chatId: ${error.message}`, "warning");
    return `chat_unknown_${Date.now()}`;
  }
}

function extractContainerId(table) {
  try {
    // Chercher le conteneur parent le plus proche avec un ID significatif
    let container = table.closest(
      '[id], [data-container-id], [class*="container"], .prose, .chat-message',
    );

    if (container) {
      // Utiliser l'ID existant si présent
      if (container.id) return container.id;

      // Utiliser data-container-id si présent
      if (container.dataset.containerId) return container.dataset.containerId;

      // Générer un ID basé sur la classe ou position
      const classes = Array.from(container.classList)
        .filter((cls) => cls.length > 2)
        .join("_")
        .substring(0, 20);

      if (classes) return `container_${classes}`;
    }

    // Fallback: utiliser la position dans le DOM
    const allTables = document.querySelectorAll("table");
    const tableIndex = Array.from(allTables).indexOf(table);

    return `container_pos_${tableIndex}`;
  } catch (error) {
    log(`⚠️ Impossible d'extraire containerId: ${error.message}`, "warning");
    return `container_unknown_${Date.now()}`;
  }
}

function generateTableId(table, index = 0) {
  try {
    // Vérifier s'il y a déjà un ID hiérarchique complet
    if (
      table.dataset.claraverseId &&
      table.dataset.claraverseId.includes("_")
    ) {
      return table.dataset.claraverseId;
    }

    // Extraire les identifiants hiérarchiques
    const userId = extractUserId();
    const chatId = extractChatId();
    const containerId = extractContainerId(table);

    // Générer l'ID basé sur la structure de la table
    const headers = Array.from(table.querySelectorAll("th, td"))
      .slice(0, 3) // Réduire à 3 pour éviter des IDs trop longs
      .map((cell) => cell.textContent.trim().substring(0, 8))
      .filter((text) => text.length > 0)
      .join("_");

    const position = {
      rows: table.rows.length,
      cols: table.rows[0]?.cells.length || 0,
    };

    // Créer un hash court des headers pour l'unicité
    const headersHash = headers.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 12);
    const structureId = `${headersHash}_${position.rows}x${position.cols}`;

    // Construire l'ID hiérarchique complet
    const hierarchicalId = `${userId}_${chatId}_${containerId}_${structureId}_${index}`;

    // Limiter la longueur totale tout en gardant les parties importantes
    const finalId =
      hierarchicalId.length > 80
        ? `${userId.substring(0, 10)}_${chatId.substring(0, 15)}_${containerId.substring(0, 15)}_${structureId}_${index}`
        : hierarchicalId;

    // Sauvegarder l'ID sur la table avec métadonnées
    table.dataset.claraverseId = finalId;
    table.dataset.userId = userId;
    table.dataset.chatId = chatId;
    table.dataset.containerId = containerId;

    log(`🆔 ID hiérarchique généré: ${finalId}`, "success");
    return finalId;
  } catch (error) {
    log(`❌ Erreur génération ID hiérarchique: ${error.message}`, "error");
    const fallbackId = `fallback_${extractUserId()}_${Date.now()}_${index}`;
    table.dataset.claraverseId = fallbackId;
    return fallbackId;
  }
}

/**
 * ========================================
 * PROCESSEUR DE TABLES AMÉLIORÉ
 * ========================================
 */
async function processTable(table, index) {
  try {
    const tableId = generateTableId(table, index);
    log(`🔄 Traitement table: ${tableId}`);

    // Marquer la table comme traité
    table.classList.add("claraverse-processed");
    table.dataset.processed = "true";
    table.dataset.timestamp = Date.now();

    // Ajouter l'indicateur visuel
    addTableIndicator(table, tableId);

    // Rendre les cellules éditables
    const cells = table.querySelectorAll("td, th");
    let editableCells = 0;

    cells.forEach((cell, cellIndex) => {
      if (!cell.querySelector("input, select, textarea, button")) {
        makeCellEditable(cell, tableId, cellIndex);
        editableCells++;
      }
    });

    log(`✅ Table ${tableId}: ${editableCells} cellules éditables`);

    // Programmer la restauration des données
    setTimeout(() => {
      restoreTableData(table, tableId);
    }, CONFIG.SYNC_DELAY);

    return { tableId, processed: true, editableCells };
  } catch (error) {
    log(`❌ Erreur traitement table ${index}: ${error.message}`, "error");
    return { processed: false, error: error.message };
  }
}

// Ajouter un indicateur visuel sur les tables
function addTableIndicator(table, tableId) {
  if (table.querySelector(".claraverse-indicator")) return;

  const indicator = document.createElement("div");
  indicator.className = "claraverse-indicator";
  indicator.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(45deg, #10b981, #059669);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  `;
  indicator.textContent = "📊 ÉDITABLE";
  indicator.title = `Table ID: ${tableId}`;

  // Positionner relativement le parent si nécessaire
  if (getComputedStyle(table).position === "static") {
    table.style.position = "relative";
  }

  table.appendChild(indicator);

  // Animation d'apparition
  setTimeout(() => {
    indicator.style.opacity = "0.8";
  }, 100);
}

// Rendre une cellule éditable
function makeCellEditable(cell, tableId, cellIndex) {
  const cellId = `${tableId}_cell_${cellIndex}`;

  cell.contentEditable = true;
  cell.dataset.cellId = cellId;
  cell.dataset.tableId = tableId;
  cell.dataset.originalContent = cell.textContent.trim();

  // Styles pour l'édition
  cell.style.transition = "all 0.2s ease";
  cell.addEventListener("focus", () => {
    cell.style.backgroundColor = "#f0f9ff";
    cell.style.outline = "2px solid #3b82f6";
  });

  cell.addEventListener("blur", () => {
    cell.style.backgroundColor = "";
    cell.style.outline = "";
  });

  attachCellEvents(cell, cellId, tableId);
}

// Attacher les événements aux cellules
function attachCellEvents(cell, cellId, tableId) {
  let saveTimeout;

  // Sauvegarder automatiquement après modification
  const handleInput = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveCellData(cell, cellId, tableId);
    }, 1000);
  };

  // Sauvegarder immédiatement en perdant le focus
  const handleBlur = () => {
    clearTimeout(saveTimeout);
    saveCellData(cell, cellId, tableId);
  };

  // Sélectionner tout le texte au focus
  const handleFocus = () => {
    selectAllCellText(cell);
  };

  // Sauvegarder avec Ctrl+S
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      clearTimeout(saveTimeout);
      saveCellData(cell, cellId, tableId);
      showQuickNotification("💾 Sauvegardé!");
    }
  };

  cell.addEventListener("input", handleInput);
  cell.addEventListener("blur", handleBlur);
  cell.addEventListener("focus", handleFocus);
  cell.addEventListener("keydown", handleKeyDown);

  // Nettoyer les événements précédents
  cell.removeEventListener("input", handleInput);
  cell.removeEventListener("blur", handleBlur);
  cell.removeEventListener("focus", handleFocus);
  cell.removeEventListener("keydown", handleKeyDown);

  // Réattacher
  cell.addEventListener("input", handleInput);
  cell.addEventListener("blur", handleBlur);
  cell.addEventListener("focus", handleFocus);
  cell.addEventListener("keydown", handleKeyDown);
}

// Sélectionner tout le texte d'une cellule
function selectAllCellText(cell) {
  if (window.getSelection && document.createRange) {
    const range = document.createRange();
    range.selectNodeContents(cell);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * ========================================
 * SYSTÈME DE SAUVEGARDE INTELLIGENT
 * ========================================
 */
async function saveCellData(cell, cellId, tableId) {
  try {
    const content = cell.textContent.trim();
    const html = cell.innerHTML;

    // Validation du contenu
    if (!content || content === "undefined" || !html || html === "undefined") {
      log(`⚠️ Sauvegarde ignorée: ${cellId} - contenu invalide`, "warning");
      return false;
    }

    const data = {
      content: content,
      html: html,
      cellId: cellId,
      tableId: tableId,
      originalContent: cell.dataset.originalContent,
      position: {
        row: cell.parentNode.rowIndex,
        col: cell.cellIndex,
      },
    };

    const storageKey = storageManager.generateStorageKey(tableId, cellId);
    const success = await storageManager.saveWithMeta(storageKey, data, {
      source: "dev",
      type: "cell_data",
    });

    if (success) {
      // Effet visuel de sauvegarde
      cell.style.backgroundColor = "#dcfce7";
      setTimeout(() => {
        if (document.activeElement !== cell) {
          cell.style.backgroundColor = "";
        }
      }, 1500);

      // Notifier les autres scripts
      notifyTableUpdate(tableId, cell.closest("table"), "dev");

      showQuickNotification("💾");
      return true;
    }

    return false;
  } catch (error) {
    log(`❌ Erreur sauvegarde ${cellId}: ${error.message}`, "error");
    showQuickNotification("❌");
    return false;
  }
}

/**
 * ========================================
 * FONCTIONS DE VALIDATION
 * ========================================
 */
function validateTableContext(table, tableId) {
  try {
    // Vérifier que la table existe et est dans le DOM
    if (!table || !table.isConnected) {
      log(`⚠️ Table ${tableId} non connectée au DOM`, "warning");
      return false;
    }

    // Vérifier que la table a des cellules
    const cells = table.querySelectorAll("td, th");
    if (cells.length === 0) {
      log(`⚠️ Table ${tableId} sans cellules`, "warning");
      return false;
    }

    return true;
  } catch (error) {
    log(`❌ Erreur validation contexte: ${error.message}`, "error");
    return false;
  }
}

function validateTableHierarchy(table, savedData, tableId) {
  try {
    // Validation basique - toujours accepter pour l'instant
    // On peut améliorer plus tard avec des vérifications strictes
    return true;
  } catch (error) {
    log(`❌ Erreur validation hiérarchie: ${error.message}`, "error");
    return false;
  }
}

function shouldRestoreContent(currentContent, savedContent) {
  try {
    // Ne pas restaurer si le contenu actuel est identique
    if (currentContent === savedContent) {
      return false;
    }

    // Ne pas restaurer si le contenu sauvegardé est vide ou invalide
    if (!savedContent || savedContent === "undefined" || savedContent === "") {
      return false;
    }

    // Restaurer dans tous les autres cas
    return true;
  } catch (error) {
    log(`❌ Erreur validation restauration: ${error.message}`, "error");
    return false;
  }
}

function sanitizeHtmlContent(html) {
  try {
    // Nettoyer le HTML pour éviter les injections
    const temp = document.createElement("div");
    temp.textContent = html;
    return temp.innerHTML;
  } catch (error) {
    log(`❌ Erreur sanitization HTML: ${error.message}`, "error");
    return "";
  }
}

/**
 * ========================================
 * SYSTÈME DE RESTAURATION ROBUSTE
 * ========================================
 */
async function restoreTableData(table, tableId) {
  try {
    log(`🔄 Restauration table: ${tableId}`);

    // Validation préalable de la table et de son contexte
    if (!validateTableContext(table, tableId)) {
      log(
        `❌ Contexte invalide pour table ${tableId} - restauration annulée`,
        "error",
      );
      return { restored: 0, failed: 0, error: "Invalid context" };
    }

    const cells = table.querySelectorAll("td[data-cell-id], th[data-cell-id]");
    let restoredCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    // Vérifier s'il existe des données pour cette table dans le contexte actuel
    const currentUserId = extractUserId();
    const currentChatId = extractChatId();
    const availableData = await storageManager.getDataByHierarchy(
      currentUserId,
      currentChatId,
      null,
    );

    // Filtrer les données correspondant à cette table
    const tableData = availableData.filter(
      (item) =>
        item.data.tableId &&
        item.data.tableId.includes(tableId.split("_").slice(-2).join("_")),
    );

    if (tableData.length === 0) {
      log(
        `ℹ️ Aucune donnée sauvegardée trouvée pour table ${tableId} dans le contexte actuel`,
        "info",
      );
      return { restored: 0, failed: 0, skipped: cells.length };
    }

    for (const cell of cells) {
      const cellId = cell.dataset.cellId;
      if (!cellId) continue;

      const success = await restoreCellDataWithRetry(cell, cellId, tableId);
      if (success) {
        restoredCount++;
      } else if (success === null) {
        skippedCount++; // Données non pertinentes pour ce contexte
      } else {
        failedCount++;
      }
    }

    log(
      `✅ Table ${tableId}: ${restoredCount} cellules restaurées, ${failedCount} échecs, ${skippedCount} ignorées`,
    );

    if (restoredCount > 0) {
      // Marquer la table comme restaurée avec métadonnées de contexte
      table.dataset.restored = "true";
      table.dataset.restoredAt = Date.now();
      table.dataset.restoredUserId = currentUserId;
      table.dataset.restoredChatId = currentChatId;

      // Effet visuel de restauration complète
      const indicator = table.querySelector(".claraverse-indicator");
      if (indicator) {
        indicator.style.background = "linear-gradient(45deg, #059669, #047857)";
        indicator.textContent = `📊 RESTAURÉE (${restoredCount}/${cells.length})`;
      }

      // Notifier la restauration réussie
      notifyTableUpdate(tableId, table, "dev-restore");
    }

    return {
      restored: restoredCount,
      failed: failedCount,
      skipped: skippedCount,
    };
  } catch (error) {
    log(`❌ Erreur restauration table ${tableId}: ${error.message}`, "error");
    return { restored: 0, failed: 0, error: error.message };
  }
}

async function restoreCellDataWithRetry(cell, cellId, tableId, attempt = 1) {
  try {
    const storageKey = storageManager.generateStorageKey(tableId, cellId);
    const savedData = await storageManager.loadWithValidation(storageKey);

    if (!savedData) {
      if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.RETRY_DELAY * attempt),
        );
        return restoreCellDataWithRetry(cell, cellId, tableId, attempt + 1);
      }
      return false;
    }

    // VALIDATION HIÉRARCHIQUE - Vérifier la cohérence des IDs
    const currentTable = cell.closest("table");
    if (!validateTableHierarchy(currentTable, savedData, tableId)) {
      log(
        `⚠️ Validation hiérarchique échouée pour ${cellId} - données ignorées`,
        "warning",
      );
      return false;
    }

    const contentToRestore = savedData.content || savedData.text;
    const currentContent = cell.textContent.trim();

    // Vérifier si la restauration est nécessaire et sécurisée
    if (
      contentToRestore &&
      contentToRestore !== "undefined" &&
      contentToRestore !== "" &&
      currentContent !== contentToRestore &&
      shouldRestoreContent(currentContent, contentToRestore)
    ) {
      // Restaurer le contenu avec validation
      if (savedData.html && savedData.html !== "undefined") {
        cell.innerHTML = sanitizeHtmlContent(savedData.html);
      } else {
        cell.textContent = contentToRestore;
      }

      // Marquer la cellule comme restaurée
      cell.dataset.restored = "true";
      cell.dataset.restoredFrom = savedData.source || "unknown";

      // Effet visuel de restauration
      cell.style.backgroundColor = "#dcfce7";
      cell.style.transition = "background-color 0.3s ease";

      setTimeout(() => {
        cell.style.backgroundColor = "";
      }, 2000);

      log(`✅ Restauré: ${cellId} = "${contentToRestore.substring(0, 30)}..."`);
      return true;
    }

    return false;
  } catch (error) {
    log(
      `❌ Erreur restauration ${cellId} (tentative ${attempt}): ${error.message}`,
      "error",
    );

    if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.RETRY_DELAY * attempt),
      );
      return restoreCellDataWithRetry(cell, cellId, tableId, attempt + 1);
    }

    return false;
  }
}

/**
 * ========================================
 * SYSTÈME DE RESTAURATION GLOBALE
 * ========================================
 */
async function restoreAllData() {
  try {
    log("🔄 Restauration globale initiée...");

    const tables = universalTableScan();
    let totalRestored = 0;
    let totalFailed = 0;

    for (const table of tables) {
      const tableId = generateTableId(table);
      const result = await restoreTableData(table, tableId);

      totalRestored += result.restored;
      totalFailed += result.failed;
    }

    log(
      `✅ Restauration globale terminée: ${totalRestored} cellules restaurées, ${totalFailed} échecs`,
    );

    if (totalRestored > 0) {
      showQuickNotification(`🔄 ${totalRestored} cellules restaurées`);
    }

    // Mettre à jour l'état de synchronisation
    syncState.lastSyncTimestamp = Date.now();

    return { restored: totalRestored, failed: totalFailed };
  } catch (error) {
    log(`❌ Erreur restauration globale: ${error.message}`, "error");
    return { restored: 0, failed: 0, error: error.message };
  }
}

/**
 * ========================================
 * API DE SYNCHRONISATION CENTRALISÉE
 * ========================================
 */
function setupSyncSystem() {
  log("🔗 Configuration du système de synchronisation centralisé");

  // Créer l'API globale de synchronisation
  window.claraverseSyncAPI = {
    // Version de l'API
    version: "3.0",

    // État de synchronisation
    getSyncState: () => ({ ...syncState }),

    // Notifier une modification de table
    notifyTableUpdate: (tableId, tableElement, source = "dev") => {
      const event = new CustomEvent("claraverse:table:updated", {
        detail: {
          tableId: tableId,
          table: tableElement,
          source: source,
          timestamp: Date.now(),
        },
      });
      document.dispatchEvent(event);
      log(`📢 Notification envoyée: ${tableId} par ${source}`);
    },

    // Forcer la sauvegarde d'une table
    forceSaveTable: async (tableElement) => {
      if (tableElement && tableElement.tagName === "TABLE") {
        const tableId = generateTableId(tableElement);
        const cells = tableElement.querySelectorAll(
          "td[data-cell-id], th[data-cell-id]",
        );

        let savedCount = 0;
        for (const cell of cells) {
          const cellId = cell.dataset.cellId;
          if (cellId) {
            const success = await saveCellData(cell, cellId, tableId);
            if (success) savedCount++;
          }
        }

        log(`💾 Sauvegarde forcée table ${tableId}: ${savedCount} cellules`);
        return savedCount;
      }
      return 0;
    },

    // Sauvegarder toutes les tables
    saveAllTables: async () => {
      const tables = universalTableScan();
      let totalSaved = 0;

      for (const table of tables) {
        const saved = await window.claraverseSyncAPI.forceSaveTable(table);
        totalSaved += saved;
      }

      log(
        `💾 Sauvegarde globale: ${totalSaved} cellules dans ${tables.length} tables`,
      );
      return totalSaved;
    },

    // Restaurer toutes les données
    restoreAllData: restoreAllData,

    // Obtenir les statistiques
    getStorageStats: () => storageManager.getStorageStats(),

    // Nettoyer les données
    cleanData: () => storageManager.cleanCorruptedData(),

    // Synchroniser avec les autres scripts
    syncWithScript: (scriptName) => {
      syncState.activeScripts.add(scriptName);
      log(`🔗 Script ${scriptName} synchronisé`);
    },
  };

  // Événements de synchronisation inter-scripts
  const eventHandlers = {
    "claraverse:table:updated": handleTableUpdate,
    "claraverse:consolidation:complete": handleConsolidationComplete,
    "claraverse:table:created": handleTableCreated,
    "claraverse:table:structure:changed": handleStructureChange,
    "claraverse:rapprochement:complete": handleRapprochementComplete,
  };

  Object.entries(eventHandlers).forEach(([eventType, handler]) => {
    document.addEventListener(eventType, handler);
  });

  log("✅ Système de synchronisation configuré");
}

// Gestionnaires d'événements
function handleTableUpdate(event) {
  const { tableId, source, timestamp } = event.detail;
  log(`📊 Table mise à jour: ${tableId} par ${source}`);

  // Programmer une sauvegarde différée si ce n'est pas nous
  if (source !== "dev") {
    setTimeout(() => {
      const table = document.querySelector(`[data-claraverse-id="${tableId}"]`);
      if (table) {
        window.claraverseSyncAPI.forceSaveTable(table);
      }
    }, CONFIG.SYNC_DELAY);
  }
}

function handleConsolidationComplete(event) {
  log("📊 Consolidation terminée, sauvegarde programmée");
  setTimeout(() => {
    window.claraverseSyncAPI.saveAllTables();
  }, CONFIG.SYNC_DELAY);
}

function handleTableCreated(event) {
  const { tableId } = event.detail;
  log(`🆕 Nouvelle table créée: ${tableId}`);

  setTimeout(() => {
    performScan();
  }, CONFIG.SYNC_DELAY);
}

function handleStructureChange(event) {
  log("🔄 Structure de table modifiée, re-scan programmé");
  setTimeout(() => {
    performScan();
  }, CONFIG.SYNC_DELAY);
}

function handleRapprochementComplete(event) {
  log("✅ Rapprochement terminé, sauvegarde programmée");
  setTimeout(() => {
    window.claraverseSyncAPI.saveAllTables();
  }, CONFIG.SYNC_DELAY);
}

function notifyTableUpdate(tableId, tableElement, source = "dev") {
  if (window.claraverseSyncAPI) {
    window.claraverseSyncAPI.notifyTableUpdate(tableId, tableElement, source);
  }
}

/**
 * ========================================
 * UTILITAIRES ET NOTIFICATIONS
 * ========================================
 */
function showQuickNotification(message, duration = 2000) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #059669, #047857);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    pointer-events: none;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animation d'entrée
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)";
  });

  // Animation de sortie et suppression
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

/**
 * ========================================
 * SYSTÈME DE SCANNING ET MONITORING
 * ========================================
 */
async function performScan() {
  try {
    log("🔍 Début du scan des tables...");

    const tables = universalTableScan();
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      // Ignorer les tables déjà traitées récemment
      const lastProcessed = parseInt(table.dataset.timestamp || "0");
      if (Date.now() - lastProcessed < 30000) {
        // 30 secondes
        continue;
      }

      const result = await processTable(table, i);
      if (result.processed) {
        processedCount++;
      } else {
        errorCount++;
      }
    }

    log(
      `✅ Scan terminé: ${processedCount} tables traitées, ${errorCount} erreurs`,
    );

    // Programmer la restauration des données après un délai
    setTimeout(() => {
      restoreAllData();
    }, CONFIG.SYNC_DELAY * 2);

    return {
      processed: processedCount,
      errors: errorCount,
      total: tables.length,
    };
  } catch (error) {
    log(`❌ Erreur scan global: ${error.message}`, "error");
    return { processed: 0, errors: 1, total: 0, error: error.message };
  }
}

// Observer les modifications du DOM
function startDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    let hasNewTables = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tables =
              node.tagName === "TABLE"
                ? [node]
                : node.querySelectorAll?.("table") || [];
            if (tables.length > 0) {
              hasNewTables = true;
            }
          }
        });
      }
    });

    if (hasNewTables) {
      log("👀 Nouvelles tables détectées, scan programmé");
      setTimeout(() => {
        performScan();
      }, CONFIG.SYNC_DELAY);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: false,
  });

  log("👁️ Observer DOM activé");
}

// Scan périodique pour sécurité
function startPeriodicScan() {
  setInterval(() => {
    if (document.hidden) return; // Pas de scan si page masquée

    const tables = universalTableScan();
    const unprocessedTables = tables.filter(
      (table) => !table.dataset.processed,
    );

    if (unprocessedTables.length > 0) {
      log(`🔄 Scan périodique: ${unprocessedTables.length} nouvelles tables`);
      performScan();
    }
  }, 10000); // Toutes les 10 secondes

  log("⏰ Scan périodique activé");
}

/**
 * ========================================
 * INITIALISATION ET API GLOBALE
 * ========================================
 */
async function initialize() {
  try {
    log("🚀 Initialisation ClaraVerse Dev.js v3.0...");

    // Marquer comme initialisé
    if (syncState.isInitialized) {
      log("⚠️ Déjà initialisé", "warning");
      return;
    }

    // Créer le gestionnaire de stockage
    window.storageManager = new CentralizedStorageManager();

    // Nettoyer les données corrompues au démarrage
    await storageManager.cleanCorruptedData();

    // Configurer le système de synchronisation
    setupSyncSystem();

    // Démarrer l'observer DOM
    startDOMObserver();

    // Démarrer le scan périodique
    startPeriodicScan();

    // Scan initial différé pour laisser le temps au DOM de se stabiliser
    setTimeout(async () => {
      log("📊 Démarrage du scan initial...");

      const scanResult = await performScan();
      log(`✅ Scan initial terminé: ${scanResult.processed} tables traitées`);

      // Restauration différée pour éviter les conflicts
      setTimeout(async () => {
        const restoreResult = await restoreAllData();
        log(
          `✅ Restauration terminée: ${restoreResult.restored} cellules restaurées`,
        );

        // Marquer l'initialisation comme terminée
        syncState.isInitialized = true;
        syncState.lastSyncTimestamp = Date.now();

        showQuickNotification("🚀 ClaraVerse Ready!");
      }, 1000);
    }, 2000);

    // Exposer l'API de debug
    window.claraverseDebug = {
      // État de synchronisation
      getSyncState: () => syncState,

      // Forcer un scan
      forceScan: performScan,

      // Forcer une restauration
      forceRestore: restoreAllData,

      // Statistiques de stockage
      getStats: () => storageManager.getStorageStats(),

      // Nettoyer les données
      cleanData: () => storageManager.cleanCorruptedData(),

      // Réinitialisation complète
      hardReset: async () => {
        log("🔥 RÉINITIALISATION COMPLÈTE...");

        // Supprimer toutes les données
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith(CONFIG.STORAGE_PREFIX) ||
            key.startsWith(CONFIG.SYNC_PREFIX) ||
            key.startsWith(CONFIG.META_PREFIX)
          ) {
            localStorage.removeItem(key);
          }
        });

        // Nettoyer les éléments DOM
        document
          .querySelectorAll("table[data-claraverse-id]")
          .forEach((table) => {
            delete table.dataset.claraverseId;
            delete table.dataset.processed;
            delete table.dataset.timestamp;
            table.classList.remove("claraverse-processed");

            const indicator = table.querySelector(".claraverse-indicator");
            if (indicator) {
              indicator.remove();
            }
          });

        document
          .querySelectorAll("td[contenteditable], th[contenteditable]")
          .forEach((cell) => {
            cell.contentEditable = false;
            delete cell.dataset.cellId;
            delete cell.dataset.tableId;
            cell.style.backgroundColor = "";
            cell.style.outline = "";
          });

        // Réinitialiser l'état
        syncState = {
          isInitialized: false,
          pendingRestores: new Set(),
          activeScripts: new Set(),
          lastSyncTimestamp: 0,
          retryQueue: new Map(),
        };

        log("✅ Réinitialisation terminée");

        // Relancer l'initialisation
        setTimeout(() => {
          initialize();
        }, 1000);
      },

      // Test de synchronisation avec les autres scripts
      testSync: () => {
        const testData = {
          timestamp: Date.now(),
          test: true,
          message: "Test de synchronisation ClaraVerse",
        };

        // Envoyer un événement test
        const event = new CustomEvent("claraverse:test:sync", {
          detail: testData,
        });
        document.dispatchEvent(event);

        log("📡 Test de synchronisation envoyé");
        return testData;
      },
    };

    log("✅ Initialisation ClaraVerse Dev.js terminée");
  } catch (error) {
    log(`❌ Erreur d'initialisation: ${error.message}`, "error");

    // Retry après délai en cas d'erreur
    setTimeout(() => {
      log("🔄 Tentative de réinitialisation...");
      initialize();
    }, 5000);
  }
}

/**
 * ========================================
 * AUTO-DÉMARRAGE ET GESTION DES ÉVÉNEMENTS
 * ========================================
 */

// Fonction de démarrage conditionnel
function startWhenReady() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initialize, 500);
    });
  } else {
    setTimeout(initialize, 500);
  }
}

// Gestion de la visibilité de la page
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && syncState.isInitialized) {
    // Page redevient visible, vérifier s'il faut synchroniser
    log("👁️ Page visible, vérification synchronisation...");
    setTimeout(() => {
      performScan();
    }, 1000);
  }
});

// Gestion avant fermeture/rechargement de page
window.addEventListener("beforeunload", () => {
  if (window.claraverseSyncAPI) {
    // Sauvegarde d'urgence
    window.claraverseSyncAPI.saveAllTables();
  }
});

// Gestion des erreurs globales
window.addEventListener("error", (event) => {
  if (event.error && event.error.message.includes("claraverse")) {
    log(`❌ Erreur globale ClaraVerse: ${event.error.message}`, "error");
  }
});

// Initialiser le gestionnaire de stockage global
const storageManager = new CentralizedStorageManager();

// Message de démarrage
log("📦 ClaraVerse Dev.js v3.0 chargé");
console.log(`
🎯 CLARAVERSE DEV.JS v3.0 - SYSTÈME CENTRALISÉ
===============================================
✨ Fonctionnalités:
   • Synchronisation inter-scripts améliorée
   • Persistance robuste avec retry
   • API unifiée pour menu.js et conso.js
   • Gestion intelligente des conflits

📊 Debug: window.claraverseDebug
🔗 API: window.claraverseSyncAPI

🚀 Initialisation automatique en cours...
`);

// Démarrer le système
startWhenReady();
