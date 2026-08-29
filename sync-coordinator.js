/**
 * ========================================
 * CLARAVERSE SYNC COORDINATOR v1.0
 * ========================================
 *
 * Script de coordination centrale pour synchroniser:
 * - dev.js (persistance des cellules)
 * - conso.js (consolidation et calculs)
 * - menu.js (modifications structurelles)
 *
 * Objectifs:
 * - Éliminer les race conditions
 * - Coordonner les sauvegardes/restaurations
 * - Gérer les timeouts intelligemment
 * - Assurer la cohérence des données
 */

(function() {
  'use strict';

  // Configuration globale
  const COORDINATOR_CONFIG = {
    VERSION: '1.0.0',
    DEBUG: true,

    // Timeouts et délais
    INIT_DELAY: 1000,
    SYNC_DELAY: 300,
    RETRY_DELAY: 500,
    MAX_RETRIES: 3,
    BATCH_DELAY: 100,

    // Événements de coordination
    EVENTS: {
      COORDINATOR_READY: 'claraverse:coordinator:ready',
      SCRIPT_REGISTERED: 'claraverse:script:registered',
      SYNC_REQUEST: 'claraverse:sync:request',
      SYNC_COMPLETE: 'claraverse:sync:complete',
      DATA_CONFLICT: 'claraverse:data:conflict',
      BATCH_OPERATION: 'claraverse:batch:operation'
    },

    // Priorités de synchronisation
    SCRIPT_PRIORITIES: {
      'coordinator': 0,
      'dev': 1,
      'conso': 2,
      'menu': 3
    }
  };

  // État global du coordinateur
  let coordinatorState = {
    isInitialized: false,
    registeredScripts: new Map(),
    pendingOperations: new Map(),
    syncQueue: [],
    currentBatch: null,
    lastSyncTimestamp: 0,
    conflictHistory: [],
    performanceMetrics: {
      totalSyncs: 0,
      avgSyncTime: 0,
      conflicts: 0,
      retries: 0
    }
  };

  /**
   * ========================================
   * SYSTÈME DE LOGGING CENTRALISÉ
   * ========================================
   */
  function log(message, level = 'info', context = 'COORDINATOR') {
    if (!COORDINATOR_CONFIG.DEBUG && level !== 'error') return;

    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍',
      sync: '🔄',
      batch: '📦'
    };

    console.log(`[${timestamp}] ${emoji[level] || '📝'} [${context}] ${message}`);
  }

  /**
   * ========================================
   * GESTIONNAIRE D'ÉVÉNEMENTS CENTRALISÉ
   * ========================================
   */
  class EventCoordinator {
    constructor() {
      this.listeners = new Map();
      this.eventHistory = [];
      this.setupGlobalListeners();
    }

    setupGlobalListeners() {
      // Écouter tous les événements ClaraVerse
      const claraverseEvents = [
        'claraverse:table:updated',
        'claraverse:consolidation:complete',
        'claraverse:table:created',
        'claraverse:table:structure:changed',
        'claraverse:rapprochement:complete',
        'claraverse:save:complete',
        'claraverse:restore:complete'
      ];

      claraverseEvents.forEach(eventType => {
        document.addEventListener(eventType, (event) => {
          this.handleClaraverseEvent(eventType, event);
        });
      });

      log('🎧 Listeners globaux configurés');
    }

    handleClaraverseEvent(eventType, event) {
      const eventData = {
        type: eventType,
        timestamp: Date.now(),
        source: event.detail?.source || 'unknown',
        data: event.detail
      };

      this.eventHistory.push(eventData);

      // Garder seulement les 100 derniers événements
      if (this.eventHistory.length > 100) {
        this.eventHistory.shift();
      }

      log(`📡 Événement reçu: ${eventType} de ${eventData.source}`, 'sync');

      // Traiter l'événement selon son type
      this.processEvent(eventData);
    }

    processEvent(eventData) {
      switch(eventData.type) {
        case 'claraverse:table:updated':
          this.handleTableUpdate(eventData);
          break;
        case 'claraverse:consolidation:complete':
          this.handleConsolidationComplete(eventData);
          break;
        case 'claraverse:save:complete':
          this.handleSaveComplete(eventData);
          break;
        default:
          // Événement générique - programmer synchronisation
          this.scheduleSynchronization(eventData.source, 'generic_event');
      }
    }

    handleTableUpdate(eventData) {
      const { source, data } = eventData;
      const { tableId, table } = data;

      log(`📊 Table ${tableId} mise à jour par ${source}`);

      // Éviter les boucles de synchronisation
      if (source === 'coordinator') return;

      // Programmer une synchronisation différée
      this.scheduleSynchronization(source, 'table_update', {
        tableId,
        table,
        priority: COORDINATOR_CONFIG.SCRIPT_PRIORITIES[source] || 99
      });
    }

    handleConsolidationComplete(eventData) {
      const { source, data } = eventData;

      log(`📊 Consolidation terminée par ${source}`);

      // Forcer une synchronisation de toutes les tables affectées
      this.scheduleSynchronization('all', 'consolidation_complete', {
        priority: 1, // Haute priorité
        affectedTables: data.consolidationTables
      });
    }

    handleSaveComplete(eventData) {
      const { source, data } = eventData;

      log(`💾 Sauvegarde terminée par ${source}: ${data.savedCells}/${data.totalCells} cellules`);

      // Notifier les autres scripts de la sauvegarde
      this.notifyScripts(COORDINATOR_CONFIG.EVENTS.SYNC_COMPLETE, {
        source: source,
        operation: 'save',
        stats: data
      });
    }

    scheduleSynchronization(source, operation, options = {}) {
      const syncId = `${source}_${operation}_${Date.now()}`;
      const syncData = {
        id: syncId,
        source: source,
        operation: operation,
        timestamp: Date.now(),
        priority: options.priority || 5,
        data: options,
        retries: 0
      };

      coordinatorState.syncQueue.push(syncData);

      // Trier par priorité (plus faible = plus prioritaire)
      coordinatorState.syncQueue.sort((a, b) => a.priority - b.priority);

      log(`🔄 Synchronisation programmée: ${syncId}`, 'sync');

      // Traiter la queue avec délai
      clearTimeout(this.syncTimeout);
      this.syncTimeout = setTimeout(() => {
        this.processSyncQueue();
      }, COORDINATOR_CONFIG.SYNC_DELAY);
    }

    async processSyncQueue() {
      if (coordinatorState.syncQueue.length === 0) return;

      const currentSync = coordinatorState.syncQueue.shift();
      const startTime = Date.now();

      try {
        log(`⚡ Traitement sync: ${currentSync.id}`, 'sync');

        await this.executeSync(currentSync);

        // Métriques de performance
        const duration = Date.now() - startTime;
        this.updatePerformanceMetrics(duration, true);

        log(`✅ Sync terminée: ${currentSync.id} (${duration}ms)`, 'success');

      } catch (error) {
        log(`❌ Erreur sync ${currentSync.id}: ${error.message}`, 'error');

        // Retry si possible
        if (currentSync.retries < COORDINATOR_CONFIG.MAX_RETRIES) {
          currentSync.retries++;
          currentSync.timestamp = Date.now();

          // Remettre en queue avec délai
          setTimeout(() => {
            coordinatorState.syncQueue.unshift(currentSync);
            this.processSyncQueue();
          }, COORDINATOR_CONFIG.RETRY_DELAY * currentSync.retries);

          coordinatorState.performanceMetrics.retries++;
          log(`🔄 Retry sync ${currentSync.id} (tentative ${currentSync.retries})`, 'warning');
        } else {
          log(`💀 Sync abandonnée: ${currentSync.id}`, 'error');
        }
      }

      // Traiter le prochain élément si présent
      if (coordinatorState.syncQueue.length > 0) {
        setTimeout(() => {
          this.processSyncQueue();
        }, COORDINATOR_CONFIG.BATCH_DELAY);
      }
    }

    async executeSync(syncData) {
      const { source, operation, data } = syncData;

      switch(operation) {
        case 'table_update':
          await this.syncTableUpdate(data);
          break;
        case 'consolidation_complete':
          await this.syncConsolidationComplete(data);
          break;
        case 'generic_event':
          await this.syncGenericEvent(source, data);
          break;
        default:
          log(`⚠️ Type de sync non reconnu: ${operation}`, 'warning');
      }
    }

    async syncTableUpdate(data) {
      const { tableId, table } = data;

      // Notifier dev.js pour sauvegarde
      if (window.claraverseSyncAPI) {
        await window.claraverseSyncAPI.forceSaveTable(table);
        log(`💾 Table ${tableId} sauvegardée via dev.js`);
      }

      // Notifier conso.js si table de consolidation
      if (table.classList.contains('claraverse-conso-table') && window.claraverseProcessor) {
        window.claraverseProcessor.saveTableData(table, tableId);
        log(`📊 Table consolidation ${tableId} synchronisée`);
      }
    }

    async syncConsolidationComplete(data) {
      const { affectedTables } = data;

      // Sauvegarder toutes les tables affectées
      if (window.claraverseSyncAPI && affectedTables) {
        for (const table of affectedTables) {
          await window.claraverseSyncAPI.forceSaveTable(table);
        }
        log(`💾 ${affectedTables.length} tables consolidées sauvegardées`);
      }

      // Forcer scan complet des tables
      if (window.claraverseDebug) {
        setTimeout(() => {
          window.claraverseDebug.forceScan();
        }, COORDINATOR_CONFIG.SYNC_DELAY);
      }
    }

    async syncGenericEvent(source, data) {
      // Synchronisation générique - sauvegarder toutes les données
      log(`🔄 Synchronisation générique de ${source}`);

      if (window.claraverseSyncAPI) {
        await window.claraverseSyncAPI.saveAllTables();
      }
    }

    notifyScripts(eventType, data) {
      const event = new CustomEvent(eventType, {
        detail: {
          ...data,
          source: 'coordinator',
          timestamp: Date.now()
        }
      });

      document.dispatchEvent(event);
      log(`📢 Notification envoyée: ${eventType}`);
    }

    updatePerformanceMetrics(duration, success) {
      const metrics = coordinatorState.performanceMetrics;

      metrics.totalSyncs++;

      if (success) {
        // Moyenne mobile des temps de sync
        metrics.avgSyncTime = ((metrics.avgSyncTime * (metrics.totalSyncs - 1)) + duration) / metrics.totalSyncs;
      }
    }
  }

  /**
   * ========================================
   * GESTIONNAIRE DE BATCH OPERATIONS
   * ========================================
   */
  class BatchOperationManager {
    constructor() {
      this.currentBatch = null;
      this.batchQueue = [];
    }

    createBatch(batchId, operations = []) {
      const batch = {
        id: batchId,
        operations: operations,
        status: 'pending',
        startTime: null,
        endTime: null,
        results: []
      };

      this.batchQueue.push(batch);
      log(`📦 Batch créé: ${batchId} avec ${operations.length} opérations`, 'batch');

      return batch;
    }

    async executeBatch(batchId) {
      const batch = this.batchQueue.find(b => b.id === batchId);
      if (!batch) {
        log(`❌ Batch introuvable: ${batchId}`, 'error');
        return null;
      }

      batch.status = 'running';
      batch.startTime = Date.now();
      this.currentBatch = batch;

      log(`📦 Exécution batch: ${batchId}`, 'batch');

      try {
        for (const operation of batch.operations) {
          const result = await this.executeOperation(operation);
          batch.results.push(result);
        }

        batch.status = 'completed';
        batch.endTime = Date.now();

        log(`✅ Batch terminé: ${batchId} (${batch.endTime - batch.startTime}ms)`, 'success');

        // Notifier la completion
        this.notifyBatchComplete(batch);

        return batch;

      } catch (error) {
        batch.status = 'failed';
        batch.endTime = Date.now();
        batch.error = error.message;

        log(`❌ Batch échoué: ${batchId} - ${error.message}`, 'error');
        return batch;
      } finally {
        this.currentBatch = null;
      }
    }

    async executeOperation(operation) {
      const { type, target, action, params } = operation;

      switch(type) {
        case 'save':
          return await this.executeSaveOperation(target, params);
        case 'restore':
          return await this.executeRestoreOperation(target, params);
        case 'sync':
          return await this.executeSyncOperation(target, action, params);
        default:
          throw new Error(`Type d'opération non supporté: ${type}`);
      }
    }

    async executeSaveOperation(target, params) {
      if (target === 'all' && window.claraverseSyncAPI) {
        return await window.claraverseSyncAPI.saveAllTables();
      } else if (target === 'table' && params.table && window.claraverseSyncAPI) {
        return await window.claraverseSyncAPI.forceSaveTable(params.table);
      }
      return null;
    }

    async executeRestoreOperation(target, params) {
      if (target === 'all' && window.claraverseSyncAPI) {
        return await window.claraverseSyncAPI.restoreAllData();
      }
      return null;
    }

    async executeSyncOperation(target, action, params) {
      // Opération de synchronisation personnalisée
      log(`🔄 Sync operation: ${action} sur ${target}`);
      return { success: true, message: `Sync ${action} exécutée` };
    }

    notifyBatchComplete(batch) {
      const event = new CustomEvent(COORDINATOR_CONFIG.EVENTS.BATCH_OPERATION, {
        detail: {
          batchId: batch.id,
          status: batch.status,
          duration: batch.endTime - batch.startTime,
          results: batch.results,
          source: 'coordinator'
        }
      });

      document.dispatchEvent(event);
    }
  }

  /**
   * ========================================
   * COORDINATEUR PRINCIPAL
   * ========================================
   */
  class SyncCoordinator {
    constructor() {
      this.eventCoordinator = new EventCoordinator();
      this.batchManager = new BatchOperationManager();
      this.healthCheck = {
        lastCheck: 0,
        scriptsStatus: new Map(),
        issues: []
      };
    }

    async initialize() {
      try {
        log('🚀 Initialisation du coordinateur de synchronisation...');

        // Attendre que le DOM soit prêt
        await this.waitForDOM();

        // Configurer l'API globale
        this.setupGlobalAPI();

        // Démarrer le monitoring de santé
        this.startHealthMonitoring();

        // Démarrer la détection des scripts
        this.startScriptDetection();

        // Marquer comme initialisé
        coordinatorState.isInitialized = true;
        coordinatorState.lastSyncTimestamp = Date.now();

        // Notifier que le coordinateur est prêt
        this.notifyCoordinatorReady();

        log('✅ Coordinateur de synchronisation initialisé');

      } catch (error) {
        log(`❌ Erreur initialisation coordinateur: ${error.message}`, 'error');

        // Retry après délai
        setTimeout(() => {
          this.initialize();
        }, COORDINATOR_CONFIG.INIT_DELAY);
      }
    }

    async waitForDOM() {
      return new Promise((resolve) => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve);
        } else {
          resolve();
        }
      });
    }

    setupGlobalAPI() {
      // API principale du coordinateur
      window.claraverseCoordinator = {
        version: COORDINATOR_CONFIG.VERSION,

        // État du coordinateur
        getState: () => ({ ...coordinatorState }),

        // Enregistrer un script
        registerScript: (scriptName, api) => {
          coordinatorState.registeredScripts.set(scriptName, {
            name: scriptName,
            api: api,
            registeredAt: Date.now(),
            lastActivity: Date.now(),
            status: 'active'
          });

          log(`🔗 Script enregistré: ${scriptName}`);

          this.eventCoordinator.notifyScripts(COORDINATOR_CONFIG.EVENTS.SCRIPT_REGISTERED, {
            scriptName: scriptName
          });
        },

        // Demander une synchronisation
        requestSync: (source, operation, data) => {
          this.eventCoordinator.scheduleSynchronization(source, operation, data);
        },

        // Créer une batch operation
        createBatch: (batchId, operations) => {
          return this.batchManager.createBatch(batchId, operations);
        },

        // Exécuter une batch
        executeBatch: (batchId) => {
          return this.batchManager.executeBatch(batchId);
        },

        // Obtenir les métriques
        getMetrics: () => ({
          ...coordinatorState.performanceMetrics,
          queueLength: coordinatorState.syncQueue.length,
          registeredScripts: coordinatorState.registeredScripts.size,
          uptime: Date.now() - coordinatorState.lastSyncTimestamp
        }),

        // Forcer une synchronisation complète
        forceMasterSync: async () => {
          log('🔄 SYNCHRONISATION MAÎTRE FORCÉE');

          const batch = this.batchManager.createBatch('master_sync', [
            { type: 'save', target: 'all' },
            { type: 'sync', target: 'all', action: 'master_sync' },
            { type: 'restore', target: 'all' }
          ]);

          return await this.batchManager.executeBatch(batch.id);
        },

        // Diagnostic complet
        runDiagnostic: () => {
          return this.runCompleteDiagnostic();
        }
      };

      log('🌐 API coordinateur exposée globalement');
    }

    startHealthMonitoring() {
      setInterval(() => {
        this.performHealthCheck();
      }, 10000); // Toutes les 10 secondes

      log('🏥 Monitoring de santé démarré');
    }

    performHealthCheck() {
      const now = Date.now();
      const issues = [];

      // Vérifier l'état des scripts enregistrés
      coordinatorState.registeredScripts.forEach((scriptData, scriptName) => {
        const timeSinceActivity = now - scriptData.lastActivity;

        if (timeSinceActivity > 30000) { // 30 secondes sans activité
          issues.push(`Script ${scriptName} inactif depuis ${Math.round(timeSinceActivity/1000)}s`);
          scriptData.status = 'inactive';
        }
      });

      // Vérifier la taille de la queue de sync
      if (coordinatorState.syncQueue.length > 10) {
        issues.push(`Queue de synchronisation surchargée: ${coordinatorState.syncQueue.length} éléments`);
      }

      // Vérifier les API des scripts
      const expectedAPIs = ['claraverseSyncAPI', 'claraverseProcessor'];
      expectedAPIs.forEach(apiName => {
        if (!window[apiName]) {
          issues.push(`API manquante: ${apiName}`);
        }
      });

      this.healthCheck.lastCheck = now;
      this.healthCheck.issues = issues;

      if (issues.length > 0) {
        log(`⚠️ Problèmes détectés: ${issues.join(', ')}`, 'warning');
      }
    }

    startScriptDetection() {
      // Détecter automatiquement les scripts chargés
      const checkInterval = setInterval(() => {
        // Vérifier dev.js
        if (window.claraverseSyncAPI && !coordinatorState.registeredScripts.has('dev')) {
          this.autoRegisterScript('dev', window.claraverseSyncAPI);
        }

        // Vérifier conso.js
        if (window.claraverseProcessor && !coordinatorState.registeredScripts.has('conso')) {
          this.autoRegisterScript('conso', window.claraverseProcessor);
        }

        // Vérifier menu.js
        if (window.contextualMenuManager && !coordinatorState.registeredScripts.has('menu')) {
          this.autoRegisterScript('menu', window.contextualMenuManager);
        }

        // Arrêter la détection après quelques tentatives
        if (coordinatorState.registeredScripts.size >= 3) {
          clearInterval(checkInterval);
          log('🔍 Détection automatique des scripts terminée');
        }
      }, 2000);

      // Timeout de sécurité
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 30000);
    }

    autoRegisterScript(name, api) {
      window.claraverseCoordinator.registerScript(name, api);

      // Synchroniser immédiatement avec le script détecté
      this.eventCoordinator.scheduleSynchronization(name, 'auto_register', {
        priority: 1
      });
    }

    notifyCoordinatorReady() {
      const event = new CustomEvent(COORDINATOR_CONFIG.EVENTS.COORDINATOR_READY, {
        detail: {
          version: COORDINATOR_CONFIG.VERSION,
          timestamp: Date.now(),
          registeredScripts: Array.from(coordinatorState.registeredScripts.keys())
        }
      });

      document.dispatchEvent(event);
      log('📢 Coordinateur prêt - notification envoyée');
    }

    runCompleteDiagnostic() {
      const diagnostic = {
        coordinator: {
          version: COORDINATOR_CONFIG.VERSION,
          initialized: coordinatorState.isInitialized,
          uptime: Date.now() - coordinatorState.lastSyncTimestamp
        },
        scripts: Object.fromEntries(coordinatorState.registeredScripts),
        queue: {
          pending: coordinatorState.syncQueue.length,
          items: coordinatorState.syncQueue.map(item => ({
            id: item.id,
            source: item.source,
            operation: item.operation,
            priority: item.priority
          }))
        },
        health: this.healthCheck,
        performance: coordinatorState.performanceMetrics,
        storage: this.getStorageDiagnostic()
      };

      log('🔍 Diagnostic complet généré');
      console.table(diagnostic.performance);

      return diagnostic;
    }

    getStorageDiagnostic() {
      const prefixes = ['claraverse_dev_', 'claraverse_sync_', 'claraverse_meta_', 'claraverse_'];
      const storage = {};

      prefixes.forEach(prefix => {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
        storage[prefix] = {
          count: keys.length,
          size: keys.reduce((total, key) => {
            return total + (localStorage.getItem(key) || '').length;
          }, 0)
        };
      });

      return storage;
    }
  }

  /**
   * ========================================
   * INITIALISATION AUTOMATIQUE
   * ========================================
   */

  // Créer et initialiser le coordinateur
  const coordinator = new SyncCoordinator();

  // Démarrage conditionnel
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => coordinator.initialize(), COORDINATOR_CONFIG.INIT_DELAY);
    });
  } else {
    setTimeout(() => coordinator.initialize(), COORDINATOR_CONFIG.INIT_DELAY);
  }

  // Message de démarrage
  log('📦 ClaraVerse Sync Coordinator v1.0 chargé');
  console.log(`
🎯 CLARAVERSE SYNC COORDINATOR v${COORDINATOR_CONFIG.VERSION}
========================================================
🎛️  Fonctionnalités:
    • Coordination centralisée des scripts
    • Élimination des race conditions
    • Gestion intelligente des timeouts
    • Batch operations optimisées
    • Monitoring de santé en temps réel

📊 API: window.claraverseCoordinator
🔍 Diagnostic: claraverseCoordinator.runDiagnostic()

🚀 Initialisation en cours...
  `);

})();
