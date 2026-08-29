// ClaraVerse Auto-Restauration Intégrée
// Système d'auto-restauration intelligent intégré dans le cycle de vie de l'application
// Résout définitivement le problème de persistance des données après actualisation

(function() {
  "use strict";

  console.log("🔄 ClaraVerse Auto-Restauration Intégrée - Système intelligent");

  const AUTO_RESTORE_CONFIG = {
    DEBUG: true,
    RESTORE_INTERVALS: [1000, 3000, 6000, 10000], // Tentatives étalées
    MAX_RESTORE_ATTEMPTS: 10,
    CELL_CHECK_INTERVAL: 2000,
    MUTATION_DEBOUNCE: 500,
    SUCCESS_THRESHOLD: 0.8, // 80% de réussite pour considérer comme succès
    FORCE_RESTORE_AFTER: 15000 // Force après 15s si nécessaire
  };

  let autoRestoreState = {
    initialized: false,
    totalAttempts: 0,
    successfulRestores: 0,
    processedCells: new Set(),
    lastRestoreTime: 0,
    observers: [],
    intervals: [],
    restorationLog: []
  };

  function autoLog(message, type = "info", data = null) {
    if (!AUTO_RESTORE_CONFIG.DEBUG) return;

    const emoji = {
      info: "🔄",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      data: "📊",
      timing: "⏱️"
    };

    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${emoji[type]} [AutoRestore ${timestamp}] ${message}`;

    console.log(logMessage);
    if (data) console.log(data);

    // Garder un log des restaurations pour debug
    autoRestoreState.restorationLog.push({
      timestamp: Date.now(),
      type,
      message,
      data
    });

    // Limiter la taille du log
    if (autoRestoreState.restorationLog.length > 100) {
      autoRestoreState.restorationLog = autoRestoreState.restorationLog.slice(-50);
    }
  }

  // Calculer similarité pour matching intelligent
  function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  // Obtenir contexte détaillé d'une cellule
  function getCellContext(cell) {
    const table = cell.closest('table');
    const row = cell.closest('tr');
    if (!table || !row) return null;

    const allTables = Array.from(document.querySelectorAll('table'));
    const allRows = Array.from(table.querySelectorAll('tr'));
    const allCells = Array.from(row.children);

    return {
      tableIndex: allTables.indexOf(table),
      rowIndex: allRows.indexOf(row),
      cellIndex: allCells.indexOf(cell),
      tableId: table.dataset.claraverseTableId || table.id || `table_${allTables.indexOf(table)}`,
      rowSignature: Array.from(row.children).map(c => c.textContent?.trim()?.substring(0, 20) || '').join('|'),
      tableSignature: table.textContent?.trim()?.substring(0, 100) || ''
    };
  }

  // Stratégies de matching avancées
  async function findMatchingData(cell, allData) {
    const context = getCellContext(cell);
    if (!context) return null;

    const currentContent = cell.textContent?.trim() || '';
    const cellId = cell.dataset.cellId;

    // Stratégie 1: ID exact
    if (cellId) {
      const exactMatch = allData.find(data => data.cellId === cellId);
      if (exactMatch) {
        autoLog(`Correspondance exacte trouvée: ${cellId}`);
        return { data: exactMatch, strategy: 'exact_id', confidence: 1.0 };
      }
    }

    // Stratégie 2: Position dans table
    const positionMatches = allData.filter(data => {
      if (!data.cellIndex || !data.tableId) return false;
      return data.cellIndex === context.cellIndex;
    });

    if (positionMatches.length > 0) {
      // Prendre le plus récent par timestamp
      const mostRecent = positionMatches.reduce((latest, current) =>
        (current.timestamp || 0) > (latest.timestamp || 0) ? current : latest
      );

      autoLog(`Correspondance position: table ${context.tableIndex}, cell ${context.cellIndex}`);
      return { data: mostRecent, strategy: 'position_match', confidence: 0.8 };
    }

    // Stratégie 3: Similarité de contenu (si cellule pas vide)
    if (currentContent.length > 3) {
      let bestMatch = null;
      let bestSimilarity = 0;

      allData.forEach(data => {
        const savedContent = (data.content || data.text || '').replace(/<[^>]*>/g, '').trim();
        if (savedContent.length < 3) return;

        const similarity = calculateSimilarity(currentContent, savedContent);
        if (similarity > 0.7 && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = data;
        }
      });

      if (bestMatch) {
        autoLog(`Correspondance contenu: ${bestSimilarity.toFixed(2)}`);
        return { data: bestMatch, strategy: 'content_similarity', confidence: bestSimilarity };
      }
    }

    // Stratégie 4: Contexte de ligne
    const contextMatches = allData.filter(data => {
      if (!data.tableId) return false;

      // Essayer de matcher sur base du contexte de table
      const tableMatch = data.tableId.includes(context.tableId) ||
                         context.tableId.includes(data.tableId) ||
                         data.tableId.includes(`table_${context.tableIndex}`);

      return tableMatch;
    });

    if (contextMatches.length > 0) {
      // Prendre le plus proche en position
      const bestContextMatch = contextMatches.reduce((best, current) => {
        const currentDiff = Math.abs((current.cellIndex || 0) - context.cellIndex);
        const bestDiff = Math.abs((best.cellIndex || 0) - context.cellIndex);
        return currentDiff < bestDiff ? current : best;
      });

      autoLog(`Correspondance contexte: ${bestContextMatch.cellId}`);
      return { data: bestContextMatch, strategy: 'context_match', confidence: 0.6 };
    }

    return null;
  }

  // Restaurer une cellule spécifique
  async function restoreCell(cell, matchResult) {
    try {
      const { data, strategy, confidence } = matchResult;
      const currentContent = cell.textContent?.trim() || '';
      const savedContent = (data.content || data.text || '').trim();

      // Vérifier si restauration nécessaire
      if (currentContent === savedContent) {
        return { success: false, reason: 'content_identical' };
      }

      // Éviter d'écraser du contenu récent
      const now = Date.now();
      const dataAge = now - (data.timestamp || 0);

      if (currentContent.length > 0 && dataAge > 7200000) { // 2 heures
        return { success: false, reason: 'data_too_old' };
      }

      // Appliquer la restauration
      if (data.content && data.content !== "undefined") {
        cell.innerHTML = data.content;
      } else if (data.text && data.text !== "undefined") {
        cell.textContent = data.text;
      } else {
        return { success: false, reason: 'no_valid_content' };
      }

      // Assigner l'ID pour éviter confusion future
      if (!cell.dataset.cellId) {
        cell.dataset.cellId = data.cellId;
      }

      // Effet visuel subtil
      cell.style.backgroundColor = "#ecfdf5";
      cell.style.transition = "background-color 0.3s ease";
      setTimeout(() => {
        cell.style.backgroundColor = "";
      }, 1500);

      autoLog(`✅ Restauré via ${strategy} (${confidence.toFixed(2)}): ${data.cellId}`, "success");

      return {
        success: true,
        strategy,
        confidence,
        cellId: data.cellId,
        contentLength: savedContent.length
      };

    } catch (error) {
      autoLog(`❌ Erreur restauration: ${error.message}`, "error");
      return { success: false, reason: 'restore_error', error: error.message };
    }
  }

  // Processus principal d'auto-restauration
  async function performAutoRestore(options = {}) {
    const {
      forceAll = false,
      maxCells = 50,
      onlyEmpty = true
    } = options;

    autoLog(`🚀 Auto-restauration (tentative ${autoRestoreState.totalAttempts + 1})`);
    autoRestoreState.totalAttempts++;
    autoRestoreState.lastRestoreTime = Date.now();

    try {
      // Vérifier disponibilité API
      if (!window.ClaraVerse?.TablePersistence?.db?.getAll) {
        throw new Error("API ClaraVerse non disponible");
      }

      // Récupérer données IndexedDB
      const allData = await window.ClaraVerse.TablePersistence.db.getAll();
      if (allData.length === 0) {
        autoLog("Aucune donnée à restaurer");
        return { restored: 0, processed: 0, reason: 'no_data' };
      }

      // Trouver cellules éditables
      const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
      if (editableCells.length === 0) {
        autoLog("Aucune cellule éditable trouvée");
        return { restored: 0, processed: 0, reason: 'no_cells' };
      }

      autoLog(`📊 ${allData.length} données, ${editableCells.length} cellules`);

      // Filtrer les cellules à traiter
      let cellsToProcess = Array.from(editableCells);

      if (onlyEmpty && !forceAll) {
        cellsToProcess = cellsToProcess.filter(cell => {
          const content = cell.textContent?.trim() || '';
          const cellId = cell.dataset.cellId;
          const alreadyProcessed = autoRestoreState.processedCells.has(cellId);
          return content.length === 0 && !alreadyProcessed;
        });
      }

      // Limiter le nombre pour performance
      cellsToProcess = cellsToProcess.slice(0, maxCells);

      autoLog(`Traitement de ${cellsToProcess.length} cellules`);

      let restored = 0;
      const usedData = new Set();
      const results = {
        restored: 0,
        processed: cellsToProcess.length,
        strategies: {},
        failures: []
      };

      // Traiter chaque cellule
      for (const cell of cellsToProcess) {
        try {
          const matchResult = await findMatchingData(cell, allData);

          if (matchResult && !usedData.has(matchResult.data.cellId)) {
            const restoreResult = await restoreCell(cell, matchResult);

            if (restoreResult.success) {
              restored++;
              usedData.add(matchResult.data.cellId);
              autoRestoreState.processedCells.add(cell.dataset.cellId || matchResult.cellId);

              // Comptabiliser stratégies
              if (!results.strategies[restoreResult.strategy]) {
                results.strategies[restoreResult.strategy] = 0;
              }
              results.strategies[restoreResult.strategy]++;

            } else {
              results.failures.push({
                cellId: cell.dataset.cellId,
                reason: restoreResult.reason
              });
            }
          }

          // Petit délai pour ne pas bloquer l'UI
          if (restored % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }

        } catch (cellError) {
          autoLog(`Erreur cellule: ${cellError.message}`, "warning");
          results.failures.push({
            cellId: cell.dataset.cellId,
            reason: 'processing_error',
            error: cellError.message
          });
        }
      }

      results.restored = restored;
      autoRestoreState.successfulRestores += restored;

      // Log du résultat
      if (restored > 0) {
        autoLog(`🎯 Auto-restauration réussie: ${restored}/${cellsToProcess.length}`, "success", results.strategies);

        // Notification discrète
        showAutoRestoreNotification(restored);

        // Déclencher sauvegarde après restauration
        setTimeout(() => {
          if (window.ClaraVerse?.TablePersistence?.scan) {
            window.ClaraVerse.TablePersistence.scan();
          }
        }, 1000);

      } else {
        autoLog(`Aucune restauration effectuée sur ${cellsToProcess.length} cellules`, "warning");
      }

      return results;

    } catch (error) {
      autoLog(`❌ Erreur auto-restauration: ${error.message}`, "error");
      return { restored: 0, processed: 0, error: error.message };
    }
  }

  // Notification discrète
  function showAutoRestoreNotification(count) {
    let notification = document.getElementById("claraverse-auto-restore-notification");

    if (!notification) {
      notification = document.createElement("div");
      notification.id = "claraverse-auto-restore-notification";
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(45deg, #10b981, #059669);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: system-ui;
        font-size: 12px;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(notification);
    }

    notification.textContent = `🔄 ${count} données auto-restaurées`;
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(20px)";
    }, 3000);
  }

  // Observer des mutations DOM
  function setupDOMObserver() {
    if (!window.MutationObserver) return;

    let debounceTimeout = null;

    const observer = new MutationObserver((mutations) => {
      let shouldRestore = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.tagName === 'TABLE' ||
                  node.querySelector?.('table') ||
                  node.querySelector?.('td[contenteditable="true"]')) {
                shouldRestore = true;
              }
            }
          });
        }
      });

      if (shouldRestore) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          autoLog("Nouvelles tables détectées via mutation observer");
          performAutoRestore({ onlyEmpty: true });
        }, AUTO_RESTORE_CONFIG.MUTATION_DEBOUNCE);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    autoRestoreState.observers.push(observer);
    autoLog("Observer DOM configuré");
  }

  // Système d'intervalles intelligents
  function setupIntelligentIntervals() {
    AUTO_RESTORE_CONFIG.RESTORE_INTERVALS.forEach((interval, index) => {
      const timeoutId = setTimeout(async () => {
        autoLog(`Restauration programmée #${index + 1} (${interval}ms)`, "timing");

        const result = await performAutoRestore({
          onlyEmpty: true,
          maxCells: 30 - (index * 5) // Réduire progressivement
        });

        // Si succès significatif, réduire la fréquence des tentatives suivantes
        if (result.restored > 5) {
          autoLog("Succès significatif, réduction fréquence");
        }

      }, interval);

      autoRestoreState.intervals.push(timeoutId);
    });

    // Force restore après délai si pas assez de succès
    const forceTimeout = setTimeout(async () => {
      const successRate = autoRestoreState.successfulRestores / autoRestoreState.totalAttempts;

      if (successRate < AUTO_RESTORE_CONFIG.SUCCESS_THRESHOLD) {
        autoLog("Taux de succès faible, restauration forcée", "warning");
        await performAutoRestore({
          forceAll: true,
          onlyEmpty: false,
          maxCells: 100
        });
      }
    }, AUTO_RESTORE_CONFIG.FORCE_RESTORE_AFTER);

    autoRestoreState.intervals.push(forceTimeout);
  }

  // Écouter les événements de l'application
  function setupApplicationListeners() {
    // Initialisation complète
    document.addEventListener('claraverse:initialized', async (event) => {
      autoLog("Application initialisée, auto-restauration...");
      setTimeout(() => performAutoRestore({ onlyEmpty: true }), 500);
    });

    // Nouvelles tables
    document.addEventListener('claraverse:table:created', async (event) => {
      autoLog("Nouvelle table créée");
      setTimeout(() => performAutoRestore({ onlyEmpty: true }), 200);
    });

    // Fin de consolidation
    document.addEventListener('claraverse:consolidation:complete', async (event) => {
      autoLog("Consolidation terminée");
      setTimeout(() => performAutoRestore({ onlyEmpty: true }), 1000);
    });

    // Changements de structure
    document.addEventListener('claraverse:table:updated', async (event) => {
      autoLog("Table mise à jour");
      setTimeout(() => performAutoRestore({ onlyEmpty: true }), 300);
    });

    // Sauvegarde terminée
    document.addEventListener('claraverse:save:complete', async (event) => {
      autoLog("Sauvegarde terminée, vérification restauration");
      setTimeout(() => performAutoRestore({ onlyEmpty: true, maxCells: 20 }), 500);
    });

    autoLog("Listeners d'événements configurés");
  }

  // Nettoyage et arrêt
  function cleanup() {
    autoRestoreState.observers.forEach(observer => observer.disconnect());
    autoRestoreState.intervals.forEach(id => clearTimeout(id));
    autoRestoreState.observers = [];
    autoRestoreState.intervals = [];
    autoLog("Nettoyage effectué");
  }

  // Initialisation principale
  async function initAutoRestore() {
    if (autoRestoreState.initialized) {
      autoLog("Déjà initialisé");
      return;
    }

    autoLog("🚀 Initialisation auto-restauration intégrée");

    try {
      // Attendre que le DOM soit prêt
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Attendre l'API ClaraVerse
      let apiWaitAttempts = 0;
      while (!window.ClaraVerse?.TablePersistence?.isInitialized?.() && apiWaitAttempts < 10) {
        autoLog(`Attente API ClaraVerse (tentative ${apiWaitAttempts + 1})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        apiWaitAttempts++;
      }

      if (!window.ClaraVerse?.TablePersistence?.isInitialized?.()) {
        throw new Error("API ClaraVerse non disponible après attente");
      }

      autoLog("API ClaraVerse disponible");

      // Configuration des composants
      setupApplicationListeners();
      setupDOMObserver();
      setupIntelligentIntervals();

      // Première restauration après court délai
      setTimeout(() => {
        performAutoRestore({ onlyEmpty: true });
      }, 1500);

      autoRestoreState.initialized = true;
      autoLog("✅ Auto-restauration intégrée initialisée avec succès!", "success");

    } catch (error) {
      autoLog(`❌ Erreur initialisation: ${error.message}`, "error");
    }
  }

  // Vérification périodique de santé
  function setupHealthCheck() {
    const healthInterval = setInterval(async () => {
      const editableCells = document.querySelectorAll('td[contenteditable="true"], th[contenteditable="true"]');
      const emptyCells = Array.from(editableCells).filter(cell => !cell.textContent?.trim());

      if (emptyCells.length > 10 && window.ClaraVerse?.TablePersistence?.db) {
        try {
          const allData = await window.ClaraVerse.TablePersistence.db.getAll();
          if (allData.length > emptyCells.length) {
            autoLog(`Santé: ${emptyCells.length} cellules vides, ${allData.length} données disponibles`);
            performAutoRestore({ onlyEmpty: true, maxCells: 15 });
          }
        } catch (error) {
          // Ignorer les erreurs de vérification de santé
        }
      }
    }, 30000); // Toutes les 30 secondes

    autoRestoreState.intervals.push(healthInterval);
  }

  // Exposer l'API
  window.ClaraVerseAutoRestore = {
    restore: performAutoRestore,
    getState: () => ({ ...autoRestoreState }),
    getLog: () => autoRestoreState.restorationLog,
    restart: () => {
      cleanup();
      autoRestoreState.initialized = false;
      initAutoRestore();
    },
    cleanup: cleanup
  };

  // Auto-initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initAutoRestore, 100);
    });
  } else {
    setTimeout(initAutoRestore, 100);
  }

  // Nettoyage à la fermeture
  window.addEventListener('beforeunload', cleanup);

  // Configuration de la vérification de santé
  setTimeout(setupHealthCheck, 10000);

  autoLog("🔄 Auto-restauration intégrée chargée - Initialisation en cours...");

})();
